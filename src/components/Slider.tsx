"use client";

import { Children, useCallback, useEffect, useRef, useState } from "react";

/**
 * Rangée horizontale à faire glisser, qui remplace une pile de cartes.
 *
 * Sur téléphone, la rangée déborde jusqu'aux bords de l'écran et la carte
 * suivante dépasse à droite : on comprend qu'il y a une suite sans avoir à
 * l'écrire. Sur ordinateur, deux flèches font défiler d'une carte.
 *
 * Le défilement est natif (scroll-snap) : sans JavaScript, la rangée se fait
 * toujours glisser au doigt ou à la molette, seuls le compteur et les flèches
 * ne répondent plus.
 */
export function Slider({
  children,
  label,
  itemClassName = "w-[82%] sm:w-[46%] lg:w-[31.5%]",
  className = "",
  autoplay = 0,
}: {
  children: React.ReactNode;
  /** Nom lu par les lecteurs d'écran, ex. « Prestations ». */
  label: string;
  /** Largeur de chaque carte, par palier d'écran. */
  itemClassName?: string;
  className?: string;
  /**
   * Défilement automatique, en millisecondes (0 : désactivé). Il s'arrête
   * dès que le visiteur touche la rangée, et ne tourne que si elle est à
   * l'écran. Jamais pour qui demande moins d'animations.
   */
  autoplay?: number;
}) {
  const rail = useRef<HTMLUListElement>(null);
  const items = Children.toArray(children);
  const [index, setIndex] = useState(0);
  const [edges, setEdges] = useState({ start: true, end: items.length <= 1 });

  const measure = useCallback(() => {
    const el = rail.current;
    if (!el) return;
    const first = el.children[0] as HTMLElement | undefined;
    const step = first ? first.offsetWidth + 12 : el.clientWidth;
    setIndex(Math.min(items.length - 1, Math.round(el.scrollLeft / step)));
    setEdges({ start: el.scrollLeft < 4, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4 });
  }, [items.length]);

  useEffect(() => {
    const el = rail.current;
    if (!el) return;
    measure();
    el.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure, { passive: true });
    return () => {
      el.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
    };
  }, [measure]);

  const [paused, setPaused] = useState(false);
  const [onScreen, setOnScreen] = useState(false);

  useEffect(() => {
    const el = rail.current;
    if (!el || !autoplay || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([e]) => setOnScreen(Boolean(e?.isIntersecting)), { threshold: 0.6 });
    io.observe(el);
    return () => io.disconnect();
  }, [autoplay]);

  useEffect(() => {
    const el = rail.current;
    if (!el || !autoplay || paused || !onScreen) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => {
      const first = el.children[0] as HTMLElement | undefined;
      if (!first) return;
      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4;
      // En bout de rangée, on revient au début plutôt que de s'arrêter.
      el.scrollTo({ left: atEnd ? 0 : el.scrollLeft + first.offsetWidth + 12, behavior: "smooth" });
    }, autoplay);
    return () => window.clearInterval(id);
  }, [autoplay, paused, onScreen]);

  const go = (dir: 1 | -1) => {
    const el = rail.current;
    const first = el?.children[0] as HTMLElement | undefined;
    if (!el || !first) return;
    setPaused(true);
    el.scrollBy({ left: dir * (first.offsetWidth + 12), behavior: "smooth" });
  };

  return (
    <div className={className}>
      <ul
        ref={rail}
        aria-label={label}
        // Le visiteur reprend la main : le défilement automatique s'arrête pour de bon.
        onPointerDown={() => setPaused(true)}
        onWheel={() => setPaused(true)}
        onFocus={() => setPaused(true)}
        className="rail -mx-4 gap-3 scroll-px-4 px-4 md:mx-0 md:scroll-px-0 md:px-0"
      >
        {items.map((child, i) => (
          <li key={i} className={itemClassName}>
            {child}
          </li>
        ))}
      </ul>

      {items.length > 1 && (
        <div className="mt-4 flex items-center justify-between">
          {/* Barre de progression : une graduation par carte. */}
          <div className="flex items-center gap-1.5" aria-hidden>
            {items.map((_, i) => (
              <span
                key={i}
                className={`h-[3px] rounded-full transition-all duration-300 ${
                  i === index ? "w-6 bg-white" : "w-3 bg-white/20"
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="mr-2 font-display text-[12px] font-semibold tabular-nums text-label">
              {String(index + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
            </span>
            <Arrow dir={-1} disabled={edges.start} onClick={() => go(-1)} />
            <Arrow dir={1} disabled={edges.end} onClick={() => go(1)} />
          </div>
        </div>
      )}
    </div>
  );
}

function Arrow({ dir, disabled, onClick }: { dir: 1 | -1; disabled: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={dir === 1 ? "Suivant" : "Précédent"}
      className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.12] text-white transition-colors hover:bg-white/[0.08] disabled:opacity-30 disabled:hover:bg-transparent"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden className={dir === -1 ? "rotate-180" : ""}>
        <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}
