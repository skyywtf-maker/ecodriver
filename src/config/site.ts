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
    model: "[Modèle]", // TODO
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
