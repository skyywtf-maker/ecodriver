import { VEHICLES } from "@/config/pricing";
import { SITE } from "@/config/site";
import { Car3D } from "./Car3D";

/**
 * Section véhicules : les trois catégories, avec leur capacité et leur tarif.
 *
 * Le modèle 3D illustre la berline ; les deux autres catégories s'appuient sur
 * leur fiche. Aucun argumentaire lié à la motorisation : le véhicule réel est
 * une Toyota Corolla, pas un véhicule électrique.
 */
export function VehicleShowcase() {
  const { accent, intro } = SITE.vehicle;

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
          <Car3D />
        </div>

        <ul className="flex flex-col gap-3 md:col-span-5">
          {VEHICLES.map((v) => (
            <li key={v.id} className="glass flex flex-col gap-3 rounded-4xl p-6">
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="font-display text-[19px] font-bold tracking-[-0.02em]">{v.name}</h3>
                <span className="shrink-0 font-display text-[14px] font-semibold text-accent">{v.from}</span>
              </div>
              <p className="text-[13px] leading-relaxed text-label">{v.tagline}</p>
              <dl className="flex flex-wrap gap-2">
                {[
                  ["Modèle", v.model],
                  ["Passagers", String(v.passengers)],
                  ["Bagages", String(v.luggage)],
                ].map(([k, val]) => (
                  <div key={k} className="flex flex-col gap-0.5 rounded-[12px] bg-white/[0.06] px-3.5 py-2">
                    <dt className="text-[10px] font-medium uppercase tracking-[0.08em] text-label">{k}</dt>
                    <dd className="text-[13px] font-semibold">{val}</dd>
                  </div>
                ))}
              </dl>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
