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

/**
 * Numéro en tête ou code postal quelque part : la requête vise une adresse
 * postale, pas un lieu nommé. Sans le code postal, « Place de la Gare 67000
 * Strasbourg » partait du côté des points d'intérêt et revenait avec un
 * simple « Strasbourg ».
 */
function looksLikeStreetAddress(q: string) {
  return /^\s*\d/.test(q) || /\d{5}/.test(q);
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

  const [addresses, allPois] = await Promise.all([
    ban.searchPlaces(trimmed).catch(() => [] as Place[]),
    photon.searchPlaces(trimmed).catch(() => [] as Place[]),
  ]);

  // Les points d'intérêt hors région sont écartés : le service ne dessert
  // que le Grand Est, et Photon remonte volontiers des homonymes lointains
  // (« petit bivouac » renvoyait un camping du Hainaut). Les adresses
  // postales, elles, gardent leur mention « Hors Grand Est » : quelqu'un qui
  // saisit la sienne doit comprendre pourquoi elle est refusée.
  const pois = allPois.filter((p) => p.inGrandEst);

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

  // Dès qu'un résultat est dans la région, on masque les autres : « petit
  // bivouac » remontait sinon des adresses de Martinique. S'il n'y en a
  // aucun, on montre les résultats lointains avec leur mention « Hors Grand
  // Est » — mieux vaut expliquer le refus que n'afficher aucune réponse.
  const inRegion = out.filter((p) => p.inGrandEst);
  return (inRegion.length > 0 ? inRegion : out).slice(0, 8);
}
