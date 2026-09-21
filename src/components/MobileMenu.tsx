"use client";

import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SITE } from "@/config/site";

const LINKS = [
  { href: "/#villes", label: "Destinations" },
  { href: "/#deroule", label: "Comment ça marche" },
  { href: "/#vehicule", label: "Le véhicule" },
  { href: "/#chauffeur", label: "Votre chauffeur" },
  { href: "/#avis", label: "Avis" },
  { href: "/services/evenementiel", label: "Événementiel" },
  { href: "/services/tourisme", label: "Circuits touristiques" },
  { href: "/services/professionnels", label: "Professionnels" },
  { href: "/#villes", label: "Zones desservies" },
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
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white transition-colors hover:bg-white/[0.08] lg:hidden"
      >
        {open ? <CloseIcon /> : <BurgerIcon />}
      </button>

      {open &&
        createPortal(
          <div id={panelId} className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-[#0A0A0A] lg:hidden">
            <div className="flex h-[72px] shrink-0 items-center justify-between px-5">
              <span className="font-display text-xl font-bold tracking-[-0.02em]">
                Eco <span className="serif-accent">Driver</span>
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Fermer le menu"
                className="flex h-11 w-11 items-center justify-center rounded-full text-white transition-colors hover:bg-white/[0.08]"
              >
                <CloseIcon />
              </button>
            </div>

            <div className="flex flex-col gap-3 px-5 pb-12 pt-4">
              <Link href="/" onClick={() => setOpen(false)} className="btn-primary w-full">
                Réserver une course
              </Link>
              <a href={SITE.phoneHref} onClick={() => setOpen(false)} className="btn-ghost w-full">
                Appeler le chauffeur
              </a>

              <nav className="mt-5 flex flex-col">
                {LINKS.map((l) => (
                  <Link
                    key={l.label}
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="flex min-h-[56px] items-center border-b border-white/[0.07] text-[17px] font-medium text-label-strong transition-colors last:border-0 hover:text-white"
                  >
                    {l.label}
                  </Link>
                ))}
              </nav>
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
