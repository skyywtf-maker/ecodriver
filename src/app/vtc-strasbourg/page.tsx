import type { Metadata } from "next";
import { LandingPage } from "@/components/seo/LandingPage";
import { LANDINGS } from "@/config/landing";
import { landingMetadata } from "@/lib/seo";

const page = LANDINGS.find((l) => l.path === "/vtc-strasbourg")!;

export const metadata: Metadata = landingMetadata(page);

export default function Page() {
  return <LandingPage page={page} />;
}
