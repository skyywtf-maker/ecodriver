import "server-only";
import type { Route } from "./types";

/**
 * OSRM — calcul d'itinéraire libre, sans clé, sur les données OpenStreetMap.
 *
 * ⚠️ Le serveur de démonstration ci-dessous est destiné aux essais : il n'offre
 * aucune garantie de disponibilité et son usage en production est déconseillé
 * par le projet. Il rend le site fonctionnel tout de suite ; dès qu'un jeton
 * Mapbox est renseigné, c'est Mapbox qui reprend la main (voir ./index.ts).
 */
const BASE = "https://router.project-osrm.org";

export async function getRoute(
  from: { lat: number; lng: number },
  to: { lat: number; lng: number }
): Promise<Route | null> {
  const coords = `${from.lng},${from.lat};${to.lng},${to.lat}`;
  const url = new URL(`${BASE}/route/v1/driving/${coords}`);
  url.searchParams.set("overview", "full");
  url.searchParams.set("geometries", "geojson");
  const res = await fetch(url, { next: { revalidate: 600 } });
  if (!res.ok) return null;
  const data = (await res.json()) as {
    routes?: { distance: number; duration: number; geometry: { coordinates: [number, number][] } }[];
  };
  const r = data.routes?.[0];
  if (!r) return null;
  return {
    distanceKm: Math.round((r.distance / 1000) * 10) / 10,
    durationMin: Math.round(r.duration / 60),
    geometry: r.geometry.coordinates,
  };
}
