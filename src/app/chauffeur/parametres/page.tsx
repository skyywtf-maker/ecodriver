import { requireDriver } from "@/lib/auth";
import { getDriver } from "@/lib/driver";
import { PRICING, BOOKING_RULES, VEHICLES } from "@/config/pricing";
import { euros } from "@/lib/pricing";
import { DriverNav } from "../DriverNav";
import { changePassword, updateContact } from "../actions";
import { ActionForm, Field } from "../ui";

export const dynamic = "force-dynamic";

export default async function ParametresPage() {
  await requireDriver();
  const driver = await getDriver();

  return (
    <div className="mx-auto max-w-[760px] px-3 pb-28 pt-3 md:px-8 md:pt-10">
      <DriverNav current="parametres" />

      <h1 className="px-1 font-display text-[26px] font-bold tracking-[-0.03em] md:text-4xl">
        Vos <span className="serif-accent">paramètres.</span>
      </h1>

      {!driver && (
        <p role="alert" className="mt-6 rounded-2xl bg-[#FF453A]/12 px-4 py-3 text-sm font-medium text-[#FF6961]">
          Aucune fiche chauffeur en base. Créez-la avec{" "}
          <code>npm run seed-driver -- &quot;email&quot; &quot;motdepasse&quot; &quot;Prénom&quot;</code>.
        </p>
      )}

      <section className="glass mt-4 flex flex-col gap-4 rounded-4xl p-5 md:p-7">
        <div className="flex flex-col gap-1">
          <h2 className="font-display text-xl font-bold tracking-[-0.02em]">Notifications</h2>
          <p className="text-[14px] text-label">
            Où vous recevez les nouvelles demandes de course. Distinct de votre identifiant de connexion.
          </p>
        </div>
        <ActionForm action={updateContact} submitLabel="Enregistrer" pendingLabel="Enregistrement…">
          <Field label="Email de notification" name="contactEmail" type="email" defaultValue={driver?.contactEmail ?? ""} />
          <Field label="Téléphone (SMS)" name="contactPhone" type="tel" defaultValue={driver?.contactPhone ?? ""} />
        </ActionForm>
      </section>

      <section className="glass mt-3 flex flex-col gap-4 rounded-4xl p-5 md:p-7">
        <div className="flex flex-col gap-1">
          <h2 className="font-display text-xl font-bold tracking-[-0.02em]">Mot de passe</h2>
          <p className="text-[14px] text-label">Dix caractères minimum. L&apos;actuel est demandé pour confirmer que c&apos;est bien vous.</p>
        </div>
        <ActionForm action={changePassword} submitLabel="Changer le mot de passe" pendingLabel="Modification…">
          <Field label="Mot de passe actuel" name="current" type="password" required autoComplete="current-password" />
          <Field label="Nouveau mot de passe" name="password" type="password" required autoComplete="new-password" />
          <Field label="Confirmer" name="confirm" type="password" required autoComplete="new-password" />
        </ActionForm>
      </section>

      <section className="tile mt-3 flex flex-col gap-4 rounded-4xl p-5 md:p-7">
        <div className="flex flex-col gap-1">
          <h2 className="font-display text-xl font-bold tracking-[-0.02em]">Tarifs appliqués</h2>
          <p className="text-[14px] text-label">
            En lecture seule. Ils vivent dans un seul fichier de configuration et ne se modifient pas depuis cette page.
          </p>
        </div>
        <dl className="flex flex-col divide-y divide-white/[0.08]">
          {VEHICLES.map((v) => (
            <div key={v.id} className="flex items-baseline justify-between gap-4 py-3">
              <dt className="text-[14px] text-label">{v.name}</dt>
              <dd className="text-right font-display text-[15px] font-semibold">{v.priceHint}</dd>
            </div>
          ))}
          {[
            [
              "Majoration nuit et week-end",
              `× ${PRICING.surchargeMultiplier} (de ${PRICING.nightStartHour} h à ${PRICING.nightEndHour} h)`,
            ],
            ["Délai minimum de réservation", `${BOOKING_RULES.minLeadMinutes} minutes`],
          ].map(([k, val]) => (
            <div key={k} className="flex items-baseline justify-between gap-4 py-3">
              <dt className="text-[14px] text-label">{k}</dt>
              <dd className="text-right font-display text-[15px] font-semibold">{val}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
