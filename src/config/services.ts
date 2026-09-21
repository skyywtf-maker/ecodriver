import { SERVICE_ZONES } from "./pricing";

/**
 * Prestations proposées en plus du trajet classique.
 *
 * Chacune a sa page et renvoie vers un formulaire de devis : ces demandes ne
 * se tarifent pas automatiquement, elles se discutent.
 */
export type Service = {
  slug: string;
  /** Intitulé court, pour la navigation et le pied de page. */
  label: string;
  eyebrow: string;
  h1: { lead: string; accent: string };
  title: string;
  description: string;
  intro: string;
  /** Arguments courts, affichés en tuiles. */
  points: { k: string; v: string }[];
  sections: { h2: string; body: string[] }[];
  /** Objet pré-rempli du formulaire de devis. */
  subject: string;
};

const ZONES = SERVICE_ZONES.map((z) => z.name).join(", ");

export const SERVICES: Service[] = [
  {
    slug: "evenementiel",
    label: "Événementiel",
    eyebrow: "Mariages, séminaires, soirées",
    h1: { lead: "Votre événement,", accent: "conduit." },
    title: "VTC événementiel · Mariage, séminaire, soirée — Eco'Driver",
    description:
      "Chauffeur privé pour vos événements dans le Grand Est : mariages, séminaires, soirées d'entreprise. Devis sur mesure, véhicules jusqu'à 8 passagers.",
    intro:
      "Un mariage, un séminaire, une soirée : les trajets ne se résument plus à un aller simple. On cale les horaires, les véhicules et les rotations ensemble, et le devis est fixé à l'avance.",
    points: [
      { k: "Rotations", v: "Plusieurs trajets sur une même soirée" },
      { k: "Véhicules", v: "Jusqu'à 8 passagers en van" },
      { k: "Horaires", v: "Nuit et week-end compris" },
      { k: "Devis", v: "Fixé avant l'événement" },
    ],
    sections: [
      {
        h2: "Ce que couvre la prestation",
        body: [
          "Navettes entre le lieu de réception et les hébergements, transferts depuis la gare ou l'aéroport pour les invités venus de loin, retours échelonnés en fin de soirée.",
          "Le nombre de véhicules et les horaires se définissent en amont : c'est ce qui permet d'annoncer un prix ferme plutôt qu'une estimation.",
        ],
      },
      {
        h2: "Comment ça se passe",
        body: [
          "Vous décrivez l'événement dans le formulaire ci-dessous — date, lieux, nombre de personnes, horaires envisagés. Vous recevez un devis par retour, et rien n'est engagé tant que vous ne l'avez pas accepté.",
        ],
      },
    ],
    subject: "Demande de devis — événementiel",
  },
  {
    slug: "tourisme",
    label: "Circuits touristiques",
    eyebrow: "Mise à disposition, à l'heure",
    h1: { lead: "L'Alsace,", accent: "à votre rythme." },
    title: "Circuits touristiques avec chauffeur · Alsace — Eco'Driver",
    description:
      "Mise à disposition avec chauffeur pour découvrir Strasbourg et l'Alsace : route des vins, châteaux, marchés de Noël. Tarif horaire, véhicule jusqu'à 8 passagers.",
    intro:
      "Une journée ou une demi-journée, le véhicule et le chauffeur sont à vous. Pas de compteur kilométrique : on facture le temps, vous décidez du parcours.",
    points: [
      { k: "Tarif", v: "60 € par heure" },
      { k: "Véhicule", v: "Van jusqu'à 8 passagers" },
      { k: "Parcours", v: "Libre, modifiable en route" },
      { k: "Durée", v: "Demi-journée ou journée" },
    ],
    sections: [
      {
        h2: "La mise à disposition",
        body: [
          "Le chauffeur reste avec vous pendant toute la durée réservée. Vous vous arrêtez où vous voulez, aussi longtemps que vous voulez, et vous repartez quand vous le décidez.",
          "C'est la formule qui convient aux visites : route des vins, châteaux du Bas-Rhin, villages alsaciens, marchés de Noël en décembre.",
        ],
      },
      {
        h2: "Au départ de Strasbourg et au-delà",
        body: [
          `Le point de départ se choisit librement, y compris depuis les aéroports desservis : ${ZONES}.`,
        ],
      },
    ],
    subject: "Demande de devis — circuit touristique",
  },
  {
    slug: "professionnels",
    label: "Professionnels",
    eyebrow: "Entreprises, hôtels, agences",
    h1: { lead: "Vos clients,", accent: "pris en charge." },
    title: "VTC entreprises et professionnels · Grand Est — Eco'Driver",
    description:
      "Mise à disposition pour entreprises, hôtels, agences et établissements de nuit dans le Grand Est. Transferts récurrents, clientèle VIP, facturation au mois.",
    intro:
      "Transferts de collaborateurs, navettes clients, prises en charge VIP. Un interlocuteur unique, un chauffeur identifié, et des trajets qui se répètent sans avoir à tout réexpliquer.",
    points: [
      { k: "Récurrence", v: "Trajets planifiés à l'avance" },
      { k: "Interlocuteur", v: "Un seul, toujours le même" },
      { k: "Discrétion", v: "Clientèle VIP et soirées" },
      { k: "Facturation", v: "Groupée, sur demande" },
    ],
    sections: [
      {
        h2: "À qui ça s'adresse",
        body: [
          "Entreprises qui déplacent régulièrement des collaborateurs ou des clients vers les aéroports et les gares. Hôtels qui veulent proposer un transfert à leurs clients. Agences événementielles et établissements de nuit qui ont besoin d'un chauffeur fiable sur des horaires tardifs.",
        ],
      },
      {
        h2: "Ce qu'on met en place",
        body: [
          "Un échange pour cadrer vos besoins — fréquence, destinations habituelles, véhicules — puis une grille tarifaire qui vous est propre. Les courses se commandent ensuite directement, sans repasser par un devis à chaque fois.",
          "Pas de compte en ligne à ce stade : tout passe par email et par téléphone, ce qui reste le plus rapide pour ce volume.",
        ],
      },
    ],
    subject: "Demande de partenariat — professionnels",
  },
];

export function serviceBySlug(slug: string) {
  return SERVICES.find((s) => s.slug === slug);
}

/**
 * Points d'intérêt mis en avant sur la page tourisme.
 *
 * Coordonnées relevées sur la Base Adresse Nationale. Les visuels sont à
 * déposer dans public/tourisme/ ; un dégradé prend le relais tant qu'ils
 * manquent, plutôt qu'une image cassée.
 */
export const TOURIST_SPOTS = [
  {
    name: "Cathédrale de Strasbourg",
    text: "Le grès rose, la flèche à 142 mètres et l'horloge astronomique, au cœur de la Grande Île.",
    image: "/tourisme/cathedrale.jpg",
    lng: 7.7509,
    lat: 48.5819,
  },
  {
    name: "La Petite France",
    text: "Maisons à colombages, canaux et ponts couverts, l'ancien quartier des tanneurs.",
    image: "/tourisme/petite-france.jpg",
    lng: 7.7409,
    lat: 48.5797,
  },
  {
    name: "Gare de Strasbourg",
    text: "La verrière contemporaine posée sur la gare de 1883, porte d'entrée de la ville.",
    image: "/tourisme/gare.jpg",
    lng: 7.7356,
    lat: 48.5844,
  },
  {
    name: "Aéroport d'Entzheim",
    text: "À une quinzaine de kilomètres du centre, relié en quelques minutes.",
    image: "/tourisme/entzheim.jpg",
    lng: 7.624,
    lat: 48.5466,
  },
] as const;
