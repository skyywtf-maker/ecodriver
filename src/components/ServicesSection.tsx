import Link from "next/link";
import Image from "next/image";
import { SERVICES, type Service } from "@/config/services";
import { Slider } from "./Slider";

/**
 * Prestations de l'accueil, en cartes plein cadre.
 *
 * Sur ordinateur, les cinq tiennent d'un coup d'œil dans une grille : deux
 * grandes cartes, puis trois. Sur téléphone, un slider qui défile seul
 * toutes les quatre secondes et s'arrête dès qu'on le touche.
 *
 * Le texte est posé sur le visuel, sous un dégradé. Une prestation sans
 * visuel reçoit une surface sombre, pas une photo d'emprunt.
 */
export function ServicesSection() {
  return (
    <section id="services" className="scroll-mt-28 pt-16 md:pt-[104px]">
      <div className="flex flex-col gap-3">
        <p className="eyebrow">Prestations</p>
        <h2 className="font-display text-[32px] font-bold leading-[1.05] tracking-[-0.035em] md:text-5xl">
          Bien plus qu&apos;un <span className="serif-accent">simple trajet.</span>
        </h2>
      </div>

      <div className="mt-8 lg:hidden">
        <Slider label="Prestations" autoplay={4000} itemClassName="w-[78%] sm:w-[44%]">
          {SERVICES.map((s, i) => (
            <ServiceCard key={s.slug} s={s} i={i} className="aspect-[4/5]" sizes="(min-width: 640px) 44vw, 78vw" />
          ))}
        </Slider>
      </div>

      <ul className="mt-10 hidden grid-cols-6 gap-3 lg:grid">
        {SERVICES.map((s, i) => (
          <li key={s.slug} className={i < 2 ? "col-span-3" : "col-span-2"}>
            <ServiceCard
              s={s}
              i={i}
              className={i < 2 ? "h-[380px]" : "h-[320px]"}
              sizes={i < 2 ? "(min-width: 1440px) 660px, 46vw" : "(min-width: 1440px) 440px, 31vw"}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}

function ServiceCard({ s, i, className, sizes }: { s: Service; i: number; className: string; sizes: string }) {
  return (
    <Link
      href={`/services/${s.slug}`}
      className={`group relative flex w-full flex-col justify-end overflow-hidden rounded-3xl border border-white/[0.08] bg-graphite ${className}`}
    >
      {s.image ? (
        <Image
          src={s.image}
          alt=""
          fill
          sizes={sizes}
          style={{ objectPosition: s.imagePosition }}
          className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.05]"
        />
      ) : (
        <div
          aria-hidden
          className="absolute inset-0 flex items-center bg-[radial-gradient(120%_80%_at_85%_0%,rgba(10,132,255,0.22)_0%,rgba(10,132,255,0)_60%),linear-gradient(180deg,#17191E_0%,#0E0F12_100%)] px-6"
        >
          {/* Le mot d'accent du titre de la page, en typographie. */}
          <span className="-mt-16 font-serif text-[44px] italic leading-[0.95] tracking-[-0.02em] text-white/85">{s.h1.accent}</span>
        </div>
      )}

      {/* Voile de lecture : le texte reste lisible quelle que soit la photo. */}
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,11,13,0)_35%,rgba(10,11,13,0.55)_62%,rgba(10,11,13,0.94)_100%)]"
      />

      <span className="absolute left-5 top-5 font-display text-[12px] font-semibold tracking-[0.08em] text-white/70">
        {String(i + 1).padStart(2, "0")}
      </span>

      <div className="relative flex items-end justify-between gap-4 p-5 md:p-6">
        <div className="flex flex-col gap-1.5">
          <h3 className="font-display text-[22px] font-bold leading-tight tracking-[-0.025em]">{s.label}</h3>
          <p className="line-clamp-2 text-[13px] leading-snug text-white/65">{s.eyebrow}</p>
        </div>
        <span
          aria-hidden
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-ink transition-transform duration-300 group-hover:translate-x-0.5"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </div>
    </Link>
  );
}
