import type { Metadata } from "next";
import { DashboardView } from "../chauffeur/DashboardView";
import { TabBar } from "../chauffeur/TabBar";
import type { PanelTab } from "../chauffeur/RidesPanel";
import { DEMO_RIDES } from "./data";
import { DemoBanner } from "./DemoBanner";

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

const PENDING = DEMO_RIDES.filter((r) => r.status === "PENDING_DRIVER");
const UPCOMING = DEMO_RIDES.filter((r) => r.status === "CONFIRMED");
const HISTORY = DEMO_RIDES.filter((r) => !["PENDING_DRIVER", "CONFIRMED"].includes(r.status));

export default async function ApercuChauffeur({ searchParams }: { searchParams: Promise<{ onglet?: string }> }) {
  const asked = (await searchParams).onglet;
  const initial: PanelTab = asked === "avenir" || asked === "historique" ? asked : "attente";

  return (
    <DashboardView
      demo
      nav={
        <>
          <DemoBanner />
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
