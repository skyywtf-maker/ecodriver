/**
 * Lieux courants d'un VTC du Grand Est.
 *
 * La Base Adresse Nationale couvre les rues et les communes, mais pas les
 * points d'intérêt : « aéroport » ou « gare » n'y donnent rien d'exploitable,
 * alors que ce sont les deux requêtes les plus fréquentes ici.
 *
 * Aucune coordonnée n'est écrite à la main. Chaque lieu pointe vers une
 * adresse réelle (`address`) que la BAN résout : le point de prise en charge
 * vient donc toujours du référentiel officiel, jamais d'une valeur devinée.
 * L'adresse résolue reste affichée sous le nom, pour que le client voie
 * exactement où le chauffeur viendra.
 */
export type CuratedPlace = {
  /** Nom affiché, celui que le client a en tête. */
  label: string;
  /** Termes de recherche, sans accents ni majuscules. */
  keywords: string[];
  /** Adresse envoyée à la BAN pour obtenir les coordonnées. */
  address: string;
};

export const CURATED_PLACES: CuratedPlace[] = [
  {
    label: "Aéroport de Strasbourg-Entzheim",
    keywords: ["aeroport strasbourg", "entzheim", "sxb", "airport strasbourg", "aeroport entzheim"],
    address: "Allée de l'Europe 67960 Entzheim",
  },
  {
    label: "Gare de Strasbourg",
    keywords: ["gare strasbourg", "gare centrale strasbourg", "strasbourg train station", "tgv strasbourg"],
    address: "Place de la Gare 67000 Strasbourg",
  },
  {
    label: "Parlement européen, Strasbourg",
    keywords: ["parlement europeen", "parlement", "union europeenne", "conseil de l europe"],
    address: "Allée du Printemps 67000 Strasbourg",
  },
  {
    label: "EuroAirport Bâle-Mulhouse",
    keywords: ["euroairport", "bale mulhouse", "aeroport mulhouse", "bsl", "aeroport bale"],
    address: "Rue de l'Aéroport 68300 Saint-Louis",
  },
  {
    label: "Aéroport de Francfort",
    keywords: ["francfort", "frankfurt", "fra", "aeroport francfort"],
    address: "Frankfurt Airport, 60547 Frankfurt am Main",
  },
  {
    label: "Aéroport de Stuttgart",
    keywords: ["stuttgart", "str", "aeroport stuttgart"],
    address: "Flughafen Stuttgart, 70629 Stuttgart",
  },
  {
    label: "Baden Airpark, Baden-Baden",
    keywords: ["baden", "baden baden", "karlsruhe", "fkb", "baden airpark"],
    address: "Victoria Boulevard, 77836 Rheinmünster",
  },
  {
    label: "Gare de Colmar",
    keywords: ["gare colmar"],
    address: "Place de la Gare 68000 Colmar",
  },
  {
    label: "Gare de Metz",
    keywords: ["gare metz"],
    address: "Place du Général de Gaulle 57000 Metz",
  },
  {
    label: "Gare de Nancy",
    keywords: ["gare nancy"],
    address: "Allée Adolphe Thiers 54000 Nancy",
  },
  {
    label: "Gare Lorraine TGV",
    keywords: ["lorraine tgv", "gare lorraine", "louvigny"],
    address: "Gare de Lorraine Tgv 57420 Louvigny",
  },
];

/** Normalise pour comparer sans accents ni casse. */
export function normalize(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/** Lieux dont un mot-clé commence par ce que le visiteur a tapé. */
export function matchCurated(query: string): CuratedPlace[] {
  const q = normalize(query);
  if (q.length < 2) return [];
  return CURATED_PLACES.filter(
    (p) => p.keywords.some((k) => normalize(k).includes(q)) || normalize(p.label).includes(q)
  );
}
