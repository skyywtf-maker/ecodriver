"use client";

import { VEHICLES, type VehicleId } from "@/config/pricing";

/**
 * Choix de la catégorie de véhicule, en carrousel horizontal.
 *
 * Construit avec des vrais boutons radio masqués : le clavier, les flèches et
 * les lecteurs d'écran fonctionnent sans code supplémentaire, et le défilement
 * tactile est celui du navigateur — donc fluide, avec inertie.
 *
 * Changer de véhicule relance le calcul du prix sans toucher aux adresses
 * déjà saisies.
 */
export function VehiclePicker({
  value,
  onChange,
}: {
  value: VehicleId;
  onChange: (id: VehicleId) => void;
}) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="field-label mb-1.5">Véhicule</legend>

      <div
        className="-mx-1 flex snap-x snap-mandatory gap-2.5 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        role="radiogroup"
        aria-label="Catégorie de véhicule"
      >
        {VEHICLES.map((v) => {
          const selected = v.id === value;
          return (
            <label
              key={v.id}
              className={`flex min-w-[168px] shrink-0 cursor-pointer snap-start flex-col gap-1.5 rounded-2xl border px-4 py-3 transition-colors ${
                selected
                  ? "border-accent bg-white/[0.10]"
                  : "border-white/[0.10] bg-white/[0.04] hover:border-white/25"
              }`}
            >
              <input
                type="radio"
                name="vehicle"
                value={v.id}
                checked={selected}
                onChange={() => onChange(v.id)}
                className="sr-only"
              />
              <span className="flex items-baseline justify-between gap-2">
                <span className="font-display text-[14px] font-semibold tracking-[-0.015em]">{v.name}</span>
                {selected && <CheckIcon />}
              </span>
              <span className="text-[11px] text-label">
                {v.passengers} passagers · {v.luggage} bagages
              </span>
              <span className={`text-[13px] font-semibold ${selected ? "text-accent" : "text-label-strong"}`}>
                {v.from}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0A84FF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}
