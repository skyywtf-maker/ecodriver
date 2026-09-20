"use client";

import { useEffect, useState } from "react";
import { AddressInput } from "@/components/AddressInput";
import { Counter } from "@/components/Counter";
import { BOOKING_RULES } from "@/config/pricing";
import { euros } from "@/lib/pricing";
import { loadDraft, saveDraft, type DraftPoint, type TripDraft } from "@/lib/draft";

export type QuoteState = TripDraft["quote"] | null;

type Props = {
  onQuote?: (q: QuoteState, from: DraftPoint | null, to: DraftPoint | null) => void;
  onContinue: (draft: TripDraft) => void;
  /** Feuille repliée : le trajet est résumé en une ligne, la carte prend la place. */
  collapsed?: boolean;
  /** Premier écran sur téléphone : seulement les adresses, pour voir la carte. */
  peek?: boolean;
  onExpand?: () => void;
};

function defaultWhen() {
  const d = new Date(Date.now() + 2 * 60 * 60 * 1000);
  d.setMinutes(Math.ceil(d.getMinutes() / 15) * 15, 0, 0);
  const pad = (n: number) => String(n).padStart(2, "0");
  return { date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`, time: `${pad(d.getHours())}:${pad(d.getMinutes())}` };
}

export function TripForm({ onQuote, onContinue, collapsed = false, peek = false, onExpand }: Props) {
  const [from, setFrom] = useState<(DraftPoint & { inGrandEst?: boolean }) | null>(null);
  const [to, setTo] = useState<(DraftPoint & { inGrandEst?: boolean }) | null>(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [passengers, setPassengers] = useState(1);
  const [luggage, setLuggage] = useState(0);
  const [quote, setQuote] = useState<QuoteState>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Reprise d'un brouillon (retour arrière depuis l'étape 2)
  useEffect(() => {
    const d = loadDraft();
    if (d) {
      setFrom(d.from);
      setTo(d.to);
      setDate(d.date);
      setTime(d.time);
      setPassengers(d.passengers);
      setLuggage(d.luggage);
    } else {
      const w = defaultWhen();
      setDate(w.date);
      setTime(w.time);
    }
  }, []);

  useEffect(() => {
    setQuote(null);
    onQuote?.(null, from, to);
    if (from?.inGrandEst === false || to?.inGrandEst === false) {
      setError("Le départ et l'arrivée doivent se trouver dans le Grand Est.");
      return;
    }
    setError(null);
    if (!from || !to || !date || !time) return;

    const ctrl = new AbortController();
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const r = await fetch("/api/quote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ from: strip(from), to: strip(to), date, time, passengers, luggage }),
          signal: ctrl.signal,
        });
        const data = await r.json();
        if (!data.ok) {
          setError(data.message ?? "Calcul impossible pour ce trajet.");
        } else {
          const q = { distanceKm: data.distanceKm, durationMin: data.durationMin, price: data.price, geometry: data.geometry };
          setQuote(q);
          onQuote?.(q, from, to);
        }
      } catch (e) {
        if ((e as Error).name !== "AbortError") setError("Connexion impossible. Réessayez.");
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [from, to, date, time]);

  const canContinue = !!(from && to && date && time && quote && !error && !loading);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!canContinue || !from || !to || !quote) return;
    const draft: TripDraft = { from: strip(from), to: strip(to), date, time, passengers, luggage, quote };
    saveDraft(draft);
    onContinue(draft);
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-5">
      {collapsed ? (
        // Repliée, la feuille ne garde que l'essentiel : le trajet, le prix,
        // et le bouton. Un appui la rouvre pour modifier quoi que ce soit.
        <button
          type="button"
          onClick={onExpand}
          className="field flex items-center gap-3 px-[18px] py-3.5 text-left"
        >
          <span className="flex flex-col items-center gap-1 pt-0.5" aria-hidden>
            <span className="h-2 w-2 rounded-full border-[2px] border-white" />
            <span className="h-4 w-px bg-white/25" />
            <span className="h-2 w-2 rounded-full bg-accent" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[14px] font-semibold">{from?.label}</span>
            <span className="block truncate text-[14px] font-semibold">{to?.label}</span>
            <span className="mt-1 block text-[11px] font-medium text-label">
              {formatWhen(date, time)} · Modifier
            </span>
          </span>
        </button>
      ) : (
        <>
      <div className="flex items-baseline justify-between">
        <h1 className="font-display text-[30px] font-bold leading-tight tracking-[-0.03em]">
          Où <span className="serif-accent">allez-vous ?</span>
        </h1>
        <span className="text-xs font-medium text-label">Grand Est</span>
      </div>

      <div className="field flex flex-col">
        <AddressInput label="Départ" placeholder="Adresse, gare, aéroport" marker="start" value={from} onChange={setFrom} className="border-b border-white/[0.08]" />
        <AddressInput label="Arrivée" placeholder="Adresse, gare, aéroport" marker="end" value={to} onChange={setTo} />
      </div>

      <div className={`grid-cols-2 gap-2.5 ${peek ? "hidden" : "grid"}`}>
        <label className="field flex h-[60px] flex-col justify-center gap-0.5 px-[18px]">
          <span className="field-label">Date</span>
          <input type="date" required className="field-input text-[15px]" value={date} onChange={(e) => setDate(e.target.value)} />
        </label>
        <label className="field flex h-[60px] flex-col justify-center gap-0.5 px-[18px]">
          <span className="field-label">Heure</span>
          <input type="time" required step={300} className="field-input text-[15px]" value={time} onChange={(e) => setTime(e.target.value)} />
        </label>
        <Counter label="Passagers" unit="passager" value={passengers} min={1} max={BOOKING_RULES.maxPassengers} onChange={setPassengers} />
        <Counter label="Bagages" unit="bagage" value={luggage} min={0} max={BOOKING_RULES.maxLuggage} onChange={setLuggage} />
      </div>
        </>
      )}

      {peek && !error && (
        <button type="button" onClick={onExpand} className="btn-ghost w-full text-[14px]">
          Date, heure, passagers
        </button>
      )}

      {error ? (
        <p role="alert" className="rounded-2xl bg-[#FF453A]/12 px-4 py-3 text-sm font-medium text-[#FF6961]">
          {error}
        </p>
      ) : (
        <div className={`items-end justify-between px-1 pt-1.5 ${peek && !quote && !loading ? "hidden" : "flex"}`} aria-live="polite">
          <div className="flex flex-col gap-1">
            <span className="text-[13px] font-medium text-label">
              {quote
                ? `${quote.distanceKm.toLocaleString("fr-FR")} km · ${quote.durationMin} min · ${quote.price.surchargeApplied ? "tarif nuit/week-end" : "tarif jour"}`
                : loading
                  ? "Calcul du prix…"
                  : "Indiquez votre trajet"}
            </span>
            <span className="text-xs text-white/50">Prix final TTC</span>
          </div>
          <span className="font-display text-[44px] font-bold leading-none tracking-[-0.03em]">
            {quote ? euros(quote.price.total) : "–"}
          </span>
        </div>
      )}

      <button type="submit" disabled={!canContinue} className="btn-primary w-full">
        Continuer
      </button>
      {!collapsed && !peek && (
        <p className="text-center text-xs text-white/50">
          Réservation au moins {BOOKING_RULES.minLeadMinutes} min à l&apos;avance
        </p>
      )}
    </form>
  );
}

/** « lun. 22 sept. à 14:30 » */
function formatWhen(date: string, time: string) {
  if (!date || !time) return "";
  const d = new Date(`${date}T${time}`);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" })} à ${time}`;
}

function strip(p: DraftPoint): DraftPoint {
  return { label: p.label, lat: p.lat, lng: p.lng };
}
