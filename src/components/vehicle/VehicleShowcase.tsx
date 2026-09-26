"use client";

import { useState } from "react";
import { VEHICLES, type VehicleId } from "@/config/pricing";
import { SITE } from "@/config/site";
import { Car3D } from "./Car3D";

/**
 * Section véhicules.
 *
 * Les trois catégories tiennent sur une seule ligne d'onglets, et seule la
 * fiche choisie est détaillée : empilées, les trois fiches obligeaient à
 * faire défiler pour comparer. Le modèle 3D suit l'onglet actif.
 */
export function VehicleShowcase() {
  const { accent, intro } = SITE.vehicle;
  const [selected, setSelected] = useState<VehicleId>(VEHICLES[0]!.id);
  const active = VEHICLES.find((v) => v.id === selected)!;

  return (
    <section id="vehicule" className="scroll-mt-28 pt-16 md:pt-[104px]">
      <div className="flex flex-col gap-3">
        <p className="eyebrow">Véhicules</p>
        <h2 className="font-display text-[32px] font-bold leading-[1.05] tracking-[-0.035em] md:text-5xl">
          Un véhicule par besoin, <span className="serif-accent">{accent}</span>
        </h2>
        <p className="hidden max-w-[560px] text-[15px] leading-relaxed text-label md:block">{intro}</p>
      </div>

      {/* Onglets : trois colonnes égales, toujours visibles d'un coup d'œil. */}
      <div role="tablist" aria-label="Catégories de véhicule" className="mt-7 grid grid-cols-2 gap-2 md:grid-cols-4">
        {VEHICLES.map((v) => {
          const on = v.id === selected;
          return (
            <button
              key={v.id}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => setSelected(v.id)}
              className={`flex flex-col items-start gap-0.5 rounded-2xl border px-3 py-2.5 text-left transition-colors sm:px-4 sm:py-3 ${
                on ? "border-accent bg-white/[0.10]" : "border-white/[0.10] bg-white/[0.04] hover:border-white/25"
              }`}
            >
              <span className="font-display text-[13px] font-semibold leading-tight tracking-[-0.015em] sm:text-[15px]">
                {v.name}
              </span>
              <span className={`text-[11px] font-semibold sm:text-[12px] ${on ? "text-accent" : "text-label"}`}>
                {v.from}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-3 grid gap-3 md:grid-cols-12">
        <div className="md:col-span-7">
          {active.model3d ? (
            <Car3D src={active.model3d} yaw={active.model3dYaw} />
          ) : (
            // Pas de modèle 3D pour cette catégorie : on le dit, plutôt que
            // d'afficher le véhicule d'une autre.
            <div className="flex h-[150px] items-center justify-center rounded-3xl border border-white/[0.08] bg-graphite text-[13px] text-label md:h-[520px]">
              Visuel à venir
            </div>
          )}
        </div>

        <div className="glass flex flex-col gap-4 rounded-3xl p-5 md:col-span-5 md:justify-center md:p-7">
          <div className="flex flex-col gap-1.5">
            <h3 className="font-display text-[21px] font-bold tracking-[-0.02em]">{active.name}</h3>
            <p className="text-[14px] leading-relaxed text-label">{active.tagline}</p>
          </div>

          <dl className="grid grid-cols-3 gap-2">
            {[
              ["Modèle", active.model],
              ["Passagers", String(active.passengers)],
              ["Bagages", String(active.luggage)],
            ].map(([k, val]) => (
              <div key={k} className="flex flex-col gap-0.5 rounded-xl bg-white/[0.06] px-3 py-2.5">
                <dt className="text-[10px] font-medium uppercase tracking-[0.08em] text-label">{k}</dt>
                <dd className="text-[13px] font-semibold leading-tight">{val}</dd>
              </div>
            ))}
          </dl>

          <p className="border-t border-white/[0.08] pt-3.5 text-[13px] text-label">
            Tarif : <span className="font-semibold text-white">{active.priceHint}</span>
          </p>
        </div>
      </div>
    </section>
  );
}
