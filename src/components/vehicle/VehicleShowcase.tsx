import { SITE } from "@/config/site";
import { Car3D } from "./Car3D";

/**
 * Section véhicule : le modèle en 3D, le confort à bord juste à côté.
 *
 * La liste est rendue côté serveur — elle reste lisible et indexable même si
 * la 3D ne se charge pas (JavaScript coupé, WebGL indisponible, mobile ancien).
 */
export function VehicleShowcase() {
  const { model, accent, comfort } = SITE.vehicle;

  return (
    <section id="vehicule" className="scroll-mt-28 pt-24 md:pt-[120px]">
      <div className="flex flex-col gap-3">
        <h2 className="font-display text-4xl font-bold tracking-[-0.035em] md:text-5xl">
          {model}, <span className="serif-accent">{accent}</span>
        </h2>
        <p className="max-w-[560px] text-[15px] leading-relaxed text-label">
          Ce qui change pour vous, à l&apos;arrière : le silence, la place, la température.
        </p>
      </div>

      <div className="mt-10 grid gap-4 md:mt-12 md:grid-cols-12">
        <div className="md:col-span-7">
          <Car3D />
        </div>

        <div className="glass flex flex-col gap-4 rounded-4xl p-7 md:col-span-5 md:p-8">
          <h3 className="text-[11px] font-medium uppercase tracking-[0.12em] text-label">Le confort à bord</h3>
          <dl className="flex flex-col">
            {comfort.map((c) => (
              <div key={c.k} className="flex flex-col gap-1 border-b border-white/[0.07] py-3.5 last:border-0 last:pb-0">
                <dt className="font-display text-[16px] font-semibold tracking-[-0.015em]">{c.k}</dt>
                <dd className="text-[13px] leading-snug text-label">{c.v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
