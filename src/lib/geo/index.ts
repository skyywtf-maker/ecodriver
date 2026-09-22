import "server-only";
import { withCurated } from "./curated";
import * as free from "./free";
import * as google from "./google";
import * as mapbox from "./mapbox";
import * as osrm from "./osrm";

export type { Place, Route } from "./types";

/**
 * Choix du fournisseur de données géographiques.
 *
 * Sans configuration, le site fonctionne : la Base Adresse Nationale pour
 * les adresses postales, Photon (OpenStreetMap) pour les points d'intérêt,
 * OSRM pour les itinéraires — tous gratuits et sans clé. Renseigner
 * MAPBOX_TOKEN fait basculer l'ensemble sur Mapbox, qui offre une
 * disponibilité contractuelle.
 *
 * Les itinéraires passent en priorité par Google (API Routes) dès que
 * GOOGLE_MAPS_SERVER_KEY est renseignée ; la recherche d'adresse reste sur
 * la BAN et Photon, gratuites et excellentes sur les adresses françaises.
 */
export const usingMapbox = Boolean(process.env.MAPBOX_TOKEN);

// Les lieux courants passent devant quel que soit le fournisseur : aucun
// géocodeur ne classe « gare de strasbourg » comme un client l'entend.
export const searchPlaces = withCurated(usingMapbox ? mapbox.searchPlaces : free.searchPlaces);
export const isInGrandEst = usingMapbox ? mapbox.isInGrandEst : free.isInGrandEst;
export const getRoute = google.usingGoogleRoutes ? google.getRoute : usingMapbox ? mapbox.getRoute : osrm.getRoute;
