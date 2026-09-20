"use client";

import dynamic from "next/dynamic";

/** Carte décorative du bloc final : mêmes contraintes que les autres. */
export const CitiesMapStatic = dynamic(() => import("./CitiesMapStaticInner"), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-graphite" aria-hidden />,
});
