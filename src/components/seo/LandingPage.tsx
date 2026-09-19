import Link from "next/link";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { LandingStructuredData } from "@/components/StructuredData";
import { allLandings, type Landing } from "@/config/landing";
import { SITE } from "@/config/site";

/**
 * Gabarit des pages de référencement local.
 *
 * Aucune nouveauté de design : mêmes classes que l'accueil (verre dépoli,
 * tuiles, Poppins pour les titres, un seul mot d'accent en Playfair).
 * Pas de carte ici — c'est le rôle de l'accueil, et ces pages doivent rester
 * légères pour se charger vite depuis un résultat de recherche.
 */
export function LandingPage({ page }: { page: Landing }) {
  const others = allLandings().filter((l) => l.path !== page.path);

  return (
    <>
      <LandingStructuredData page={page} />
      <Nav />

      <main className="mx-auto max-w-[900px] px-4 pt-28 md:px-8 md:pt-36">
        <nav aria-label="Fil d'Ariane" className="text-[13px] font-medium text-label">
          <Link href="/" className="hover:text-white">
            Accueil
          </Link>
          <span className="px-2 text-white/25">/</span>
          <span className="text-label-strong">{page.shortLabel}</span>
        </nav>

        <p className="mt-8 text-[13px] font-medium uppercase tracking-[0.12em] text-label">{page.eyebrow}</p>

        <h1 className="mt-4 font-display text-4xl font-bold tracking-[-0.04em] md:text-[56px] md:leading-[1.05]">
          {page.h1.lead} <span className="serif-accent">{page.h1.accent}</span>
        </h1>

        <p className="mt-6 max-w-[620px] text-[17px] leading-relaxed text-label-strong md:text-lg">{page.intro}</p>

        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
          <Link href="/" className="btn-primary">
            Voir le prix et réserver
          </Link>
          <a href={SITE.phoneHref} className="btn-ghost">
            Appeler le chauffeur
          </a>
        </div>

        <ul className="mt-14 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          {page.highlights.map((h) => (
            <li key={h.k} className="tile flex flex-col gap-1.5 rounded-[22px] px-5 py-[18px]">
              <span className="text-[11px] font-medium text-label">{h.k}</span>
              <span className="font-display text-[17px] font-semibold tracking-[-0.02em]">{h.v}</span>
            </li>
          ))}
        </ul>

        {page.sections.map((s) => (
          <section key={s.h2} className="pt-16 md:pt-20">
            <h2 className="font-display text-2xl font-bold tracking-[-0.025em] md:text-3xl">{s.h2}</h2>
            <div className="mt-5 flex max-w-[680px] flex-col gap-4 text-[15px] leading-relaxed text-white/75">
              {s.body.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
          </section>
        ))}

        <section className="pt-16 md:pt-20">
          <h2 className="font-display text-2xl font-bold tracking-[-0.025em] md:text-3xl">Questions fréquentes</h2>
          <dl className="mt-6 flex flex-col gap-3">
            {page.faq.map((f) => (
              <div key={f.q} className="tile flex flex-col gap-2.5 rounded-3xl p-6 md:p-7">
                <dt className="font-display text-[17px] font-semibold tracking-[-0.015em]">{f.q}</dt>
                <dd className="text-[15px] leading-relaxed text-white/75">{f.a}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="pt-16 md:pt-20">
          <h2 className="font-display text-2xl font-bold tracking-[-0.025em] md:text-3xl">
            Ailleurs dans le <span className="serif-accent">Grand Est.</span>
          </h2>
          <ul className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3">
            {others.map((l) => (
              <li key={l.path}>
                <Link
                  href={l.path}
                  className="tile flex h-full items-center rounded-[20px] px-5 py-4 font-display text-[15px] font-semibold tracking-[-0.015em] transition-colors hover:bg-white/[0.08]"
                >
                  {l.shortLabel}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <div className="glass mt-16 flex flex-col gap-5 rounded-4xl p-8 md:mt-20 md:flex-row md:items-center md:justify-between md:p-10">
          <div className="flex flex-col gap-2">
            <h2 className="font-display text-2xl font-bold tracking-[-0.025em]">
              Votre trajet, <span className="serif-accent">maintenant.</span>
            </h2>
            <p className="text-[15px] text-label">Le prix s’affiche dès que le départ et l’arrivée sont renseignés.</p>
          </div>
          <Link href="/" className="btn-primary shrink-0">
            Réserver
          </Link>
        </div>
      </main>

      <Footer />
    </>
  );
}
