import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { HeroBooking } from "@/components/booking/HeroBooking";
import { SITE } from "@/config/site";
import { SiteStructuredData } from "@/components/StructuredData";
import { VehicleShowcase } from "@/components/vehicle/VehicleShowcase";
import { DriverProfile } from "@/components/DriverProfile";
import { Reveal } from "@/components/Reveal";
import { StepsTimeline } from "@/components/StepsTimeline";
import { CitiesMap } from "@/components/CitiesMap";

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
        <Reveal>
          <VehicleShowcase />
        </Reveal>

        <section id="villes" className="scroll-mt-28 pt-24 md:pt-[120px]">
          <h2 className="font-display text-4xl font-bold tracking-[-0.035em] md:text-5xl">
            Huit villes, <span className="serif-accent">un seul chauffeur.</span>
          </h2>
          <div className="mt-10 md:mt-12">
            <CitiesMap />
          </div>
        </section>

        <section id="deroule" className="scroll-mt-28 pt-24 md:pt-[120px]">
          <StepsTimeline steps={STEPS} />
        </section>

        <section id="avis" className="scroll-mt-28 pt-24 md:pt-[120px]">
          <ul className="grid gap-4 md:grid-cols-3">
            {SITE.reviews.map((r, i) => (
              <Reveal as="li" key={i} delay={i * 80}>
                <figure className="tile flex h-[240px] flex-col justify-between rounded-4xl p-8">
                  <blockquote className="font-serif text-[22px] italic leading-snug">« {r.text} »</blockquote>
                  <figcaption className="text-[13px] font-medium text-label">
                    <span className="font-semibold text-white">{r.author}</span> · {r.route}
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </ul>
        </section>
      </main>
      <Footer />
    </>
  );
}
