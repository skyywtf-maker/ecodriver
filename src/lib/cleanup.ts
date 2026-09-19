import "server-only";
import { db } from "./db";
import { stripe } from "./stripe";
import { markPaid } from "./bookings";

/** Au-delà de ce délai, une réservation jamais payée est considérée comme abandonnée. */
export const STALE_PENDING_PAYMENT_HOURS = 24;

export type PurgeReport = {
  examined: number;
  deleted: number;
  /** Paiements en réalité réussis : récupérés au lieu d'être supprimés (webhook manqué). */
  recovered: number;
  /** PaymentIntents annulés chez Stripe avant suppression. */
  cancelled: number;
  errors: string[];
};

/**
 * Supprime les réservations restées en PENDING_PAYMENT au-delà de 24 h.
 *
 * Une réservation en PENDING_PAYMENT est créée au clic sur « Payer » : si le
 * client abandonne le Payment Element, la ligne reste en base avec un
 * PaymentIntent jamais confirmé. On ne supprime jamais à l'aveugle : Stripe
 * fait foi. Si le PaymentIntent a en fait réussi (webhook perdu), la
 * réservation est récupérée via markPaid() au lieu d'être détruite.
 */
export async function purgeStalePendingPayments(): Promise<PurgeReport> {
  const cutoff = new Date(Date.now() - STALE_PENDING_PAYMENT_HOURS * 60 * 60 * 1000);
  const stale = await db.booking.findMany({
    where: { status: "PENDING_PAYMENT", createdAt: { lt: cutoff } },
    select: { id: true, reference: true, stripePaymentIntentId: true },
  });

  const report: PurgeReport = { examined: stale.length, deleted: 0, recovered: 0, cancelled: 0, errors: [] };

  for (const booking of stale) {
    try {
      if (booking.stripePaymentIntentId) {
        const intent = await stripe().paymentIntents.retrieve(booking.stripePaymentIntentId);

        if (intent.status === "succeeded" || intent.status === "processing") {
          // Le client a bien payé, seule la notification s'est perdue.
          await markPaid(intent.id);
          report.recovered++;
          continue;
        }
        if (intent.status !== "canceled") {
          await stripe().paymentIntents.cancel(intent.id, { cancellation_reason: "abandoned" });
          report.cancelled++;
        }
      }

      // Le statut est répété dans le where : si le webhook passe entre-temps, rien n'est supprimé.
      const { count } = await db.booking.deleteMany({ where: { id: booking.id, status: "PENDING_PAYMENT" } });
      report.deleted += count;
    } catch (e) {
      report.errors.push(`${booking.reference} : ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  return report;
}
