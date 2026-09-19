import { SITE } from "@/config/site";
import { Car3D } from "./Car3D";

/**
 * Section véhicule : le modèle en 3D, sa fiche technique juste à côté.
 *
 * La fiche est rendue côté serveur — elle est lisible et indexable même si
 * la 3D ne se charge pas (JavaScript coupé, WebGL indisponible, mobile ancien).
 */
export function VehicleShowcase() {
  const { model, accent, techSpecs, specs } = SITE.vehicle;

  return (
    <section id="vehicule" className="scroll-mt-28 pt-24 md:pt-[120px]">
      <h2 className="font-display text-4xl font-bold tracking-[-0.035em] md:text-5xl">
        {model}, <span className="serif-accent">{accent}</span>
      </h2>

      <div className="mt-10 grid gap-4 md:mt-12 md:grid-cols-12">
        <div className="md:col-span-7">
          <Car3D />
        </div>

        <div className="glass flex flex-col gap-7 rounded-4xl p-7 md:col-span-5 md:p-8">
          <div className="flex flex-col gap-4">
            <h3 className="text-[11px] font-medium uppercase tracking-[0.12em] text-label">Fiche technique</h3>
            <dl className="flex flex-col">
              {techSpecs.map((s) => (
                <div
                  key={s.k}
                  className="flex items-baseline justify-between gap-4 border-b border-white/[0.07] py-3 last:border-0"
                >
                  <dt className="text-[13px] font-medium text-label">{s.k}</dt>
                  <dd className="flex items-baseline gap-2">
                    <span className="font-display text-[19px] font-bold tracking-[-0.02em]">{s.v}</span>
                    {s.note && <span className="text-[11px] font-medium text-label">{s.note}</span>}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="text-[11px] font-medium uppercase tracking-[0.12em] text-label">À bord</h3>
            <dl className="grid grid-cols-2 gap-2">
              {specs.map((s) => (
                <div key={s.k} className="flex flex-col gap-0.5 rounded-[14px] bg-white/[0.06] px-4 py-3.5">
                  <dt className="text-[11px] font-medium text-label">{s.k}</dt>
                  <dd className="text-[15px] font-semibold">{s.v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
