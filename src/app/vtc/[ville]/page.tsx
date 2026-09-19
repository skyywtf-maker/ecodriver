import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LandingPage } from "@/components/seo/LandingPage";
import { LANDING_CITIES, cityLanding, citySlug } from "@/config/landing";
import { landingMetadata } from "@/lib/seo";

/** Les villes desservies sont connues à l'avance : ces pages sont pré-rendues. */
export function generateStaticParams() {
  return LANDING_CITIES.map((c) => ({ ville: citySlug(c.name) }));
}

/** Toute autre ville renvoie un 404 : pas de page générée à la volée. */
export const dynamicParams = false;

function find(ville: string) {
  const city = LANDING_CITIES.find((c) => citySlug(c.name) === ville);
  return city ? cityLanding(city.name, city.km) : null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ ville: string }>;
}): Promise<Metadata> {
  const page = find((await params).ville);
  return page ? landingMetadata(page) : {};
}

export default async function Page({ params }: { params: Promise<{ ville: string }> }) {
  const page = find((await params).ville);
  if (!page) notFound();
  return <LandingPage page={page} />;
}
