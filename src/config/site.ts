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
    { name: "Strasbourg", km: "Base", lng: 7.7615, lat: 48.5798 },
    { name: "Colmar", km: "≈ 75 km", lng: 7.3526, lat: 48.0818 },
    { name: "Mulhouse", km: "≈ 115 km", lng: 7.3265, lat: 47.7517 },
    { name: "Nancy", km: "≈ 155 km", lng: 6.1713, lat: 48.6881 },
    { name: "Metz", km: "≈ 165 km", lng: 6.1949, lat: 49.1084 },
    { name: "Troyes", km: "≈ 325 km", lng: 4.0751, lat: 48.2928 },
    { name: "Reims", km: "≈ 345 km", lng: 4.0556, lat: 49.2509 },
    { name: "Charleville-Mézières", km: "≈ 360 km", lng: 4.7173, lat: 49.7676 },
  ],
  driver: {
    firstName: "Nicolas",
    role: "Chauffeur VTC indépendant",
    /**
     * Portrait détouré (fond transparent), converti en WebP : 3,2 Mo de PNG
     * ramenés à 132 Ko. Un monogramme prend le relais si le fichier manque.
     */
    photo: "/nicolas.webp",
    /** Validé avec Nicolas : ancienneté, sans date de création précise. */
    experienceYears: "4",
    /**
     * Pastilles disposées autour du portrait.
     *
     * Tout ce qui est entre crochets reste à remplir. Rien ici n'invente de
     * note, d'avis ni de nombre de courses : ce sont des affirmations
     * vérifiables sur une personne réelle, et une fausse note publiée est
     * une tromperie commerciale, pas un texte de remplissage.
     */
    stats: [
      { k: "Expérience", v: "4 ans", d: "Quatre ans de transport de personnes, 500 courses notées 4,99 sur 5." },
      { k: "Véhicule", v: "Tesla Model 3", d: "Berline électrique, 4 passagers, deux coffres." },
      { k: "Secteur", v: "Grand Est", d: "Départ et arrivée dans la région, de Strasbourg à Reims." },
      { k: "Langues", v: "[À compléter]", d: "Langues parlées à bord, à confirmer avec Nicolas." },
      { k: "Carte VTC", v: "[N° EVTC]", d: "Inscription au registre des VTC, obligatoire et vérifiable." },
      { k: "Paiement", v: "Prix ferme", d: "Réglé en ligne à la réservation, aucun supplément à l'arrivée." },
    ],

    /** TODO: à faire valider par Nicolas, c'est lui qui parle ici. */
    bio: [
      "Chauffeur indépendant basé à Strasbourg, au volant de sa propre voiture.",
      "Un seul véhicule et un seul interlocuteur : celui qui confirme votre course est celui qui vient vous chercher.",
    ],
  },

  vehicle: {
    model: "Tesla Model 3",
    /** Mot d'accent en Playfair dans le titre de la section. */
    accent: "100 % électrique.",
    /** Modèle 3D compressé (2,25 Mo), chargé seulement à l'approche de la section. */
    model3d: "/vehicule/tesla-model-3.glb",

    /**
     * Ce que le passager ressent, et rien d'autre.
     *
     * Les chiffres de catalogue (autonomie, 0 à 100, kWh/100 km, classe
     * énergétique) ont été retirés : ils ne disent rien à quelqu'un qui monte
     * à l'arrière pour aller à l'aéroport, et une partie n'est pas vérifiable
     * sur le véhicule de Nicolas.
     *
     * Tout ce qui figure ici est soit propre à un véhicule électrique, soit
     * commun à toutes les Model 3, soit une règle de service déjà validée.
     */
    comfort: [
      { k: "Silence à bord", v: "Moteur électrique, aucune vibration" },
      { k: "Climatisation", v: "Habitacle mis à température avant la montée" },
      { k: "Bagages", v: "Coffre arrière et coffre avant" },
      { k: "Places", v: "Jusqu'à 4 passagers" },
      { k: "Wifi", v: "Inclus, sans rien demander" },
      { k: "Siège enfant", v: "Sur demande à la réservation" },
    ],

    /**
     * Étiquettes ancrées sur la voiture en 3D, au-dessus de `lg`.
     * Le +Z du modèle est l'AVANT du véhicule : le coffre arrière est donc
     * en Z négatif. L'inverse plaçait le coffre arrière sur le capot.
     */
    hotspots: [
      { label: "Coffre arrière", at: [0, 1.05, 2.0] },
      { label: "Silence à bord", at: [0, 1.5, 0.15] },
      { label: "Coffre avant", at: [0, 0.95, -1.9] },
    ],
  },
  /**
   * Note réelle du profil Uber de Nicolas, relevée le 22 septembre 2026 :
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
