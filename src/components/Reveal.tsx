"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Apparition à l'arrivée dans l'écran.
 *
 * Le contenu est rendu visible par défaut : il ne devient masqué qu'une fois
 * le composant monté côté navigateur. Sans JavaScript, ou si l'observateur
 * n'existe pas, la page reste entièrement lisible — une animation ne doit
 * jamais pouvoir faire disparaître du texte.
 *
 * Le mouvement est supprimé pour qui demande moins d'animations.
 */
export function Reveal({
  children,
  delay = 0,
  className = "",
  as: Tag = "div",
}: {
  children: React.ReactNode;
  /** Décalage en millisecondes, pour faire filer une série d'éléments. */
  delay?: number;
  className?: string;
  /** « li » dans une liste : un div entre <ul> et <li> serait invalide. */
  as?: "div" | "li";
}) {
  const ref = useRef<HTMLElement>(null);
  const [armed, setArmed] = useState(false);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }

    setArmed(true);

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShown(true);
          io.disconnect();
        }
      },
      // Se déclenche un peu avant l'entrée réelle : l'élément est déjà en
      // place quand le regard arrive dessus.
      { rootMargin: "0px 0px -12% 0px", threshold: 0.05 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const hidden = armed && !shown;

  return (
    <Tag
      ref={ref as React.Ref<HTMLDivElement & HTMLLIElement>}
      style={{ transitionDelay: hidden ? "0ms" : `${delay}ms` }}
      className={`transition-[opacity,transform] duration-[700ms] ease-[cubic-bezier(0.22,0.61,0.36,1)] ${
        hidden ? "translate-y-5 opacity-0" : "translate-y-0 opacity-100"
      } ${className}`}
    >
      {children}
    </Tag>
  );
}
