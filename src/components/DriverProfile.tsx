"use client";

import { useState } from "react";
import Image from "next/image";
import { SITE } from "@/config/site";

/**
 * Espace profil du chauffeur.
 *
 * Sur un site de VTC, c'est le bloc qui rassure le plus : on confie une heure
 * de trajet à quelqu'un, on veut savoir à qui. Le portrait est donc large,
 * pas une vignette.
 *
 * Tant que la photo n'est pas déposée dans public/, un monogramme prend le
 * relais : la section reste présentable au lieu d'afficher une image cassée.
 */
export function DriverProfile() {
  const { firstName, role, photo, experienceYears, bio } = SITE.driver;
  const [hasPhoto, setHasPhoto] = useState(Boolean(photo));
  const yearsKnown = !experienceYears.includes("[");

  return (
    <section id="chauffeur" className="scroll-mt-28 pt-24 md:pt-[120px]">
      <div className="grid gap-4 md:grid-cols-12">
        <div className="relative aspect-[2/3] max-h-[620px] overflow-hidden rounded-4xl border border-white/[0.08] bg-graphite md:col-span-5">
          {hasPhoto ? (
            <Image
              src={photo}
              alt={`${firstName}, ${role.toLowerCase()} à Strasbourg`}
              fill
              // Pleine largeur au téléphone, un peu moins de la moitié ensuite.
              sizes="(min-width: 768px) 40vw, 100vw"
              // Tant que le fichier n'est pas déposé, l'optimiseur renvoie 404
              // et le monogramme prend le relais sans casser la mise en page.
              onError={() => setHasPhoto(false)}
              // object-top : si le cadre devait rogner, ce serait par le bas,
              // jamais sur le visage.
              className="object-cover object-top"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-3">
              <span className="font-display text-[64px] font-bold leading-none text-white/25">
                {firstName.charAt(0)}
              </span>
              <span className="text-[12px] font-medium text-white/30">Photo à venir</span>
            </div>
          )}
        </div>

        <div className="glass flex flex-col justify-center gap-6 rounded-4xl p-7 md:col-span-7 md:p-10">
          <div className="flex flex-col gap-3">
            <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-label">{role}</p>
            <h2 className="font-display text-4xl font-bold tracking-[-0.035em] md:text-5xl">
              Au volant, <span className="serif-accent">{firstName}.</span>
            </h2>
          </div>

          <div className="flex max-w-[520px] flex-col gap-3 text-[15px] leading-relaxed text-white/75">
            {bio.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>

          <dl className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            <Fact k="Expérience" v={yearsKnown ? `${experienceYears} ans` : "À compléter"} />
            <Fact k="Véhicule" v={SITE.vehicle.model} />
            <Fact k="Secteur" v="Grand Est" />
          </dl>
        </div>
      </div>
    </section>
  );
}

function Fact({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-[14px] bg-white/[0.06] px-4 py-3.5">
      <dt className="text-[11px] font-medium text-label">{k}</dt>
      <dd className="text-[15px] font-semibold">{v}</dd>
    </div>
  );
}
