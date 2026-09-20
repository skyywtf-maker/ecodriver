import Link from "next/link";
import type { Booking } from "@prisma/client";
import { requireDriver } from "@/lib/auth";
import { db } from "@/lib/db";
import { getDriver } from "@/lib/driver";
import { euros } from "@/lib/pricing";
import { dashboardMetrics, lastSevenDays, type DayCount, type Metric } from "@/lib/stats";
import { STATUS_LABEL, STATUS_TONE } from "@/lib/status";
import { formatParis } from "@/lib/time";
import { DriverNav } from "../DriverNav";
import { setAvailable } from "../actions";
import { AvailabilityToggle } from "../ui";

export const dynamic = "force-dynamic";

const PER_PAGE = 20;

/**
 * Les demandes en attente passent devant : ce sont les seules qui réclament
 * une décision. Le reste suit par date de création décroissante.
 */
const RECENT_ORDER = [{ status: "asc" as const }, { createdAt: "desc" as const }];

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  await requireDriver();

  const page = Math.max(1, Number((await searchParams).page ?? 1) || 1);

  const [driver, metrics, days, total, recent, upcoming] = await Promise.all([
    getDriver(),
    dashboardMetrics(),
    lastSevenDays(),
    db.booking.count({ where: { status: { not: "PENDING_PAYMENT" } } }),
    db.booking.findMany({
      where: { status: { not: "PENDING_PAYMENT" } },
      orderBy: RECENT_ORDER,
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
    }),
    db.booking.findMany({
      where: { status: "CONFIRMED", pickupAt: { gte: new Date() } },
      orderBy: { pickupAt: "asc" },
      take: 8,
    }),
  ]);

  const pages = Math.max(1, Math.ceil(total / PER_PAGE));

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-6 md:px-8 md:py-10">
      <DriverNav current="bord" />

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <h1 className="font-display text-3xl font-bold tracking-[-0.03em] md:text-4xl">
            Bonjour{driver?.firstName ? ", " : ""}
            {driver?.firstName && <span className="serif-accent">{driver.firstName}.</span>}
          </h1>
          <p className="text-[14px] text-label">Activité des 30 derniers jours</p>
        </div>
        <AvailabilityToggle value={Boolean(driver?.availableToday)} onToggle={setAvailable} />
      </div>

      <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((m) => (
          <li key={m.label}>
            <MetricCard metric={m} />
          </li>
        ))}
      </ul>

      <section className="tile mt-4 rounded-4xl p-6 md:p-7">
        <h2 className="text-[11px] font-medium uppercase tracking-[0.12em] text-label">Courses par jour</h2>
        <Chart days={days} />
      </section>

      <section className="mt-10">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="font-display text-xl font-bold tracking-[-0.02em]">Nouvelles réservations</h2>
          <span className="text-[13px] text-label">{total} au total</span>
        </div>

        {recent.length === 0 ? (
          <p className="tile mt-4 rounded-3xl p-8 text-center text-sm text-label">Aucune réservation pour le moment.</p>
        ) : (
          <ul className="mt-4 flex flex-col gap-2">
            {recent.map((b) => (
              <li key={b.id}>
                <Row booking={b} />
              </li>
            ))}
          </ul>
        )}

        {pages > 1 && (
          <nav className="mt-5 flex items-center justify-center gap-2" aria-label="Pagination">
            {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
              <Link
                key={n}
                href={`/chauffeur/tableau-de-bord?page=${n}`}
                aria-current={n === page ? "page" : undefined}
                className={`flex h-9 min-w-9 items-center justify-center rounded-full px-3 text-sm font-medium transition-colors ${
                  n === page ? "bg-white text-ink" : "bg-white/[0.06] text-label hover:text-white"
                }`}
              >
                {n}
              </Link>
            ))}
          </nav>
        )}
      </section>

      <section className="mt-10">
        <h2 className="font-display text-xl font-bold tracking-[-0.02em]">Prochaines courses</h2>
        {upcoming.length === 0 ? (
          <p className="tile mt-4 rounded-3xl p-8 text-center text-sm text-label">Aucune course confirmée à venir.</p>
        ) : (
          <ul className="mt-4 flex flex-col gap-2">
            {upcoming.map((b) => (
              <li key={b.id}>
                <Row booking={b} showCountdown />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function MetricCard({ metric }: { metric: Metric }) {
  const { label, value, delta, hint } = metric;
  const tone = delta === null ? "text-label" : delta >= 0 ? "text-[#30D158]" : "text-[#FF6961]";

  return (
    <div className="tile flex h-full flex-col gap-2 rounded-3xl p-5">
      <span className="text-[11px] font-medium uppercase tracking-[0.1em] text-label">{label}</span>
      <span className="font-display text-[28px] font-bold leading-none tracking-[-0.03em]">{value}</span>
      <span className="flex items-baseline gap-2 text-[12px]">
        <span className={`font-semibold ${tone}`}>
          {delta === null ? "—" : `${delta >= 0 ? "+" : ""}${delta} %`}
        </span>
        <span className="text-label">{hint}</span>
      </span>
    </div>
  );
}

/**
 * Histogramme des sept derniers jours.
 *
 * Dessiné en CSS plutôt qu'avec une bibliothèque de graphiques : sept barres
 * ne justifient pas d'embarquer du JavaScript supplémentaire.
 */
function Chart({ days }: { days: DayCount[] }) {
  const max = Math.max(1, ...days.map((d) => d.count));

  return (
    <ol className="mt-5 flex h-[140px] items-end gap-2">
      {days.map((d) => (
        <li key={d.date} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
          <span className="text-[12px] font-semibold text-white">{d.count}</span>
          <span
            className="w-full rounded-t-lg bg-accent/70"
            style={{ height: `${Math.max(3, (d.count / max) * 100)}%` }}
            title={`${d.count} course(s) le ${d.date}`}
          />
          <span className="text-[11px] text-label">{d.label}</span>
        </li>
      ))}
    </ol>
  );
}

function Row({ booking: b, showCountdown = false }: { booking: Booking; showCountdown?: boolean }) {
  return (
    <Link
      href={`/chauffeur/course/${b.id}`}
      className="tile flex flex-col gap-3 rounded-3xl p-5 transition-colors hover:bg-white/[0.07] md:flex-row md:items-center md:gap-5"
    >
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="font-display text-[15px] font-semibold tracking-[-0.015em]">
          {b.firstName} {b.lastName}
        </span>
        <span className="truncate text-[13px] text-label">
          {b.fromLabel} → {b.toLabel}
        </span>
      </div>

      <div className="flex items-center justify-between gap-4 md:justify-end">
        <span className="text-[13px] text-label-strong">{formatParis(b.pickupAt)}</span>
        <span className="font-display text-[15px] font-semibold">{euros(b.priceCents / 100)}</span>
        <span className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold ${STATUS_TONE[b.status]}`}>
          {showCountdown && b.enRoute ? (b.arrived ? "Sur place" : "En route") : STATUS_LABEL[b.status]}
        </span>
      </div>
    </Link>
  );
}
