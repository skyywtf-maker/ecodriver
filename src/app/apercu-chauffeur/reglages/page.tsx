import type { Metadata } from "next";
import { PRICING, BOOKING_RULES, VEHICLES } from "@/config/pricing";
import { TabBar } from "../../chauffeur/TabBar";
import { DemoButton } from "../DemoButton";
import { DemoBanner } from "../DemoBanner";

export const metadata: Metadata = { title: "Aperçu · réglages", robots: { index: false, follow: false } };

/** Réglages de l'aperçu : champs d'exemple, enregistrement désactivé. Les tarifs sont les vrais, publics. */
export default function ApercuReglages() {
  return (
    <div className="mx-auto max-w-[760px] px-3 pb-28 pt-3 md:px-8 md:pt-10">
      <DemoBanner />
      <TabBar demo current="parametres" available />

      <h1 className="px-1 font-display text-[26px] font-bold tracking-[-0.03em] md:text-4xl">
        Vos <span className="serif-accent">paramètres.</span>
      </h1>

      <Section title="Notifications" text="Où vous recevez les nouvelles demandes de course. Distinct de votre identifiant de connexion.">
        <Fake label="Email de notification" value="chauffeur@exemple.test" />
        <Fake label="Téléphone (SMS)" value="06 00 00 00 00" />
        <DemoButton label="Enregistrer" className="btn-primary mt-1 w-full" />
      </Section>

      <Section title="Mot de passe" text="Dix caractères minimum. L'actuel est demandé pour confirmer que c'est bien vous.">
        <Fake label="Mot de passe actuel" value="••••••••••" />
        <Fake label="Nouveau mot de passe" value="" />
        <Fake label="Confirmer" value="" />
        <DemoButton label="Changer le mot de passe" className="btn-primary mt-1 w-full" />
      </Section>

      <section className="tile mt-3 flex flex-col gap-4 rounded-4xl p-5 md:p-7">
        <div className="flex flex-col gap-1">
          <h2 className="font-display text-xl font-bold tracking-[-0.02em]">Tarifs appliqués</h2>
          <p className="text-[14px] text-label">En lecture seule, issus du fichier de configuration du site.</p>
        </div>
        <dl className="flex flex-col divide-y divide-white/[0.08]">
          {VEHICLES.map((v) => (
            <Row key={v.id} k={v.name} v={v.priceHint} />
          ))}
          <Row k="Majoration nuit et week-end" v={`× ${PRICING.surchargeMultiplier} (de ${PRICING.nightStartHour} h à ${PRICING.nightEndHour} h)`} />
          <Row k="Délai minimum de réservation" v={`${BOOKING_RULES.minLeadMinutes} minutes`} />
        </dl>
      </section>
    </div>
  );
}

function Section({ title, text, children }: { title: string; text: string; children: React.ReactNode }) {
  return (
    <section className="glass mt-3 flex flex-col gap-3 rounded-4xl p-5 md:p-7">
      <div className="flex flex-col gap-1">
        <h2 className="font-display text-xl font-bold tracking-[-0.02em]">{title}</h2>
        <p className="text-[14px] text-label">{text}</p>
      </div>
      {children}
    </section>
  );
}

function Fake({ label, value }: { label: string; value: string }) {
  return (
    <label className="field flex h-[54px] flex-col justify-center gap-0.5 px-4 md:h-16 md:px-5">
      <span className="field-label">{label}</span>
      <input readOnly defaultValue={value} className="field-input" />
    </label>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-3">
      <dt className="text-[14px] text-label">{k}</dt>
      <dd className="text-right font-display text-[15px] font-semibold">{v}</dd>
    </div>
  );
}
