"use client";

import { VEHICLES, type VehicleId } from "@/config/pricing";

/**
 * Choix de la catégorie de véhicule, sur trois colonnes égales.
 *
 * Construit avec des vrais boutons radio masqués : le clavier, les flèches et
 * les lecteurs d'écran fonctionnent sans code supplémentaire.
 *
 * Plus de carrousel : un <fieldset> s'élargit par défaut à son contenu
 * (min-width: min-content), la rangée débordait du formulaire et la carte
 * Van sortait du panneau. Trois colonnes tiennent toujours dans la largeur.
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
    <fieldset className="flex min-w-0 flex-col gap-2">
      <legend className="field-label mb-1.5">Véhicule</legend>

      <div
        className="grid grid-cols-3 gap-2"
        role="radiogroup"
        aria-label="Catégorie de véhicule"
      >
        {VEHICLES.map((v) => {
          const selected = v.id === value;
          return (
            <label
              key={v.id}
              className={`flex min-w-0 cursor-pointer flex-col gap-1 rounded-2xl border px-3 py-2.5 transition-colors ${
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
              <span className="flex items-start justify-between gap-1">
                <span className="font-display text-[13px] font-semibold leading-tight tracking-[-0.015em]">{v.name}</span>
                {selected && <CheckIcon />}
              </span>
              <span className="text-[11px] leading-tight text-label">
                {v.passengers} pers. · {v.luggage} bag.
              </span>
              <span className={`mt-auto text-[12px] font-semibold ${selected ? "text-accent" : "text-label-strong"}`}>
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
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0A84FF" className="mt-0.5 shrink-0" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}
