"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";
import { useGoogleMaps } from "@/lib/google-maps";

const loading = () => <div className="absolute inset-0 bg-[#0B0C0E]" aria-hidden />;

/**
 * La carte est montée côté navigateur uniquement.
 *
 * MapLibre a besoin de `window` et, surtout, de son worker : le charger par
 * un import() à l'intérieur d'un effet empêche webpack d'émettre ce worker,
 * et la carte reste noire sans qu'aucune erreur ne soit signalée.
 *
 * Avec NEXT_PUBLIC_GOOGLE_MAPS_KEY, c'est la version Google qui est chargée ;
 * MapLibre reste le repli sans clé, ou si Google refuse la clé.
 */
const MapLibreRouteMap = dynamic(() => import("./RouteMapInner"), { ssr: false, loading });
const GoogleRouteMap = dynamic(() => import("./RouteMapGoogle"), { ssr: false, loading });

export function RouteMap(props: ComponentProps<typeof MapLibreRouteMap>) {
  return useGoogleMaps() ? <GoogleRouteMap {...props} /> : <MapLibreRouteMap {...props} />;
}
