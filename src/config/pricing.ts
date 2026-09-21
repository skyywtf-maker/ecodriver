/**
 * TARIFS : seul endroit à modifier.
 *
 * Chaque catégorie de véhicule a sa propre grille. Le prix se calcule sur la
 * distance réelle du trajet, jamais sur un rayon depuis un point fixe.
 */

/** Identifiants des catégories, utilisés en base et dans les URL. */
export const VEHICLE_IDS = ["BERLINE", "TOURING", "VAN"] as const;
export type VehicleId = (typeof VEHICLE_IDS)[number];

/**
 * Grille par paliers de distance.
 *
 * `upToKm` est la borne haute du palier. Le premier palier peut être
 * forfaitaire (`flat`), les suivants sont au kilomètre (`perKm`) et ne
 * s'appliquent qu'aux kilomètres compris dans le palier.
 */
export type DistanceTier = { upToKm: number | null; flat?: number; perKm?: number };

export type VehicleTariff =
  | { mode: "distance"; tiers: DistanceTier[] }
  /** Mise à disposition : facturée au temps, sans calcul kilométrique. */
  | { mode: "hourly"; perHour: number; minimumHours: number };

export type Vehicle = {
  id: VehicleId;
  name: string;
  /** Modèle réel ou capacité, affiché sous le nom de la catégorie. */
  model: string;
  tagline: string;
  passengers: number;
  luggage: number;
  /** Visuel dédié, à déposer dans public/vehicules/. */
  image: string;
  /** Modèle 3D facultatif ; la photo sert de repli. */
  model3d?: string;
  tariff: VehicleTariff;
  /** Phrase affichée sous le nom dans le sélecteur. */
  priceHint: string;
  /** Prix de départ affiché sur la carte du sélecteur. */
  from: string;
};

export const VEHICLES: Vehicle[] = [
  {
    id: "BERLINE",
    name: "Berline confort",
    model: "Toyota Corolla",
    tagline: "Pour les trajets du quotidien et les transferts aéroport.",
    passengers: 4,
    luggage: 3,
    image: "/vehicules/berline.jpg",
    model3d: "/vehicule/toyota-corolla.glb",
    priceHint: "15 € jusqu'à 5 km, puis au kilomètre",
    from: "dès 15 €",
    tariff: {
      mode: "distance",
      tiers: [
        { upToKm: 5, flat: 15 },
        { upToKm: 15, perKm: 2 },
        { upToKm: null, perKm: 2.3 },
      ],
    },
  },
  {
    id: "TOURING",
    name: "Voiture touring",
    model: "Break",
    tagline: "Pour les bagages volumineux et les longues distances.",
    passengers: 4,
    luggage: 5,
    image: "/vehicules/touring.jpg",
    model3d: "/vehicule/toyota-corolla.glb",
    priceHint: "15 € jusqu'à 5 km, puis au kilomètre",
    from: "dès 15 €",
    // Même grille que la berline pour l'instant, mais dans une variable
    // distincte : la différencier plus tard ne demandera pas de toucher au code.
    tariff: {
      mode: "distance",
      tiers: [
        { upToKm: 5, flat: 15 },
        { upToKm: 15, perKm: 2 },
        { upToKm: null, perKm: 2.3 },
      ],
    },
  },
  {
    id: "VAN",
    name: "Van / XL",
    model: "8 places",
    tagline: "Mise à disposition avec chauffeur, groupes et événements.",
    passengers: 8,
    luggage: 8,
    image: "/vehicules/van.jpg",
    model3d: "/vehicule/mercedes-v-class.glb",
    priceHint: "60 € par heure, mise à disposition",
    from: "60 € / heure",
    tariff: { mode: "hourly", perHour: 60, minimumHours: 2 },
  },
];

export function vehicleById(id: string): Vehicle | undefined {
  return VEHICLES.find((v) => v.id === id);
}

export const DEFAULT_VEHICLE: VehicleId = "BERLINE";

export const PRICING = {
  currency: "eur",
  /** Coefficient appliqué la nuit (22h-6h) et le week-end, toutes catégories. */
  surchargeMultiplier: 1.25,
  nightStartHour: 22,
  nightEndHour: 6,
} as const;

export const BOOKING_RULES = {
  /** Délai minimum entre maintenant et la prise en charge. */
  minLeadMinutes: 90,
  /** Plafonds du formulaire : la plus grande capacité parmi les véhicules. */
  maxPassengers: Math.max(...VEHICLES.map((v) => v.passengers)),
  maxLuggage: Math.max(...VEHICLES.map((v) => v.luggage)),
  timeZone: "Europe/Paris",
  /**
   * Région de référence, utilisée pour signaler une adresse hors zone
   * habituelle. Ce n'est plus un refus : les transferts vers Francfort,
   * Stuttgart ou Baden-Baden font partie de l'offre.
   */
  allowedRegion: "Grand Est",
} as const;

/**
 * Destinations desservies, au-delà du Grand Est : les aéroports
 * transfrontaliers font partie de l'offre.
 */
export const SERVICE_ZONES = [
  { name: "Strasbourg-Entzheim", country: "France" },
  { name: "EuroAirport Bâle-Mulhouse-Fribourg", country: "France · Suisse · Allemagne" },
  { name: "Frankfurt am Main", country: "Allemagne" },
  { name: "Stuttgart", country: "Allemagne" },
  { name: "Baden Airpark (Baden-Baden)", country: "Allemagne" },
] as const;
