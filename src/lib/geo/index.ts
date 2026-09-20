import "server-only";
import * as ban from "./ban";
import * as mapbox from "./mapbox";
import * as osrm from "./osrm";

export type { Place, Route } from "./types";

/**
 * Choix du fournisseur de données géographiques.
 *
 * Sans configuration, le site fonctionne : la Base Adresse Nationale
 * (officielle, gratuite, sans clé) fournit les adresses, OSRM les
 * itinéraires. Renseigner MAPBOX_TOKEN fait basculer sur Mapbox, qui gère
 * les points d'intérêt et offre une disponibilité contractuelle — c'est ce
 * qu'il faut en production.
 */
export const usingMapbox = Boolean(process.env.MAPBOX_TOKEN);

export const searchPlaces = usingMapbox ? mapbox.searchPlaces : ban.searchPlaces;
export const isInGrandEst = usingMapbox ? mapbox.isInGrandEst : ban.isInGrandEst;
export const getRoute = usingMapbox ? mapbox.getRoute : osrm.getRoute;
