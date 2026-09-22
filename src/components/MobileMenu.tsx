"use client";

import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SITE } from "@/config/site";
import { SERVICES } from "@/config/services";
import { Logo } from "./Logo";

/** Les quatre sections de l'accueil, rien de plus : douze liens noyaient l'essentiel. */
const SECTIONS = [
  { href: "/#vehicule", label: "Véhicules" },
  { href: "/#villes", label: "Destinations" },
  { href: "/#services", label: "Prestations" },
  { href: "/#avis", label: "Avis" },
];

/**
 * Menu complet, ouvert depuis les trois traits en haut à gauche.
 *
 * En dessous de `lg`, la barre de navigation n'affiche aucun lien : les
 * sections de l'accueil seraient inatteignables au doigt sans lui.
 *
 * Le panneau est plein écran et OPAQUE. En verre dépoli, le texte de la page
 * restait lisible dessous et le menu devenait illisible ; il est de surcroît
 * sorti du <nav> par un portail, la barre portant un backdrop-filter qui en
 * ferait une racine de fond.
 */
export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const panelId = useId();

  // Un changement de page referme le menu. Les liens d'ancre, eux, ne
  // modifient pas le chemin : ils ferment donc au clic (voir plus bas).
  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
        aria-expanded={open}
        aria-controls={panelId}
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white transition-colors hover:bg-white/[0.08] lg:hidden"
      >
        {open ? <CloseIcon /> : <BurgerIcon />}
      </button>

      {open &&
        createPortal(
          <div id={panelId} className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-[#0A0A0A] lg:hidden">
            <div className="flex h-[72px] shrink-0 items-center justify-between px-5">
              {/* Le logo mène à l'accueil : sur l'accueil même, le chemin ne change
                  pas, c'est donc le clic qui referme le menu. */}
              <div onClick={() => setOpen(false)}>
                <Logo className="text-[22px]" />
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Fermer le menu"
                className="flex h-11 w-11 items-center justify-center rounded-xl text-white transition-colors hover:bg-white/[0.08]"
              >
                <CloseIcon />
              </button>
            </div>

            <nav className="flex flex-1 flex-col px-5 pt-6">
              <ul className="flex flex-col">
                {SECTIONS.map((l, i) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      onClick={() => setOpen(false)}
                      className="flex items-baseline gap-4 py-2.5 font-display text-[30px] font-bold tracking-[-0.03em] text-white transition-colors hover:text-accent"
                    >
                      <span className="w-6 font-sans text-[11px] font-semibold tracking-[0.08em] text-white/30">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>

              {/* Les prestations en second niveau, en petit : elles ont leur page,
                  mais ne doivent pas concurrencer les sections. */}
              <p className="eyebrow mt-10">Nos prestations</p>
              <ul className="mt-3 grid grid-cols-2 gap-2">
                {SERVICES.map((s) => (
                  <li key={s.slug}>
                    <Link
                      href={`/services/${s.slug}`}
                      onClick={() => setOpen(false)}
                      className="flex h-full min-h-[48px] items-center rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-2.5 text-[13px] font-semibold leading-tight text-label-strong transition-colors hover:text-white"
                    >
                      {s.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Actions toujours à portée du pouce, en bas de l'écran. */}
            <div className="sticky bottom-0 grid grid-cols-[1fr_auto] gap-2 border-t border-white/[0.07] bg-[#0A0A0A] px-5 pb-[max(20px,env(safe-area-inset-bottom))] pt-4">
              <Link href="/" onClick={() => setOpen(false)} className="btn-primary w-full">
                Réserver une course
              </Link>
              <a href={SITE.phoneHref} onClick={() => setOpen(false)} className="btn-ghost" aria-label="Appeler">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z" />
                </svg>
              </a>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}

function BurgerIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
      <path d="M3 6h18M3 12h18M3 18h18" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}
