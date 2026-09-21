"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { RouteMap } from "@/components/RouteMap";
import { TripForm, type QuoteState } from "./TripForm";
import type { DraftPoint, TripDraft } from "@/lib/draft";
import { useIsDesktop } from "@/lib/useIsDesktop";

type Props = {
  /** Sur l'accueil, "Continuer" mène à /reserver. Dans /reserver, passe à l'étape suivante. */
  onContinue?: (d: TripDraft) => void;
  showHeadline?: boolean;
};

export function HeroBooking({ onContinue, showHeadline = true }: Props) {
  const router = useRouter();
  const desktop = useIsDesktop();
  const [route, setRoute] = useState<{ q: QuoteState; from: DraftPoint | null; to: DraftPoint | null }>({ q: null, from: null, to: null });

  // Feuille repliée façon Uber : dès que le prix est connu, le panneau se
  // baisse et rend l'écran à la carte. Sans objet sur grand écran, où la
  // carte de réservation occupe sa propre colonne.
  const [collapsed, setCollapsed] = useState(false);
  // Premier écran sur téléphone : seulement les adresses. Le formulaire
  // complet occupait les deux tiers de la hauteur et la carte ne se voyait
  // plus, alors qu'elle est ce qui rend le service lisible.
  const [expanded, setExpanded] = useState(false);
  const hasQuote = Boolean(route.q);

  useEffect(() => {
    if (desktop) setCollapsed(false);
    else if (hasQuote) setCollapsed(true);
  }, [desktop, hasQuote]);

  const sheetCollapsed = collapsed && !desktop;
  const sheetPeek = !desktop && !sheetCollapsed && !expanded;

  const dragStart = useRef<number | null>(null);
  function openSheet() {
    setCollapsed(false);
    setExpanded(true);
  }
  function closeSheet() {
    if (hasQuote) setCollapsed(true);
    else setExpanded(false);
  }

  const padding = useMemo(
    () =>
      desktop
        ? { top: 140, bottom: 220, left: 600, right: 120 }
        : // La carte se recentre sur la place réellement laissée par la
          // feuille, selon qu'elle est repliée, réduite ou dépliée.
          { top: 96, bottom: sheetCollapsed ? 260 : sheetPeek ? 300 : 540, left: 32, right: 32 },
    [desktop, sheetCollapsed, sheetPeek]
  );

  return (
    <section className="relative h-[100svh] min-h-[760px] overflow-hidden">
      <RouteMap from={route.from} to={route.to} geometry={route.q?.geometry} padding={padding} />

      <div className="glass absolute inset-x-2 bottom-2 z-20 rounded-5xl p-5 shadow-[0_30px_80px_rgba(0,0,0,0.45)] transition-[padding] duration-300 md:inset-x-auto md:bottom-auto md:left-16 md:top-[120px] md:w-[440px] md:p-7">
        {/* Poignée : indique que la feuille se manipule, comme sur mobile. */}
        {/* Poignée réellement manipulable : glisser vers le haut déplie la
            feuille, vers le bas la replie. Le clic fait la même chose, pour
            le clavier et la souris. */}
        <button
          type="button"
          onClick={() => (sheetPeek || sheetCollapsed ? openSheet() : closeSheet())}
          onTouchStart={(e) => {
            dragStart.current = e.touches[0]!.clientY;
          }}
          onTouchEnd={(e) => {
            const start = dragStart.current;
            dragStart.current = null;
            if (start === null) return;
            const delta = e.changedTouches[0]!.clientY - start;
            if (delta < -30) openSheet();
            else if (delta > 30) closeSheet();
          }}
          aria-label={sheetCollapsed || sheetPeek ? "Déplier le formulaire" : "Replier le formulaire"}
          aria-expanded={!sheetCollapsed && !sheetPeek}
          className="mx-auto mb-3 flex h-6 w-full touch-none items-center justify-center md:hidden"
        >
          <span className="h-1 w-10 rounded-full bg-white/25" />
        </button>

        <TripForm
          collapsed={sheetCollapsed}
          peek={sheetPeek}
          onExpand={() => {
            setCollapsed(false);
            setExpanded(true);
          }}
          onQuote={(q, from, to) => setRoute({ q, from, to })}
          onContinue={(d) => (onContinue ? onContinue(d) : router.push("/reserver"))}
        />
      </div>

      {/* Voile sombre derrière la barre, le titre et son sous-titre : sur la
          carte, le texte blanc devenait illisible dès qu'il tombait sur une
          zone claire. Uniquement sur petit écran, où le texte est en haut. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 z-[5] h-[30%] bg-[linear-gradient(180deg,rgba(10,10,10,0.78)_0%,rgba(10,10,10,0.32)_65%,rgba(10,10,10,0)_100%)] md:hidden"
      />

      {/* En dessous de lg, le titre de droite disparaît : l'écran n'affichait
          plus que la carte et le formulaire, sans dire ce qu'on vend. */}
      {showHeadline && (
        <div className="pointer-events-none absolute inset-x-6 top-[88px] z-10 flex flex-col gap-3 md:hidden">
          <p className="font-display text-[26px] font-extrabold leading-[1.05] tracking-[-0.035em] sm:text-[32px]">
            Votre chauffeur privé,
            <br />
            <span className="serif-accent">partout en Grand Est.</span>
          </p>
          <p className="text-[13px] leading-snug text-label-strong">Prix ferme, payé en ligne.</p>
        </div>
      )}

      {showHeadline && (
        <div className="pointer-events-none absolute bottom-14 right-6 z-10 hidden max-w-[240px] flex-col items-end gap-5 text-right md:flex lg:right-16 lg:max-w-[400px] xl:max-w-[800px]">
          <p className="font-display text-[30px] font-extrabold leading-[1.05] tracking-[-0.035em] lg:text-[34px] xl:text-[48px] xl:leading-[1.02] xl:tracking-[-0.04em]">
            Votre chauffeur privé,
            <br />
            <span className="serif-accent">partout en Grand Est.</span>
          </p>
          <ul className="hidden gap-2 lg:flex">
            {["Paiement sécurisé", "Confirmé par le chauffeur", "Remboursement intégral si refus"].map((c) => (
              <li key={c} className="glass-soft flex h-9 items-center rounded-full px-4 text-[13px] font-medium text-white/85">
                {c}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
