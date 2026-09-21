"use client";

import { useEffect, useRef, useState } from "react";
// Import en haut de module, et non à la demande : c'est ce qui permet à
// webpack de produire le worker de MapLibre. Chargé par un import()
// dans un effet, le worker finit en 404 et la source vectorielle ne se
// charge jamais — carte noire, sans la moindre erreur remontée.
import maplibregl from "maplibre-gl";
import type { Map as MapLibreMap, Marker } from "maplibre-gl";
import { SITE } from "@/config/site";

type Pt = { lat: number; lng: number; label?: string };

type Props = {
  from?: Pt | null;
  to?: Pt | null;
  geometry?: [number, number][] | null;
  /** Espace réservé par les panneaux posés sur la carte, en px */
  padding?: { top: number; bottom: number; left: number; right: number };
  className?: string;
};

const ACCENT = "#0A84FF";

/**
 * Fond de carte vectoriel sombre, libre et sans clé.
 *
 * Carto « Dark Matter » sur données OpenStreetMap : pas d'inscription, et un
 * contraste de voirie lisible sur fond sombre — le style « dark » d'OpenFreeMap
 * rendait la ville quasiment noire. Le rendu est vectoriel : rues nommées,
 * zoom continu, étiquettes nettes, pas une image figée.
 */
const STYLE = "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";

export default function RouteMapInner({ from, to, geometry, padding, className = "" }: Props) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<MapLibreMap | null>(null);
  const markers = useRef<Marker[]>([]);
  const observer = useRef<ResizeObserver | null>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!el.current || map.current) return;
    let cancelled = false;

    {
      if (cancelled || !el.current) return;

      const m = new maplibregl.Map({
        container: el.current,
        style: STYLE,
        center: [SITE.base.lng, SITE.base.lat],
        zoom: 11.5,
        attributionControl: false,
        // Sur mobile, un doigt fait défiler la page ; deux doigts manipulent
        // la carte. Sans cela la page se bloque dès qu'on la frôle.
        cooperativeGestures: true,
      });

      m.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-right");
      m.on("error", () => setFailed(true));

      m.on("load", () => {
        m.addSource("route", { type: "geojson", data: emptyLine() });
        m.addLayer({
          id: "route-glow",
          type: "line",
          source: "route",
          layout: { "line-cap": "round", "line-join": "round" },
          paint: { "line-color": ACCENT, "line-width": 16, "line-opacity": 0.2, "line-blur": 6 },
        });
        m.addLayer({
          id: "route-line",
          type: "line",
          source: "route",
          layout: { "line-cap": "round", "line-join": "round" },
          paint: { "line-color": ACCENT, "line-width": 4.5 },
        });
        // Sur petit écran, la carte est un décor derrière du texte blanc :
        // les noms de rues et de communes la rendaient illisible. On masque
        // les étiquettes en dessous de 768 px, la voirie suffit à situer.
        if (window.matchMedia("(max-width: 767px)").matches) {
          for (const layer of m.getStyle().layers ?? []) {
            // Les noms de communes restent : ce sont eux qui font comprendre
            // qu'il s'agit d'une carte. Rues et points d'intérêt disparaissent.
            if (layer.type === "symbol" && !/place|city|town|country/i.test(layer.id)) {
              m.setLayoutProperty(layer.id, "visibility", "none");
            }
          }
          m.setZoom(12.4);
        }

        setReady(true);
      });

      // Le conteneur peut encore mesurer zéro au moment où la carte est
      // créée : MapLibre fige alors une taille nulle, ne demande presque
      // aucune tuile et n'affiche qu'un fond noir. On le resynchronise sur
      // la taille réelle dès qu'elle est connue, puis à chaque changement.
      const ro = new ResizeObserver(() => m.resize());
      ro.observe(el.current);
      observer.current = ro;

      map.current = m;
    }

    return () => {
      cancelled = true;
      observer.current?.disconnect();
      observer.current = null;
      map.current?.remove();
      map.current = null;
    };
  }, []);

  useEffect(() => {
    const m = map.current;
    if (!m || !ready) return;

    {
      markers.current.forEach((mk) => mk.remove());
      markers.current = [];

      const src = m.getSource("route") as import("maplibre-gl").GeoJSONSource | undefined;
      src?.setData(geometry && geometry.length > 1 ? line(geometry) : emptyLine());

      const pts: Pt[] = [];
      if (from) {
        markers.current.push(new maplibregl.Marker({ element: dot("start") }).setLngLat([from.lng, from.lat]).addTo(m));
        pts.push(from);
      }
      if (to) {
        markers.current.push(new maplibregl.Marker({ element: dot("end") }).setLngLat([to.lng, to.lat]).addTo(m));
        pts.push(to);
      }

      const coords: [number, number][] = geometry && geometry.length > 1 ? geometry : pts.map((p) => [p.lng, p.lat]);
      if (coords.length >= 2) {
        const b = new maplibregl.LngLatBounds(coords[0], coords[0]);
        coords.forEach((c) => b.extend(c));
        m.fitBounds(b, { padding: padding ?? 80, duration: 900, maxZoom: 14 });
      } else if (coords.length === 1) {
        m.flyTo({ center: coords[0], zoom: 13.5, duration: 900 });
      }
    }
  }, [ready, from, to, geometry, padding]);

  return (
    <>
      <div ref={el} className={`absolute inset-0 h-full w-full ${className}`} aria-label="Carte de l'itinéraire" role="img" />
      {failed && <FallbackMap className={className} />}
    </>
  );
}

function line(coords: [number, number][]) {
  return { type: "Feature" as const, properties: {}, geometry: { type: "LineString" as const, coordinates: coords } };
}
function emptyLine() {
  return line([]);
}

function dot(kind: "start" | "end") {
  const d = document.createElement("div");
  d.style.cssText =
    kind === "start"
      ? "width:18px;height:18px;border-radius:50%;background:#0A0B0D;border:3px solid #fff;box-shadow:0 0 0 6px rgba(255,255,255,.12)"
      : `width:16px;height:16px;border-radius:50%;background:${ACCENT};box-shadow:0 0 0 10px rgba(10,132,255,.22)`;
  return d;
}

/** Filet de sécurité si le fond de carte est injoignable. */
function FallbackMap({ className }: { className: string }) {
  return (
    <div className={`absolute inset-0 bg-[#0B0C0E] ${className}`} aria-hidden>
      <svg className="h-full w-full" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" fill="none">
        <path d="M1180 0 C1150 200 1260 380 1190 560 S1110 800 1160 900" stroke="#101923" strokeWidth="42" />
        <path d="M0 420 C300 400 500 480 760 430 S1050 300 1190 360" stroke="#101821" strokeWidth="14" />
        <path d="M0 140 L1440 90 M0 300 L1440 250 M0 560 L1440 620 M0 760 L1440 700 M200 0 L260 900 M420 0 L380 900 M640 0 L700 900 M860 0 L820 900 M1060 0 L1100 900 M1320 0 L1280 900" stroke="rgba(255,255,255,0.045)" />
        <path d="M0 360 C400 330 700 380 1000 280 S1300 180 1440 200 M500 900 C560 700 640 560 820 460 S1000 320 1060 0 M0 700 C300 640 520 700 700 720 S1100 760 1440 740" stroke="rgba(255,255,255,0.10)" strokeWidth="3" />
      </svg>
    </div>
  );
}
