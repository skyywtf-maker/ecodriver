import Link from "next/link";
import { Logo } from "@/components/Logo";
import { logout } from "./actions";

/**
 * Barre commune aux pages authentifiées.
 *
 * Reprend les tokens du site public : verre dépoli, Poppins pour la marque,
 * Montserrat pour les liens, accent bleu sur l'onglet actif.
 */
export function DriverNav({ current }: { current: "bord" | "parametres" }) {
  const link = (active: boolean) =>
    `flex h-9 items-center rounded-full px-4 text-sm font-medium transition-colors ${
      active ? "bg-white/[0.10] text-white" : "text-label hover:text-white"
    }`;

  return (
    <header className="glass mb-8 flex flex-wrap items-center justify-between gap-4 rounded-4xl px-5 py-3.5 md:px-6">
      <div className="flex items-center gap-5">
        <Logo className="text-xl" />
        <nav className="flex items-center gap-1">
          <Link href="/chauffeur/tableau-de-bord" className={link(current === "bord")}>
            Tableau de bord
          </Link>
          <Link href="/chauffeur/parametres" className={link(current === "parametres")}>
            Paramètres
          </Link>
        </nav>
      </div>
      <form action={logout}>
        <button className="h-9 rounded-full px-4 text-sm font-medium text-label transition-colors hover:text-white">
          Déconnexion
        </button>
      </form>
    </header>
  );
}
