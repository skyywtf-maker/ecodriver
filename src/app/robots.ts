import type { MetadataRoute } from "next";
import { SITE } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Espace chauffeur, suivi nominatif et retour de paiement : rien à indexer,
      // et le suivi contient des données personnelles.
      disallow: ["/chauffeur", "/suivi", "/reserver/confirmation"],
    },
    sitemap: `${SITE.url}/sitemap.xml`,
  };
}
