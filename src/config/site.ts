export const SITE = {
  name: "Eco Driver",
  tagline: "Chauffeur privé, Grand Est.",
  phoneDisplay: "+33 [0 00 00 00 00]", // TODO: vrai numéro
  phoneHref: "tel:+33000000000",
  email: "contact@eco-driver.fr", // TODO
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  /** Centre de la carte par défaut (Strasbourg) */
  base: { lng: 7.7521, lat: 48.5734 },
  cities: [
    { name: "Strasbourg", km: "Base" },
    { name: "Colmar", km: "≈ 75 km" },
    { name: "Mulhouse", km: "≈ 115 km" },
    { name: "Nancy", km: "≈ 155 km" },
    { name: "Metz", km: "≈ 165 km" },
    { name: "Troyes", km: "≈ 325 km" },
    { name: "Reims", km: "≈ 345 km" },
    { name: "Charleville-Mézières", km: "≈ 360 km" },
  ],
  vehicle: {
    model: "Tesla Model S",
    specs: [
      { k: "Passagers", v: "4 places" },
      { k: "Bagages", v: "3 valises" },
      { k: "Wifi", v: "Inclus" },
      { k: "Siège enfant", v: "Sur demande" },
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
