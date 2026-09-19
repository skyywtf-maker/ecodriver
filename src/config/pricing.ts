/**
 * TARIFS : seul endroit à modifier.
 * Valeurs provisoires, à valider avec le chauffeur.
 */
export const PRICING = {
  currency: "eur",
  /** Prise en charge fixe, en euros */
  baseFare: 8,
  /** Prix au kilomètre, en euros */
  perKm: 2.2,
  /** Coefficient appliqué la nuit (22h-6h) et le week-end */
  surchargeMultiplier: 1.25,
  nightStartHour: 22,
  nightEndHour: 6,
  /** Montant plancher, en euros */
  minimumFare: 25,
} as const;

export const BOOKING_RULES = {
  /** Délai minimum entre maintenant et la prise en charge */
  minLeadMinutes: 90,
  maxPassengers: 4,
  maxLuggage: 3,
  /** Nom de la région Mapbox autorisée */
  allowedRegion: "Grand Est",
  timeZone: "Europe/Paris",
} as const;
