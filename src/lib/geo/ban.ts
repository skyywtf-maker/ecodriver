import "server-only";
import { BOOKING_RULES } from "@/config/pricing";
import { CURATED_PLACES, matchCurated } from "@/config/places";
import type { Place } from "./types";

/**
 * Base Adresse Nationale — le référentiel officiel des adresses françaises.
 *
 * Gratuit, sans clé et sans inscription : c'est ce qui permet à
 * l'autocomplétion de fonctionner sans qu'aucun service tiers ne soit
 * configuré. Couvre la France entière, adresses et communes.
 *
 * Documentation : https://adresse.data.gouv.fr/api-doc/adresse
 */
const BASE = "https://api-adresse.data.gouv.fr";

type BanFeature = {
  geometry: { coordinates: [number, number] };
  properties: {
    label: string;
    /** « 67, Bas-Rhin, Grand Est » : la région est le dernier segment. */
    context?: string;
    type?: string;
    score?: number;
  };
};

function regionOf(f: BanFeature): string | null {
  const parts = f.properties.context?.split(",").map((s) => s.trim());
  return parts?.length ? parts[parts.length - 1] : null;
}

function toPlace(f: BanFeature, label?: string): Place {
  const [lng, lat] = f.geometry.coordinates;
  return {
    label: label ?? f.properties.label,
    // Quand on affiche un nom d'usage, l'adresse résolue reste visible :
    // le client doit savoir où le chauffeur se présentera.
    hint: label ? f.properties.label : undefined,
    lat,
    lng,
    inGrandEst: regionOf(f) === BOOKING_RULES.allowedRegion,
  };
}

async function query(q: string, limit: number): Promise<BanFeature[]> {
  const url = new URL(`${BASE}/search/`);
  url.searchParams.set("q", q);
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("autocomplete", "1");
  // Oriente les résultats autour de Strasbourg sans exclure le reste.
  url.searchParams.set("lat", "48.5734");
  url.searchParams.set("lon", "7.7521");
  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) return [];
  const data = (await res.json()) as { features?: BanFeature[] };
  return data.features ?? [];
}

export async function searchPlaces(q: string): Promise<Place[]> {
  const trimmed = q.trim();
  if (trimmed.length < 2) return [];

  // Les lieux courants (gares, aéroports) passent devant : la BAN ne les
  // connaît pas, et ce sont les destinations les plus demandées.
  const curated = matchCurated(trimmed).slice(0, 3);
  const [curatedResolved, results] = await Promise.all([
    Promise.all(
      curated.map(async (c) => {
        const [f] = await query(c.address, 1);
        return f ? toPlace(f, c.label) : null;
      })
    ),
    query(trimmed, 6),
  ]);

  const places = curatedResolved.filter((p): p is Place => p !== null);
  const seen = new Set(places.map((p) => `${p.lat.toFixed(4)},${p.lng.toFixed(4)}`));

  for (const f of results) {
    const p = toPlace(f);
    const key = `${p.lat.toFixed(4)},${p.lng.toFixed(4)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    places.push(p);
  }

  return places.slice(0, 7);
}

/** Vérification côté serveur : le point est-il dans la région autorisée ? */
export async function isInGrandEst(lat: number, lng: number): Promise<boolean> {
  const url = new URL(`${BASE}/reverse/`);
  url.searchParams.set("lat", String(lat));
  url.searchParams.set("lon", String(lng));
  const res = await fetch(url, { next: { revalidate: 86400 } });
  if (!res.ok) return false;
  const data = (await res.json()) as { features?: BanFeature[] };
  const f = data.features?.[0];
  return f ? regionOf(f) === BOOKING_RULES.allowedRegion : false;
}

/** Utilisé au démarrage pour vérifier que les lieux courants se résolvent. */
export const CURATED_COUNT = CURATED_PLACES.length;
