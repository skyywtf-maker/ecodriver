import type { Metadata, Viewport } from "next";
import { Montserrat, Playfair_Display, Poppins } from "next/font/google";
import "mapbox-gl/dist/mapbox-gl.css";
import "./globals.css";

const poppins = Poppins({ subsets: ["latin"], weight: ["500", "600", "700", "800"], variable: "--font-poppins" });
const montserrat = Montserrat({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-montserrat" });
const playfair = Playfair_Display({ subsets: ["latin"], style: ["italic"], weight: ["400"], variable: "--font-playfair" });

export const metadata: Metadata = {
  title: "Eco Driver · Chauffeur privé, Grand Est",
  description: "Réservez votre chauffeur privé à Strasbourg et dans tout le Grand Est. Prix immédiat, paiement en ligne, confirmation par le chauffeur.",
};

export const viewport: Viewport = { themeColor: "#0A0B0D" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${poppins.variable} ${montserrat.variable} ${playfair.variable}`}>
      <body className="bg-ink font-sans text-white">{children}</body>
    </html>
  );
}
