"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { accept, arrived, complete, onTheWay, refuse } from "./actions";

export type RideRow = {
  id: string;
  name: string;
  from: string;
  to: string;
  when: string;
  price: string;
  status: "PENDING_DRIVER" | "CONFIRMED" | "COMPLETED" | "REFUSED" | "CANCELLED" | "PENDING_PAYMENT";
  tone: string;
  enRoute: boolean;
  arrived: boolean;
};

export type PanelTab = "attente" | "avenir" | "historique";

/**
 * Les courses, en une carte à onglets dont la liste défile à l'intérieur :
 * la page ne s'allonge pas avec l'historique. Les décisions se prennent dans
 * la ligne même — accepter, refuser, étape suivante — sans ouvrir la fiche.
 */
export function RidesPanel({
  pending,
  upcoming,
  history,
  initial,
  demo = false,
}: {
  pending: RideRow[];
  upcoming: RideRow[];
  history: RideRow[];
  initial: PanelTab;
  /** Aperçu public : aucune action n'est envoyée, les fiches ne s'ouvrent pas. */
  demo?: boolean;
}) {
  const [tab, setTab] = useState<PanelTab>(initial);
  const lists: Record<PanelTab, RideRow[]> = { attente: pending, avenir: upcoming, historique: history };
  const rows = lists[tab];
  const empty = {
    attente: "Aucune demande à traiter. Tout est à jour.",
    avenir: "Aucune course confirmée à venir.",
    historique: "Pas encore d'historique.",
  }[tab];

  return (
    <section id="courses" className="min-w-0 scroll-mt-4 rounded-4xl border border-white/[0.08] bg-[#121317] p-2">
      <div role="tablist" aria-label="Courses" className="grid grid-cols-3 gap-1 rounded-3xl bg-white/[0.04] p-1">
        {(
          [
            ["attente", "À traiter", pending.length],
            ["avenir", "À venir", upcoming.length],
            ["historique", "Historique", history.length],
          ] as const
        ).map(([id, label, count]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={`flex h-9 items-center justify-center gap-1.5 rounded-2xl text-[12px] font-semibold transition-colors ${
              tab === id ? "bg-white text-ink" : "text-label hover:text-white"
            }`}
          >
            {label}
            <span
              className={`min-w-5 rounded-full px-1.5 text-[10px] leading-5 ${
                tab === id ? "bg-ink/10" : id === "attente" && count > 0 ? "bg-[#FF9F0A] text-ink" : "bg-white/10"
              }`}
            >
              {count}
            </span>
          </button>
        ))}
      </div>

      {rows.length === 0 ? (
        <p className="px-3 py-10 text-center text-[13px] text-label">{empty}</p>
      ) : (
        // Défilement interne : la carte garde sa hauteur, l'historique défile dedans.
        <ul className="mt-1 max-h-[46svh] overflow-y-auto overscroll-contain md:max-h-[520px]">
          {rows.map((r) => (
            <Row key={r.id} r={r} demo={demo} />
          ))}
        </ul>
      )}
    </section>
  );
}

function Row({ r, demo }: { r: RideRow; demo: boolean }) {
  // En aperçu, chaque action se contente d'expliquer qu'elle est désactivée.
  const guard = (fn: () => Promise<void>) => (demo ? async () => window.alert("Aperçu : cette action est désactivée.") : fn);
  return (
    <li className="border-b border-white/[0.06] px-3 py-3 last:border-0">
      <Link href={demo ? "#courses" : `/chauffeur/course/${r.id}`} className="block">
        <div className="flex items-center justify-between gap-3">
          <p className="flex items-center gap-2 text-[12px] font-semibold text-label-strong">
            <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${dot(r)}`} aria-hidden />
            {r.when}
          </p>
          <span className="font-display text-[15px] font-bold">{r.price}</span>
        </div>
        <div className="mt-1 flex items-center justify-between gap-3">
          <p className="min-w-0 truncate font-display text-[14px] font-semibold tracking-[-0.01em]">{r.name}</p>
          <span className={`shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${r.tone}`}>{shortStatus(r)}</span>
        </div>
        {/* Le trajet a toute la largeur : c'est ce que le chauffeur lit en premier. */}
        <p className="mt-0.5 truncate text-[12px] text-label">
          {r.from} → {r.to}
        </p>
      </Link>

      {r.status === "PENDING_DRIVER" && (
        <div className="mt-2.5 grid grid-cols-2 gap-2">
          <Act
            label="Refuser"
            tone="danger"
            confirm={demo ? undefined : "Refuser cette course ? Le client sera remboursé intégralement."}
            run={guard(() => refuse(r.id))}
          />
          <Act label="Accepter" tone="primary" run={guard(() => accept(r.id))} />
        </div>
      )}
      {r.status === "CONFIRMED" && (
        <div className="mt-2.5">
          {!r.enRoute ? (
            <Act label="Je suis en route" tone="ghost" run={guard(() => onTheWay(r.id))} />
          ) : !r.arrived ? (
            <Act label="Je suis arrivé" tone="ghost" run={guard(() => arrived(r.id))} />
          ) : (
            <Act label="Course terminée" tone="ghost" confirm={demo ? undefined : "Confirmer que la course a été effectuée ?"} run={guard(() => complete(r.id))} />
          )}
        </div>
      )}
    </li>
  );
}

/** Libellés courts pour la liste ; la fiche garde les libellés complets. */
function shortStatus(r: RideRow) {
  if (r.status === "CONFIRMED" && r.enRoute) return r.arrived ? "Sur place" : "En route";
  return (
    {
      PENDING_DRIVER: "À confirmer",
      CONFIRMED: "Confirmée",
      COMPLETED: "Terminée",
      REFUSED: "Refusée",
      CANCELLED: "Annulée",
      PENDING_PAYMENT: "Paiement",
    } as const
  )[r.status];
}

function dot(r: RideRow) {
  if (r.status === "PENDING_DRIVER") return "bg-[#FF9F0A]";
  if (r.status === "CONFIRMED") return "bg-[#30D158]";
  if (r.status === "REFUSED" || r.status === "CANCELLED") return "bg-[#FF453A]";
  return "bg-white/30";
}

function Act({
  label,
  tone,
  run,
  confirm,
}: {
  label: string;
  tone: "primary" | "danger" | "ghost";
  run: () => Promise<void>;
  confirm?: string;
}) {
  const [pending, start] = useTransition();
  const cls = {
    primary: "bg-white text-ink hover:opacity-90",
    danger: "bg-[#FF453A]/15 text-[#FF6961] hover:bg-[#FF453A]/25",
    ghost: "w-full bg-white/[0.08] text-white hover:bg-white/[0.12]",
  }[tone];
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (confirm && !window.confirm(confirm)) return;
        start(() => run());
      }}
      className={`flex h-9 items-center justify-center rounded-xl text-[13px] font-semibold transition-colors disabled:opacity-50 ${cls}`}
    >
      {pending ? "…" : label}
    </button>
  );
}
