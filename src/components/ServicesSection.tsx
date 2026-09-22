import Link from "next/link";
import Image from "next/image";
import { SERVICES } from "@/config/services";
import { Slider } from "./Slider";

/**
 * Prestations de l'accueil, en slider de cartes plein cadre.
 *
 * Le texte est posé sur le visuel, sous un dégradé : une carte tient dans
 * l'écran d'un téléphone et les cinq prestations se parcourent au doigt, au
 * lieu de s'empiler sur plusieurs écrans.
 *
 * Les prestations sans visuel reçoivent une surface sombre, pas une photo
 * d'emprunt qui laisserait croire à une prestation qu'on n'a pas montrée.
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

      <Slider label="Prestations" className="mt-8" itemClassName="w-[78%] sm:w-[44%] lg:w-[30.5%]">
        {SERVICES.map((s, i) => (
          <Link
            key={s.slug}
            href={`/services/${s.slug}`}
            className="group relative flex aspect-[4/5] w-full flex-col justify-end overflow-hidden rounded-3xl border border-white/[0.08] bg-graphite"
          >
            {s.image ? (
              <Image
                src={s.image}
                alt=""
                fill
                sizes="(min-width: 1024px) 30vw, (min-width: 640px) 44vw, 78vw"
                className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.05]"
              />
            ) : (
              <div
                aria-hidden
                className="absolute inset-0 flex items-center px-6 bg-[radial-gradient(120%_80%_at_85%_0%,rgba(10,132,255,0.22)_0%,rgba(10,132,255,0)_60%),linear-gradient(180deg,#17191E_0%,#0E0F12_100%)]"
              >
                {/* Le mot d'accent du titre de la page, en typographie : la
                    carte a du caractère sans image d'emprunt. */}
                <span className="-mt-16 font-serif text-[44px] italic leading-[0.95] tracking-[-0.02em] text-white/85">
                  {s.h1.accent}
                </span>
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
        ))}
      </Slider>
    </section>
  );
}
