import "server-only";
import { matchCurated } from "@/config/places";
import type { Place } from "./types";

/**
 * Place les lieux courants en tête des résultats, quel que soit le
 * fournisseur actif.
 *
 * Aucun géocodeur ne classe « gare de strasbourg » comme un client
 * l'entend : la BAN ne connaît pas les points d'intérêt, et Mapbox remonte
 * Neudorf, Port du Rhin et Roethig avant la gare centrale. La liste de
 * `config/places.ts` tranche cette ambiguïté.
 *
 * Les coordonnées ne sont jamais écrites à la main : chaque lieu pointe vers
 * une adresse que le fournisseur en place résout lui-même.
 */
export function withCurated(search: (q: string) => Promise<Place[]>) {
  return async function searchPlaces(q: string): Promise<Place[]> {
    const trimmed = q.trim();
    if (trimmed.length < 2) return [];

    const curated = matchCurated(trimmed).slice(0, 3);

    const [resolved, results] = await Promise.all([
      Promise.all(
        curated.map(async (c): Promise<Place | null> => {
          const [first] = await search(c.address).catch(() => [] as Place[]);
          // L'adresse résolue reste visible sous le nom d'usage : le client
          // doit savoir où le chauffeur se présentera.
          return first ? { ...first, label: c.label, hint: first.label } : null;
        })
      ),
      search(trimmed),
    ]);

    const out = resolved.filter((p): p is Place => p !== null);
    const seen = new Set(out.map((p) => `${p.lat.toFixed(3)},${p.lng.toFixed(3)}`));

    for (const p of results) {
      const key = `${p.lat.toFixed(3)},${p.lng.toFixed(3)}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(p);
    }

    return out.slice(0, 8);
  };
}
