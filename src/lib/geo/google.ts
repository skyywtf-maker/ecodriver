import "server-only";
import type { Route } from "./types";

/**
 * Itinéraires par l'API Routes de Google, en remplacement d'OSRM.
 *
 * Clé SERVEUR, distincte de la clé navigateur des cartes : une clé limitée
 * par domaine est refusée par Google pour les appels serveur. Elle se
 * restreint aux seules API Routes (et Places si on l'ajoute un jour).
 *
 * Le prix se calcule sur la distance renvoyée ici, toujours côté serveur.
 */
const KEY = process.env.GOOGLE_MAPS_SERVER_KEY?.trim() ?? "";

export const usingGoogleRoutes = KEY.length > 0;

export async function getRoute(
  from: { lat: number; lng: number },
  to: { lat: number; lng: number }
): Promise<Route | null> {
  if (!KEY) return null;
  const res = await fetch("https://routes.googleapis.com/directions/v2:computeRoutes", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": KEY,
      // Seuls les champs demandés sont facturés et renvoyés.
      "X-Goog-FieldMask": "routes.distanceMeters,routes.duration,routes.polyline.encodedPolyline",
    },
    body: JSON.stringify({
      origin: { location: { latLng: { latitude: from.lat, longitude: from.lng } } },
      destination: { location: { latLng: { latitude: to.lat, longitude: to.lng } } },
      travelMode: "DRIVE",
      // Sans trafic : un prix ferme ne doit pas dépendre de l'heure du devis.
      routingPreference: "TRAFFIC_UNAWARE",
      // Le prix se calcule au kilomètre : variantes demandées, la plus courte retenue.
      computeAlternativeRoutes: true,
      languageCode: "fr-FR",
      units: "METRIC",
    }),
    next: { revalidate: 600 },
  });
  if (!res.ok) {
    console.error("[routes] Google a répondu", res.status, await res.text().catch(() => ""));
    return null;
  }
  type GRoute = { distanceMeters?: number; duration?: string; polyline?: { encodedPolyline?: string } };
  const data = (await res.json()) as { routes?: GRoute[] };
  const r = (data.routes ?? []).reduce<GRoute | undefined>(
    (best, x) => (x.distanceMeters && (!best?.distanceMeters || x.distanceMeters < best.distanceMeters) ? x : best),
    undefined
  );
  if (!r?.distanceMeters) return null;
  return {
    distanceKm: Math.round((r.distanceMeters / 1000) * 10) / 10,
    // La durée arrive sous la forme « 1234s ».
    durationMin: Math.round(parseInt(r.duration ?? "0", 10) / 60),
    geometry: decodePolyline(r.polyline?.encodedPolyline ?? ""),
  };
}

/** Décode une polyline Google (précision 5) en couples [lng, lat], comme GeoJSON. */
function decodePolyline(encoded: string): [number, number][] {
  const out: [number, number][] = [];
  let i = 0;
  let lat = 0;
  let lng = 0;
  while (i < encoded.length) {
    for (const axis of [0, 1]) {
      let shift = 0;
      let result = 0;
      let byte: number;
      do {
        byte = encoded.charCodeAt(i++) - 63;
        result |= (byte & 0x1f) << shift;
        shift += 5;
      } while (byte >= 0x20);
      const delta = result & 1 ? ~(result >> 1) : result >> 1;
      if (axis === 0) lat += delta;
      else lng += delta;
    }
    out.push([lng / 1e5, lat / 1e5]);
  }
  return out;
}
