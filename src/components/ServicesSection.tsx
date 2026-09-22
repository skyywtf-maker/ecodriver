"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { SERVICES } from "@/config/services";

/**
 * Prestations de l'accueil, en mosaïque : les cinq d'un coup d'œil.
 *
 * Téléphone : une grande carte, puis quatre en 2 × 2. Ordinateur : la grande
 * à gauche sur deux rangées, les quatre autres à droite. La carte mise en
 * avant tourne toutes les 2,5 s (éclairée, liseré bleu, description) ; la
 * rotation s'arrête dès qu'on survole ou touche la grille, et ne tourne que
 * si la section est à l'écran. Jamais pour qui demande moins d'animations.
 */
export function ServicesSection() {
  const grid = useRef<HTMLUListElement>(null);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [onScreen, setOnScreen] = useState(false);

  useEffect(() => {
    const el = grid.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([e]) => setOnScreen(Boolean(e?.isIntersecting)), { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (paused || !onScreen) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => setActive((a) => (a + 1) % SERVICES.length), 2500);
    return () => window.clearInterval(id);
  }, [paused, onScreen]);

  return (
    <section id="services" className="scroll-mt-28 pt-16 md:pt-[104px]">
      <div className="flex flex-col gap-3">
        <p className="eyebrow">Prestations</p>
        <h2 className="font-display text-[32px] font-bold leading-[1.05] tracking-[-0.035em] md:text-5xl">
          Bien plus qu&apos;un <span className="serif-accent">simple trajet.</span>
        </h2>
      </div>

      <ul
        ref={grid}
        onPointerEnter={() => setPaused(true)}
        onPointerLeave={() => setPaused(false)}
        onTouchStart={() => setPaused(true)}
        className="mt-8 grid grid-cols-2 gap-2 md:mt-10 md:h-[460px] md:grid-cols-4 md:grid-rows-2 md:gap-3"
      >
        {SERVICES.map((s, i) => {
          const featured = i === 0;
          const on = i === active;
          return (
            <li
              key={s.slug}
              className={featured ? "col-span-2 h-[190px] md:row-span-2 md:h-auto" : "h-[140px] md:h-auto"}
            >
              <Link
                href={`/services/${s.slug}`}
                onFocus={() => {
                  setPaused(true);
                  setActive(i);
                }}
                onPointerEnter={() => setActive(i)}
                className={`group relative flex h-full w-full flex-col justify-end overflow-hidden rounded-3xl border bg-graphite transition-colors duration-500 ${
                  on ? "border-accent" : "border-white/[0.08]"
                }`}
              >
                {s.image && (
                  <Image
                    src={s.image}
                    alt=""
                    fill
                    sizes={featured ? "(min-width: 768px) 50vw, 100vw" : "(min-width: 768px) 25vw, 50vw"}
                    style={{ objectPosition: s.imagePosition }}
                    className={`object-cover transition-transform duration-[1200ms] ease-out ${on ? "scale-[1.06]" : "scale-100"}`}
                  />
                )}

                {/* Voile : fort sur les cartes au repos, léger sur la carte active. */}
                <div
                  aria-hidden
                  className={`absolute inset-0 transition-opacity duration-500 ${on ? "opacity-40" : "opacity-100"} bg-[linear-gradient(180deg,rgba(10,11,13,0.25)_0%,rgba(10,11,13,0.7)_100%)]`}
                />
                <div
                  aria-hidden
                  className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,11,13,0)_45%,rgba(10,11,13,0.9)_100%)]"
                />

                <div className="relative flex items-end justify-between gap-3 p-3.5 md:p-5">
                  <div className="flex min-w-0 flex-col gap-1">
                    <h3
                      className={`font-display font-bold leading-tight tracking-[-0.025em] ${
                        featured ? "text-[20px] md:text-[26px]" : "text-[15px] md:text-[18px]"
                      }`}
                    >
                      {s.label}
                    </h3>
                    {/* La description n'apparaît que sur la carte active (et sur la grande). */}
                    <p
                      className={`line-clamp-2 text-[12px] leading-snug text-white/70 transition-all duration-500 md:text-[13px] ${
                        on || featured ? "max-h-10 opacity-100" : "max-h-0 opacity-0"
                      }`}
                    >
                      {s.eyebrow}
                    </p>
                  </div>
                  <span
                    aria-hidden
                    className={`flex shrink-0 items-center justify-center rounded-xl bg-white text-ink transition-transform duration-300 group-hover:translate-x-0.5 ${
                      featured ? "h-10 w-10" : "h-8 w-8"
                    }`}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                      <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
