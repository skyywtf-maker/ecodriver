/**
 * Logo du site.
 *
 * `file` est la source de vérité : déposer le fichier dans public/ et
 * renseigner son chemin ici suffit, le composant Logo n'a pas à changer.
 * Tant qu'il vaut null, le logotype texte prend le relais.
 *
 * `fileDark` est la déclinaison pour fonds clairs, facultative.
 */
export const LOGO = {
  file: "/logo.png" as string | null,
  fileDark: null as string | null,
  alt: "Eco'Driver, transport de personnes",
  /** Proportions du fichier fourni, pour réserver la place avant chargement. */
  width: 2811,
  height: 900,
} as const;

/**
 * URL publique du site.
 *
 * `??` ne se déclenche que sur undefined : une variable d'environnement
 * définie mais VIDE passait au travers, et `new URL("")` faisait échouer le
 * build entier sur « Invalid URL ». On teste donc le contenu, pas l'absence.
 *
 * À défaut, Vercel fournit l'URL du déploiement : le site reste cohérent même
 * si personne n'a renseigné le domaine.
 */
function siteUrl() {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/+$/, "");

  // URL stable du projet, et non celle du déploiement : NEXT_PUBLIC_VERCEL_URL
  // change à chaque build, ce qui ferait pointer les canoniques et le sitemap
  // vers des adresses mortes au déploiement suivant.
  const production = process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (production) return `https://${production.replace(/^https?:\/\//, "")}`;

  return "http://localhost:3000";
}

export const SITE = {
  name: "Eco Driver",
  tagline: "Chauffeur privé, Grand Est.",
  phoneDisplay: "+33 6 35 21 09 92",
  phoneHref: "tel:+33635210992",
  email: "contact@eco-driver.fr", // TODO
  url: siteUrl(),
  /** Centre de la carte par défaut (Strasbourg) */
  base: { lng: 7.7521, lat: 48.5734 },
  /** Coordonnées issues de la Base Adresse Nationale, jamais saisies à la main. */
  cities: [
    { country: "France", name: "Strasbourg", km: "Base", lng: 7.7615, lat: 48.5798 },
    { country: "France", name: "Colmar", km: "≈ 75 km", lng: 7.3526, lat: 48.0818 },
    { country: "France", name: "Mulhouse", km: "≈ 115 km", lng: 7.3265, lat: 47.7517 },
    { country: "France", name: "Nancy", km: "≈ 155 km", lng: 6.1713, lat: 48.6881 },
    { country: "France", name: "Metz", km: "≈ 165 km", lng: 6.1949, lat: 49.1084 },
    { country: "France", name: "Troyes", km: "≈ 325 km", lng: 4.0751, lat: 48.2928 },
    { country: "France", name: "Reims", km: "≈ 345 km", lng: 4.0556, lat: 49.2509 },
    { country: "France", name: "Charleville-Mézières", km: "≈ 360 km", lng: 4.7173, lat: 49.7676 },
    { country: "Allemagne", name: "Baden-Baden", km: "≈ 60 km", lng: 8.2406, lat: 48.7606 },
    { country: "Allemagne", name: "Karlsruhe", km: "≈ 85 km", lng: 8.4037, lat: 49.0069 },
    { country: "Allemagne", name: "Stuttgart", km: "≈ 155 km", lng: 9.1829, lat: 48.7758 },
    { country: "Allemagne", name: "Francfort", km: "≈ 220 km", lng: 8.6821, lat: 50.1109 },
  ],
  /**
   * Chiffres de la marque, vérifiables. Remplacent la fiche individuelle du
   * chauffeur : c'est le service qu'on met en avant, pas une personne.
   */
  trust: [
    // Confirmé par le client le 22 septembre 2026.
    { k: "Expérience", v: "4 ans", d: "de transport de personnes dans le Grand Est." },
    { k: "Courses notées", v: "500", d: "sur les 500 dernières évaluations Uber." },
    { k: "Note moyenne", v: "4,99 / 5", d: "496 courses notées cinq étoiles." },
    { k: "Prix", v: "Ferme", d: "affiché avant paiement, jamais révisé après." },
  ],

  /** Section véhicules de l'accueil. Les fiches vivent dans config/pricing.ts. */
  vehicle: {
    accent: "trois catégories.",
    intro: "Du trajet quotidien au groupe de huit, avec la même exigence de confort et de ponctualité.",
    /** Modèle 3D d'illustration de la berline. */
    model3d: "/vehicule/tesla-model-3.glb",
  },

  /**
   * Note réelle relevée sur le profil Uber du chauffeur, le 22 septembre 2026 :
   * 4,99 sur 500 dernières courses (496 × 5★, 3 × 4★, 1 × 1★).
   * À réactualiser de temps en temps, elle évolue avec les courses.
   */
  reviewSummary: {
    rating: 4.99 as number | null,
    count: 500,
    source: "Uber",
    url: "",
  },

  /**
   * Motifs de satisfaction les plus cités par les passagers, tels
   * qu'agrégés par Uber. Ce sont des catégories, pas des avis individuels :
   * on ne leur invente donc ni auteur ni texte.
   */
  reviewHighlights: [
    { title: "Excellent service", text: "Service aimable, attentionné et professionnel." },
    { title: "Beau véhicule", text: "Véhicule confortable et bien entretenu." },
    { title: "Conduite fluide", text: "Conduite sûre, fluide et confortable." },
  ],

  /** Commentaires laissés par des passagers. Verbatim, sans retouche. */
  reviews: [
    { text: "Hyper sympathique.", author: "Un passager", route: "Avis Uber" },
  ],
} as const;

/**
 * Identité de l'entreprise, utilisée par les données structurées
 * (LocalBusiness / TaxiService) et les mentions légales.
 *
 * Google recoupe ces informations avec la fiche Google Business Profile :
 * le nom, l'adresse et le téléphone doivent être IDENTIQUES des deux côtés,
 * au caractère près. Tout ce qui reste entre crochets est à remplir avant
 * la mise en ligne, sinon il vaut mieux retirer le champ que le publier faux.
 */
export const BUSINESS = {
  legalName: "[Raison sociale du chauffeur]", // TODO
  /** Numéro d'inscription au registre VTC (EVTC), obligatoire en mentions légales. */
  evtc: "[Numéro EVTC]", // TODO
  siret: "[SIRET]", // TODO
  address: {
    street: "[Adresse]", // TODO
    postalCode: "[Code postal]", // TODO
    city: "Strasbourg", // TODO: commune réelle de domiciliation
    country: "FR",
  },
  /** Coordonnées du point de rattachement, pour le SEO local. */
  geo: { lat: 48.5734, lng: 7.7521 },
  /** Fourchette indicative affichée par Google. */
  priceRange: "€€",
  /** Le chauffeur prend les réservations en ligne 24 h/24. TODO: confirmer les plages réelles. */
  opensAllHours: true,
  /** Profils à lier quand ils existeront (Google Business Profile, Instagram...). */
  sameAs: [] as string[],
} as const;
