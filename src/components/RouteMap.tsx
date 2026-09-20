"use client";

import dynamic from "next/dynamic";

/**
 * La carte est montée côté navigateur uniquement.
 *
 * MapLibre a besoin de `window` et, surtout, de son worker : le charger par
 * un import() à l'intérieur d'un effet empêche webpack d'émettre ce worker,
 * et la carte reste noire sans qu'aucune erreur ne soit signalée.
 */
export const RouteMap = dynamic(() => import("./RouteMapInner"), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-[#0B0C0E]" aria-hidden />,
});
