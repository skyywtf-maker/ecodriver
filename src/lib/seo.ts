import type { Metadata } from "next";
import type { Landing } from "@/config/landing";

/**
 * Métadonnées d'une page de référencement local.
 *
 * Le titre est déclaré en `absolute` pour court-circuiter le gabarit
 * « %s · Eco Driver » du layout : ces titres portent déjà leur contexte, et
 * le suffixe les ferait passer au-delà de ce que Google affiche.
 */
export function landingMetadata(page: Landing): Metadata {
  return {
    title: { absolute: page.title },
    description: page.description,
    alternates: { canonical: page.path },
    openGraph: {
      type: "website",
      locale: "fr_FR",
      url: page.path,
      title: page.title,
      description: page.description,
    },
    twitter: {
      card: "summary_large_image",
      title: page.title,
      description: page.description,
    },
  };
}
