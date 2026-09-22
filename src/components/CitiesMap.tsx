"use client";

import dynamic from "next/dynamic";

/** Même contrainte que la carte de l'accueil : MapLibre ne se monte que côté navigateur. */
export const CitiesMap = dynamic(() => import("./CitiesMapInner"), {
  ssr: false,
  loading: () => <div className="h-[230px] rounded-3xl border border-white/[0.08] bg-graphite md:h-[420px]" aria-hidden />,
});
