import { PRICING, vehicleById, type Vehicle, type VehicleId } from "@/config/pricing";
import { parisHourAndWeekday } from "./time";

export type PriceBreakdown = {
  vehicleId: VehicleId;
  vehicleName: string;
  /** Détail ligne à ligne, tel qu'affiché au client. */
  lines: { label: string; amount: number }[];
  subtotal: number;
  surchargeApplied: boolean;
  surchargeMultiplier: number;
  /** Conservé pour compatibilité : aucune catégorie n'a de plancher aujourd'hui. */
  minimumApplied: boolean;
  total: number;
  totalCents: number;
  /** Heures facturées pour une mise à disposition, sinon null. */
  billedHours: number | null;
};

export function isSurchargeTime(pickupAt: Date) {
  const { hour, weekday } = parisHourAndWeekday(pickupAt);
  const night = hour >= PRICING.nightStartHour || hour < PRICING.nightEndHour;
  const weekend = weekday === "Sat" || weekday === "Sun";
  return night || weekend;
}

const round = (n: number) => Math.round(n * 100) / 100;

/**
 * Ventile une distance dans les paliers de la grille.
 *
 * Chaque palier ne facture que les kilomètres qui lui reviennent : au-delà de
 * 15 km, seuls les kilomètres 15+ passent au tarif supérieur, pas la course
 * entière. Un palier forfaitaire couvre toute sa tranche, quelle que soit la
 * distance réellement parcourue dedans.
 */
function distanceLines(vehicle: Vehicle, distanceKm: number) {
  if (vehicle.tariff.mode !== "distance") return [];

  const lines: { label: string; amount: number }[] = [];
  let covered = 0;

  for (const tier of vehicle.tariff.tiers) {
    if (covered >= distanceKm && lines.length > 0) break;

    const ceiling = tier.upToKm ?? Infinity;
    const inTier = Math.max(0, Math.min(distanceKm, ceiling) - covered);

    if (tier.flat !== undefined) {
      lines.push({ label: `Forfait jusqu'à ${tier.upToKm} km`, amount: tier.flat });
    } else if (tier.perKm !== undefined && inTier > 0) {
      const upper = tier.upToKm === null ? "au-delà" : `jusqu'à ${tier.upToKm} km`;
      lines.push({
        label: `${round(inTier).toLocaleString("fr-FR")} km ${upper} × ${tier.perKm.toLocaleString("fr-FR")} €`,
        amount: round(inTier * tier.perKm),
      });
    }

    covered = ceiling;
  }

  return lines;
}

/**
 * Prix d'une course.
 *
 * `durationMin` sert aux véhicules facturés au temps ; il est ignoré par les
 * grilles kilométriques.
 */
export function computePrice(
  distanceKm: number,
  pickupAt: Date,
  vehicleIdOrDefault: VehicleId,
  durationMin = 0
): PriceBreakdown {
  const vehicle = vehicleById(vehicleIdOrDefault);
  if (!vehicle) throw new Error(`Catégorie de véhicule inconnue : ${vehicleIdOrDefault}`);

  let lines: { label: string; amount: number }[];
  let billedHours: number | null = null;

  if (vehicle.tariff.mode === "hourly") {
    // Mise à disposition : on facture le temps, arrondi à l'heure supérieure,
    // avec une durée minimale. Aucun kilomètre n'entre dans le calcul.
    const { perHour, minimumHours } = vehicle.tariff;
    billedHours = Math.max(minimumHours, Math.ceil(durationMin / 60));
    lines = [{ label: `${billedHours} h × ${perHour.toLocaleString("fr-FR")} €`, amount: billedHours * perHour }];
  } else {
    lines = distanceLines(vehicle, distanceKm);
  }

  const subtotal = round(lines.reduce((sum, l) => sum + l.amount, 0));
  const surchargeApplied = isSurchargeTime(pickupAt);
  const total = round(surchargeApplied ? subtotal * PRICING.surchargeMultiplier : subtotal);

  return {
    vehicleId: vehicle.id,
    vehicleName: vehicle.name,
    lines,
    subtotal,
    surchargeApplied,
    surchargeMultiplier: PRICING.surchargeMultiplier,
    minimumApplied: false,
    total,
    totalCents: Math.round(total * 100),
    billedHours,
  };
}

export function euros(value: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(value);
}
