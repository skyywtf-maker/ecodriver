"use client";

import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SITE } from "@/config/site";

const SECTIONS = [
  { href: "/#villes", label: "Destinations" },
  { href: "/#deroule", label: "Comment ça marche" },
  { href: "/#vehicule", label: "Le véhicule" },
  { href: "/#chauffeur", label: "Votre chauffeur" },
  { href: "/#avis", label: "Avis" },
];

const LEGAL = [
  { href: "/mentions-legales", label: "Mentions légales" },
  { href: "/cgv", label: "CGV" },
  { href: "/confidentialite", label: "Confidentialité" },
];

/**
 * Menu complet, ouvert depuis les trois traits en haut à gauche.
 *
 * En dessous de `lg`, la barre de navigation n'affichait aucun lien : les
 * sections de l'accueil et les pages locales étaient inatteignables au doigt.
 */
type ZoneLink = { href: string; label: string };

/** Les liens sont fournis par le serveur : sans cela, tout le contenu
    rédactionnel des pages locales partirait dans le paquet JavaScript. */
export function MobileMenu({ zones }: { zones: ZoneLink[] }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const panelId = useId();

  // Toute navigation referme le menu, y compris un simple saut d'ancre.
  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    // Le fond ne défile pas derrière le panneau.
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
          <>
            {/* Le panneau est sorti du <nav> par un portail : la barre de
                navigation porte un backdrop-filter, ce qui en fait une racine
                de fond. Un enfant qui floute son arrière-plan n'y verrait que
                la barre, et le texte de la page resterait net dessous. */}
            <div
              className="fixed inset-0 z-40 bg-black/60 lg:hidden"
              onClick={() => setOpen(false)}
              aria-hidden
            />
            <div
              id={panelId}
              className="glass fixed inset-x-4 top-20 z-50 max-h-[calc(100svh-6rem)] overflow-y-auto rounded-4xl p-6 shadow-[0_30px_80px_rgba(0,0,0,0.5)] lg:hidden"
            >
          <Link href="/" className="btn-primary w-full">
            Réserver une course
          </Link>

          <a href={SITE.phoneHref} className="btn-ghost mt-3 w-full">
            Appeler le chauffeur
          </a>

          <Group title="Le site">
            {SECTIONS.map((s) => (
              <Row key={s.href} href={s.href} label={s.label} />
            ))}
          </Group>

          <Group title="Zones desservies">
            {zones.map((z) => (
              <Row key={z.href} href={z.href} label={z.label} />
            ))}
          </Group>

          <Group title="Informations">
            {LEGAL.map((l) => (
              <Row key={l.href} href={l.href} label={l.label} />
            ))}
          </Group>
            </div>
          </>,
          document.body
        )}
    </>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-7 flex flex-col gap-1">
      <h2 className="px-1 pb-2 text-[11px] font-medium uppercase tracking-[0.12em] text-white/35">{title}</h2>
      {children}
    </div>
  );
}

function Row({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="flex min-h-12 items-center rounded-2xl px-3 text-[15px] font-medium text-label-strong transition-colors hover:bg-white/[0.06] hover:text-white"
    >
      {label}
    </Link>
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
