import Link from "next/link";
import { notFound } from "next/navigation";
import { Nav } from "@/components/Nav";
import { BookingRecap } from "@/components/BookingRecap";
import { ClearDraft } from "@/components/ClearDraft";
import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { markPaid } from "@/lib/bookings";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ booking?: string; payment_intent?: string }> };

export default async function ConfirmationPage({ searchParams }: Props) {
  const { booking: id, payment_intent: piId } = await searchParams;
  if (!id) notFound();
  let b = await db.booking.findUnique({ where: { id } });
  if (!b) notFound();

  // Si le webhook n'est pas encore passé, on vérifie nous-mêmes auprès de Stripe.
  if (b.status === "PENDING_PAYMENT" && piId && piId === b.stripePaymentIntentId) {
    const pi = await stripe().paymentIntents.retrieve(piId);
    if (pi.status === "succeeded") {
      await markPaid(piId);
      b = await db.booking.findUniqueOrThrow({ where: { id } });
    }
  }

  const paid = b.status !== "PENDING_PAYMENT";

  return (
    <>
      <Nav />
      <main className="mx-auto flex min-h-[100svh] max-w-[640px] flex-col justify-center px-4 pb-10 pt-28">
        {paid && <ClearDraft />}
        <div className="glass rounded-5xl p-6 md:p-10">
          {paid ? (
            <>
              <p className="mb-3 text-sm font-medium text-[#30D158]">Paiement validé</p>
              <h1 className="font-display text-4xl font-bold leading-tight tracking-[-0.04em]">
                Réservation <span className="serif-accent">enregistrée.</span>
              </h1>
              <p className="mt-4 text-[15px] leading-relaxed text-white/75">
                Votre chauffeur va confirmer votre course sous peu. Vous recevrez un message dès que ce sera fait.
              </p>
              <div className="mt-8">
                <BookingRecap b={b} />
              </div>
              <Link href={`/suivi/${b.id}`} className="btn-primary mt-8 w-full">
                Suivre ma réservation
              </Link>
            </>
          ) : (
            <>
              <h1 className="font-display text-3xl font-bold tracking-[-0.03em]">Paiement non finalisé</h1>
              <p className="mt-4 text-[15px] text-white/75">
                Votre paiement n&apos;a pas été validé et aucune somme n&apos;a été prélevée. Vous pouvez réessayer.
              </p>
              <Link href="/reserver" className="btn-primary mt-8 w-full">Reprendre la réservation</Link>
            </>
          )}
        </div>
      </main>
    </>
  );
}
