import { BUSINESS, SITE } from "@/config/site";

/**
 * Une valeur encore entre crochets est un placeholder : on la laisse tomber
 * plutôt que de la publier. Mieux vaut une donnée structurée incomplète
 * qu'une adresse « [Adresse] » indexée par Google.
 */
function filled(value: string): string | undefined {
  return value.includes("[") ? undefined : value;
}

/** Retire récursivement les champs vides pour ne pas publier d'objets creux. */
function prune<T>(value: T): T {
  if (Array.isArray(value)) return value.map(prune).filter((v) => v !== undefined) as T;
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) {
      const p = prune(v);
      if (p === undefined) continue;
      // Un objet réduit à son seul « @type » ne décrit plus rien.
      const keys = typeof p === "object" && p !== null && !Array.isArray(p) ? Object.keys(p) : null;
      if (keys && keys.length === 1 && keys[0] === "@type") continue;
      out[k] = p;
    }
    return (Object.keys(out).length ? out : undefined) as T;
  }
  return value;
}

const BUSINESS_ID = `${SITE.url}/#chauffeur`;

/**
 * Données structurées du site : l'entreprise locale, le service de VTC
 * qu'elle rend, et le site lui-même. À placer une seule fois, sur l'accueil.
 */
export function SiteStructuredData() {
  const address = prune({
    "@type": "PostalAddress",
    streetAddress: filled(BUSINESS.address.street),
    postalCode: filled(BUSINESS.address.postalCode),
    addressLocality: BUSINESS.address.city,
    addressRegion: "Grand Est",
    addressCountry: BUSINESS.address.country,
  });

  const areaServed = [
    { "@type": "AdministrativeArea", name: "Grand Est" },
    ...SITE.cities.map((c) => ({ "@type": "City", name: c.name })),
  ];

  const graph = prune([
    {
      "@type": "LocalBusiness",
      "@id": BUSINESS_ID,
      name: SITE.name,
      legalName: filled(BUSINESS.legalName),
      description:
        "Chauffeur privé VTC indépendant basé à Strasbourg, pour vos trajets dans le Grand Est : aéroport d'Entzheim, gare de Strasbourg, gares TGV et déplacements professionnels.",
      url: SITE.url,
      telephone: filled(SITE.phoneDisplay),
      email: SITE.email,
      image: `${SITE.url}/opengraph-image.png`,
      priceRange: BUSINESS.priceRange,
      currenciesAccepted: "EUR",
      paymentAccepted: "Carte bancaire",
      vatID: filled(BUSINESS.siret),
      address,
      geo: { "@type": "GeoCoordinates", latitude: BUSINESS.geo.lat, longitude: BUSINESS.geo.lng },
      areaServed,
      sameAs: BUSINESS.sameAs.length ? BUSINESS.sameAs : undefined,
      openingHoursSpecification: BUSINESS.opensAllHours
        ? {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
            opens: "00:00",
            closes: "23:59",
          }
        : undefined,
    },
    {
      "@type": "TaxiService",
      "@id": `${SITE.url}/#service`,
      name: "VTC et chauffeur privé, Strasbourg et Grand Est",
      serviceType: "Voiture de transport avec chauffeur (VTC)",
      provider: { "@id": BUSINESS_ID },
      areaServed,
      availableChannel: {
        "@type": "ServiceChannel",
        serviceUrl: SITE.url,
        name: "Réservation en ligne",
      },
    },
    {
      "@type": "WebSite",
      "@id": `${SITE.url}/#site`,
      url: SITE.url,
      name: SITE.name,
      inLanguage: "fr-FR",
      publisher: { "@id": BUSINESS_ID },
    },
  ]);

  return <JsonLd data={{ "@context": "https://schema.org", "@graph": graph }} />;
}

export function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      // Contenu produit par nous, jamais par l'utilisateur.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\u003c") }}
    />
  );
}
