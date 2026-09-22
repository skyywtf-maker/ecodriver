"use client";

import dynamic from "next/dynamic";
import { useGoogleMaps } from "@/lib/google-maps";

/** Même contrainte que la carte de l'accueil : la carte ne se monte que côté navigateur. */
const Inner = dynamic(() => import("./CitiesMapInner"), {
  ssr: false,
  loading: () => <div className="h-[230px] rounded-3xl border border-white/[0.08] bg-graphite md:h-[420px]" aria-hidden />,
});

/** La clé `key` remonte la carte à neuf si Google refuse la clé en cours de route. */
export function CitiesMap() {
  const google = useGoogleMaps();
  return <Inner key={google ? "google" : "maplibre"} google={google} />;
}
