import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { HeroBooking } from "@/components/booking/HeroBooking";
import { SITE } from "@/config/site";
import { SiteStructuredData } from "@/components/StructuredData";
import { VehicleShowcase } from "@/components/vehicle/VehicleShowcase";
import { TrustSection } from "@/components/TrustSection";
import { ServicesSection } from "@/components/ServicesSection";
import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { CitiesMapStatic } from "@/components/CitiesMapStatic";
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

        <section id="villes" className="scroll-mt-28 pt-16 md:pt-[104px]">
          <div className="flex flex-col gap-3">
            <p className="eyebrow">Destinations</p>
            <h2 className="font-display text-[32px] font-bold leading-[1.05] tracking-[-0.035em] md:text-5xl">
              Nos destinations, <span className="serif-accent">un seul chauffeur.</span>
            </h2>
          </div>
          <div className="mt-7 md:mt-10">
            <CitiesMap />
          </div>
        </section>

        <Reveal>
          <ServicesSection />
        </Reveal>

        <section id="deroule" className="scroll-mt-28 pt-16 md:pt-[104px]">
          <div className="mb-7 flex flex-col gap-3 md:mb-10">
            <p className="eyebrow">Réservation</p>
            <h2 className="font-display text-[32px] font-bold leading-[1.05] tracking-[-0.035em] md:text-5xl">
              Trois étapes, <span className="serif-accent">pas une de plus.</span>
            </h2>
          </div>
          <StepsTimeline steps={STEPS} />
        </section>

        <Reveal>
          <TrustSection />
        </Reveal>

        {/* Dernier appel à l'action : après les avis, le visiteur convaincu
            ne doit pas avoir à remonter toute la page pour réserver. */}
        <Reveal>
          <section className="pt-16 md:pt-[104px]">
            <div className="glass flex flex-col gap-6 overflow-hidden rounded-4xl p-6 md:gap-7 md:p-12">
              <div className="flex flex-col gap-3">
                <h2 className="font-display text-[32px] font-bold leading-[1.05] tracking-[-0.035em] md:text-5xl">
                  Votre trajet, <span className="serif-accent">maintenant.</span>
                </h2>
                <p className="max-w-[520px] text-[15px] leading-relaxed text-label">
                  Deux adresses suffisent : le prix s&apos;affiche avant que vous ne payiez, et il ne bouge plus.
                </p>
              </div>

              <div className="relative hidden h-[280px] overflow-hidden rounded-3xl border border-white/[0.08] md:block">
                <CitiesMapStatic />
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Link href="/" className="btn-primary">
                  Voir le prix et réserver
                </Link>
                <a href={SITE.phoneHref} className="btn-ghost">
                  Appeler
                </a>
              </div>
            </div>
          </section>
        </Reveal>

      </main>
      <Footer />
    </>
  );
}
