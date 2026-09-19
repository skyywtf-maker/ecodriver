"use client";

import { useEffect, useRef, useState } from "react";
import type { Map as MapboxMap, Marker } from "mapbox-gl";
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

const TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
const ACCENT = "#0A84FF";

export function RouteMap({ from, to, geometry, padding, className = "" }: Props) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<MapboxMap | null>(null);
  const markers = useRef<Marker[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!TOKEN || !el.current || map.current) return;
    let cancelled = false;
    (async () => {
      const mapboxgl = (await import("mapbox-gl")).default;
      if (cancelled || !el.current) return;
      mapboxgl.accessToken = TOKEN;
      const m = new mapboxgl.Map({
        container: el.current,
        style: "mapbox://styles/mapbox/dark-v11",
        center: [SITE.base.lng, SITE.base.lat],
        zoom: 10.5,
        attributionControl: false,
        cooperativeGestures: true,
      });
      m.addControl(new mapboxgl.AttributionControl({ compact: true }), "bottom-right");
      m.on("load", () => {
        m.addSource("route", { type: "geojson", data: emptyLine() });
        m.addLayer({
          id: "route-glow",
          type: "line",
          source: "route",
          layout: { "line-cap": "round", "line-join": "round" },
          paint: { "line-color": ACCENT, "line-width": 14, "line-opacity": 0.22, "line-blur": 4 },
        });
        m.addLayer({
          id: "route-line",
          type: "line",
          source: "route",
          layout: { "line-cap": "round", "line-join": "round" },
          paint: { "line-color": ACCENT, "line-width": 4 },
        });
        setReady(true);
      });
      map.current = m;
    })();
    return () => {
      cancelled = true;
      map.current?.remove();
      map.current = null;
    };
  }, []);

  useEffect(() => {
    const m = map.current;
    if (!m || !ready) return;
    (async () => {
      const mapboxgl = (await import("mapbox-gl")).default;
      markers.current.forEach((mk) => mk.remove());
      markers.current = [];
      const src = m.getSource("route") as import("mapbox-gl").GeoJSONSource | undefined;
      src?.setData(geometry && geometry.length > 1 ? line(geometry) : emptyLine());

      const pts: Pt[] = [];
      if (from) {
        markers.current.push(new mapboxgl.Marker({ element: dot("start") }).setLngLat([from.lng, from.lat]).addTo(m));
        pts.push(from);
      }
      if (to) {
        markers.current.push(new mapboxgl.Marker({ element: dot("end") }).setLngLat([to.lng, to.lat]).addTo(m));
        pts.push(to);
      }
      const coords: [number, number][] = geometry && geometry.length > 1 ? geometry : pts.map((p) => [p.lng, p.lat]);
      if (coords.length >= 2) {
        const b = new mapboxgl.LngLatBounds(coords[0], coords[0]);
        coords.forEach((c) => b.extend(c));
        m.fitBounds(b, { padding: padding ?? 80, duration: 900, maxZoom: 14 });
      } else if (coords.length === 1) {
        m.flyTo({ center: coords[0], zoom: 13, duration: 900 });
      }
    })();
  }, [ready, from, to, geometry, padding]);

  if (!TOKEN) return <FallbackMap className={className} />;
  return <div ref={el} className={`absolute inset-0 ${className}`} aria-label="Carte de l'itinéraire" role="img" />;
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

/** Affiché tant que le jeton Mapbox n'est pas configuré. */
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
