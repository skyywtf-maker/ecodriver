"use client";

import { useSyncExternalStore } from "react";
import { importLibrary, setOptions } from "@googlemaps/js-api-loader";

/**
 * Socle commun des cartes Google.
 *
 * La clé est une clé NAVIGATEUR, publique par nature : sa protection tient à
 * la restriction par domaine configurée dans Google Cloud, pas à son secret.
 * Sans elle, les composants retombent sur MapLibre (voir les *Map.tsx).
 */
export const GOOGLE_MAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY?.trim() || "";
/** Map ID facultatif : active le rendu vectoriel et le thème sombre natif. */
const MAP_ID = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID?.trim() || "";
/** Avec un Map ID, la carte est vectorielle : les zooms fractionnaires y restent nets. */
export const hasMapId = MAP_ID.length > 0;

const hasKey = GOOGLE_MAPS_KEY.length > 0;

/*
 * Filet de sécurité : si Google refuse la clé (domaine non autorisé, API
 * désactivée, facturation coupée), il appelle window.gm_authFailure et
 * remplace la carte par un panneau d'erreur gris. On bascule alors toutes
 * les cartes sur MapLibre. Cas typique : le passage à un nom de domaine
 * propre, oublié dans les restrictions de la clé.
 */
let authFailed = false;
const listeners = new Set<() => void>();
if (typeof window !== "undefined") {
  (window as unknown as { gm_authFailure: () => void }).gm_authFailure = () => {
    authFailed = true;
    console.warn("[carte] Clé Google Maps refusée pour ce domaine : bascule sur MapLibre.");
    listeners.forEach((f) => f());
  };
}

/** Vrai tant que Google Maps est configuré et n'a pas refusé la clé. */
export function useGoogleMaps(): boolean {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => hasKey && !authFailed,
    () => hasKey
  );
}

let configured = false;

/** Charge la bibliothèque « maps » une seule fois pour tout le site. */
export async function loadMaps(): Promise<google.maps.MapsLibrary> {
  if (!configured) {
    setOptions({ key: GOOGLE_MAPS_KEY, v: "weekly", language: "fr", region: "FR" });
    configured = true;
  }
  return importLibrary("maps");
}

/**
 * Thème sombre aligné sur la charte : fond #0A0B0D, voirie gris ardoise,
 * eau à peine bleutée, points d'intérêt masqués. Utilisé tant qu'aucun
 * Map ID n'est fourni ; avec un Map ID, Google applique son thème sombre.
 */
const DARK_STYLE: google.maps.MapTypeStyle[] = [
  { elementType: "geometry", stylers: [{ color: "#0d0e11" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#8a8f98" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0a0b0d" }] },
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { featureType: "administrative", elementType: "geometry.stroke", stylers: [{ color: "#2a2e36" }] },
  { featureType: "administrative.country", elementType: "geometry.stroke", stylers: [{ color: "#3a404b" }] },
  { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#c3c7ce" }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#262a31" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#15171b" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#363b45" }] },
  { featureType: "road.arterial", elementType: "geometry", stylers: [{ color: "#2d3139" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#6b707a" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#0b1622" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#3d5a78" }] },
  { featureType: "landscape.natural", elementType: "geometry", stylers: [{ color: "#0f1114" }] },
];

/** Options de base : aucune commande, fond sombre même pendant le chargement. */
export function baseOptions(extra: google.maps.MapOptions = {}): google.maps.MapOptions {
  return {
    backgroundColor: "#0A0B0D",
    disableDefaultUI: true,
    clickableIcons: false,
    keyboardShortcuts: false,
    isFractionalZoomEnabled: true,
    ...(MAP_ID ? { mapId: MAP_ID, colorScheme: "DARK" as google.maps.ColorScheme } : { styles: DARK_STYLE }),
    ...extra,
  };
}

/**
 * Masque les noms de rues et de communes, sur petit écran : la carte y sert
 * de décor derrière du texte blanc, les repères suffisent à situer. Sans effet avec un Map ID
 * (le style se règle alors dans la console Google).
 */
export function hideStreetLabels(map: google.maps.Map) {
  if (MAP_ID) return;
  map.setOptions({
    styles: [
      ...DARK_STYLE,
      { featureType: "road", elementType: "labels", stylers: [{ visibility: "off" }] },
      { featureType: "administrative.neighborhood", elementType: "labels", stylers: [{ visibility: "off" }] },
      // Les communes voisines (Schiltigheim, Bischheim…) passaient sous le
      // titre : aucune n'est affichée, la carte pose son propre « Strasbourg ».
      { featureType: "administrative.locality", elementType: "labels", stylers: [{ visibility: "off" }] },
    ],
  });
}

/**
 * Marqueur HTML libre, posé par un OverlayView : mêmes pastilles qu'avant,
 * sans dépendre des marqueurs avancés (qui exigent un Map ID).
 */
export function createDot(
  map: google.maps.Map,
  position: google.maps.LatLngLiteral,
  element: HTMLElement,
  /** Point d'accroche de l'élément sur la coordonnée ; centré par défaut. */
  transform = "translate(-50%, -50%)"
): { setMap: (m: google.maps.Map | null) => void; element: HTMLElement } {
  class Dot extends google.maps.OverlayView {
    onAdd() {
      element.style.position = "absolute";
      element.style.transform = transform;
      this.getPanes()?.overlayMouseTarget.appendChild(element);
    }
    draw() {
      const p = this.getProjection()?.fromLatLngToDivPixel(new google.maps.LatLng(position));
      if (!p) return;
      element.style.left = `${p.x}px`;
      element.style.top = `${p.y}px`;
    }
    onRemove() {
      element.remove();
    }
  }
  const dot = new Dot();
  dot.setMap(map);
  return { setMap: (m) => dot.setMap(m), element };
}

/**
 * Zoom animé vers un cadrage : Google n'a pas d'équivalent au flyTo de
 * MapLibre, on interpole donc le zoom image par image, avec un amorti.
 */
export function animateZoom(
  map: google.maps.Map,
  center: google.maps.LatLngLiteral,
  to: number,
  duration: number
): () => void {
  const from = map.getZoom() ?? to;
  const start = performance.now();
  let frame = 0;
  const step = (now: number) => {
    const t = Math.min(1, (now - start) / duration);
    const e = 1 - Math.pow(1 - t, 3);
    map.moveCamera({ center, zoom: from + (to - from) * e });
    if (t < 1) frame = requestAnimationFrame(step);
  };
  frame = requestAnimationFrame(step);
  return () => cancelAnimationFrame(frame);
}

export function reducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
