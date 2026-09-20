import { BOOKING_RULES } from "./pricing";
import { CURATED_PLACES, type CuratedPlace } from "./places";
import { SITE } from "./site";

/**
 * Contenu des pages de référencement local.
 *
 * Règle de rédaction : aucune promesse que le chauffeur n'a pas validée, et
 * AUCUN prix chiffré. Les tarifs de `pricing.ts` sont provisoires et le
 * CLAUDE.md interdit toute valeur de prix hors de ce fichier ; ces pages
 * parlent donc de la méthode de calcul, jamais d'un montant.
 *
 * Les chiffres de service (délai, passagers, bagages) sont lus dans
 * BOOKING_RULES : ils resteront justes si les règles changent.
 */

export type Landing = {
  /** Chemin complet, sans slash final. */
  path: string;
  /** Titre de page : le mot d'accent passe en Playfair italique. */
  h1: { lead: string; accent: string };
  title: string;
  description: string;
  /** Petite étiquette au-dessus du H1. */
  eyebrow: string;
  intro: string;
  sections: Array<{ h2: string; body: string[] }>;
  highlights: Array<{ k: string; v: string }>;
  faq: Array<{ q: string; a: string }>;
  /** Zone décrite, pour les données structurées. */
  area: string;
  /** Libellé dans le fil d'Ariane et le maillage interne. */
  shortLabel: string;
};

const LEAD = BOOKING_RULES.minLeadMinutes;
const PASSENGERS = BOOKING_RULES.maxPassengers;
const LUGGAGE = BOOKING_RULES.maxLuggage;

/** Paragraphes communs : le prix et la zone, formulés une seule fois. */
const PRICE_BODY = [
  "Le prix est calculé sur la distance réelle de l'itinéraire, puis affiché avant que vous ne payiez. C'est celui-là que vous réglez : pas de compteur qui tourne, pas de supplément découvert à l'arrivée.",
  "Une majoration s'applique la nuit et le week-end. Elle est déjà comprise dans le montant affiché au moment de la réservation.",
  "Le paiement se fait en ligne par carte. Si le chauffeur ne peut pas assurer la course, elle est remboursée intégralement et automatiquement.",
];

const AREA_BODY = [
  `Le service couvre le ${BOOKING_RULES.allowedRegion} : le point de départ comme le point d'arrivée doivent s'y trouver. C'est un chauffeur indépendant, avec un seul véhicule — d'où la réservation à l'avance plutôt que la course immédiate.`,
];

const COMMON_FAQ: Landing["faq"] = [
  {
    q: "Quelle différence entre un VTC et un taxi ?",
    a: `Un VTC se réserve à l'avance : il ne se hèle pas dans la rue et ne stationne pas en station. En contrepartie, le véhicule est attribué à votre course et le prix est connu avant le départ. Comptez au moins ${LEAD} minutes entre la réservation et la prise en charge.`,
  },
  {
    q: "Combien de temps à l'avance faut-il réserver ?",
    a: `${LEAD} minutes au minimum. Au-delà, vous pouvez réserver pour n'importe quelle date à venir.`,
  },
  {
    q: "Combien de passagers et de bagages ?",
    a: `Jusqu'à ${PASSENGERS} passagers et ${LUGGAGE} valises. Un siège enfant est disponible sur demande : indiquez-le dans la note au moment de la réservation.`,
  },
  {
    q: "Comment se passe le paiement ?",
    a: "En ligne par carte bancaire, au moment de la réservation. Le chauffeur confirme ensuite la course ; s'il ne peut pas l'assurer, vous êtes remboursé en totalité, sans démarche de votre part.",
  },
];

const COMMON_HIGHLIGHTS: Landing["highlights"] = [
  { k: "Délai minimum", v: `${LEAD} min` },
  { k: "Passagers", v: `Jusqu'à ${PASSENGERS}` },
  { k: "Bagages", v: `${LUGGAGE} valises` },
  { k: "Paiement", v: "En ligne, prix ferme" },
];

