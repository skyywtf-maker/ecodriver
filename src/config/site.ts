export const SITE = {
  name: "Eco Driver",
  tagline: "Chauffeur privé, Grand Est.",
  phoneDisplay: "+33 [0 00 00 00 00]", // TODO: vrai numéro
  phoneHref: "tel:+33000000000",
  email: "contact@eco-driver.fr", // TODO
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
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
    /**
     * ⚠️ VALEUR INVENTÉE, POUR LA MAQUETTE UNIQUEMENT.
     *
     * Elle sert à voir la section remplie, rien d'autre. Elle porte sur une
     * personne réelle et nommée, et c'est un argument sur lequel un client
     * s'appuie pour choisir son chauffeur : à remplacer par le vrai chiffre
     * avant toute mise en ligne, ou à retirer de la page.
     */
    experienceYears: "9",
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
  // Avis statiques (MVP). TODO: remplacer par de vrais avis clients.
  reviews: [
    { text: "[Texte de l'avis client]", author: "[Prénom N.]", route: "Strasbourg → Entzheim" },
    { text: "[Texte de l'avis client]", author: "[Prénom N.]", route: "Colmar → Bâle-Mulhouse" },
    { text: "[Texte de l'avis client]", author: "[Prénom N.]", route: "Metz → Lorraine TGV" },
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
