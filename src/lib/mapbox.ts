import "server-only";
import { BOOKING_RULES } from "@/config/pricing";

const TOKEN = process.env.MAPBOX_TOKEN ?? "";
/** Emprise approximative du Grand Est, pour orienter l'autocomplétion. */
const GRAND_EST_BBOX = "3.38,47.42,8.24,50.17";

export type Place = { label: string; lat: number; lng: number; inGrandEst: boolean };

type MbFeature = {
  place_name: string;
  center: [number, number];
  id: string;
  text: string;
  context?: { id: string; text: string }[];
};

function regionOf(f: MbFeature) {
  if (f.id.startsWith("region.")) return f.text;
  return f.context?.find((c) => c.id.startsWith("region."))?.text ?? null;
}

export async function searchPlaces(q: string): Promise<Place[]> {
  if (!TOKEN || q.trim().length < 3) return [];
  const url = new URL(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(q)}.json`);
  url.searchParams.set("access_token", TOKEN);
  url.searchParams.set("country", "fr");
  url.searchParams.set("language", "fr");
  url.searchParams.set("types", "address,poi,place,locality,neighborhood");
  url.searchParams.set("proximity", "7.7521,48.5734");
  url.searchParams.set("bbox", GRAND_EST_BBOX);
  url.searchParams.set("autocomplete", "true");
  url.searchParams.set("limit", "6");
  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) return [];
  const data = (await res.json()) as { features: MbFeature[] };
  return data.features.map((f) => ({
    label: f.place_name.replace(/, France$/, ""),
    lng: f.center[0],
    lat: f.center[1],
    inGrandEst: regionOf(f) === BOOKING_RULES.allowedRegion,
  }));
}

/** Vérification côté serveur : le point est-il dans la région autorisée ? */
export async function isInGrandEst(lat: number, lng: number): Promise<boolean> {
  if (!TOKEN) return false;
  const url = new URL(`https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json`);
  url.searchParams.set("access_token", TOKEN);
  url.searchParams.set("types", "region");
  url.searchParams.set("language", "fr");
  const res = await fetch(url, { next: { revalidate: 86400 } });
  if (!res.ok) return false;
  const data = (await res.json()) as { features: MbFeature[] };
  return data.features[0]?.text === BOOKING_RULES.allowedRegion;
}

export type Route = {
  distanceKm: number;
  durationMin: number;
  geometry: [number, number][];
};

export async function getRoute(from: { lat: number; lng: number }, to: { lat: number; lng: number }): Promise<Route | null> {
  if (!TOKEN) return null;
  const coords = `${from.lng},${from.lat};${to.lng},${to.lat}`;
  const url = new URL(`https://api.mapbox.com/directions/v5/mapbox/driving/${coords}`);
  url.searchParams.set("access_token", TOKEN);
  url.searchParams.set("geometries", "geojson");
  url.searchParams.set("overview", "full");
  const res = await fetch(url, { next: { revalidate: 600 } });
  if (!res.ok) return null;
  const data = (await res.json()) as {
    routes: { distance: number; duration: number; geometry: { coordinates: [number, number][] } }[];
  };
  const r = data.routes?.[0];
  if (!r) return null;
  return {
    distanceKm: Math.round((r.distance / 1000) * 10) / 10,
    durationMin: Math.round(r.duration / 60),
    geometry: r.geometry.coordinates,
  };
}
