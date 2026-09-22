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
  /** Visuel de tête. Null quand aucun n'est fourni : le bloc est alors omis. */
  image: string | null;
  /** Point de cadrage quand le visuel est recadré (object-position). Centré par défaut. */
  imagePosition?: string;
  /** Objet pré-rempli du formulaire de devis. */
  subject: string;
};

export const SERVICES: Service[] = [
  {
    slug: "transferts-aeroport",
    label: "Transferts aéroport",
    eyebrow: "Entzheim, Bâle-Mulhouse, Francfort, Stuttgart, Baden",
    h1: { lead: "Transferts", accent: "aéroport." },
    title: "Transfert aéroport avec chauffeur · Strasbourg, Bâle, Francfort — Eco'Driver",
    description:
      "Transferts vers les aéroports de Strasbourg-Entzheim, Bâle-Mulhouse, Francfort, Stuttgart et Baden-Baden. Prix ferme, véhicules avec chauffeur.",
    intro:
      "Gagnez du temps, voyagez l'esprit tranquille. Le prix est fixé avant le départ et ne bouge plus, quel que soit le trafic.",
    points: [
      { k: "Aéroports", v: "France et Allemagne" },
      { k: "Horaires", v: "Vols tôt et tardifs" },
      { k: "Prix", v: "Ferme, payé en ligne" },
      { k: "Bagages", v: "Jusqu'à 8 en van" },
    ],
    sections: [
      {
        h2: "Les aéroports desservis",
        body: [
          "Strasbourg-Entzheim à une quinzaine de kilomètres du centre, l'EuroAirport Bâle-Mulhouse, et côté allemand Baden Airpark, Stuttgart et Francfort.",
          "Pour un vol au départ, indiquez votre numéro de vol dans la note : il sert de repère si l'horaire bouge.",
        ],
      },
      {
        h2: "Tôt le matin, tard le soir",
        body: [
          "Les réservations se prennent pour n'importe quelle heure. Une majoration de nuit s'applique alors, déjà comprise dans le prix affiché au moment de réserver.",
        ],
      },
    ],
    image: "/services/transferts-aeroport.webp",
    subject: "Demande — transfert aéroport",
  },
  {
    slug: "strasbourg-institutions",
    label: "Strasbourg & institutions",
    eyebrow: "Parlement européen, Conseil de l'Europe, CEDH",
    h1: { lead: "Strasbourg et les", accent: "institutions européennes." },
    title: "VTC Strasbourg & institutions européennes — Eco'Driver",
    description:
      "Transport avec chauffeur vers le Parlement européen, le Conseil de l'Europe et la CEDH. Sessions parlementaires, délégations, transferts depuis l'aéroport et la gare.",
    intro:
      "Partez à la découverte du cœur de l'Europe avec un service de transport fiable et confortable. Sessions, délégations, rendez-vous institutionnels : les horaires sont tenus.",
    points: [
      { k: "Ponctualité", v: "Horaires institutionnels tenus" },
      { k: "Confort", v: "Berline ou van, au choix" },
      { k: "Chauffeur", v: "Professionnel et discret" },
      { k: "Transferts", v: "Gare et aéroport inclus" },
    ],
    sections: [
      {
        h2: "Pour qui",
        body: [
          "Délégations en session, collaborateurs parlementaires, visiteurs et journalistes accrédités, entreprises reçues au quartier européen.",
          "Les prises en charge se font à la gare de Strasbourg, à l'aéroport d'Entzheim ou devant votre hôtel, selon ce qui vous arrange.",
        ],
      },
      {
        h2: "Pendant les sessions",
        body: [
          "Les semaines de session concentrent les demandes. Réservez à l'avance : les créneaux se remplissent, et une mise à disposition sur la journée évite d'avoir à recommander à chaque déplacement.",
        ],
      },
    ],
    image: "/services/strasbourg-institutions.webp",
    subject: "Demande — Strasbourg et institutions européennes",
  },
  {
    slug: "route-des-vins",
    label: "Route des vins d'Alsace",
    eyebrow: "Circuits et mise à disposition",
    h1: { lead: "La route des vins", accent: "d'Alsace." },
    title: "Route des vins d'Alsace avec chauffeur — Eco'Driver",
    description:
      "Circuits sur la route des vins d'Alsace avec chauffeur privé : villages authentiques, domaines viticoles, dégustations. Mise à disposition à l'heure, jusqu'à 8 passagers.",
    intro:
      "Des villages authentiques, des paysages uniques, une expérience inoubliable. Le chauffeur reste avec vous : vous dégustez, il conduit.",
    points: [
      { k: "Découverte", v: "Villages et domaines" },
      { k: "Gastronomie", v: "Dégustations sans conduire" },
      { k: "Sur mesure", v: "Parcours libre" },
      { k: "Tarif", v: "60 € par heure" },
    ],
    sections: [
      {
        h2: "La mise à disposition",
        body: [
          "Le véhicule et le chauffeur sont à vous pour la durée réservée. Vous vous arrêtez où vous voulez, aussi longtemps que vous voulez, et vous repartez quand vous le décidez.",
          "C'est la formule qui convient aux dégustations : personne n'a à se priver ni à surveiller l'heure du retour.",
        ],
      },
      {
        h2: "Les incontournables",
        body: [
          "Obernai, Ribeauvillé, Riquewihr, Kaysersberg, Eguisheim : la route des vins se parcourt du nord au sud sur une centaine de kilomètres. Une demi-journée permet d'en voir trois ou quatre, une journée complète d'aller jusqu'à Colmar.",
        ],
      },
    ],
    image: "/services/route-des-vins.webp",
    subject: "Demande — circuit route des vins",
  },
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
      { k: "Rotations", v: "Plusieurs trajets sur une soirée" },
      { k: "Véhicules", v: "Jusqu'à 8 passagers" },
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
    ],
    image: "/services/evenementiel.webp",
    // Les mariés sont à gauche : un recadrage centré les coupait sur la carte.
    imagePosition: "15% center",
    subject: "Demande de devis — événementiel",
  },
  {
    slug: "professionnels",
    label: "Professionnels",
    eyebrow: "Entreprises, hôtels, agences",
    h1: { lead: "Vos clients,", accent: "pris en charge." },
    title: "VTC entreprises et professionnels · Grand Est — Eco'Driver",
    description:
      "Mise à disposition pour entreprises, hôtels, agences et établissements de nuit dans le Grand Est. Transferts récurrents, clientèle VIP, facturation groupée.",
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
        ],
      },
    ],
    image: "/services/professionnels.webp",
    subject: "Demande de partenariat — professionnels",
  },
];

export function serviceBySlug(slug: string) {
  return SERVICES.find((s) => s.slug === slug);
}

/**
 * Points d'intérêt mis en avant sur la page route des vins.
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

/**
 * Repères affichés sur la carte d'accueil (Google Maps).
 *
 * Mêmes coordonnées que ci-dessus (Base Adresse Nationale) ; le Parlement
 * européen vient d'OpenStreetMap (Photon, bâtiment Louise Weiss), la BAN ne
 * connaissant que l'allée du Printemps. Aucune valeur devinée.
 */
export const MAP_LANDMARKS: { name: string; lng: number; lat: number }[] = [
  ...TOURIST_SPOTS.map(({ name, lng, lat }) => ({
    name: name.replace("Cathédrale de Strasbourg", "Cathédrale").replace("Gare de Strasbourg", "Gare").replace("Aéroport d'Entzheim", "Aéroport"),
    lng,
    lat,
  })),
  { name: "Parlement européen", lng: 7.7692853, lat: 48.597022 },
];
