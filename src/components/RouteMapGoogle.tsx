"use client";

import { useEffect, useRef, useState } from "react";
import { SITE } from "@/config/site";
import { animateZoom, baseOptions, createDot, hideStreetLabels, loadMaps, reducedMotion } from "@/lib/google-maps";

type Pt = { lat: number; lng: number; label?: string };

type Props = {
  from?: Pt | null;
  to?: Pt | null;
  geometry?: [number, number][] | null;
  padding?: { top: number; bottom: number; left: number; right: number };
  className?: string;
};

const ACCENT = "#0A84FF";
const INTRO_ZOOM = 5.2;
const CENTER = { lat: SITE.base.lat, lng: SITE.base.lng };

/** Cadrage d'arrivée sur Strasbourg, plus serré sur téléphone. */
function targetZoom() {
  return window.matchMedia("(max-width: 767px)").matches ? 12.4 : 11.6;
}

/**
 * Carte de l'accueil, version Google Maps.
 *
 * Même comportement que la version MapLibre : zoom d'ouverture, léger zoom
 * rejoué à chaque retour sur la carte, tracé bleu et deux pastilles pour le
 * trajet. Un doigt fait défiler la page, deux doigts manipulent la carte
 * (gestureHandling « cooperative »).
 */
export default function RouteMapGoogle({ from, to, geometry, padding, className = "" }: Props) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<google.maps.Map | null>(null);
  const lines = useRef<google.maps.Polyline[]>([]);
  const dots = useRef<{ setMap: (m: google.maps.Map | null) => void }[]>([]);
  const stopAnim = useRef<() => void>(() => {});
  const hasRoute = useRef(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!el.current || map.current) return;
    let cancelled = false;

    loadMaps()
      .then(({ Map, Polyline }) => {
        if (cancelled || !el.current) return;
        const m = new Map(el.current, baseOptions({ center: CENTER, zoom: INTRO_ZOOM, gestureHandling: "cooperative" }));
        if (window.matchMedia("(max-width: 767px)").matches) hideStreetLabels(m);

        // Halo puis trait plein, comme la version MapLibre.
        lines.current = [
          new Polyline({ map: m, strokeColor: ACCENT, strokeOpacity: 0.2, strokeWeight: 16, clickable: false }),
          new Polyline({ map: m, strokeColor: ACCENT, strokeOpacity: 1, strokeWeight: 4.5, clickable: false }),
        ];

        map.current = m;
        google.maps.event.addListenerOnce(m, "tilesloaded", () => {
          if (cancelled) return;
          setReady(true);
          if (reducedMotion()) m.moveCamera({ center: CENTER, zoom: targetZoom() });
          else if (!hasRoute.current) stopAnim.current = animateZoom(m, CENTER, targetZoom(), 2600);
        });
      })
      .catch(() => setFailed(true));

    return () => {
      cancelled = true;
      stopAnim.current();
      lines.current.forEach((l) => l.setMap(null));
      dots.current.forEach((d) => d.setMap(null));
      map.current = null;
    };
  }, []);

  // Trajet : tracé, pastilles et cadrage.
  useEffect(() => {
    const m = map.current;
    if (!m || !ready) return;

    dots.current.forEach((d) => d.setMap(null));
    dots.current = [];

    const path = geometry && geometry.length > 1 ? geometry.map(([lng, lat]) => ({ lat, lng })) : [];
    lines.current.forEach((l) => l.setPath(path));

    const pts: Pt[] = [];
    if (from) {
      dots.current.push(createDot(m, { lat: from.lat, lng: from.lng }, dot("start")));
      pts.push(from);
    }
    if (to) {
      dots.current.push(createDot(m, { lat: to.lat, lng: to.lng }, dot("end")));
      pts.push(to);
    }

    const coords = path.length > 1 ? path : pts.map((p) => ({ lat: p.lat, lng: p.lng }));
    hasRoute.current = coords.length > 0;
    if (coords.length > 0) stopAnim.current();

    if (coords.length >= 2) {
      const b = new google.maps.LatLngBounds();
      coords.forEach((c) => b.extend(c));
      m.fitBounds(b, padding ?? 80);
      google.maps.event.addListenerOnce(m, "idle", () => {
        if ((m.getZoom() ?? 0) > 14) m.setZoom(14);
      });
    } else if (coords.length === 1) {
      m.panTo(coords[0]!);
      m.setZoom(13.5);
    }
  }, [ready, from, to, geometry, padding]);

  // Léger zoom rejoué au retour sur la carte, jamais avec un trajet affiché.
  useEffect(() => {
    const node = el.current;
    const m = map.current;
    if (!node || !m || !ready || typeof IntersectionObserver === "undefined") return;

    let away = false;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        if (!entry.isIntersecting) away = true;
        else if (away && entry.intersectionRatio >= 0.5) {
          away = false;
          if (hasRoute.current || reducedMotion()) return;
          const target = targetZoom();
          stopAnim.current();
          m.moveCamera({ center: CENTER, zoom: target - 0.9 });
          stopAnim.current = animateZoom(m, CENTER, target, 1400);
        }
      },
      { threshold: [0, 0.5] }
    );
    io.observe(node);
    return () => io.disconnect();
  }, [ready]);

  return (
    <>
      <div ref={el} className={`absolute inset-0 h-full w-full ${className}`} aria-label="Carte de l'itinéraire" role="img" />
      {failed && <div className={`absolute inset-0 bg-[#0B0C0E] ${className}`} aria-hidden />}
    </>
  );
}

function dot(kind: "start" | "end") {
  const d = document.createElement("div");
  d.style.cssText =
    kind === "start"
      ? "width:18px;height:18px;border-radius:50%;background:#0A0B0D;border:3px solid #fff;box-shadow:0 0 0 6px rgba(255,255,255,.12)"
      : `width:16px;height:16px;border-radius:50%;background:${ACCENT};box-shadow:0 0 0 10px rgba(10,132,255,.22)`;
  return d;
}
