import { notFound } from "next/navigation";
import { Nav } from "@/components/Nav";
import { BookingRecap } from "@/components/BookingRecap";
import { db } from "@/lib/db";
import { STATUS_LABEL, STATUS_TONE } from "@/lib/status";
import { SITE } from "@/config/site";

export const dynamic = "force-dynamic";
export const metadata = { title: "Suivi de réservation · Eco Driver", robots: { index: false } };

const MESSAGES = {
  PENDING_PAYMENT: "Nous vérifions votre paiement. Actualisez la page dans un instant.",
  PENDING_DRIVER: "Votre chauffeur n'a pas encore confirmé. Vous recevrez un message dès que ce sera fait.",
  CONFIRMED: "Votre course est confirmée. Le jour J, vous pouvez joindre votre chauffeur directement.",
  REFUSED: "Votre chauffeur ne peut pas assurer cette course. Vous avez été remboursé intégralement.",
  COMPLETED: "Course terminée. Merci d'avoir voyagé avec Eco Driver.",
  CANCELLED: "Cette course a été annulée. Vous avez été remboursé intégralement.",
} as const;

export default async function SuiviPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const b = await db.booking.findUnique({ where: { id } });
  if (!b) notFound();

  return (
    <>
      <Nav />
      <main className="mx-auto flex min-h-[100svh] max-w-[640px] flex-col justify-center px-4 pb-10 pt-28">
        <div className="glass rounded-5xl p-6 md:p-10">
          <span className={`inline-flex h-8 items-center rounded-full px-3.5 text-[13px] font-semibold ${STATUS_TONE[b.status]}`}>
            {STATUS_LABEL[b.status]}
          </span>
          <h1 className="mt-5 font-display text-4xl font-bold tracking-[-0.04em]">
            Course <span className="serif-accent">{b.reference}</span>
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-white/75">{MESSAGES[b.status]}</p>
          {b.status === "CONFIRMED" && (
            <a href={SITE.phoneHref} className="btn-primary mt-6 w-full">
              Appeler le chauffeur · {SITE.phoneDisplay}
            </a>
          )}
          <div className="mt-8">
            <BookingRecap b={b} />
          </div>
          <p className="mt-6 text-xs text-white/45">Actualisez la page pour voir le dernier statut.</p>
        </div>
      </main>
    </>
  );
}
