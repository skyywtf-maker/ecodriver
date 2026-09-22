"use client";

import Link from "next/link";
import { useTransition } from "react";
import { logout, setAvailable } from "./actions";

type Tab = "accueil" | "courses" | "parametres";

/**
 * Barre d'onglets fixée en bas de l'écran, comme une application.
 *
 * Tout l'espace chauffeur est à un pouce : accueil, courses, réglages. Au
 * centre, en accent, la disponibilité du jour — le geste le plus fréquent.
 */
export function TabBar({ current, available }: { current: Tab; available: boolean }) {
  const [pending, start] = useTransition();

  return (
    <nav
      aria-label="Espace chauffeur"
      className="fixed inset-x-2 bottom-2 z-40 mx-auto max-w-[520px] rounded-3xl border border-white/[0.10] bg-[#121317] px-2 py-1.5 shadow-[0_18px_50px_rgba(0,0,0,0.55)]"
      style={{ paddingBottom: "max(6px, env(safe-area-inset-bottom))" }}
    >
      <ul className="grid grid-cols-5 items-center">
        <Item href="/chauffeur/tableau-de-bord" label="Accueil" on={current === "accueil"} icon={<IconHome />} />
        <Item href="/chauffeur/tableau-de-bord?onglet=historique#courses" label="Courses" on={current === "courses"} icon={<IconList />} />
        <li className="flex justify-center">
          <button
            type="button"
            role="switch"
            aria-checked={available}
            disabled={pending}
            onClick={() => start(() => setAvailable(!available))}
            className={`flex h-12 w-12 flex-col items-center justify-center rounded-2xl text-[9px] font-bold uppercase tracking-[0.06em] transition-colors disabled:opacity-60 ${
              available ? "bg-[#30D158] text-ink" : "bg-accent text-white"
            }`}
          >
            <span className={`mb-0.5 h-2 w-2 rounded-full ${available ? "bg-ink" : "bg-white/70"}`} aria-hidden />
            {available ? "Dispo" : "Absent"}
          </button>
        </li>
        <Item href="/chauffeur/parametres" label="Réglages" on={current === "parametres"} icon={<IconGear />} />
        <li>
          <form action={logout}>
            <button className="flex w-full flex-col items-center gap-1 py-1.5 text-[10px] font-medium text-label transition-colors hover:text-white">
              <IconOut />
              Quitter
            </button>
          </form>
        </li>
      </ul>
    </nav>
  );
}

function Item({ href, label, on, icon }: { href: string; label: string; on: boolean; icon: React.ReactNode }) {
  return (
    <li>
      <Link
        href={href}
        aria-current={on ? "page" : undefined}
        className={`flex flex-col items-center gap-1 py-1.5 text-[10px] font-medium transition-colors ${
          on ? "text-white" : "text-label hover:text-white"
        }`}
      >
        {icon}
        {label}
      </Link>
    </li>
  );
}

const svg = { width: 20, height: 20, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
const IconHome = () => (
  <svg {...svg}>
    <path d="M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1z" />
  </svg>
);
const IconList = () => (
  <svg {...svg}>
    <path d="M9 6h11M9 12h11M9 18h11M4.5 6h.01M4.5 12h.01M4.5 18h.01" />
  </svg>
);
const IconGear = () => (
  <svg {...svg}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
  </svg>
);
const IconOut = () => (
  <svg {...svg}>
    <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 17l5-5-5-5M15 12H4" />
  </svg>
);
