"use client";

import { useState } from "react";
import Image from "next/image";
import { SITE } from "@/config/site";

/**
 * Profil du chauffeur, en étoile autour du portrait.
 *
 * Le portrait est au centre, les informations tournent autour et se
 * sélectionnent : le détail de la pastille choisie s'affiche à côté. Cette
 * disposition n'a de sens qu'à partir de `lg` ; en dessous, les pastilles
 * redeviennent une liste sous la photo, ce qui reste lisible au doigt.
 *
 * Tant que la photo n'est pas déposée dans public/, un monogramme prend le
 * relais : la section reste présentable au lieu d'afficher une image cassée.
 */
export function DriverProfile() {
  const { firstName, role, photo, bio, stats } = SITE.driver;
  const [hasPhoto, setHasPhoto] = useState(Boolean(photo));
  const [selected, setSelected] = useState(0);

  const active = stats[selected];

  return (
    <section id="chauffeur" className="scroll-mt-28 pt-24 md:pt-[120px]">
      <div className="flex flex-col gap-3">
        <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-label">{role}</p>
        <h2 className="font-display text-4xl font-bold tracking-[-0.035em] md:text-5xl">
          Au volant, <span className="serif-accent">{firstName}.</span>
        </h2>
        <p className="max-w-[560px] text-[15px] leading-relaxed text-label">{bio[0]}</p>
      </div>

      <div className="mt-10 grid gap-4 md:mt-12 lg:grid-cols-12 lg:items-center">
        {/* L'étoile : portrait au centre, pastilles réparties sur un cercle. */}
        <div className="relative aspect-square w-full lg:col-span-7">
          <Orbit
            selected={selected}
            onSelect={setSelected}
            labels={stats.map((s) => s.k)}
            values={stats.map((s) => s.v)}
          />

          <div className="absolute left-1/2 top-1/2 h-[42%] w-[42%] -translate-x-1/2 -translate-y-1/2">
            <Portrait
              hasPhoto={hasPhoto}
              onError={() => setHasPhoto(false)}
              photo={photo}
              firstName={firstName}
              role={role}
              rounded
              sizes="(min-width: 1024px) 28vw, 45vw"
            />
          </div>
        </div>

        <div className="glass flex flex-col gap-5 rounded-4xl p-7 lg:col-span-5 lg:p-9">
          <div className="flex flex-col gap-2">
            <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-label">{active.k}</p>
            <p className="font-display text-[30px] font-bold leading-tight tracking-[-0.03em]">{active.v}</p>
            <p className="text-[15px] leading-relaxed text-white/75">{active.d}</p>
          </div>

          <p className="border-t border-white/[0.08] pt-5 text-[14px] leading-relaxed text-label">{bio[1]}</p>

        </div>
      </div>
    </section>
  );
}

/** Rayon du cercle des pastilles, en pourcentage de la demi-largeur. */
const RADIUS = 34;

function Orbit({
  selected,
  onSelect,
  labels,
  values,
}: {
  selected: number;
  onSelect: (i: number) => void;
  labels: string[];
  values: string[];
}) {
  const count = labels.length;
  // Première pastille en haut, puis réparties dans le sens horaire.
  const angle = (i: number) => (i / count) * 2 * Math.PI - Math.PI / 2;

  return (
    <>
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" aria-hidden>
        <circle cx="50" cy="50" r={RADIUS} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="0.25" />
        {labels.map((label, i) => {
          const a = angle(i);
          const on = i === selected;
          return (
            <line
              key={label}
              x1={50 + Math.cos(a) * 22}
              y1={50 + Math.sin(a) * 22}
              x2={50 + Math.cos(a) * RADIUS}
              y2={50 + Math.sin(a) * RADIUS}
              stroke={on ? "#0A84FF" : "rgba(255,255,255,0.14)"}
              strokeWidth={on ? "0.55" : "0.25"}
            />
          );
        })}
      </svg>

      {labels.map((label, i) => {
        const a = angle(i);
        const on = i === selected;
        return (
          <button
            key={label}
            type="button"
            onClick={() => onSelect(i)}
            onMouseEnter={() => onSelect(i)}
            onFocus={() => onSelect(i)}
            aria-pressed={on}
            style={{ left: `${50 + Math.cos(a) * RADIUS}%`, top: `${50 + Math.sin(a) * RADIUS}%` }}
            className={`absolute flex w-[104px] -translate-x-1/2 -translate-y-1/2 flex-col gap-0.5 rounded-xl border px-2.5 py-1.5 text-left transition-all duration-300 sm:w-[128px] sm:px-3 sm:py-2 lg:w-[158px] lg:rounded-2xl lg:px-4 lg:py-2.5 ${
              on ? "glass scale-[1.06] border-accent/50" : "glass-soft border-white/[0.10] hover:border-white/25"
            }`}
          >
            <span className="text-[8px] font-medium uppercase tracking-[0.08em] text-label sm:text-[9px] lg:text-[10px] lg:tracking-[0.1em]">{label}</span>
            <span className="truncate font-display text-[11px] font-semibold tracking-[-0.015em] sm:text-[13px] lg:text-[15px]">{values[i]}</span>
          </button>
        );
      })}
    </>
  );
}

function Portrait({
  hasPhoto,
  onError,
  photo,
  firstName,
  role,
  rounded,
  sizes,
}: {
  hasPhoto: boolean;
  onError: () => void;
  photo: string;
  firstName: string;
  role: string;
  rounded: boolean;
  sizes: string;
}) {
  const shape = rounded ? "rounded-full border border-white/10 bg-graphite" : "";

  if (!hasPhoto) {
    return (
      <div className={`flex h-full w-full flex-col items-center justify-center gap-3 bg-graphite ${shape}`}>
        <span className="font-display text-[56px] font-bold leading-none text-white/25">{firstName.charAt(0)}</span>
        <span className="text-[12px] font-medium text-white/30">Photo à venir</span>
      </div>
    );
  }

  return (
    <div className={`relative h-full w-full overflow-hidden ${shape}`}>
      <Image
        src={photo}
        alt={`${firstName}, ${role.toLowerCase()} à Strasbourg`}
        fill
        sizes={sizes}
        // Tant que le fichier n'est pas déposé, l'optimiseur renvoie 404 et
        // le monogramme prend le relais sans casser la mise en page.
        onError={onError}
        className="object-cover object-top"
      />
    </div>
  );
}
