"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { RouteMap } from "@/components/RouteMap";
import { ArrivalToast } from "./ArrivalToast";
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

  const padding = useMemo(
    () =>
      desktop
        ? { top: 140, bottom: 220, left: 600, right: 120 }
        : // La carte se recentre sur la place réellement laissée par la
          // feuille, selon qu'elle est repliée, réduite ou dépliée.
          { top: 110, bottom: sheetCollapsed ? 280 : sheetPeek ? 330 : 560, left: 40, right: 40 },
    [desktop, sheetCollapsed, sheetPeek]
  );

  return (
    <section className="relative h-[100svh] min-h-[760px] overflow-hidden">
      <RouteMap from={route.from} to={route.to} geometry={route.q?.geometry} padding={padding} />

      <div className="glass absolute inset-x-2 bottom-2 z-20 rounded-5xl p-5 shadow-[0_30px_80px_rgba(0,0,0,0.45)] transition-[padding] duration-300 md:inset-x-auto md:bottom-auto md:left-16 md:top-[120px] md:w-[440px] md:p-7">
        {/* Poignée : indique que la feuille se manipule, comme sur mobile. */}
        <button
          type="button"
          onClick={() => {
            if (sheetPeek) setExpanded(true);
            else if (sheetCollapsed) setCollapsed(false);
            else setCollapsed(true);
          }}
          aria-label={sheetCollapsed ? "Déplier le formulaire" : "Replier le formulaire"}
          aria-expanded={!sheetCollapsed}
          className="mx-auto mb-3 flex h-4 w-full items-center justify-center md:hidden"
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

      {/* En dessous de lg, le titre de droite disparaît : l'écran n'affichait
          plus que la carte et le formulaire, sans dire ce qu'on vend. */}
      {showHeadline && (
        <div className="pointer-events-none absolute inset-x-6 top-[88px] z-10 flex flex-col gap-3 md:hidden">
          <p className="font-display text-[26px] font-extrabold leading-[1.05] tracking-[-0.035em] sm:text-[32px]">
            <span className="serif-accent">Nicolas,</span> votre chauffeur privé.
            <br />
            Partout en Grand Est.
          </p>
          <p className="text-[13px] leading-snug text-label-strong">Prix ferme, payé en ligne.</p>
        </div>
      )}

      {showHeadline && (
        <div className="pointer-events-none absolute bottom-14 right-6 z-10 hidden max-w-[240px] flex-col items-end gap-5 text-right md:flex lg:right-16 lg:max-w-[400px] xl:max-w-[800px]">
          <div className="pointer-events-auto mb-1 hidden lg:block">
            <ArrivalToast />
          </div>
          <p className="font-display text-[30px] font-extrabold leading-[1.05] tracking-[-0.035em] lg:text-[34px] xl:text-[48px] xl:leading-[1.02] xl:tracking-[-0.04em]">
            <span className="serif-accent">Nicolas,</span> votre chauffeur privé.
            <br />
            Partout en Grand Est.
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
