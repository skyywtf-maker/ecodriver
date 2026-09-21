import type { TripDraft } from "@/lib/draft";
import { euros } from "@/lib/pricing";

function formatDate(date: string, time: string) {
  const [y, m, d] = date.split("-").map(Number);
  const label = new Intl.DateTimeFormat("fr-FR", { weekday: "short", day: "numeric", month: "short" }).format(new Date(y, m - 1, d));
  return { day: label.charAt(0).toUpperCase() + label.slice(1), time };
}

export function TripSummary({ draft, detailed = false }: { draft: TripDraft; detailed?: boolean }) {
  const { day, time } = formatDate(draft.date, draft.time);
  const p = draft.quote.price;
  return (
    <div className="flex h-full flex-col gap-[18px]">
      <span className="text-[13px] font-medium text-label">Votre trajet</span>
      <div className="flex gap-3.5">
        <div className="flex flex-col items-center pt-1.5" aria-hidden>
          <span className="h-2.5 w-2.5 rounded-full border-[2.5px] border-white" />
          <span className="h-10 w-0.5 bg-white/20" />
          <span className="h-2.5 w-2.5 rounded-full bg-accent" />
        </div>
        <div className="flex min-w-0 flex-col gap-[26px] text-base font-semibold">
          <span className="truncate">{draft.from.label}</span>
          <span className="truncate">{draft.to.label}</span>
        </div>
      </div>
      <dl className="grid grid-cols-2 gap-2">
        {[
          ["Date", day],
          ["Heure", time],
          ["Distance", `${draft.quote.distanceKm.toLocaleString("fr-FR")} km`],
          ["Passagers · bagages", `${draft.passengers} · ${draft.luggage}`],
        ].map(([k, v]) => (
          <div key={k} className="flex flex-col gap-0.5 rounded-[14px] bg-white/[0.06] px-4 py-3.5">
            <dt className="text-[11px] font-medium text-label">{k}</dt>
            <dd className="text-[15px] font-semibold">{v}</dd>
          </div>
        ))}
      </dl>
      {detailed && (
        <dl className="flex flex-col gap-2.5 border-t border-white/10 pt-4 text-sm">
          {/* Le détail vient de la grille du véhicule choisi : chaque palier
              de distance donne sa propre ligne. */}
          <Row k="Véhicule" v={p.vehicleName} />
          {p.lines.map((l) => (
            <Row key={l.label} k={l.label} v={euros(l.amount)} />
          ))}
          {p.surchargeApplied && (
            <Row k={`Majoration nuit/week-end (× ${p.surchargeMultiplier.toLocaleString("fr-FR")})`} v="incluse" />
          )}
        </dl>
      )}
      <div className="mt-auto flex items-end justify-between border-t border-white/10 pt-5">
        <span className="text-[13px] font-medium text-label">Total TTC</span>
        <span className="font-display text-5xl font-bold leading-none tracking-[-0.03em]">{euros(p.total)}</span>
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-label">{k}</dt>
      <dd className="font-semibold">{v}</dd>
    </div>
  );
}
