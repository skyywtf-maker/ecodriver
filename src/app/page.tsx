import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { HeroBooking } from "@/components/booking/HeroBooking";
import { SITE } from "@/config/site";
import { SiteStructuredData } from "@/components/StructuredData";
import { VehicleShowcase } from "@/components/vehicle/VehicleShowcase";
import { DriverProfile } from "@/components/DriverProfile";
import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { CitiesMapStatic } from "@/components/CitiesMapStatic";
import { ReviewSummary } from "@/components/ReviewSummary";
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

        <Reveal>
          <DriverProfile />
        </Reveal>

        <section id="avis" className="scroll-mt-28 pt-24 md:pt-[120px]">
          <div className="mb-8">
            <ReviewSummary />
          </div>

          <ul className="mt-8 grid gap-4 md:grid-cols-3">
            {SITE.reviewHighlights.map((h, i) => (
              <Reveal as="li" key={h.title} delay={i * 80} className="tile flex flex-col gap-2.5 rounded-4xl p-7">
                <h3 className="font-display text-xl font-bold tracking-[-0.02em]">{h.title}</h3>
                <p className="text-[15px] leading-relaxed text-label">{h.text}</p>
              </Reveal>
            ))}
          </ul>

          {SITE.reviews.length > 0 && (
            <ul className="mt-4 grid gap-4 md:grid-cols-3">
              {SITE.reviews.map((r, i) => (
                <Reveal as="li" key={i} delay={i * 80}>
                  <figure className="tile flex h-full flex-col justify-between gap-6 rounded-4xl p-7">
                    <blockquote className="font-serif text-[22px] italic leading-snug">« {r.text} »</blockquote>
                    <figcaption className="text-[13px] font-medium text-label">
                      <span className="font-semibold text-white">{r.author}</span> · {r.route}
                    </figcaption>
                  </figure>
                </Reveal>
              ))}
            </ul>
          )}
        </section>

        <Reveal>
          <DriverProfile />
        </Reveal>

        <section id="avis" className="scroll-mt-28 pt-24 md:pt-[120px]">
          <div className="mb-8">
            <ReviewSummary />
          </div>

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

        {/* Dernier appel à l'action : après les avis, le visiteur convaincu
            ne doit pas avoir à remonter toute la page pour réserver. */}
        <Reveal>
          <section className="pt-24 md:pt-[120px]">
            <div className="glass flex flex-col gap-7 overflow-hidden rounded-5xl p-8 md:p-12">
              <div className="flex flex-col gap-3">
                <h2 className="font-display text-4xl font-bold tracking-[-0.035em] md:text-5xl">
                  Votre trajet, <span className="serif-accent">maintenant.</span>
                </h2>
                <p className="max-w-[520px] text-[15px] leading-relaxed text-label">
                  Deux adresses suffisent : le prix s&apos;affiche avant que vous ne payiez, et il ne bouge plus.
                </p>
              </div>

              <div className="relative h-[220px] overflow-hidden rounded-4xl border border-white/[0.08] md:h-[280px]">
                <CitiesMapStatic />
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Link href="/" className="btn-primary">
                  Voir le prix et réserver
                </Link>
                <a href={SITE.phoneHref} className="btn-ghost">
                  Appeler {SITE.driver.firstName}
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
