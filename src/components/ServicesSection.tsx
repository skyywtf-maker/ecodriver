import Link from "next/link";
import Image from "next/image";
import { SERVICES } from "@/config/services";
import { Reveal } from "./Reveal";

/**
 * Prestations mises en avant sur l'accueil.
 *
 * Seules celles qui ont un visuel passent en grandes cartes ; les autres
 * suivent en liste, pour ne pas laisser de vignette vide.
 */
export function ServicesSection() {
  const featured = SERVICES.filter((s) => s.image);
  const rest = SERVICES.filter((s) => !s.image);

  return (
    <section id="services" className="scroll-mt-28 pt-24 md:pt-[120px]">
      <div className="flex flex-col gap-3">
        <h2 className="font-display text-4xl font-bold tracking-[-0.035em] md:text-5xl">
          Bien plus qu&apos;un <span className="serif-accent">simple trajet.</span>
        </h2>
        <p className="max-w-[560px] text-[15px] leading-relaxed text-label">
          Transferts, institutions, circuits, événements : chaque prestation se cale avec vous, et le prix est fixé
          avant de partir.
        </p>
      </div>

      <ul className="mt-10 grid gap-4 md:mt-12 md:grid-cols-3">
        {featured.map((s, i) => (
          <Reveal as="li" key={s.slug} delay={i * 80}>
            <Link
              href={`/services/${s.slug}`}
              className="tile group flex h-full flex-col overflow-hidden rounded-4xl transition-colors hover:bg-white/[0.07]"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-graphite">
                <Image
                  src={s.image!}
                  alt=""
                  fill
                  sizes="(min-width: 768px) 33vw, 100vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                />
              </div>
              <div className="flex flex-1 flex-col gap-2 p-6">
                <h3 className="font-display text-[19px] font-bold tracking-[-0.02em]">{s.label}</h3>
                <p className="text-[13px] leading-relaxed text-label">{s.eyebrow}</p>
              </div>
            </Link>
          </Reveal>
        ))}
      </ul>

      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {rest.map((s) => (
          <li key={s.slug}>
            <Link
              href={`/services/${s.slug}`}
              className="tile flex h-full flex-col gap-1 rounded-3xl px-6 py-5 transition-colors hover:bg-white/[0.07]"
            >
              <span className="font-display text-[16px] font-semibold tracking-[-0.015em]">{s.label}</span>
              <span className="text-[13px] text-label">{s.eyebrow}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
