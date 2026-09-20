import Link from "next/link";
import { SITE } from "@/config/site";
import { Logo } from "./Logo";
import { MobileMenu } from "./MobileMenu";

export function Nav({ children }: { children?: React.ReactNode }) {
  return (
    <nav className="glass fixed inset-x-4 top-4 z-30 flex h-14 items-center justify-between rounded-full pl-1.5 pr-1.5 md:inset-x-16 md:top-6 md:h-16 md:pr-3 lg:pl-7">
      <div className="flex items-center gap-1">
        {/* Les trois traits n'apparaissent qu'en dessous de lg, là où les
            liens en ligne disparaissent. */}
        <MobileMenu />
        <Logo className="text-xl max-lg:pl-1" />
      </div>
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

        <Link href="/reserver" className="hidden h-11 items-center rounded-full bg-white px-5 font-display text-sm font-semibold text-ink md:flex">
          Réserver
        </Link>
      </div>
    </nav>
  );
}
