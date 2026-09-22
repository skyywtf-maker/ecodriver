import Link from "next/link";
import type { Booking } from "@prisma/client";
import { requireDriver } from "@/lib/auth";
import { db } from "@/lib/db";
import { getDriver } from "@/lib/driver";
import { euros } from "@/lib/pricing";
import { dashboardMetrics, lastSevenDays, type DayCount } from "@/lib/stats";
import { STATUS_TONE } from "@/lib/status";
import { formatParis } from "@/lib/time";
import { Logo } from "@/components/Logo";
import { DriverNav } from "../DriverNav";
import { RidesPanel, type PanelTab, type RideRow } from "../RidesPanel";

export const dynamic = "force-dynamic";

/** Historique : les 60 dernières courses suffisent, la liste défile dans sa carte. */
const HISTORY = 60;

/**
 * Tableau de bord, pensé comme une application : trois cartes empilées et
 * une barre d'onglets en bas, presque sans défilement de page.
 *
 * 1. Le revenu du mois en grand, trois chiffres secondaires, et deux boutons
 *    qui mènent droit aux courses à traiter et à venir.
 * 2. Les courses des sept derniers jours, en barres compactes.
 * 3. Les courses à onglets ; la liste défile dans sa carte, et les décisions
 *    se prennent dans la ligne.
 */
export default async function Dashboard({ searchParams }: { searchParams: Promise<{ onglet?: string }> }) {
  await requireDriver();

  const asked = (await searchParams).onglet;
  const [driver, metrics, days, pending, upcoming, history] = await Promise.all([
    getDriver(),
    dashboardMetrics(),
    lastSevenDays(),
    db.booking.findMany({ where: { status: "PENDING_DRIVER" }, orderBy: { pickupAt: "asc" } }),
    db.booking.findMany({ where: { status: "CONFIRMED" }, orderBy: { pickupAt: "asc" } }),
    db.booking.findMany({
      where: { status: { in: ["COMPLETED", "REFUSED", "CANCELLED"] } },
      orderBy: { pickupAt: "desc" },
      take: HISTORY,
    }),
  ]);

  const [rides, revenue, average, loss] = metrics;
  const initial: PanelTab =
    asked === "avenir" || asked === "historique" || asked === "attente"
      ? asked
      : pending.length > 0
        ? "attente"
        : "avenir";

  return (
    <div className="mx-auto max-w-[1100px] px-3 pb-28 pt-3 md:px-8 md:pt-8">
      <DriverNav current={asked === "historique" ? "courses" : "accueil"} />

      <div className="grid grid-cols-1 gap-2.5 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] md:gap-4">
        <div className="flex min-w-0 flex-col gap-2.5 md:gap-4">
          {/* 1. En-tête : le chiffre du mois et les accès directs. */}
          <section className="rounded-4xl border border-white/[0.08] bg-[#121317] p-4 md:p-6">
            <div className="flex items-center justify-between gap-3">
              <Logo className="text-[15px]" />
              <span className="text-[12px] font-medium text-label">
                Bonjour{driver?.firstName ? `, ${driver.firstName}` : ""}
              </span>
            </div>

            <div className="mt-5 flex items-end justify-between gap-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-label">Revenu · 30 jours</p>
                <p className="mt-1 font-display text-[34px] font-bold leading-none tracking-[-0.03em]">{revenue?.value}</p>
              </div>
              <Delta value={revenue?.delta ?? null} />
            </div>

            <dl className="mt-4 grid grid-cols-3 divide-x divide-white/[0.08] rounded-2xl bg-white/[0.04] py-2.5">
              {[rides, average, loss].map((m) =>
                m ? (
                  <div key={m.label} className="px-3">
                    <dt className="truncate text-[10px] font-medium text-label">{m.label}</dt>
                    <dd className="mt-0.5 font-display text-[16px] font-bold">{m.value}</dd>
                  </div>
                ) : null
              )}
            </dl>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <Link
                href="?onglet=attente#courses"
                className={`flex h-11 items-center justify-center gap-2 rounded-2xl text-[13px] font-semibold transition-colors ${
                  pending.length ? "bg-white text-ink hover:opacity-90" : "bg-white/[0.08] text-white hover:bg-white/[0.12]"
                }`}
              >
                À traiter
                <span className={`rounded-full px-1.5 text-[11px] leading-5 ${pending.length ? "bg-[#FF9F0A] text-ink" : "bg-white/10"}`}>
                  {pending.length}
                </span>
              </Link>
              <Link
                href="?onglet=avenir#courses"
                className="flex h-11 items-center justify-center gap-2 rounded-2xl bg-white/[0.08] text-[13px] font-semibold text-white transition-colors hover:bg-white/[0.12]"
              >
                À venir
                <span className="rounded-full bg-white/10 px-1.5 text-[11px] leading-5">{upcoming.length}</span>
              </Link>
            </div>
          </section>

          {/* 2. Activité de la semaine. */}
          <section className="rounded-4xl border border-white/[0.08] bg-[#121317] px-4 pb-3 pt-4 md:px-6">
            <div className="flex items-baseline justify-between">
              <h2 className="text-[12px] font-semibold text-label-strong">Courses · 7 jours</h2>
              <span className="text-[12px] text-label">{days.reduce((n, d) => n + d.count, 0)} au total</span>
            </div>
            <Bars days={days} />
          </section>
        </div>

        {/* 3. Les courses. */}
        {/* La clé remonte le panneau quand un bouton demande un autre onglet. */}
        <RidesPanel
          key={initial}
          initial={initial}
          pending={pending.map(toRow)}
          upcoming={upcoming.map(toRow)}
          history={history.map(toRow)}
        />
      </div>
    </div>
  );
}

function toRow(b: Booking): RideRow {
  return {
    id: b.id,
    name: `${b.firstName} ${b.lastName}`,
    from: b.fromLabel,
    to: b.toLabel,
    when: formatParis(b.pickupAt),
    price: euros(b.priceCents / 100),
    status: b.status,
    tone: STATUS_TONE[b.status],
    enRoute: b.enRoute,
    arrived: b.arrived,
  };
}

function Delta({ value }: { value: number | null }) {
  if (value === null) return <span className="text-[12px] text-label">— vs 30 j préc.</span>;
  const up = value >= 0;
  return (
    <span className={`rounded-lg px-2 py-1 text-[12px] font-semibold ${up ? "bg-[#30D158]/12 text-[#30D158]" : "bg-[#FF453A]/12 text-[#FF6961]"}`}>
      {up ? "+" : ""}
      {value} %
    </span>
  );
}

/** Sept barres fines, dessinées en CSS : pas de bibliothèque pour si peu. */
function Bars({ days }: { days: DayCount[] }) {
  const max = Math.max(1, ...days.map((d) => d.count));
  return (
    <ol className="mt-3 flex h-[76px] items-end gap-2">
      {days.map((d, i) => (
        <li key={d.date} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
          <span
            className={`w-full rounded-md ${i === days.length - 1 ? "bg-accent" : "bg-white/15"}`}
            style={{ height: `${Math.max(6, (d.count / max) * 100)}%` }}
            title={`${d.count} course(s) le ${d.date}`}
          />
          <span className="text-[10px] text-label">{d.label}</span>
        </li>
      ))}
    </ol>
  );
}
