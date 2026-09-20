"use client";

import { useEffect, useRef, useState } from "react";

export type Step = { t: string; d: string };

/**
 * Déroulé en trois temps, relié par une ligne qui se remplit au défilement.
 *
 * La progression est écrite directement dans une variable CSS via la
 * référence : le trait suit le doigt sans repasser par un rendu React. Seul
 * le nombre d'étapes atteintes est un état, et il ne change que trois fois.
 *
 * Sans JavaScript, ou si le visiteur demande moins d'animations, tout est
 * affiché plein et la ligne est complète : rien ne disparaît jamais.
 */
export function StepsTimeline({ steps }: { steps: Step[] }) {
  const holder = useRef<HTMLOListElement>(null);
  const [reached, setReached] = useState(steps.length);

  useEffect(() => {
    const el = holder.current;
    if (!el) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    el.style.setProperty("--progress", "0");
    setReached(0);

    let frame = 0;
    const measure = () => {
      frame = 0;
      const r = el.getBoundingClientRect();
      // Le remplissage court de l'entrée du bloc dans l'écran jusqu'au
      // moment où son bas atteint le milieu de l'écran.
      const start = window.innerHeight * 0.85;
      const end = window.innerHeight * 0.25;
      const raw = (start - r.top) / Math.max(1, r.height + (start - end));
      const p = Math.min(1, Math.max(0, raw));

      el.style.setProperty("--progress", p.toFixed(4));
      setReached((prev) => {
        const next = Math.min(steps.length, Math.floor(p * steps.length + 0.35));
        return next === prev ? prev : next;
      });
    };

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [steps.length]);

  return (
    <ol ref={holder} className="relative grid gap-4 pl-10 md:grid-cols-3 md:pl-0">
      {/* Rail. Sur téléphone il court à gauche, HORS des cartes : posé à
          l'intérieur, il traversait les textes. Dès md il passe à
          l'horizontale, par le centre des pastilles. */}
      <span
        aria-hidden
        className="absolute bottom-6 left-[15px] top-6 w-px bg-white/[0.10] md:bottom-auto md:left-8 md:right-8 md:top-[3.375rem] md:h-px md:w-auto"
      />
      <span
        aria-hidden
        className="absolute bottom-6 left-[15px] top-6 w-px origin-top scale-y-[var(--progress,1)] bg-accent transition-transform duration-150 ease-out md:bottom-auto md:left-8 md:right-8 md:top-[3.375rem] md:h-px md:w-auto md:origin-left md:scale-y-100 md:scale-x-[var(--progress,1)]"
      />

      {steps.map((s, i) => {
        const active = i < reached;
        return (
          <li
            key={s.t}
            className={`tile relative flex flex-col gap-6 rounded-4xl p-6 transition-opacity duration-500 md:min-h-[240px] md:justify-between md:p-8 ${
              active ? "opacity-100" : "opacity-60"
            }`}
          >
            <span
              className={`absolute -left-10 top-6 flex h-[30px] w-[30px] items-center justify-center rounded-full font-display text-[13px] font-bold transition-colors duration-500 md:static md:h-11 md:w-11 md:text-base ${
                active ? "bg-white text-ink" : "bg-white/15 text-white/70"
              }`}
            >
              {i + 1}
            </span>
            <div className="flex flex-col gap-2.5">
              <h3 className="font-display text-2xl font-bold tracking-[-0.02em]">{s.t}</h3>
              <p className="text-[15px] leading-relaxed text-label">{s.d}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
