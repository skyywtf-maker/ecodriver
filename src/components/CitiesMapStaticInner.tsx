"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import { SITE } from "@/config/site";
import { baseOptions, createDot, loadMaps } from "@/lib/google-maps";

function cityDot(name: string) {
  const node = document.createElement("div");
  node.style.cssText = `width:10px;height:10px;border-radius:50%;background:${
    name === "Strasbourg" ? "#fff" : "#0A84FF"
  };box-shadow:0 0 0 5px rgba(10,132,255,0.16)`;
  return node;
}

const STYLE = "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";

/**
 * Carte du bloc final, purement décorative : non interactive, sans étiquette
 * cliquable. Elle rappelle l'étendue du service juste avant le bouton.
 */
export default function CitiesMapStaticInner({ google: withGoogle = false }: { google?: boolean }) {
  const el = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = el.current;
    if (!node) return;

    if (withGoogle) {
      let cancelled = false;
      loadMaps()
        .then(({ Map }) => {
          if (cancelled) return;
          const g = new Map(node, baseOptions({ gestureHandling: "none", draggable: false }));
          g.fitBounds({ west: 3.9, south: 47.4, east: 9.6, north: 50.4 }, 40);
          for (const c of SITE.cities) createDot(g, { lat: c.lat, lng: c.lng }, cityDot(c.name));
        })
        .catch(() => {});
      return () => {
        cancelled = true;
      };
    }

    const m = new maplibregl.Map({
      container: node,
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
        new maplibregl.Marker({ element: cityDot(c.name) }).setLngLat([c.lng, c.lat]).addTo(m);
      }
    });

    const ro = new ResizeObserver(() => m.resize());
    ro.observe(node);
    return () => {
      ro.disconnect();
      m.remove();
    };
  }, [withGoogle]);

  return <div ref={el} className="absolute inset-0 h-full w-full" aria-hidden />;
}
