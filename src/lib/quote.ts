import "server-only";
import { BOOKING_RULES, DEFAULT_VEHICLE, type VehicleId } from "@/config/pricing";
import { getRoute, type Route } from "./geo";
import { computePrice, type PriceBreakdown } from "./pricing";
import { minutesFromNow, parisLocalToUtc } from "./time";
import type { TripInput } from "./validation";

export type QuoteResult =
  | { ok: true; pickupAt: Date; route: Route; price: PriceBreakdown }
  | { ok: false; code: "TOO_SOON" | "IN_PAST" | "NO_ROUTE"; message: string };

/** Calcul de référence, utilisé pour l'affichage ET pour le paiement. */
export async function buildQuote(trip: TripInput): Promise<QuoteResult> {
  const pickupAt = parisLocalToUtc(trip.date, trip.time);
  const lead = minutesFromNow(pickupAt);
  if (lead < 0) {
    return { ok: false, code: "IN_PAST", message: "Cette date est déjà passée. Choisissez un horaire à venir." };
  }
  if (lead < BOOKING_RULES.minLeadMinutes) {
    return {
      ok: false,
      code: "TOO_SOON",
      message: `Réservez au moins ${BOOKING_RULES.minLeadMinutes} minutes à l'avance. Choisissez un horaire plus tardif.`,
    };
  }
  const route = await getRoute(trip.from, trip.to);
  if (!route) {
    return { ok: false, code: "NO_ROUTE", message: "Itinéraire introuvable entre ces deux adresses." };
  }
  const vehicleId = (trip.vehicle ?? DEFAULT_VEHICLE) as VehicleId;
  return { ok: true, pickupAt, route, price: computePrice(route.distanceKm, pickupAt, vehicleId, route.durationMin) };
}
