import Link from "next/link";
import { SITE } from "@/config/site";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="mx-auto mt-24 flex max-w-[1440px] flex-col gap-6 border-t border-white/[0.08] px-4 py-12 text-sm text-label md:mt-[120px] md:flex-row md:items-start md:justify-between md:px-16">
      <Logo className="text-xl text-white" />
      <div className="flex flex-wrap gap-x-8 gap-y-3">
        <a href={SITE.phoneHref} className="hover:text-white">{SITE.phoneDisplay}</a>
        <a href={`mailto:${SITE.email}`} className="hover:text-white">{SITE.email}</a>
        <Link href="/mentions-legales" className="hover:text-white">Mentions légales</Link>
        <Link href="/cgv" className="hover:text-white">CGV</Link>
        <Link href="/confidentialite" className="hover:text-white">Confidentialité</Link>
      </div>
    </footer>
  );
}
