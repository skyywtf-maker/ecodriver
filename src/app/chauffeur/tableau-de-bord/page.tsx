import type { Booking } from "@prisma/client";
import { requireDriver } from "@/lib/auth";
import { db } from "@/lib/db";
import { getDriver } from "@/lib/driver";
import { euros } from "@/lib/pricing";
import { dashboardMetrics, lastSevenDays } from "@/lib/stats";
import { STATUS_TONE } from "@/lib/status";
import { formatParis } from "@/lib/time";
import { DriverNav } from "../DriverNav";
import type { PanelTab, RideRow } from "../RidesPanel";
import { DashboardView } from "../DashboardView";

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

  const initial: PanelTab =
    asked === "avenir" || asked === "historique" || asked === "attente"
      ? asked
      : pending.length > 0
        ? "attente"
        : "avenir";

  return (
    <DashboardView
      nav={<DriverNav current={asked === "historique" ? "courses" : "accueil"} />}
      firstName={driver?.firstName ?? ""}
      metrics={metrics}
      days={days}
      initial={initial}
      pending={pending.map(toRow)}
      upcoming={upcoming.map(toRow)}
      history={history.map(toRow)}
    />
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

