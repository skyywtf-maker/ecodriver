"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import { SITE } from "@/config/site";

const STYLE = "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";

/**
 * Carte du bloc final, purement décorative : non interactive, sans étiquette
 * cliquable. Elle rappelle l'étendue du service juste avant le bouton.
 */
export default function CitiesMapStaticInner() {
  const el = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!el.current) return;
    const m = new maplibregl.Map({
      container: el.current,
      style: STYLE,
      // Emprise élargie à l'Allemagne desservie : Francfort et Stuttgart
      // font désormais partie des destinations.
      bounds: [
        [3.9, 47.4],
        [9.6, 50.4],
      ],
      fitBoundsOptions: { padding: 40 },
      attributionControl: false,
      interactive: false,
    });
    m.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-right");
    m.on("load", () => {
      for (const c of SITE.cities) {
        const node = document.createElement("div");
        node.style.cssText = `width:10px;height:10px;border-radius:50%;background:${
          c.name === "Strasbourg" ? "#fff" : "#0A84FF"
        };box-shadow:0 0 0 5px rgba(10,132,255,0.16)`;
        new maplibregl.Marker({ element: node }).setLngLat([c.lng, c.lat]).addTo(m);
      }
    });

    const ro = new ResizeObserver(() => m.resize());
    ro.observe(el.current);
    return () => {
      ro.disconnect();
      m.remove();
    };
  }, []);

  return <div ref={el} className="absolute inset-0 h-full w-full" aria-hidden />;
}
