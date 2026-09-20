import "server-only";
import { db } from "./db";
import { stripe } from "./stripe";
import {
  notifyBookingConfirmed,
  notifyBookingPaid,
  notifyBookingRefunded,
  notifyDriverArrived,
  notifyDriverOnTheWay,
} from "./notify";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export function newReference() {
  let s = "";
  for (let i = 0; i < 6; i++) s += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  return `ED-${s}`;
}

/**
 * Passe une réservation de PENDING_PAYMENT à PENDING_DRIVER.
 * Idempotent : appelé par le webhook ET par la page de confirmation, notifie une seule fois.
 */
export async function markPaid(paymentIntentId: string) {
  const { count } = await db.booking.updateMany({
    where: { stripePaymentIntentId: paymentIntentId, status: "PENDING_PAYMENT" },
    data: { status: "PENDING_DRIVER" },
  });
  if (count > 0) {
    const b = await db.booking.findUnique({ where: { stripePaymentIntentId: paymentIntentId } });
    if (b) await notifyBookingPaid(b);
  }
}

export async function acceptBooking(id: string) {
  const { count } = await db.booking.updateMany({
    where: { id, status: "PENDING_DRIVER" },
    data: { status: "CONFIRMED", confirmedAt: new Date() },
  });
  if (count > 0) {
    const b = await db.booking.findUniqueOrThrow({ where: { id } });
    await notifyBookingConfirmed(b);
  }
}

export async function completeBooking(id: string) {
  await db.booking.updateMany({
    where: { id, status: "CONFIRMED" },
    data: { status: "COMPLETED", completedAt: new Date() },
  });
}

/**
 * Jalons du déroulé. Idempotents comme les transitions de statut : le drapeau
 * attendu figure dans le `where`, donc un double appui n'envoie qu'un SMS.
 */
export async function markOnTheWay(id: string) {
  const { count } = await db.booking.updateMany({
    where: { id, status: "CONFIRMED", enRoute: false },
    data: { enRoute: true, enRouteAt: new Date() },
  });
  if (count > 0) {
    const b = await db.booking.findUniqueOrThrow({ where: { id } });
    await notifyDriverOnTheWay(b);
  }
}

export async function markArrived(id: string) {
  const { count } = await db.booking.updateMany({
    where: { id, status: "CONFIRMED", arrived: false },
    data: { arrived: true, arrivedAt: new Date(), enRoute: true },
  });
  if (count > 0) {
    const b = await db.booking.findUniqueOrThrow({ where: { id } });
    await notifyDriverArrived(b);
  }
}

/** Refus (depuis PENDING_DRIVER) ou annulation (depuis CONFIRMED) avec remboursement intégral. */
export async function refundBooking(id: string, reason: "refused" | "cancelled") {
  const from = reason === "refused" ? "PENDING_DRIVER" : "CONFIRMED";
  const to = reason === "refused" ? "REFUSED" : "CANCELLED";
  const b = await db.booking.findUnique({ where: { id } });
  if (!b || b.status !== from || !b.stripePaymentIntentId) return;

  const refund = await stripe().refunds.create(
    { payment_intent: b.stripePaymentIntentId, reason: "requested_by_customer" },
    { idempotencyKey: `refund-${b.id}` }
  );
  const { count } = await db.booking.updateMany({
    where: { id, status: from },
    data: { status: to, stripeRefundId: refund.id },
  });
  if (count > 0) await notifyBookingRefunded({ ...b, status: to, stripeRefundId: refund.id }, reason);
}
