import type { Metadata, Viewport } from "next";
import { Montserrat, Playfair_Display, Poppins } from "next/font/google";
// Avant globals.css : MapLibre déclare « .maplibregl-map { position: relative } »,
// qui écrase sinon le « absolute inset-0 » de Tailwind sur le conteneur de la
// carte. Celui-ci sort alors du flux positionné, sa hauteur tombe à zéro, et
// la carte ne peint plus rien.
import "maplibre-gl/dist/maplibre-gl.css";
import "./globals.css";
import { SITE } from "@/config/site";

const poppins = Poppins({ subsets: ["latin"], weight: ["500", "600", "700", "800"], variable: "--font-poppins" });
const montserrat = Montserrat({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-montserrat" });
const playfair = Playfair_Display({ subsets: ["latin"], style: ["italic"], weight: ["400"], variable: "--font-playfair" });

export const metadata: Metadata = {
  // Rend absolues les URL des images et des canoniques (obligatoire pour l'Open Graph).
  metadataBase: new URL(SITE.url),
  title: {
    default: "VTC Strasbourg · Chauffeur privé dans le Grand Est — Eco Driver",
    template: "%s · Eco Driver",
  },
  description:
    "VTC à Strasbourg et dans tout le Grand Est : aéroport d'Entzheim, gare de Strasbourg, Colmar, Mulhouse, Nancy, Metz. Prix ferme affiché avant de réserver, paiement en ligne, confirmation par le chauffeur.",
  applicationName: SITE.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: SITE.name,
    url: SITE.url,
    title: "VTC Strasbourg · Chauffeur privé dans le Grand Est",
    description:
      "Réservez un chauffeur privé à Strasbourg, vers l'aéroport d'Entzheim ou partout dans le Grand Est. Prix immédiat, paiement en ligne.",
  },
  twitter: {
    card: "summary_large_image",
    title: "VTC Strasbourg · Chauffeur privé dans le Grand Est",
    description: "Prix immédiat, paiement en ligne, confirmation par le chauffeur.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
};

export const viewport: Viewport = { themeColor: "#0A0B0D" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${poppins.variable} ${montserrat.variable} ${playfair.variable}`}>
      <body className="bg-ink font-sans text-white">{children}</body>
    </html>
  );
}
