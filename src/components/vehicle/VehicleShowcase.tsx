"use client";

import { useState } from "react";
import { VEHICLES, type VehicleId } from "@/config/pricing";
import { SITE } from "@/config/site";
import { Car3D } from "./Car3D";

/**
 * Section véhicules : les trois catégories, avec leur capacité et leur tarif.
 *
 * La fiche sélectionnée pilote le modèle 3D affiché à côté. Aucun
 * argumentaire lié à la motorisation : le véhicule est une Toyota Corolla
 * thermique, pas un véhicule électrique.
 */
export function VehicleShowcase() {
  const { accent, intro } = SITE.vehicle;
  const [selected, setSelected] = useState<VehicleId>(VEHICLES[0]!.id);
  const active = VEHICLES.find((v) => v.id === selected)!;

  return (
    <section id="vehicule" className="scroll-mt-28 pt-24 md:pt-[120px]">
      <div className="flex flex-col gap-3">
        <h2 className="font-display text-4xl font-bold tracking-[-0.035em] md:text-5xl">
          Un véhicule par besoin, <span className="serif-accent">{accent}</span>
        </h2>
        <p className="max-w-[560px] text-[15px] leading-relaxed text-label">{intro}</p>
      </div>

      <div className="mt-10 grid gap-4 md:mt-12 md:grid-cols-12">
        <div className="md:col-span-7">
          <Car3D src={active.model3d ?? ""} />
        </div>

        <ul className="flex flex-col gap-3 md:col-span-5">
          {VEHICLES.map((v) => {
            const on = v.id === selected;
            return (
              <li key={v.id}>
                <button
                  type="button"
                  onClick={() => setSelected(v.id)}
                  aria-pressed={on}
                  className={`flex w-full flex-col gap-3 rounded-4xl border p-6 text-left transition-colors ${
                    on ? "glass border-accent/50" : "tile border-white/[0.08] hover:bg-white/[0.07]"
                  }`}
                >
                  <span className="flex items-baseline justify-between gap-3">
                    <span className="font-display text-[19px] font-bold tracking-[-0.02em]">{v.name}</span>
                    <span className={`shrink-0 font-display text-[14px] font-semibold ${on ? "text-accent" : "text-label"}`}>
                      {v.from}
                    </span>
                  </span>
                  <span className="text-[13px] leading-relaxed text-label">{v.tagline}</span>
                  <span className="flex flex-wrap gap-2">
                    {[
                      ["Modèle", v.model],
                      ["Passagers", String(v.passengers)],
                      ["Bagages", String(v.luggage)],
                    ].map(([k, val]) => (
                      <span key={k} className="flex flex-col gap-0.5 rounded-[12px] bg-white/[0.06] px-3.5 py-2">
                        <span className="text-[10px] font-medium uppercase tracking-[0.08em] text-label">{k}</span>
                        <span className="text-[13px] font-semibold">{val}</span>
                      </span>
                    ))}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
