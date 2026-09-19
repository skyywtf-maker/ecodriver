import Link from "next/link";
import { SITE } from "@/config/site";
import { Logo } from "./Logo";

export function Nav({ children }: { children?: React.ReactNode }) {
  return (
    <nav className="glass fixed inset-x-4 top-4 z-30 flex h-14 items-center justify-between rounded-full pl-5 pr-1.5 md:inset-x-16 md:top-6 md:h-16 md:pl-7 md:pr-3">
      <Logo />
      {children ?? (
        <div className="hidden gap-9 text-sm font-medium text-label-strong lg:flex">
          <Link href="/#villes" className="hover:text-white">Destinations</Link>
          <Link href="/#deroule" className="hover:text-white">Comment ça marche</Link>
          <Link href="/#vehicule" className="hover:text-white">Véhicule</Link>
          <Link href="/#avis" className="hover:text-white">Avis</Link>
        </div>
      )}
      <div className="flex items-center gap-5">
        <a href={SITE.phoneHref} className="hidden text-sm font-medium text-label-strong hover:text-white md:block">
          {SITE.phoneDisplay}
        </a>
        <a
          href={SITE.phoneHref}
          aria-label="Appeler le chauffeur"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-ink md:hidden"
        >
          <PhoneIcon />
        </a>
        <Link href="/reserver" className="hidden h-11 items-center rounded-full bg-white px-5 font-display text-sm font-semibold text-ink md:flex">
          Réserver
        </Link>
      </div>
    </nav>
  );
}

function PhoneIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z" />
    </svg>
  );
}
