import "server-only";
import type { Booking } from "@prisma/client";
import { db } from "./db";

export type Metric = { label: string; value: string; delta: number | null; hint: string };

/** Variation en pourcentage, null quand la période précédente était vide. */
function delta(now: number, before: number): number | null {
  if (before === 0) return null;
  return Math.round(((now - before) / before) * 100);
}

const DAY = 24 * 60 * 60 * 1000;

/** Les statuts qui représentent une course réellement encaissée. */
const EARNED: Booking["status"][] = ["CONFIRMED", "COMPLETED"];
/** Les statuts qui représentent une course abandonnée après paiement. */
const LOST: Booking["status"][] = ["REFUSED", "CANCELLED"];

/**
 * Indicateurs des 30 derniers jours, comparés aux 30 précédents.
 *
 * Tout est calculé en base : aucune valeur n'est figée dans le code, et les
 * périodes glissantes évitent les à-coups d'un début de mois.
 */
export async function dashboardMetrics(): Promise<Metric[]> {
  const now = Date.now();
  const since = new Date(now - 30 * DAY);
  const previousSince = new Date(now - 60 * DAY);

  const [current, previous] = await Promise.all([
    db.booking.findMany({
      where: { createdAt: { gte: since } },
      select: { status: true, priceCents: true },
    }),
    db.booking.findMany({
      where: { createdAt: { gte: previousSince, lt: since } },
      select: { status: true, priceCents: true },
    }),
  ]);

  const summarize = (rows: { status: Booking["status"]; priceCents: number }[]) => {
    const earned = rows.filter((r) => EARNED.includes(r.status));
    const lost = rows.filter((r) => LOST.includes(r.status));
    const revenue = earned.reduce((sum, r) => sum + r.priceCents, 0);
    const decided = earned.length + lost.length;
    return {
      rides: earned.length,
      revenue,
      average: earned.length ? revenue / earned.length : 0,
      lossRate: decided ? (lost.length / decided) * 100 : 0,
    };
  };

  const a = summarize(current);
  const b = summarize(previous);
  const euros = (cents: number) => `${(cents / 100).toLocaleString("fr-FR", { maximumFractionDigits: 0 })} €`;

  return [
    { label: "Courses", value: String(a.rides), delta: delta(a.rides, b.rides), hint: "30 derniers jours" },
    { label: "Revenu encaissé", value: euros(a.revenue), delta: delta(a.revenue, b.revenue), hint: "courses confirmées" },
    { label: "Panier moyen", value: euros(a.average), delta: delta(a.average, b.average), hint: "par course" },
    {
      label: "Refus et annulations",
      value: `${Math.round(a.lossRate)} %`,
      // Une hausse du taux de perte est une mauvaise nouvelle : le signe est
      // inversé pour que la couleur reste lisible d'un coup d'œil.
      delta: delta(a.lossRate, b.lossRate) === null ? null : -delta(a.lossRate, b.lossRate)!,
      hint: "des courses payées",
    },
  ];
}

export type DayCount = { label: string; date: string; count: number };

/** Nombre de courses par jour sur les sept derniers jours, aujourd'hui inclus. */
export async function lastSevenDays(): Promise<DayCount[]> {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setTime(start.getTime() - 6 * DAY);

  const rows = await db.booking.findMany({
    where: { createdAt: { gte: start } },
    select: { createdAt: true },
  });

  const days: DayCount[] = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(start.getTime() + i * DAY);
    const next = new Date(day.getTime() + DAY);
    days.push({
      label: day.toLocaleDateString("fr-FR", { weekday: "short" }).replace(".", ""),
      date: day.toLocaleDateString("fr-FR", { day: "numeric", month: "short" }),
      count: rows.filter((r) => r.createdAt >= day && r.createdAt < next).length,
    });
  }
  return days;
}
