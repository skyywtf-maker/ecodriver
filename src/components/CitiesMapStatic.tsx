"use client";

import dynamic from "next/dynamic";
import { useGoogleMaps } from "@/lib/google-maps";

/** Carte décorative du bloc final : mêmes contraintes que les autres. */
const Inner = dynamic(() => import("./CitiesMapStaticInner"), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-graphite" aria-hidden />,
});

export function CitiesMapStatic() {
  const google = useGoogleMaps();
  return <Inner key={google ? "google" : "maplibre"} google={google} />;
}