export const LANDINGS: Landing[] = [
  {
    path: "/vtc-strasbourg",
    eyebrow: "Bas-Rhin · Grand Est",
    h1: { lead: "VTC à Strasbourg,", accent: "sur réservation." },
    title: "VTC Strasbourg · Chauffeur privé à réserver en ligne",
    description:
      "VTC à Strasbourg : réservez un chauffeur privé en ligne, avec le prix affiché avant paiement. Aéroport d'Entzheim, gare centrale, déplacements professionnels et trajets dans tout le Grand Est.",
    intro:
      "Un chauffeur privé indépendant, un seul véhicule, des courses réservées à l'avance dans Strasbourg et son agglomération. Vous voyez le prix avant de payer, et il ne bouge plus.",
    highlights: COMMON_HIGHLIGHTS,
    sections: [
      {
        h2: "Chauffeur privé à Strasbourg et dans l'agglomération",
        body: [
          "Rendez-vous professionnel, correspondance à prendre, soirée sans voiture : la course se réserve en ligne, à l'heure que vous choisissez, et le chauffeur vous confirme la prise en charge.",
          ...AREA_BODY,
        ],
      },
      {
        h2: "Le prix, connu avant de réserver",
        body: PRICE_BODY,
      },
      {
        h2: "Les trajets les plus demandés au départ de Strasbourg",
        body: [
          "L'aéroport de Strasbourg-Entzheim et la gare centrale concentrent l'essentiel des réservations. Viennent ensuite les liaisons vers les autres villes du Grand Est, de Colmar à Reims.",
        ],
      },
    ],
    faq: COMMON_FAQ,
    area: "Strasbourg",
    shortLabel: "Strasbourg",
  },
  {
    path: "/vtc-aeroport-entzheim",
    eyebrow: "Aéroport de Strasbourg · SXB",
    h1: { lead: "VTC aéroport", accent: "d'Entzheim." },
    title: "VTC aéroport Entzheim · Transfert depuis et vers Strasbourg",
    description:
      "Transfert VTC entre l'aéroport de Strasbourg-Entzheim et Strasbourg ou le reste du Grand Est. Réservation en ligne, prix ferme affiché avant paiement, chauffeur privé.",
    intro:
      "L'aéroport de Strasbourg-Entzheim se trouve à une quinzaine de kilomètres du centre de Strasbourg. Réservez votre transfert à l'avance : le chauffeur vous attend, le prix est fixé.",
    highlights: COMMON_HIGHLIGHTS,
    sections: [
      {
        h2: "Transfert aéroport, dans les deux sens",
        body: [
          "Vers l'aéroport comme au retour, la course se réserve en ligne pour l'horaire de votre choix. Indiquez votre numéro de vol dans la note au moment de la réservation : le chauffeur en tient compte.",
          ...AREA_BODY,
        ],
      },
      {
        h2: "Vols tôt le matin, vols tardifs",
        body: [
          "Les réservations se prennent pour n'importe quelle heure, y compris avant les premiers vols et après les derniers. Une majoration de nuit s'applique alors, déjà comprise dans le prix affiché.",
        ],
      },
      {
        h2: "Bagages et passagers",
        body: [
          `Le véhicule accueille jusqu'à ${PASSENGERS} passagers et ${LUGGAGE} valises. Si vous voyagez avec davantage de bagages ou un équipement encombrant, signalez-le dans la note : le chauffeur vous dira avant la course si c'est jouable.`,
        ],
      },
      {
        h2: "Le prix, connu avant de réserver",
        body: PRICE_BODY,
      },
    ],
    faq: COMMON_FAQ,
    area: "Aéroport de Strasbourg-Entzheim",
    shortLabel: "Aéroport d'Entzheim",
  },
  {
    path: "/vtc-gare-strasbourg",
    eyebrow: "Gare de Strasbourg · TGV",
    h1: { lead: "VTC gare de", accent: "Strasbourg." },
    title: "VTC gare de Strasbourg · Chauffeur privé à la gare centrale",
    description:
      "VTC à la gare de Strasbourg : prise en charge et dépose à la gare centrale, réservées en ligne. Prix ferme affiché avant paiement, liaisons vers tout le Grand Est.",
    intro:
      "Prise en charge ou dépose à la gare centrale de Strasbourg, réservée à l'avance. Vous descendez du train, la voiture est là ; vous partez en train, vous n'avez pas à surveiller l'heure.",
    highlights: COMMON_HIGHLIGHTS,
    sections: [
      {
        h2: "Départ et arrivée à la gare centrale",
        body: [
          "La gare de Strasbourg est le principal point de correspondance de la région : TGV vers Paris, liaisons vers le reste du Grand Est et l'Allemagne. Réserver la course en amont évite l'attente à l'arrivée comme le calcul de marge au départ.",
          ...AREA_BODY,
        ],
      },
      {
        h2: "Correspondances et déplacements professionnels",
        body: [
          "Pour un aller-retour dans la journée, les deux trajets se réservent séparément, chacun à son horaire. Chaque course est confirmée par le chauffeur et suivie depuis un lien qui vous est envoyé par email.",
        ],
      },
      {
        h2: "Le prix, connu avant de réserver",
        body: PRICE_BODY,
      },
    ],
    faq: COMMON_FAQ,
    area: "Gare de Strasbourg",
    shortLabel: "Gare de Strasbourg",
  },
];

