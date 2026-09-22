"use client";

import { useEffect, useRef, useState } from "react";
import { MAP_LANDMARKS, type Landmark } from "@/config/services";
import { animateZoom, baseOptions, createDot, hasMapId, hideStreetLabels, loadMaps, reducedMotion } from "@/lib/google-maps";

type Pt = { lat: number; lng: number; label?: string };

type Props = {
  from?: Pt | null;
  to?: Pt | null;
  geometry?: [number, number][] | null;
  padding?: { top: number; bottom: number; left: number; right: number };
  className?: string;
  /** Clic sur un repère de la ville : le formulaire le met en arrivée. */
  onLandmark?: (l: Landmark) => void;
};

const ACCENT = "#0A84FF";
/*
 * Les zooms de Google valent ceux de MapLibre plus un (tuiles de 256 px
 * contre 512). Sans Map ID, la carte est en images : on s'arrête sur un
 * zoom ENTIER, sinon Google agrandit les tuiles et les noms deviennent
 * énormes et flous.
 */
const INTRO_ZOOM = 6;
/*
 * Point visé : l'hypercentre (cathédrale, Petite France, gare), et non le
 * centre administratif de la commune, plus au sud, qui laissait les repères
 * collés au titre.
 */
const BASE = { lat: 48.5835, lng: 7.7465 };

const isMobile = () => window.matchMedia("(max-width: 767px)").matches;

/**
 * Cadrage d'arrivée : assez large pour lire « Strasbourg » sur téléphone,
 * où la bande visible entre le titre et le formulaire est étroite.
 */
function targetZoom() {
  if (hasMapId) return isMobile() ? 12.3 : 12.8;
  return isMobile() ? 12 : 13;
}

/**
 * Centre à donner à la carte pour que Strasbourg tombe dans la partie
 * VISIBLE : sur téléphone, le formulaire couvre la moitié basse, on remonte
 * donc la ville vers le tiers haut ; sur ordinateur, le panneau occupe la
 * gauche, on la décale vers la droite.
 */
function viewCenter(zoom: number, node: HTMLElement): google.maps.LatLngLiteral {
  const metersPerPx = (156543.03 * Math.cos((BASE.lat * Math.PI) / 180)) / 2 ** zoom;
  if (isMobile()) {
    // L'hypercentre tombe vers 38 % de la hauteur : entre le titre et le formulaire.
    const px = node.clientHeight * 0.12;
    return { lat: BASE.lat - (px * metersPerPx) / 111320, lng: BASE.lng };
  }
  const px = 240;
  return { lat: BASE.lat, lng: BASE.lng - (px * metersPerPx) / (111320 * Math.cos((BASE.lat * Math.PI) / 180)) };
}

/**
 * Carte de l'accueil, version Google Maps.
 *
 * Même comportement que la version MapLibre : zoom d'ouverture, léger zoom
 * rejoué à chaque retour sur la carte, tracé bleu et deux pastilles pour le
 * trajet. Un doigt fait défiler la page, deux doigts manipulent la carte
 * (gestureHandling « cooperative »).
 */
