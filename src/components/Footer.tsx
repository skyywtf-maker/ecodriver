import Link from "next/link";
import { allLandings } from "@/config/landing";
import { SERVICES } from "@/config/services";
import { SITE } from "@/config/site";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="mx-auto mt-24 flex max-w-[1440px] flex-col gap-10 border-t border-white/[0.08] px-4 py-12 text-sm text-label md:mt-[120px] md:px-16">
      <nav aria-label="Prestations" className="flex flex-col gap-3">
        <h2 className="text-[11px] font-medium uppercase tracking-[0.12em] text-white/35">Prestations</h2>
        <ul className="flex flex-wrap gap-x-6 gap-y-2.5">
          {SERVICES.map((s) => (
            <li key={s.slug}>
              <Link href={`/services/${s.slug}`} className="hover:text-white">
                {s.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Maillage interne vers les pages locales : discret, hors navigation principale. */}
      <nav aria-label="Zones desservies" className="flex flex-col gap-3">
        <h2 className="text-[11px] font-medium uppercase tracking-[0.12em] text-white/35">Zones desservies</h2>
        <ul className="flex flex-wrap gap-x-6 gap-y-2.5">
          {allLandings().map((l) => (
            <li key={l.path}>
              <Link href={l.path} className="hover:text-white">
                {l.shortLabel}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <Logo className="text-xl text-white" />
        <div className="flex flex-wrap gap-x-8 gap-y-3">
          <a href={SITE.phoneHref} className="hover:text-white">{SITE.phoneDisplay}</a>
          <a href={`mailto:${SITE.email}`} className="hover:text-white">{SITE.email}</a>
          <Link href="/mentions-legales" className="hover:text-white">Mentions légales</Link>
          <Link href="/cgv" className="hover:text-white">CGV</Link>
          <Link href="/confidentialite" className="hover:text-white">Confidentialité</Link>
        </div>
      </div>
    </footer>
  );
}
