import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { HeroBooking } from "@/components/booking/HeroBooking";
import { SITE } from "@/config/site";
import { SiteStructuredData } from "@/components/StructuredData";
import { VehicleShowcase } from "@/components/vehicle/VehicleShowcase";

const STEPS = [
  { t: "Votre trajet", d: "Départ, arrivée, horaire. Le prix exact s’affiche tout de suite." },
  { t: "Paiement en ligne", d: "En une fois, sécurisé. Remboursé intégralement si la course ne peut être assurée." },
  { t: "Confirmation", d: "Le chauffeur valide et vous transmet son numéro pour le jour J." },
];

export default function Home() {
  return (
    <>
      <SiteStructuredData />
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

        <VehicleShowcase />

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
