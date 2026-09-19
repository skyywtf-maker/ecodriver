import { BUSINESS, SITE } from "@/config/site";
import type { Landing } from "@/config/landing";

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

const AREA_SERVED = [
  { "@type": "AdministrativeArea", name: "Grand Est" },
  ...SITE.cities.map((c) => ({ "@type": "City", name: c.name })),
];

/**
 * Le nœud décrivant l'entreprise.
 *
 * Il est répété sur chaque page plutôt que référencé depuis l'accueil :
 * un `@id` ne se résout que dans le document courant, une référence vers un
 * nœud défini ailleurs reste pendante pour les moteurs.
 */
function businessNode() {
  return {
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
    address: {
      "@type": "PostalAddress",
      streetAddress: filled(BUSINESS.address.street),
      postalCode: filled(BUSINESS.address.postalCode),
      addressLocality: BUSINESS.address.city,
      addressRegion: "Grand Est",
      addressCountry: BUSINESS.address.country,
    },
    geo: { "@type": "GeoCoordinates", latitude: BUSINESS.geo.lat, longitude: BUSINESS.geo.lng },
    areaServed: AREA_SERVED,
    sameAs: BUSINESS.sameAs.length ? BUSINESS.sameAs : undefined,
    openingHoursSpecification: BUSINESS.opensAllHours
      ? {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
          opens: "00:00",
          closes: "23:59",
        }
      : undefined,
  };
}

/**
 * Données structurées de l'accueil : l'entreprise locale, le service de VTC
 * qu'elle rend, et le site lui-même.
 */
export function SiteStructuredData() {
  const graph = prune([
    businessNode(),
    {
      "@type": "TaxiService",
      "@id": `${SITE.url}/#service`,
      name: "VTC et chauffeur privé, Strasbourg et Grand Est",
      serviceType: "Voiture de transport avec chauffeur (VTC)",
      provider: { "@id": BUSINESS_ID },
      areaServed: AREA_SERVED,
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

/**
 * Données structurées d'une page de référencement local : l'entreprise, le
 * service rendu sur cette zone, le fil d'Ariane, et la FAQ de la page.
 *
 * La FAQ déclarée ici est exactement celle qui est visible à l'écran :
 * Google sanctionne les FAQ structurées absentes de la page.
 */
export function LandingStructuredData({ page }: { page: Landing }) {
  const url = `${SITE.url}${page.path}`;

  const graph = prune([
    businessNode(),
    {
      "@type": "TaxiService",
      "@id": `${url}#service`,
      name: page.title,
      description: page.description,
      serviceType: "Voiture de transport avec chauffeur (VTC)",
      provider: { "@id": BUSINESS_ID },
      areaServed: { "@type": "Place", name: page.area },
      availableChannel: {
        "@type": "ServiceChannel",
        serviceUrl: SITE.url,
        name: "Réservation en ligne",
      },
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${url}#fil-ariane`,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Accueil", item: SITE.url },
        { "@type": "ListItem", position: 2, name: page.shortLabel, item: url },
      ],
    },
    {
      "@type": "FAQPage",
      "@id": `${url}#faq`,
      mainEntity: page.faq.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ]);

  return <JsonLd data={{ "@context": "https://schema.org", "@graph": graph }} />;
}

export function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      // Contenu produit par nous, jamais par l'utilisateur ; on neutralise
      // malgré tout « < » pour qu'aucune chaîne ne puisse fermer la balise.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
