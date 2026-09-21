"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import type { Map as MapLibreMap, Marker } from "maplibre-gl";
import { SITE } from "@/config/site";

const STYLE = "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";
const ACCENT = "#0A84FF";

/**
 * Les villes desservies, posées sur la carte.
 *
 * Une grille de huit pavés ne disait rien de la géographie du service.
 * Les points apparaissent un à un à l'arrivée de la section dans l'écran,
 * et survoler une ville la met en avant des deux côtés.
 */
export default function CitiesMapInner() {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<MapLibreMap | null>(null);
  const markers = useRef<Marker[]>([]);
  const [ready, setReady] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(0);

  useEffect(() => {
    if (!el.current || map.current) return;

    const m = new maplibregl.Map({
      container: el.current,
      style: STYLE,
      // Cadrage sur l'ensemble du Grand Est.
      // Emprise élargie à l'Allemagne desservie : Francfort et Stuttgart
      // font désormais partie des destinations.
      bounds: [
        [3.9, 47.4],
        [9.6, 50.4],
      ],
      fitBoundsOptions: { padding: 48 },
      attributionControl: false,
      interactive: false,
    });
    m.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-right");
    m.on("load", () => setReady(true));

    const ro = new ResizeObserver(() => m.resize());
    ro.observe(el.current);
    map.current = m;

    return () => {
      ro.disconnect();
      m.remove();
      map.current = null;
    };
  }, []);

  // Les points apparaissent en cascade quand la section entre dans l'écran.
  useEffect(() => {
    const node = el.current;
    if (!node || !ready) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || typeof IntersectionObserver === "undefined") {
      setRevealed(SITE.cities.length);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();
        SITE.cities.forEach((_, i) => {
          window.setTimeout(() => setRevealed(i + 1), i * 130);
        });
      },
      { threshold: 0.25 }
    );
    io.observe(node);
    return () => io.disconnect();
  }, [ready]);

  // Repose les marqueurs à chaque changement d'état affiché.
  useEffect(() => {
    const m = map.current;
    if (!m || !ready) return;

    markers.current.forEach((mk) => mk.remove());
    markers.current = SITE.cities.slice(0, revealed).map((c) => {
      const isActive = active === c.name;
      const node = document.createElement("div");
      node.style.cssText = `width:${isActive ? 18 : 12}px;height:${isActive ? 18 : 12}px;border-radius:50%;background:${
        c.name === "Strasbourg" ? "#fff" : ACCENT
      };box-shadow:0 0 0 ${isActive ? 10 : 6}px rgba(10,132,255,${isActive ? 0.28 : 0.16});transition:all .25s ease`;
      return new maplibregl.Marker({ element: node }).setLngLat([c.lng, c.lat]).addTo(m);
    });
  }, [ready, revealed, active]);

  return (
    <div className="grid gap-4 md:grid-cols-12">
      <div
        ref={el}
        role="img"
        aria-label="Carte des villes desservies dans le Grand Est"
        className="relative h-[300px] overflow-hidden rounded-4xl border border-white/[0.08] bg-graphite md:col-span-7 md:h-[420px]"
      />

      {/* Deux listes groupées par pays, chaque ligne alignée sur sa distance.
          Les pastilles en largeur libre donnaient un bord droit en dents de
          scie et ne disaient rien de la géographie. */}
      <div className="flex flex-col gap-6 md:col-span-5 md:content-start">
        {["France", "Allemagne"].map((country) => (
          <div key={country} className="flex flex-col gap-1">
            <h3 className="mb-1 text-[11px] font-medium uppercase tracking-[0.12em] text-white/35">{country}</h3>
            <ul className="flex flex-col">
              {SITE.cities
                .map((c, i) => ({ ...c, i }))
                .filter((c) => c.country === country)
                .map((c) => (
                  <li key={c.name}>
                    <button
                      type="button"
                      onMouseEnter={() => setActive(c.name)}
                      onMouseLeave={() => setActive(null)}
                      onFocus={() => setActive(c.name)}
                      onBlur={() => setActive(null)}
                      className={`flex w-full items-baseline justify-between gap-4 border-b border-white/[0.07] px-1 py-2.5 text-left transition-all duration-500 last:border-0 ${
                        c.i < revealed ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0"
                      } ${active === c.name ? "text-white" : ""}`}
                    >
                      <span className="font-display text-[15px] font-semibold tracking-[-0.015em]">{c.name}</span>
                      <span className={`text-[13px] font-medium ${active === c.name ? "text-accent" : "text-label"}`}>
                        {c.km}
                      </span>
                    </button>
                  </li>
                ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
