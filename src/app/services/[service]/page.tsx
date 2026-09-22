import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Reveal } from "@/components/Reveal";
import { QuoteForm } from "@/components/seo/QuoteForm";
import { JsonLd } from "@/components/StructuredData";
import { SERVICES, TOURIST_SPOTS, serviceBySlug } from "@/config/services";
import { SERVICE_ZONES } from "@/config/pricing";
import { SITE } from "@/config/site";

export function generateStaticParams() {
  return SERVICES.map((s) => ({ service: s.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ service: string }> }): Promise<Metadata> {
  const s = serviceBySlug((await params).service);
  if (!s) return {};
  return {
    title: { absolute: s.title },
    description: s.description,
    alternates: { canonical: `/services/${s.slug}` },
    openGraph: { type: "website", locale: "fr_FR", url: `/services/${s.slug}`, title: s.title, description: s.description },
  };
}

export default async function ServicePage({ params }: { params: Promise<{ service: string }> }) {
  const s = serviceBySlug((await params).service);
  if (!s) notFound();

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Service",
          name: s.label,
          description: s.description,
          serviceType: "Transport de personnes avec chauffeur",
          areaServed: SERVICE_ZONES.map((z) => ({ "@type": "Place", name: z.name })),
          provider: { "@type": "LocalBusiness", name: SITE.name, url: SITE.url },
        }}
      />
      <Nav />

      <main className="mx-auto max-w-[900px] px-4 pt-28 md:px-8 md:pt-36">
        <nav aria-label="Fil d'Ariane" className="text-[13px] font-medium text-label">
          <Link href="/" className="hover:text-white">Accueil</Link>
          <span className="px-2 text-white/25">/</span>
          <span className="text-label-strong">{s.label}</span>
        </nav>

        <p className="mt-8 text-[13px] font-medium uppercase tracking-[0.12em] text-label">{s.eyebrow}</p>
        <h1 className="mt-4 font-display text-4xl font-bold tracking-[-0.04em] md:text-[56px] md:leading-[1.05]">
          {s.h1.lead} <span className="serif-accent">{s.h1.accent}</span>
        </h1>
        <p className="mt-6 max-w-[620px] text-[17px] leading-relaxed text-label-strong md:text-lg">{s.intro}</p>

        {s.image && (
          <div className="relative mt-10 aspect-[16/9] overflow-hidden rounded-4xl border border-white/[0.08] bg-graphite">
            <Image src={s.image} alt="" fill priority sizes="(min-width: 900px) 900px, 100vw" className="object-cover" />
          </div>
        )}

        <ul className="mt-12 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          {s.points.map((p, i) => (
            <Reveal as="li" key={p.k} delay={i * 60} className="tile flex flex-col gap-1.5 rounded-3xl px-5 py-[18px]">
              <span className="text-[11px] font-medium text-label">{p.k}</span>
              <span className="font-display text-[15px] font-semibold tracking-[-0.02em]">{p.v}</span>
            </Reveal>
          ))}
        </ul>

        {s.sections.map((section) => (
          <Reveal key={section.h2}>
            <section className="pt-16 md:pt-20">
              <h2 className="font-display text-2xl font-bold tracking-[-0.025em] md:text-3xl">{section.h2}</h2>
              <div className="mt-5 flex max-w-[680px] flex-col gap-4 text-[15px] leading-relaxed text-white/75">
                {section.body.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </div>
            </section>
          </Reveal>
        ))}

        {s.slug === "route-des-vins" && (
          <Reveal>
            <section className="pt-16 md:pt-20">
              <h2 className="font-display text-2xl font-bold tracking-[-0.025em] md:text-3xl">
                Quelques <span className="serif-accent">incontournables.</span>
              </h2>
              <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                {TOURIST_SPOTS.map((spot) => (
                  <li key={spot.name} className="tile flex flex-col overflow-hidden rounded-3xl">
                    {/* Dégradé tant que le visuel n'est pas déposé : une image
                        cassée serait pire qu'une surface pleine. */}
                    <div
                      className="h-[140px] w-full bg-[linear-gradient(135deg,#16181D_0%,#0F1115_100%)] bg-cover bg-center"
                      style={{ backgroundImage: `url(${spot.image}), linear-gradient(135deg,#16181D,#0F1115)` }}
                      aria-hidden
                    />
                    <div className="flex flex-col gap-1.5 p-5">
                      <h3 className="font-display text-[16px] font-semibold tracking-[-0.015em]">{spot.name}</h3>
                      <p className="text-[13px] leading-relaxed text-label">{spot.text}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          </Reveal>
        )}

        <Reveal>
          <section className="pt-16 md:pt-20">
            <QuoteForm service={s.slug} pro={s.slug === "professionnels"} />
          </section>
        </Reveal>

        <Reveal>
          <section className="pt-16 md:pt-20">
            <h2 className="font-display text-2xl font-bold tracking-[-0.025em] md:text-3xl">Autres prestations</h2>
            <ul className="mt-6 grid gap-3 sm:grid-cols-3">
              {SERVICES.filter((o) => o.slug !== s.slug).map((o) => (
                <li key={o.slug}>
                  <Link
                    href={`/services/${o.slug}`}
                    className="tile flex h-full flex-col gap-1 rounded-3xl px-5 py-4 transition-colors hover:bg-white/[0.08]"
                  >
                    <span className="font-display text-[15px] font-semibold tracking-[-0.015em]">{o.label}</span>
                    <span className="text-[12px] text-label">{o.eyebrow}</span>
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/"
                  className="tile flex h-full flex-col gap-1 rounded-3xl px-5 py-4 transition-colors hover:bg-white/[0.08]"
                >
                  <span className="font-display text-[15px] font-semibold tracking-[-0.015em]">Trajet simple</span>
                  <span className="text-[12px] text-label">Prix immédiat, réservation en ligne</span>
                </Link>
              </li>
            </ul>
          </section>
        </Reveal>
      </main>

      <Footer />
    </>
  );
}
