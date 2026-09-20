"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { SITE } from "@/config/site";

/**
 * Notification façon iOS, posée sur la carte de l'accueil.
 *
 * Reprend la structure exacte d'une notification : bandeau d'en-tête avec
 * l'icône de l'app, son nom en capitales et l'horodatage à droite, puis le
 * corps avec titre en gras et texte. Variante sombre, translucide, pour
 * rester dans la charte.
 *
 * Elle tombe après un court délai, comme une vraie notification. Le mouvement
 * est supprimé pour qui demande moins d'animations.
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
      className={`pointer-events-none w-[326px] overflow-hidden rounded-[22px] text-left border border-white/[0.12] shadow-[0_26px_70px_rgba(0,0,0,0.6)] transition-all duration-700 ease-[cubic-bezier(0.22,0.61,0.36,1)] ${
        shown ? "translate-y-0 scale-100 opacity-100" : "-translate-y-4 scale-95 opacity-0"
      }`}
    >
      {/* En-tête : icône, nom de l'app en capitales, horodatage. */}
      <div className="flex items-center gap-2 bg-[rgba(44,44,46,0.82)] px-3.5 py-2 backdrop-blur-2xl">
        <span className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-[6px] bg-ink">
          <svg width="14" height="14" viewBox="0 0 64 64" aria-hidden>
            <path d="M16 50c0-12 8-16 16-16s16-4 16-16" fill="none" stroke="#fff" strokeWidth="7" strokeLinecap="round" />
            <circle cx="48" cy="17" r="8" fill="#0A84FF" />
          </svg>
        </span>
        <span className="flex-1 text-[12px] font-semibold uppercase tracking-[0.04em] text-white/70">
          {SITE.name}
        </span>
        <span className="text-[12px] font-medium text-white/45">maintenant</span>
      </div>

      {/* Corps : miniature, titre, message. */}
      <div className="flex items-start gap-3 bg-[rgba(28,28,30,0.78)] px-3.5 py-3 backdrop-blur-2xl">
        <div className="relative h-[42px] w-[42px] shrink-0 overflow-hidden rounded-[10px] bg-graphite">
          {hasPhoto ? (
            <Image
              src={photo}
              alt=""
              fill
              sizes="42px"
              onError={() => setHasPhoto(false)}
              className="object-cover object-top"
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center font-display text-sm font-bold text-white/40">
              {firstName.charAt(0)}
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-semibold leading-tight tracking-[-0.01em] text-white">
            {firstName} arrive !
          </p>
          <p className="mt-0.5 text-[13px] leading-snug text-white/65">
            Votre course est confirmée. Prise en charge à l&apos;heure choisie, prix déjà réglé.
          </p>
        </div>
      </div>
    </div>
  );
}
