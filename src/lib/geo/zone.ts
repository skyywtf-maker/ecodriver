import { BOOKING_RULES } from "@/config/pricing";

/** « Bade Wurtemberg », « Bade-Wurtemberg », « bade-wurtemberg » : même région. */
function norm(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z]+/g, " ")
    .trim();
}

const SERVED = new Set(BOOKING_RULES.servedRegions.map(norm));

/** La région (ou le Land) fait-elle partie de la zone desservie ? */
export function isServedRegion(region: string | null | undefined): boolean {
  return Boolean(region) && SERVED.has(norm(region!));
}

/**
 * Emprise de la zone desservie, pour borner la recherche de lieux : sans
 * elle, « leonor » remontait l'Illinois et l'Australie.
 */
export const SERVED_BBOX = { west: 3.3, south: 47.3, east: 10.3, north: 50.6 };
