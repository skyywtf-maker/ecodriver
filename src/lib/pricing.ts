import { PRICING } from "@/config/pricing";
import { parisHourAndWeekday } from "./time";

export type PriceBreakdown = {
  baseFare: number;
  perKm: number;
  distanceKm: number;
  distanceCost: number;
  subtotal: number;
  surchargeApplied: boolean;
  surchargeMultiplier: number;
  minimumApplied: boolean;
  total: number; // euros, arrondi au centime
  totalCents: number;
};

export function isSurchargeTime(pickupAt: Date) {
  const { hour, weekday } = parisHourAndWeekday(pickupAt);
  const night = hour >= PRICING.nightStartHour || hour < PRICING.nightEndHour;
  const weekend = weekday === "Sat" || weekday === "Sun";
  return night || weekend;
}

export function computePrice(distanceKm: number, pickupAt: Date): PriceBreakdown {
  const distanceCost = distanceKm * PRICING.perKm;
  const subtotal = PRICING.baseFare + distanceCost;
  const surchargeApplied = isSurchargeTime(pickupAt);
  let total = surchargeApplied ? subtotal * PRICING.surchargeMultiplier : subtotal;
  const minimumApplied = total < PRICING.minimumFare;
  if (minimumApplied) total = PRICING.minimumFare;
  const totalCents = Math.round(total * 100);
  return {
    baseFare: PRICING.baseFare,
    perKm: PRICING.perKm,
    distanceKm,
    distanceCost: Math.round(distanceCost * 100) / 100,
    subtotal: Math.round(subtotal * 100) / 100,
    surchargeApplied,
    surchargeMultiplier: PRICING.surchargeMultiplier,
    minimumApplied,
    total: totalCents / 100,
    totalCents,
  };
}

export function euros(value: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(value);
}
