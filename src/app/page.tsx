import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { HeroBooking } from "@/components/booking/HeroBooking";
import { SITE } from "@/config/site";

const STEPS = [
  { t: "Votre trajet", d: "Départ, arrivée, horaire. Le prix exact s’affiche tout de suite." },
  { t: "Paiement en ligne", d: "En une fois, sécurisé. Remboursé intégralement si la course ne peut être assurée." },
  { t: "Confirmation", d: "Le chauffeur valide et vous transmet son numéro pour le jour J." },
];

export default function Home() {
  return (
    <>
      <Nav />
      <HeroBooking />

      <main className="mx-auto max-w-[1440px] px-4 md:px-16">
        <section id="villes" className="scroll-mt-28 pt-24 md:pt-[120px]">
          <h2 className="font-display text-4xl font-bold tracking-[-0.035em] md:text-5xl">
            Huit villes, <span className="serif-accent">un seul chauffeur.</span>
          </h2>
          <ul className="mt-10 grid grid-cols-2 gap-3 md:mt-12 md:grid-cols-4 md:gap-4">
            {SITE.cities.map((c) => (
              <li key={c.name} className="tile flex h-[116px] flex-col justify-between rounded-[22px] px-6 py-[22px]">
                <span className="font-display text-lg font-semibold tracking-[-0.02em] md:text-xl">{c.name}</span>
                <span className="text-sm font-medium text-label">{c.km}</span>
              </li>
            ))}
          </ul>
        </section>

        <section id="deroule" className="scroll-mt-28 pt-24 md:pt-[120px]">
          <ol className="grid gap-4 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <li key={s.t} className="tile flex h-[240px] flex-col justify-between rounded-4xl p-8">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white font-display text-base font-bold text-ink">
                  {i + 1}
                </span>
                <div className="flex flex-col gap-2.5">
                  <h3 className="font-display text-2xl font-bold tracking-[-0.02em]">{s.t}</h3>
                  <p className="text-[15px] leading-relaxed text-label">{s.d}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section id="vehicule" className="scroll-mt-28 pt-24 md:pt-[120px]">
          <div className="relative flex min-h-[580px] items-end overflow-hidden rounded-5xl border border-white/[0.08] bg-graphite p-4 md:justify-end md:p-8">
            {/* TODO: remplacer par la vidéo/photo du véhicule tournée par AchMedia (public/vehicule.mp4) */}
            <span className="absolute left-8 top-8 text-[13px] font-medium text-white/45">[ Photo ou vidéo du véhicule, plein cadre ]</span>
            <div className="glass relative flex w-full flex-col gap-5 rounded-3xl p-7 md:w-[420px]">
              <h2 className="font-display text-[32px] font-bold tracking-[-0.03em]">
                {SITE.vehicle.model} <span className="serif-accent">berline</span>
              </h2>
              <dl className="grid grid-cols-2 gap-2">
                {SITE.vehicle.specs.map((s) => (
                  <div key={s.k} className="flex flex-col gap-0.5 rounded-[14px] bg-white/[0.06] px-4 py-3.5">
                    <dt className="text-[11px] font-medium text-label">{s.k}</dt>
                    <dd className="text-[15px] font-semibold">{s.v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </section>

        <section id="avis" className="scroll-mt-28 pt-24 md:pt-[120px]">
          <ul className="grid gap-4 md:grid-cols-3">
            {SITE.reviews.map((r, i) => (
              <li key={i}>
                <figure className="tile flex h-[240px] flex-col justify-between rounded-4xl p-8">
                  <blockquote className="font-serif text-[22px] italic leading-snug">« {r.text} »</blockquote>
                  <figcaption className="text-[13px] font-medium text-label">
                    <span className="font-semibold text-white">{r.author}</span> · {r.route}
                  </figcaption>
                </figure>
              </li>
            ))}
          </ul>
        </section>
      </main>
      <Footer />
    </>
  );
}