/** Villes du gabarit `/vtc/[ville]` : toutes celles desservies, sauf la base. */
export const LANDING_CITIES = SITE.cities.filter((c) => c.name !== "Strasbourg");

export function citySlug(name: string) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Construit la page d'une ville desservie à partir de sa distance depuis Strasbourg. */
export function cityLanding(name: string, km: string): Landing {
  return {
    path: `/vtc/${citySlug(name)}`,
    eyebrow: `${km} depuis Strasbourg`,
    h1: { lead: "VTC et chauffeur privé à", accent: `${name}.` },
    title: `VTC ${name} · Chauffeur privé, Grand Est`,
    description: `VTC à ${name} et liaison avec Strasbourg : réservez un chauffeur privé en ligne, avec le prix affiché avant paiement. Service dans tout le Grand Est.`,
    intro: `${name} fait partie des villes desservies, à ${km.replace("≈ ", "environ ")} de Strasbourg. La course se réserve en ligne, dans un sens comme dans l'autre.`,
    highlights: COMMON_HIGHLIGHTS,
    sections: [
      {
        h2: `Se déplacer à ${name} et vers Strasbourg`,
        body: [
          `Liaison avec Strasbourg, transfert vers l'aéroport d'Entzheim, trajet entre deux villes de la région : tant que le départ et l'arrivée sont dans le ${BOOKING_RULES.allowedRegion}, la course peut être réservée.`,
          `Sur une distance comme celle-ci, réservez confortablement à l'avance : le délai minimum est de ${LEAD} minutes, mais une course longue se cale mieux la veille.`,
        ],
      },
      {
        h2: "Le prix, connu avant de réserver",
        body: PRICE_BODY,
      },
    ],
    faq: COMMON_FAQ,
    area: name,
    shortLabel: name,
  };
}

/**
 * Lieux déjà couverts par une page dédiée : inutile d'en générer une seconde
 * sous /transfert.
 */
const ALREADY_COVERED = ["Gare de Strasbourg", "Aéroport de Strasbourg-Entzheim"];

export const TRANSFER_PLACES = CURATED_PLACES.filter((p) => !ALREADY_COVERED.includes(p.label));

/** Page de transfert vers un lieu précis : gare, aéroport, institution. */
export function transferLanding(place: CuratedPlace): Landing {
  const { label, address } = place;
  return {
    path: `/transfert/${citySlug(label)}`,
    eyebrow: address,
    h1: { lead: "Transfert VTC", accent: `${label}.` },
    title: `VTC ${label} · Transfert avec chauffeur privé`,
    description: `Transfert en VTC vers ${label} et au départ de ce lieu. Réservation en ligne, prix affiché avant paiement, chauffeur privé dans tout le Grand Est.`,
    intro: `Prise en charge et dépose à ${label}. La course se réserve à l'avance, dans un sens comme dans l'autre, et le prix est fixé avant que vous ne payiez.`,
    highlights: COMMON_HIGHLIGHTS,
    sections: [
      {
        h2: `Se rendre à ${label}`,
        body: [
          `Le point de prise en charge est ${address}. Indiquez si besoin un point de rendez-vous plus précis dans la note au moment de la réservation.`,
          ...AREA_BODY,
        ],
      },
      {
        h2: "Horaires tôt ou tardifs",
        body: [
          `Les réservations se prennent pour n'importe quelle heure. Une majoration de nuit s'applique alors, déjà comprise dans le prix affiché. Comptez ${LEAD} minutes entre la réservation et la prise en charge.`,
        ],
      },
      { h2: "Le prix, connu avant de réserver", body: PRICE_BODY },
    ],
    faq: COMMON_FAQ,
    area: label,
    shortLabel: label,
  };
}

/** Toutes les pages de référencement, pour le sitemap et le maillage interne. */
export function allLandings(): Landing[] {
  return [
    ...LANDINGS,
    ...LANDING_CITIES.map((c) => cityLanding(c.name, c.km)),
    ...TRANSFER_PLACES.map(transferLanding),
  ];
}
