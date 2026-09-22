"use client";

import { useEffect, useState } from "react";
import { SITE } from "@/config/site";

/** Événement écouté par HeroBooking : déplie le formulaire « Où allez-vous ? ». */
export const OPEN_BOOKING_EVENT = "ecodriver:open-booking";

/**
 * Barre de réservation fixée en bas de l'écran, sur téléphone uniquement.
 *
 * Elle apparaît dès que la carte d'accueil a quitté l'écran : où qu'on soit
 * dans la page, réserver reste à un pouce. Le bouton remonte en haut et
 * déplie directement le formulaire.
 */
export function StickyBookBar({ heroId }: { heroId: string }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const hero = document.getElementById(heroId);
    if (!hero || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([e]) => setVisible(!e?.isIntersecting), { threshold: 0.15 });
    io.observe(hero);
    return () => io.disconnect();
  }, [heroId]);

  function book() {
    const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: smooth ? "smooth" : "auto" });
    window.dispatchEvent(new Event(OPEN_BOOKING_EVENT));
  }

  return (
    <div
      aria-hidden={!visible}
      className={`fixed inset-x-3 bottom-3 z-40 transition-all duration-300 md:hidden ${
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-[140%] opacity-0"
      }`}
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {/* Fond opaque : en verre dépoli, le texte de la page transparaissait. */}
      <div className="flex items-center gap-2 rounded-3xl border border-white/[0.12] bg-[#121317] p-2 shadow-[0_18px_50px_rgba(0,0,0,0.55)]">
        <button type="button" onClick={book} tabIndex={visible ? 0 : -1} className="btn-primary h-12 flex-1 px-4 text-[15px]">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3.5-3.5" />
          </svg>
          Où allez-vous ?
        </button>
        <a href={SITE.phoneHref} tabIndex={visible ? 0 : -1} aria-label="Appeler" className="btn-ghost h-12 w-12 shrink-0 px-0">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z" />
          </svg>
        </a>
      </div>
    </div>
  );
}
