import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LandingPage } from "@/components/seo/LandingPage";
import { TRANSFER_PLACES, citySlug, transferLanding } from "@/config/landing";
import { landingMetadata } from "@/lib/seo";

/** Les lieux sont connus à l'avance : ces pages sont pré-rendues. */
export function generateStaticParams() {
  return TRANSFER_PLACES.map((p) => ({ lieu: citySlug(p.label) }));
}

/** Tout autre lieu renvoie un 404 : pas de page générée à la volée. */
export const dynamicParams = false;

function find(lieu: string) {
  const place = TRANSFER_PLACES.find((p) => citySlug(p.label) === lieu);
  return place ? transferLanding(place) : null;
}

export async function generateMetadata({ params }: { params: Promise<{ lieu: string }> }): Promise<Metadata> {
  const page = find((await params).lieu);
  return page ? landingMetadata(page) : {};
}

export default async function Page({ params }: { params: Promise<{ lieu: string }> }) {
  const page = find((await params).lieu);
  if (!page) notFound();
  return <LandingPage page={page} />;
}
