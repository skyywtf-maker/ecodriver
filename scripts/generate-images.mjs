/**
 * Génère les images statiques du site (aperçu Open Graph, icône iOS) à partir
 * de SVG, avec les polices de la charte.
 *
 * Ils sont écrits dans src/app pour être pris en charge par les conventions de
 * fichiers de Next (opengraph-image, apple-icon) : URL absolue, dimensions et
 * empreinte de cache gérées automatiquement.
 *
 * Ces PNG sont versionnés : le build ne dépend d'aucun rendu d'image. Relancer
 * `npm run images` après une modification de la charte ou du nom des villes.
 */
import { Resvg } from "@resvg/resvg-js";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const FONTS = join(ROOT, "assets/fonts");
const OUT = join(ROOT, "src/app");

const INK = "#0A0B0D";
const ACCENT = "#0A84FF";
const LABEL = "rgba(235,235,245,0.6)";

const CITIES = ["Strasbourg", "Colmar", "Mulhouse", "Nancy", "Metz"];

/** Marque : l'itinéraire en blanc, le marqueur d'arrivée en accent bleu. */
const MARK = (x, y, scale) => `
  <g transform="translate(${x} ${y}) scale(${scale})">
    <path d="M16 50c0-12 8-16 16-16s16-4 16-16" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round"/>
    <circle cx="48" cy="17" r="7" fill="${ACCENT}"/>
  </g>`;

const openGraph = `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#10131A"/>
      <stop offset="0.55" stop-color="${INK}"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>

  ${MARK(80, 62, 0.72)}
  <text x="136" y="104" font-family="Poppins" font-weight="700" font-size="30" fill="#fff" letter-spacing="-0.6">Eco</text>
  <text x="196" y="104" font-family="Playfair Display" font-style="italic" font-size="31" fill="#fff">Driver</text>

  <rect x="80" y="268" width="84" height="5" rx="2.5" fill="${ACCENT}"/>

  <text x="80" y="370" font-family="Poppins" font-weight="700" font-size="82" fill="#fff" letter-spacing="-2.9">Chauffeur privé,</text>
  <text x="80" y="458" font-family="Playfair Display" font-style="italic" font-size="82" fill="#fff" letter-spacing="-1.6">Grand Est.</text>

  <text x="80" y="524" font-family="Montserrat" font-size="26" fill="${LABEL}">Prix immédiat, paiement en ligne, confirmation par le chauffeur.</text>
  <text x="80" y="570" font-family="Montserrat" font-size="21" fill="${LABEL}">${CITIES.join("  ·  ")}</text>
</svg>`;

const appleIcon = `
<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180" viewBox="0 0 64 64">
  <rect width="64" height="64" fill="${INK}"/>
  ${MARK(0, 0, 1)}
</svg>`;

function render(svg, width, file) {
  const png = new Resvg(svg, {
    fitTo: { mode: "width", value: width },
    font: { fontDirs: [FONTS], loadSystemFonts: false, defaultFontFamily: "Montserrat" },
  })
    .render()
    .asPng();
  mkdirSync(OUT, { recursive: true });
  writeFileSync(join(OUT, file), png);
  console.log(`${file} · ${(png.length / 1024).toFixed(0)} Ko`);
}

render(openGraph, 1200, "opengraph-image.png");
render(appleIcon, 180, "apple-icon.png");
