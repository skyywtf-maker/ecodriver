import Link from "next/link";
import type { BookingStatus, Booking } from "@prisma/client";
import { requireDriver } from "@/lib/auth";
import { db } from "@/lib/db";
import { euros } from "@/lib/pricing";
import { formatParis } from "@/lib/time";
import { STATUS_LABEL, STATUS_TONE } from "@/lib/status";
import { Logo } from "@/components/Logo";
import { logout, setAvailable } from "../actions";
import { AvailabilityToggle } from "../ui";

export const dynamic = "force-dynamic";

const TABS: { key: string; label: string; statuses: BookingStatus[]; order: "asc" | "desc" }[] = [
  { key: "attente", label: "En attente", statuses: ["PENDING_DRIVER"], order: "asc" },
  { key: "avenir", label: "À venir", statuses: ["CONFIRMED"], order: "asc" },
  { key: "historique", label: "Historique", statuses: ["COMPLETED", "REFUSED", "CANCELLED"], order: "desc" },
];

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ onglet?: string }> }) {
  await requireDriver();
  const { onglet } = await searchParams;
  const tab = TABS.find((t) => t.key === onglet) ?? TABS[0];

  const [bookings, counts, available] = await Promise.all([
    db.booking.findMany({ where: { status: { in: tab.statuses } }, orderBy: { pickupAt: tab.order }, take: 200 }),
    Promise.all(TABS.map((t) => db.booking.count({ where: { status: { in: t.statuses } } }))),
    db.setting.findUnique({ where: { key: "available_today" } }),
  ]);

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-6 md:px-8 md:py-10">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <Logo className="text-2xl" />
        <div className="flex items-center gap-3">
          <AvailabilityToggle value={available?.value === "true"} onToggle={setAvailable} />
          <form action={logout}>
            <button className="h-11 rounded-full px-4 text-sm font-medium text-label hover:text-white">Déconnexion</button>
          </form>
        </div>
      </header>

      <nav className="mt-8 flex gap-1 rounded-full bg-white/[0.06] p-1 md:w-fit" aria-label="Listes de courses">
        {TABS.map((t, i) => (
          <Link
            key={t.key}
            href={`?onglet=${t.key}`}
            aria-current={t.key === tab.key ? "page" : undefined}
            className={`flex h-10 flex-1 items-center justify-center gap-2 rounded-full px-4 text-sm md:flex-none ${
              t.key === tab.key ? "bg-white font-display font-semibold text-ink" : "font-medium text-label hover:text-white"
            }`}
          >
            {t.label}
            <span className="text-xs opacity-60">{counts[i]}</span>
          </Link>
        ))}
      </nav>

      <ul className="mt-6 flex flex-col gap-2">
        {bookings.length === 0 && (
          <li className="tile rounded-3xl p-8 text-center text-label">Aucune course dans cette liste.</li>
        )}
        {bookings.map((b) => (
          <Row key={b.id} b={b} />
        ))}
      </ul>
    </div>
  );
}

function Row({ b }: { b: Booking }) {
  return (
    <li>
      <Link href={`/chauffeur/course/${b.id}`} className="tile grid gap-3 rounded-3xl p-5 hover:bg-white/[0.07] md:grid-cols-[160px_1fr_auto] md:items-center md:gap-6">
        <div className="flex flex-col">
          <span className="font-display text-lg font-semibold">{formatParis(b.pickupAt, { weekday: "short", day: "numeric", month: "short", hour: undefined, minute: undefined })}</span>
          <span className="text-sm text-label">{formatParis(b.pickupAt, { weekday: undefined, day: undefined, month: undefined })}</span>
        </div>
        <div className="flex min-w-0 flex-col gap-1">
          <span className="truncate text-[15px] font-semibold">{b.fromLabel} → {b.toLabel}</span>
          <span className="text-sm text-label">
            {b.firstName} {b.lastName} · {b.phone} · {b.distanceKm.toLocaleString("fr-FR")} km
          </span>
        </div>
        <div className="flex items-center gap-3 md:flex-col md:items-end md:gap-1.5">
          <span className="font-display text-xl font-bold">{euros(b.priceCents / 100)}</span>
          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_TONE[b.status]}`}>{STATUS_LABEL[b.status]}</span>
        </div>
      </Link>
    </li>
  );
}
