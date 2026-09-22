import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { STATUS_LABEL, STATUS_TONE } from "@/lib/status";
import { TabBar } from "../../../chauffeur/TabBar";
import { DEMO_RIDES, demoRide } from "../../data";
import { DemoButton } from "../../DemoButton";
import { DemoBanner } from "../../DemoBanner";

export const metadata: Metadata = { title: "Aperçu · fiche course", robots: { index: false, follow: false } };

export function generateStaticParams() {
  return DEMO_RIDES.map((r) => ({ id: r.id }));
}

/** Fiche course de l'aperçu : même mise en page que la vraie, données fictives. */
export default async function ApercuCourse({ params }: { params: Promise<{ id: string }> }) {
  const r = demoRide((await params).id);
  if (!r) notFound();

  const rows: [string, string][] = [
    ["Prise en charge", r.when],
    ["Départ", r.from],
    ["Arrivée", r.to],
    ["Distance", r.distance],
    ["Client", r.name],
    ["Téléphone", r.phone],
    ["Email", r.email],
    ["Passagers · bagages", `${r.passengers} · ${r.luggage}`],
    ["Note", r.note || "–"],
    ["Montant", r.price],
    ["Référence", r.reference],
  ];
  const main = "btn-primary flex-1";
  const danger =
    "flex h-12 flex-1 items-center justify-center rounded-2xl bg-[#FF453A]/15 px-6 text-[15px] font-semibold text-[#FF6961] md:h-14";

  return (
    <div className="mx-auto max-w-[720px] px-3 pb-28 pt-3 md:px-4 md:pt-10">
      <DemoBanner />
      <TabBar demo current="courses" available />
      <Link href="/apercu-chauffeur" className="px-1 text-sm font-medium text-label hover:text-white">
        ← Toutes les courses
      </Link>
      <div className="glass mt-3 rounded-4xl p-5 md:mt-6 md:rounded-5xl md:p-8">
        <span className={`inline-flex h-8 items-center rounded-full px-3.5 text-[13px] font-semibold ${STATUS_TONE[r.status]}`}>
          {r.status === "CONFIRMED" && r.enRoute ? "En route" : STATUS_LABEL[r.status]}
        </span>
        <h1 className="mt-3 font-display text-[24px] font-bold tracking-[-0.03em] md:mt-4 md:text-3xl">Course {r.reference}</h1>
        <dl className="mt-5 flex flex-col divide-y divide-white/[0.08]">
          {rows.map(([k, v]) => (
            <div key={k} className="grid grid-cols-[112px_1fr] gap-3 py-2.5 text-[14px] md:grid-cols-[140px_1fr] md:gap-4 md:py-3 md:text-[15px]">
              <dt className="text-label">{k}</dt>
              <dd className="font-medium">{v}</dd>
            </div>
          ))}
        </dl>
        <DemoButton label="Ouvrir l'itinéraire" className="btn-ghost mt-5 w-full" />

        {r.steps.length > 1 && (
          <ol className="mt-6 flex flex-col border-t border-white/[0.08] pt-4">
            {r.steps.map((s, i) => (
              <li key={s.label} className="flex items-start gap-3.5 py-2">
                <span className="flex flex-col items-center pt-1.5" aria-hidden>
                  <span className={`h-2.5 w-2.5 rounded-full ${i === r.steps.length - 1 ? "bg-accent" : "bg-white/30"}`} />
                  {i < r.steps.length - 1 && <span className="mt-1 h-5 w-px bg-white/15" />}
                </span>
                <span className="flex flex-1 flex-wrap items-baseline justify-between gap-2">
                  <span className="text-[14px] font-medium">{s.label}</span>
                  <span className="text-[13px] text-label">{s.at}</span>
                </span>
              </li>
            ))}
          </ol>
        )}

        {r.status === "PENDING_DRIVER" && (
          <div className="mt-4 flex gap-3">
            <DemoButton label="Refuser" className={danger} />
            <DemoButton label="Accepter" className={main} />
          </div>
        )}
        {r.status === "CONFIRMED" && (
          <div className="mt-4 flex flex-col gap-3">
            <DemoButton label={r.enRoute ? "Je suis arrivé" : "Je suis en route"} className={main} />
            <DemoButton label="Annuler la course" className={danger} />
          </div>
        )}
      </div>
    </div>
  );
}
