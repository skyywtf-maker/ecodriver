"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { SITE } from "@/config/site";

/**
 * Bandeau façon notification, posé sur la carte de l'accueil.
 *
 * Il illustre la promesse du service — un chauffeur identifié qui arrive —
 * sans rien affirmer de vérifiable. Volontairement blanc sur le fond sombre :
 * c'est la seule surface claire de la page, elle attire l'œil là où il faut.
 *
 * Il apparaît après un court délai, comme une notification qui tombe. Le
 * mouvement est supprimé pour qui demande moins d'animations, et le bandeau
 * s'affiche alors directement.
 */
export function ArrivalToast() {
  const { firstName, photo } = SITE.driver;
  const [shown, setShown] = useState(false);
  const [hasPhoto, setHasPhoto] = useState(Boolean(photo));

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(true);
      return;
    }
    const t = window.setTimeout(() => setShown(true), 900);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <div
      className={`pointer-events-none flex items-center gap-4 rounded-[28px] bg-white py-3.5 pl-3.5 pr-6 shadow-[0_24px_60px_rgba(0,0,0,0.45)] transition-all duration-700 ease-[cubic-bezier(0.22,0.61,0.36,1)] ${
        shown ? "translate-y-0 opacity-100" : "-translate-y-3 opacity-0"
      }`}
    >
      <div className="relative h-[58px] w-[58px] shrink-0 overflow-hidden rounded-full bg-graphite">
        {hasPhoto ? (
          <Image
            src={photo}
            alt=""
            fill
            sizes="58px"
            onError={() => setHasPhoto(false)}
            className="object-cover object-top"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center font-display text-lg font-bold text-white/40">
            {firstName.charAt(0)}
          </span>
        )}
      </div>

      <div className="flex min-w-0 flex-col gap-0.5 text-ink">
        <span className="w-fit rounded-md bg-ink px-2 py-0.5 font-display text-[11px] font-semibold tracking-[-0.01em] text-white">
          {SITE.name}
        </span>
        <p className="font-display text-[19px] font-bold leading-tight tracking-[-0.02em]">
          {firstName} arrive !
        </p>
        <p className="font-serif text-[13px] italic leading-snug text-ink/70">
          Prise en charge à l&apos;heure choisie, prix déjà réglé.
        </p>
      </div>
    </div>
  );
}
