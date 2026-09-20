import "server-only";
import type { Place } from "./types";
import * as ban from "./ban";
import * as photon from "./photon";

export { isInGrandEst } from "./ban";

function normalizeLabel(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/** Une requête qui commence par un numéro vise une adresse postale. */
function looksLikeStreetAddress(q: string) {
  return /^\s*\d/.test(q);
}

/**
 * Recherche combinée, sans aucune clé d'API.
 *
 * La Base Adresse Nationale est la référence pour les adresses postales,
 * mais elle ignore les points d'intérêt : « EM Strasbourg » n'y donne rien.
 * Photon apporte les lieux nommés depuis OpenStreetMap. On interroge les
 * deux en parallèle et on fusionne, l'ordre dépendant de ce que le visiteur
 * a tapé : un numéro de rue en tête privilégie l'adresse postale.
 */
export async function searchPlaces(q: string): Promise<Place[]> {
  const trimmed = q.trim();
  if (trimmed.length < 2) return [];

  const [addresses, pois] = await Promise.all([
    ban.searchPlaces(trimmed).catch(() => [] as Place[]),
    photon.searchPlaces(trimmed).catch(() => [] as Place[]),
  ]);

  const first = looksLikeStreetAddress(trimmed) ? addresses : pois;
  const second = first === addresses ? pois : addresses;

  const out: Place[] = [];
  const seen = new Set<string>();

  // Les lieux composés par notre liste (gares, aéroports) restent en tête :
  // ban.searchPlaces les place déjà en premier de ses résultats.
  for (const p of [...first, ...second]) {
    // Deux clés : la position, et le nom avec sa commune. OpenStreetMap
    // décrit parfois un même lieu par plusieurs nœuds voisins, que la seule
    // comparaison de coordonnées ne rapproche pas.
    const byPosition = `@${p.lat.toFixed(4)},${p.lng.toFixed(4)}`;
    const byName = `#${normalizeLabel(p.label)}|${normalizeLabel(p.hint ?? "")}`;
    if (seen.has(byPosition) || seen.has(byName)) continue;
    seen.add(byPosition);
    seen.add(byName);
    out.push(p);
  }

  return out.slice(0, 8);
}
