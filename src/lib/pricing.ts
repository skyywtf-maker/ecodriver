import { EXTRAS, PRICING, vehicleById, type Vehicle, type VehicleId } from "@/config/pricing";
import { parisHourAndWeekday } from "./time";

/** Ce que le client demande en plus de la course, facturé à prix fixe. */
export type PriceOptions = {
  boosterSeat?: boolean;
  /** Nombre total de bagages ; ceux au-delà du compris sont facturés. */
  luggage?: number;
  /** Nombre de passagers : le compris est d'un bagage par personne. */
  passengers?: number;
};

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
  durationMin = 0,
  options: PriceOptions = {}
): PriceBreakdown {
  const vehicle = vehicleById(vehicleIdOrDefault);
  if (!vehicle) throw new Error(`Catégorie de véhicule inconnue : ${vehicleIdOrDefault}`);

  let lines: { label: string; amount: number }[];
  let billedHours: number | null = null;

  if (vehicle.tariff.mode === "hourly") {
    // Mise à disposition : on facture le temps, arrondi à l'heure supérieure,
    // avec une durée minimale. Les premiers kilomètres sont compris dans les
    // heures ; au-delà, chaque kilomètre s'ajoute.
    const { perHour, minimumHours, includedKm, perExtraKm } = vehicle.tariff;
    billedHours = Math.max(minimumHours, Math.ceil(durationMin / 60));
    lines = [{ label: `${billedHours} h × ${perHour.toLocaleString("fr-FR")} €`, amount: billedHours * perHour }];

    const extraKm = round(Math.max(0, distanceKm - includedKm));
    if (extraKm > 0) {
      lines.push({
        label: `${extraKm.toLocaleString("fr-FR")} km au-delà de ${includedKm} km × ${perExtraKm.toLocaleString("fr-FR")} €`,
        amount: round(extraKm * perExtraKm),
      });
    }
  } else {
    lines = distanceLines(vehicle, distanceKm);
  }

  const subtotal = round(lines.reduce((sum, l) => sum + l.amount, 0));
  const surchargeApplied = isSurchargeTime(pickupAt);
  const course = round(surchargeApplied ? subtotal * PRICING.surchargeMultiplier : subtotal);

  // Les suppléments s'ajoutent APRÈS la majoration : le chauffeur les veut à
  // prix fixe, de jour comme de nuit (message du 29 septembre 2026).
  let extras = 0;

  // Un bagage par personne est compris. Catégorie sans nombre annoncé
  // (le van) : rien n'est facturé en plus.
  const perPassenger = vehicle.luggagePerPassenger;
  const includedBags = perPassenger === null ? null : Math.max(1, options.passengers ?? 1) * perPassenger;
  const extraBags = includedBags === null ? 0 : Math.max(0, (options.luggage ?? 0) - includedBags);
  if (extraBags > 0) {
    const amount = extraBags * EXTRAS.extraLuggage.price;
    const bagage = extraBags > 1 ? "bagages supplémentaires" : "bagage supplémentaire";
    lines.push({ label: `${extraBags} ${bagage} × ${EXTRAS.extraLuggage.price} €`, amount });
    extras += amount;
  }

  if (options.boosterSeat) {
    lines.push({ label: EXTRAS.boosterSeat.label, amount: EXTRAS.boosterSeat.price });
    extras += EXTRAS.boosterSeat.price;
  }

  const total = round(course + extras);

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
