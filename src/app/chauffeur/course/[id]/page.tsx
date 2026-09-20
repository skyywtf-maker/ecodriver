import Link from "next/link";
import type { Booking } from "@prisma/client";
import { notFound } from "next/navigation";
import { requireDriver } from "@/lib/auth";
import { db } from "@/lib/db";
import { euros } from "@/lib/pricing";
import { formatParis } from "@/lib/time";
import { STATUS_LABEL, STATUS_TONE } from "@/lib/status";
import { accept, arrived, cancel, complete, onTheWay, refuse } from "../../actions";
import { ActionButton } from "../../ui";

export const dynamic = "force-dynamic";

export default async function CoursePage({ params }: { params: Promise<{ id: string }> }) {
  await requireDriver();
  const { id } = await params;
  const b = await db.booking.findUnique({ where: { id } });
  if (!b || b.status === "PENDING_PAYMENT") notFound();

  const mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${b.fromLat},${b.fromLng}&destination=${b.toLat},${b.toLng}`;
  const rows: [string, React.ReactNode][] = [
    ["Prise en charge", formatParis(b.pickupAt, { weekday: "long", month: "long" })],
    ["Départ", b.fromLabel],
    ["Arrivée", b.toLabel],
    ["Distance", `${b.distanceKm.toLocaleString("fr-FR")} km · ${b.durationMin} min`],
    ["Client", `${b.firstName} ${b.lastName}`],
    ["Téléphone", <a key="t" href={`tel:${b.phone.replace(/\s/g, "")}`} className="underline underline-offset-2">{b.phone}</a>],
    ["Email", b.email],
    ["Passagers · bagages", `${b.passengers} · ${b.luggage}`],
    ["Note", b.note || "–"],
    ["Montant", `${euros(b.priceCents / 100)}${b.surchargeApplied ? " (majoré)" : ""}${b.minimumApplied ? " (minimum)" : ""}`],
    ["Référence", b.reference],
  ];

  return (
    <div className="mx-auto max-w-[720px] px-4 py-6 md:py-10">
      <Link href="/chauffeur/tableau-de-bord" className="text-sm font-medium text-label hover:text-white">← Toutes les courses</Link>
      <div className="glass mt-6 rounded-5xl p-6 md:p-8">
        <span className={`inline-flex h-8 items-center rounded-full px-3.5 text-[13px] font-semibold ${STATUS_TONE[b.status]}`}>{STATUS_LABEL[b.status]}</span>
        <h1 className="mt-4 font-display text-3xl font-bold tracking-[-0.03em]">Course {b.reference}</h1>
        <dl className="mt-6 flex flex-col divide-y divide-white/[0.08]">
          {rows.map(([k, v]) => (
            <div key={k} className="grid grid-cols-[140px_1fr] gap-4 py-3 text-[15px]">
              <dt className="text-label">{k}</dt>
              <dd className="font-medium">{v}</dd>
            </div>
          ))}
        </dl>
        <a href={mapsUrl} target="_blank" rel="noreferrer" className="btn-ghost mt-6 w-full">Ouvrir l&apos;itinéraire</a>

        <Timeline booking={b} />

        {b.status === "PENDING_DRIVER" && (
          <div className="mt-3 flex gap-3">
            <ActionButton action={refuse.bind(null, b.id)} label="Refuser" variant="danger" confirmText="Refuser cette course ? Le client sera remboursé intégralement." />
            <ActionButton action={accept.bind(null, b.id)} label="Accepter" />
          </div>
        )}

        {b.status === "CONFIRMED" && (
          <div className="mt-3 flex flex-col gap-3">
            {/* Une seule action principale à la fois : celle qui correspond à
                l'étape suivante. L'annulation reste accessible en dessous
                tant que la course n'est pas terminée. */}
            {!b.enRoute ? (
              <ActionButton action={onTheWay.bind(null, b.id)} label="Je suis en route" />
            ) : !b.arrived ? (
              <ActionButton action={arrived.bind(null, b.id)} label="Je suis arrivé" />
            ) : (
              <ActionButton action={complete.bind(null, b.id)} label="Marquer comme terminée" confirmText="Confirmer que la course a été effectuée ?" />
            )}
            <ActionButton action={cancel.bind(null, b.id)} label="Annuler la course" variant="danger" confirmText="Annuler cette course confirmée ? Le client sera remboursé intégralement." />
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Fil chronologique de la course.
 *
 * Seules les étapes réellement atteintes sont affichées : une date nulle
 * signifie que l'étape n'a pas eu lieu, elle ne doit pas s'inventer un
 * horaire.
 */
function Timeline({ booking: b }: { booking: Booking }) {
  const steps: { label: string; at: Date | null }[] = [
    { label: "Réservée", at: b.createdAt },
    { label: "Confirmée", at: b.confirmedAt },
    { label: "En route", at: b.enRouteAt },
    { label: "Sur place", at: b.arrivedAt },
    { label: "Terminée", at: b.completedAt },
  ];
  const reached = steps.filter((s) => s.at !== null);
  if (reached.length <= 1) return null;

  return (
    <ol className="mt-7 flex flex-col border-t border-white/[0.08] pt-5">
      {reached.map((s, i) => (
        <li key={s.label} className="flex items-start gap-3.5 py-2">
          <span className="flex flex-col items-center pt-1.5" aria-hidden>
            <span className={`h-2.5 w-2.5 rounded-full ${i === reached.length - 1 ? "bg-accent" : "bg-white/30"}`} />
            {i < reached.length - 1 && <span className="mt-1 h-5 w-px bg-white/15" />}
          </span>
          <span className="flex flex-1 flex-wrap items-baseline justify-between gap-2">
            <span className="text-[14px] font-medium">{s.label}</span>
            <span className="text-[13px] text-label">{formatParis(s.at!, { weekday: "short", month: "short" })}</span>
          </span>
        </li>
      ))}
    </ol>
  );
}
