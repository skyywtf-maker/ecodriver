import type { Booking } from "@prisma/client";
import { euros } from "@/lib/pricing";
import { formatParis } from "@/lib/time";

export function BookingRecap({ b }: { b: Booking }) {
  const rows: [string, string][] = [
    ["Référence", b.reference],
    ["Date", formatParis(b.pickupAt)],
    ["Distance", `${b.distanceKm.toLocaleString("fr-FR")} km · ${b.durationMin} min`],
    ["Passagers · bagages", `${b.passengers} · ${b.luggage}`],
  ];
  return (
    <div className="flex flex-col gap-5">
      <div className="flex gap-3.5">
        <div className="flex flex-col items-center pt-1.5" aria-hidden>
          <span className="h-2.5 w-2.5 rounded-full border-[2.5px] border-white" />
          <span className="h-10 w-0.5 bg-white/20" />
          <span className="h-2.5 w-2.5 rounded-full bg-accent" />
        </div>
        <div className="flex min-w-0 flex-col gap-[26px] text-base font-semibold">
          <span>{b.fromLabel}</span>
          <span>{b.toLabel}</span>
        </div>
      </div>
      <dl className="grid grid-cols-2 gap-2">
        {rows.map(([k, v]) => (
          <div key={k} className="flex flex-col gap-0.5 rounded-[14px] bg-white/[0.06] px-4 py-3.5">
            <dt className="text-[11px] font-medium text-label">{k}</dt>
            <dd className="text-[15px] font-semibold">{v}</dd>
          </div>
        ))}
      </dl>
      <div className="flex items-end justify-between border-t border-white/10 pt-5">
        <span className="text-[13px] font-medium text-label">Payé</span>
        <span className="font-display text-4xl font-bold leading-none tracking-[-0.03em]">{euros(b.priceCents / 100)}</span>
      </div>
    </div>
  );
}
