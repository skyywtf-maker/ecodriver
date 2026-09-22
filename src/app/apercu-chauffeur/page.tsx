import type { Metadata } from "next";
import { DashboardView } from "../chauffeur/DashboardView";
import { TabBar } from "../chauffeur/TabBar";
import type { PanelTab, RideRow } from "../chauffeur/RidesPanel";
import { STATUS_TONE } from "@/lib/status";

/**
 * Aperçu public de l'espace chauffeur, pour le montrer au client sans mot de
 * passe. AUCUNE donnée réelle : tout ce qui s'affiche est écrit ci-dessous,
 * rien n'est lu en base, et chaque action est neutralisée (mode `demo`).
 * La page n'est pas indexée par les moteurs de recherche.
 */
export const metadata: Metadata = {
  title: "Aperçu de l'espace chauffeur",
  robots: { index: false, follow: false },
};

const ride = (
  id: string,
  when: string,
  name: string,
  from: string,
  to: string,
  price: string,
  status: RideRow["status"],
  extra: Partial<RideRow> = {}
): RideRow => ({ id, when, name, from, to, price, status, tone: STATUS_TONE[status], enRoute: false, arrived: false, ...extra });

const PENDING = [
  ride("d1", "mer. 23 sept., 07:55", "Camille (exemple)", "Gare de Strasbourg", "Aéroport de Strasbourg-Entzheim", "39,00 €", "PENDING_DRIVER"),
  ride("d2", "mer. 23 sept., 17:55", "Thomas (exemple)", "Parlement européen, Strasbourg", "Gare de Strasbourg", "17,00 €", "PENDING_DRIVER"),
];
const UPCOMING = [
  ride("d3", "mar. 22 sept., 13:55", "Léa (exemple)", "Cathédrale de Strasbourg", "Aéroport de Francfort", "499,00 €", "CONFIRMED", { enRoute: true }),
  ride("d4", "jeu. 24 sept., 13:55", "Hugo (exemple)", "Place des Halles, Strasbourg", "Gare de Colmar", "171,00 €", "CONFIRMED"),
];
const HISTORY = [
  ride("d5", "lun. 21 sept., 05:55", "Sarah (exemple)", "Gare de Strasbourg", "Rivétoile, Strasbourg", "15,00 €", "COMPLETED"),
  ride("d6", "sam. 19 sept., 07:55", "Nicolas (exemple)", "Aéroport de Strasbourg-Entzheim", "Cathédrale de Strasbourg", "33,00 €", "COMPLETED"),
  ride("d7", "ven. 18 sept., 07:55", "Paul (exemple)", "Cathédrale de Strasbourg", "Gare de Colmar", "166,00 €", "REFUSED"),
  ride("d8", "mar. 15 sept., 09:55", "Julie (exemple)", "Rivétoile, Strasbourg", "Parlement européen, Strasbourg", "19,00 €", "COMPLETED"),
  ride("d9", "lun. 14 sept., 03:55", "Emma (exemple)", "Place des Halles, Strasbourg", "Aéroport de Strasbourg-Entzheim", "32,00 €", "CANCELLED"),
  ride("d10", "jeu. 10 sept., 09:55", "Marc (exemple)", "Gare de Strasbourg", "Aéroport de Strasbourg-Entzheim", "35,00 €", "COMPLETED"),
];

export default async function ApercuChauffeur({ searchParams }: { searchParams: Promise<{ onglet?: string }> }) {
  const asked = (await searchParams).onglet;
  const initial: PanelTab = asked === "avenir" || asked === "historique" ? asked : "attente";

  return (
    <DashboardView
      demo
      nav={
        <>
          <p className="mb-2 rounded-2xl border border-accent/40 bg-accent/10 px-3 py-1.5 text-[11px] font-semibold text-[#5AB0FF]">
            Aperçu de l&apos;espace chauffeur : données fictives, actions désactivées.
          </p>
          <TabBar demo current={asked === "historique" ? "courses" : "accueil"} available />
        </>
      }
      firstName=""
      metrics={[
        { label: "Courses", value: "7", delta: 17, hint: "" },
        { label: "Revenu encaissé", value: "811 €", delta: 12, hint: "" },
        { label: "Panier moyen", value: "116 €", delta: -4, hint: "" },
        { label: "Refus et annul.", value: "22 %", delta: null, hint: "" },
      ]}
      days={[
        { label: "mer", date: "16 sept.", count: 0 },
        { label: "jeu", date: "17 sept.", count: 1 },
        { label: "ven", date: "18 sept.", count: 1 },
        { label: "sam", date: "19 sept.", count: 0 },
        { label: "dim", date: "20 sept.", count: 1 },
        { label: "lun", date: "21 sept.", count: 4 },
        { label: "mar", date: "22 sept.", count: 2 },
      ]}
      initial={initial}
      pending={PENDING}
      upcoming={UPCOMING}
      history={HISTORY}
    />
  );
}
