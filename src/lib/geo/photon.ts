import "server-only";
import type { Place } from "./types";
import { isServedRegion, SERVED_BBOX } from "./zone";

/**
 * Photon — recherche de lieux sur les données OpenStreetMap.
 *
 * Gratuit et sans clé, conçu pour l'autocomplétion. Il apporte ce que la
 * Base Adresse Nationale n'a pas : les points d'intérêt nommés — écoles,
 * restaurants, hôtels, entreprises, salles de spectacle. La BAN reste la
 * référence pour les adresses postales précises ; les deux sont donc
 * interrogés ensemble et fusionnés.
 *
 * Instance publique de Komoot : convient à ce volume, mais n'offre aucune
 * garantie contractuelle. Un jeton Mapbox reprend la main s'il est défini.
 */
const BASE = "https://photon.komoot.io/api/";

/**
 * Types OSM sans intérêt comme point de prise en charge : un quai ou un
 * arrêt de bus ajoute du bruit au-dessus des vrais lieux.
 */
const IGNORED = new Set(["platform", "bus_stop", "low_emission_zone", "stop_position", "traffic_signals"]);

type PhotonFeature = {
  geometry: { coordinates: [number, number] };
  properties: {
    name?: string;
    street?: string;
    housenumber?: string;
    postcode?: string;
    city?: string;
    state?: string;
    osm_value?: string;
    type?: string;
  };
};

export async function searchPlaces(q: string): Promise<Place[]> {
  const trimmed = q.trim();
  if (trimmed.length < 2) return [];

  const url = new URL(BASE);
  url.searchParams.set("q", trimmed);
  url.searchParams.set("lang", "fr");
  url.searchParams.set("limit", "8");
  // Oriente vers Strasbourg et borne à la zone desservie : sans emprise,
  // Photon remontait des homonymes du monde entier.
  url.searchParams.set("lat", "48.5734");
  url.searchParams.set("lon", "7.7521");
  url.searchParams.set("bbox", [SERVED_BBOX.west, SERVED_BBOX.south, SERVED_BBOX.east, SERVED_BBOX.north].join(","));

  const res = await fetch(url, {
    next: { revalidate: 3600 },
    headers: { "User-Agent": "eco-driver/1.0 (site de réservation VTC)" },
  });
  if (!res.ok) return [];

  const data = (await res.json()) as { features?: PhotonFeature[] };

  return (data.features ?? [])
    .filter((f) => f.properties.name && !IGNORED.has(f.properties.osm_value ?? ""))
    .map((f) => {
      const p = f.properties;
      const [lng, lat] = f.geometry.coordinates;
      // Adresse sous le nom, pour lever l'ambiguïté entre deux homonymes.
      const hint = [[p.housenumber, p.street].filter(Boolean).join(" "), [p.postcode, p.city].filter(Boolean).join(" ")]
        .filter(Boolean)
        .join(", ");
      return {
        label: p.name!,
        hint: hint || undefined,
        lat,
        lng,
        // Le champ garde son nom historique, mais vaut « dans la zone desservie ».
        inGrandEst: isServedRegion(p.state),
      };
    });
}
