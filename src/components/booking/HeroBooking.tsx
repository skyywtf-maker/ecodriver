"use client";

import { useMemo, useState } from "react";
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

  const padding = useMemo(
    () => (desktop ? { top: 140, bottom: 220, left: 600, right: 120 } : { top: 110, bottom: 560, left: 40, right: 40 }),
    [desktop]
  );

  return (
    <section className="relative h-[100svh] min-h-[760px] overflow-hidden">
      <RouteMap from={route.from} to={route.to} geometry={route.q?.geometry} padding={padding} />

      <div className="glass absolute inset-x-2 bottom-2 z-20 rounded-5xl p-5 shadow-[0_30px_80px_rgba(0,0,0,0.45)] md:inset-x-auto md:bottom-auto md:left-16 md:top-[120px] md:w-[440px] md:p-7">
        <TripForm
          onQuote={(q, from, to) => setRoute({ q, from, to })}
          onContinue={(d) => (onContinue ? onContinue(d) : router.push("/reserver"))}
        />
      </div>

      {/* En dessous de lg, le titre de droite disparaît : l'écran n'affichait
          plus que la carte et le formulaire, sans dire ce qu'on vend. */}
      {showHeadline && (
        <div className="pointer-events-none absolute inset-x-6 top-[88px] z-10 flex flex-col gap-3 md:hidden">
          <p className="font-display text-[34px] font-extrabold leading-[0.98] tracking-[-0.04em] sm:text-[42px]">
            Chauffeur privé.
            <br />
            <span className="serif-accent">Grand Est.</span>
          </p>
          <p className="max-w-[260px] text-[14px] leading-snug text-label-strong">
            Prix ferme affiché avant de réserver, payé en ligne.
          </p>
        </div>
      )}

      {showHeadline && (
        <div className="pointer-events-none absolute bottom-14 right-6 z-10 hidden max-w-[240px] flex-col items-end gap-5 text-right md:flex lg:right-16 lg:max-w-none">
          <p className="font-display text-[34px] font-extrabold leading-[1.02] tracking-[-0.04em] lg:text-[72px] lg:leading-[0.98] lg:tracking-[-0.045em]">
            Chauffeur privé.
            <br />
            <span className="serif-accent">Grand Est.</span>
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