export default function RouteMapGoogle({ from, to, geometry, padding, className = "", onLandmark }: Props) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<google.maps.Map | null>(null);
  const lines = useRef<google.maps.Polyline[]>([]);
  const dots = useRef<{ setMap: (m: google.maps.Map | null) => void }[]>([]);
  const landmarks = useRef<{ setMap: (m: google.maps.Map | null) => void }[]>([]);
  const stopAnim = useRef<() => void>(() => {});
  const hasRoute = useRef(false);
  // Le gestionnaire change à chaque rendu du parent : on lit toujours le dernier.
  const onLandmarkRef = useRef(onLandmark);
  onLandmarkRef.current = onLandmark;
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!el.current || map.current) return;
    let cancelled = false;

    loadMaps()
      .then(({ Map, Polyline }) => {
        if (cancelled || !el.current) return;
        const node = el.current;
        const m = new Map(node, baseOptions({ center: viewCenter(INTRO_ZOOM, node), zoom: INTRO_ZOOM, gestureHandling: "cooperative" }));
        if (window.matchMedia("(max-width: 767px)").matches) hideStreetLabels(m);

        // Halo puis trait plein, comme la version MapLibre.
        lines.current = [
          new Polyline({ map: m, strokeColor: ACCENT, strokeOpacity: 0.2, strokeWeight: 16, clickable: false }),
          new Polyline({ map: m, strokeColor: ACCENT, strokeOpacity: 1, strokeWeight: 4.5, clickable: false }),
        ];

        // Repères de la ville : pastille blanche et nom, en verre sombre.
        // Sur téléphone, à ce zoom, les vignettes s'entassaient sur le nom de
        // la ville : la carte n'y porte que des points, les photos et les noms
        // sont dans la rangée « Destinations populaires » au-dessus du formulaire.
        const compact = isMobile();
        landmarks.current = MAP_LANDMARKS.map((l) => {
          const node = compact ? landmarkCompact(l, () => onLandmarkRef.current?.(l)) : landmark(l, () => onLandmarkRef.current?.(l));
          // Les clics sur le repère ne doivent pas déplacer la carte.
          google.maps.OverlayView.preventMapHitsAndGesturesFrom(node);
          // Accroche sur la pastille (ou la vignette), du côté où elle se trouve.
          const inset = l.image ? 19 : 10;
          const transform = compact
            ? "translate(-50%, -50%)"
            : l.side === "left"
              ? `translate(calc(-100% + ${inset}px), -50%)`
              : `translate(-${inset}px, -50%)`;
          return createDot(m, { lat: l.lat, lng: l.lng }, node, transform);
        });

        map.current = m;
        google.maps.event.addListenerOnce(m, "tilesloaded", () => {
          if (cancelled) return;
          setReady(true);
          const z = targetZoom();
          if (reducedMotion()) m.moveCamera({ center: viewCenter(z, node), zoom: z });
          else if (!hasRoute.current) stopAnim.current = animateZoom(m, viewCenter(z, node), z, 2600);
        });
      })
      .catch(() => setFailed(true));

    return () => {
      cancelled = true;
      stopAnim.current();
      lines.current.forEach((l) => l.setMap(null));
      dots.current.forEach((d) => d.setMap(null));
      landmarks.current.forEach((d) => d.setMap(null));
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
    // Les repères restent tant que seule l'arrivée est choisie (pour en
    // changer d'un geste) et s'effacent devant le trajet complet.
    landmarks.current.forEach((d) => d.setMap(coords.length >= 2 ? null : m));

    if (coords.length >= 2) {
      const b = new google.maps.LatLngBounds();
      coords.forEach((c) => b.extend(c));
      m.fitBounds(b, padding ?? 80);
      google.maps.event.addListenerOnce(m, "idle", () => {
        if ((m.getZoom() ?? 0) > 14) m.setZoom(14);
      });
    } else if (coords.length === 1) {
      // Un seul point : on le centre dans la place laissée par le formulaire,
      // pas au milieu de l'écran, où la feuille le recouvrirait.
      m.setZoom(14);
      m.panTo(coords[0]!);
      const p = padding ?? { top: 0, bottom: 0, left: 0, right: 0 };
      m.panBy((p.right - p.left) / 2, (p.bottom - p.top) / 2);
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
          const c = viewCenter(target, node);
          stopAnim.current();
          m.moveCamera({ center: c, zoom: target - 1 });
          stopAnim.current = animateZoom(m, c, target, 1400);
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

function landmarkCompact(l: Landmark, onPick: () => void) {
  const d = document.createElement("button");
  d.type = "button";
  d.title = l.short;
  d.setAttribute("aria-label", `Aller à : ${l.label}`);
  // Zone de toucher de 28 px autour d'un point de 9 px.
  d.style.cssText = "display:flex;align-items:center;justify-content:center;width:28px;height:28px;padding:0;border:0;background:transparent;cursor:pointer";
  const dotEl = document.createElement("span");
  dotEl.style.cssText = "width:9px;height:9px;border-radius:50%;background:#fff;box-shadow:0 0 0 3px rgba(10,11,13,.7),0 0 0 6px rgba(255,255,255,.14)";
  d.append(dotEl);
  d.addEventListener("click", (e) => {
    e.stopPropagation();
    onPick();
  });
  return d;
}

function landmark(l: Landmark, onPick: () => void) {
  const d = document.createElement("button");
  d.type = "button";
  d.setAttribute("aria-label", `Aller à : ${l.label}`);
  d.style.cssText =
    `display:flex;flex-direction:${l.side === "left" ? "row-reverse" : "row"};align-items:center;gap:7px;padding:${l.side === "left" ? "4px 4px 4px 10px" : "4px 10px 4px 4px"};border-radius:8px;background:rgba(10,11,13,.86);border:1px solid rgba(255,255,255,.16);color:#fff;font:600 11px/1 var(--font-montserrat),system-ui,sans-serif;white-space:nowrap;letter-spacing:-.01em;cursor:pointer;box-shadow:0 6px 18px rgba(0,0,0,.4);transition:border-color .2s`;
  if (l.image) {
    const img = document.createElement("img");
    img.src = l.image;
    img.alt = "";
    img.decoding = "async";
    img.style.cssText = "width:30px;height:30px;border-radius:6px;object-fit:cover;display:block";
    d.append(img);
  } else {
    const pin = document.createElement("span");
    pin.style.cssText = "width:7px;height:7px;margin:0 3px;border-radius:50%;background:#fff;box-shadow:0 0 0 3px rgba(255,255,255,.18)";
    d.append(pin);
  }
  const text = document.createElement("span");
  text.style.cssText = `display:flex;flex-direction:column;gap:3px;text-align:${l.side === "left" ? "right" : "left"}`;
  const name = document.createElement("span");
  name.textContent = l.short;
  const hint = document.createElement("span");
  hint.textContent = `${l.kind} · Y aller`;
  hint.style.cssText = "font-size:10px;font-weight:600;color:rgba(235,235,245,.6)";
  text.append(name, hint);
  d.append(text);
  d.addEventListener("mouseenter", () => (d.style.borderColor = "rgba(10,132,255,.8)"));
  d.addEventListener("mouseleave", () => (d.style.borderColor = "rgba(255,255,255,.16)"));
  d.addEventListener("click", (e) => {
    e.stopPropagation();
    onPick();
  });
  return d;
}

function dot(kind: "start" | "end") {
  const d = document.createElement("div");
  d.style.cssText =
    kind === "start"
      ? "width:18px;height:18px;border-radius:50%;background:#0A0B0D;border:3px solid #fff;box-shadow:0 0 0 6px rgba(255,255,255,.12)"
      : `width:16px;height:16px;border-radius:50%;background:${ACCENT};box-shadow:0 0 0 10px rgba(10,132,255,.22)`;
  return d;
}
