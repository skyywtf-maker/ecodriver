import { devBypass } from "@/lib/auth";
import { getDriver } from "@/lib/driver";
import { TabBar } from "./TabBar";

/**
 * Chrome commun aux pages de l'espace chauffeur : bandeau du mode
 * développement (local uniquement) et barre d'onglets fixée en bas.
 * Les pages réservent 7 rem en bas pour ne rien cacher derrière la barre.
 */
export async function DriverNav({ current }: { current: "accueil" | "courses" | "parametres" }) {
  const driver = await getDriver().catch(() => null);
  return (
    <>
      {devBypass && (
        <p className="mb-2 rounded-2xl border border-[#FF9F0A]/40 bg-[#FF9F0A]/10 px-3 py-1.5 text-[11px] font-semibold text-[#FFB340]">
          Mode développement local : accès sans mot de passe. Impossible en production.
        </p>
      )}
      <TabBar current={current} available={Boolean(driver?.availableToday)} />
    </>
  );
}
