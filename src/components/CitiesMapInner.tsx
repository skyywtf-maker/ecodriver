"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import { SITE } from "@/config/site";
import { baseOptions, createDot, loadMaps } from "@/lib/google-maps";

/** Pose une pastille sur la carte, quel que soit le fond ; renvoie de quoi la retirer. */
type AddDot = (lng: number, lat: number, node: HTMLElement) => () => void;

/** Emprise commune aux deux fonds : Grand Est et Allemagne desservie. */
const BOUNDS = { west: 3.9, south: 47.4, east: 9.6, north: 50.4 };

const STYLE = "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";
const ACCENT = "#0A84FF";
const COUNTRIES = ["France", "Allemagne"] as const;

/**
 * Les villes desservies, posées sur la carte.
 *
 * Une grille de huit pavés ne disait rien de la géographie du service.
 * Les points apparaissent un à un à l'arrivée de la section dans l'écran,
 * et survoler une ville la met en avant des deux côtés.
 */
export default function CitiesMapInner({ google: withGoogle = false }: { google?: boolean }) {
  const el = useRef<HTMLDivElement>(null);
  const addDot = useRef<AddDot | null>(null);
  const markers = useRef<(() => void)[]>([]);
  const [ready, setReady] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(0);
  const [country, setCountry] = useState<(typeof COUNTRIES)[number]>("France");

  useEffect(() => {
    const node = el.current;
    if (!node || addDot.current) return;
    // Sur téléphone, 48 px de marge sur une carte de 230 px dézoomaient
    // jusqu'à Paris et tassaient les points au centre.
    const padding = node.clientWidth < 500 ? 12 : 48;

    if (withGoogle) {
      let cancelled = false;
      loadMaps()
        .then(({ Map }) => {
          if (cancelled) return;
          const m = new Map(node, baseOptions({ gestureHandling: "none", draggable: false }));
          m.fitBounds(BOUNDS, padding);
          addDot.current = (lng, lat, dotNode) => {
            const d = createDot(m, { lat, lng }, dotNode);
            return () => d.setMap(null);
          };
          google.maps.event.addListenerOnce(m, "idle", () => !cancelled && setReady(true));
        })
        .catch(() => {});
      return () => {
        cancelled = true;
        addDot.current = null;
      };
    }

    const m = new maplibregl.Map({
      container: node,
      style: STYLE,
      bounds: [
        [BOUNDS.west, BOUNDS.south],
        [BOUNDS.east, BOUNDS.north],
      ],
      fitBoundsOptions: { padding },
      attributionControl: false,
      interactive: false,
    });
    m.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-right");
    addDot.current = (lng, lat, dotNode) => {
      const mk = new maplibregl.Marker({ element: dotNode }).setLngLat([lng, lat]).addTo(m);
      return () => mk.remove();
    };
    m.on("load", () => setReady(true));

    const ro = new ResizeObserver(() => m.resize());
    ro.observe(node);
    return () => {
      ro.disconnect();
      m.remove();
      addDot.current = null;
    };
  }, [withGoogle]);

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
    const add = addDot.current;
    if (!add || !ready) return;

    markers.current.forEach((remove) => remove());
    markers.current = SITE.cities.slice(0, revealed).map((c) => {
      const isActive = active === c.name;
      const node = document.createElement("div");
      node.style.cssText = `width:${isActive ? 18 : 12}px;height:${isActive ? 18 : 12}px;border-radius:50%;background:${
        c.name === "Strasbourg" ? "#fff" : ACCENT
      };box-shadow:0 0 0 ${isActive ? 10 : 6}px rgba(10,132,255,${isActive ? 0.28 : 0.16});transition:all .25s ease`;
      return add(c.lng, c.lat, node);
    });
  }, [ready, revealed, active]);

  const shown = SITE.cities.map((c, i) => ({ ...c, i })).filter((c) => c.country === country);

  return (
    <div className="grid gap-3 md:grid-cols-12 md:gap-4">
      <div
        ref={el}
        role="img"
        aria-label="Carte des villes desservies dans le Grand Est"
        className="relative h-[230px] overflow-hidden rounded-3xl border border-white/[0.08] bg-graphite md:col-span-7 md:h-[420px]"
      />

      {/* Un pays à la fois, villes sur deux colonnes : la liste complète
          occupait plus d'un écran de téléphone à elle seule. */}
      <div className="flex flex-col gap-3 md:col-span-5">
        <div role="tablist" aria-label="Pays" className="grid grid-cols-2 gap-1 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-1">
          {COUNTRIES.map((c) => {
            const on = c === country;
            return (
              <button
                key={c}
                type="button"
                role="tab"
                aria-selected={on}
                onClick={() => {
                  setCountry(c);
                  setActive(null);
                }}
                className={`flex h-10 items-center justify-center gap-2 rounded-xl font-display text-[13px] font-semibold transition-colors ${
                  on ? "bg-white text-ink" : "text-label hover:text-white"
                }`}
              >
                {c}
                <span className={`text-[11px] font-medium ${on ? "text-ink/50" : "text-white/30"}`}>
                  {SITE.cities.filter((x) => x.country === c).length}
                </span>
              </button>
            );
          })}
        </div>

        <ul className="grid grid-cols-2 gap-2">
          {shown.map((c) => {
            const on = active === c.name;
            return (
              <li key={c.name}>
                <button
                  type="button"
                  onMouseEnter={() => setActive(c.name)}
                  onMouseLeave={() => setActive(null)}
                  onFocus={() => setActive(c.name)}
                  onBlur={() => setActive(null)}
                  onClick={() => setActive(on ? null : c.name)}
                  className={`flex h-full w-full flex-col items-start justify-between gap-1 rounded-xl border px-3.5 py-2.5 text-left transition-all duration-500 ${
                    c.i < revealed ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0"
                  } ${on ? "border-accent/60 bg-accent/[0.08]" : "border-white/[0.07] bg-white/[0.03]"}`}
                >
                  <span className="font-display text-[14px] font-semibold leading-tight tracking-[-0.015em]">{c.name}</span>
                  <span className={`text-[12px] font-medium ${on ? "text-accent" : "text-label"}`}>{c.km}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
