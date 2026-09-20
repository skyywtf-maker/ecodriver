import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { buildQuote } from "@/lib/quote";
import { newReference } from "@/lib/bookings";
import { bookingRequestSchema } from "@/lib/validation";
import { PRICING } from "@/config/pricing";
import { clientIp, rateLimit, tooManyRequests } from "@/lib/rate-limit";

/** Crée la réservation (PENDING_PAYMENT) et le PaymentIntent. Le prix est TOUJOURS recalculé ici. */
export async function POST(req: Request) {
  // Protège le compte Stripe des essais de cartes en rafale.
  const limit = rateLimit(`bookings:${clientIp(req)}`, 5, 600);
  if (!limit.ok) return tooManyRequests(limit.retryAfterSeconds);

  const parsed = bookingRequestSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, message: "Informations incomplètes ou invalides." }, { status: 400 });
  }
  const { trip, contact } = parsed.data;
  const q = await buildQuote(trip);
  if (!q.ok) return NextResponse.json(q, { status: 422 });

  const booking = await db.booking.create({
    data: {
      reference: newReference(),
      fromLabel: trip.from.label,
      fromLat: trip.from.lat,
      fromLng: trip.from.lng,
      toLabel: trip.to.label,
      toLat: trip.to.lat,
      toLng: trip.to.lng,
      pickupAt: q.pickupAt,
      distanceKm: q.route.distanceKm,
      durationMin: q.route.durationMin,
      priceCents: q.price.totalCents,
      surchargeApplied: q.price.surchargeApplied,
      minimumApplied: q.price.minimumApplied,
      firstName: contact.firstName,
      lastName: contact.lastName,
      phone: contact.phone,
      email: contact.email,
      note: contact.note || null,
      passengers: trip.passengers,
      luggage: trip.luggage,
    },
  });

  const intent = await stripe().paymentIntents.create(
    {
      amount: q.price.totalCents,
      currency: PRICING.currency,
      automatic_payment_methods: { enabled: true },
      receipt_email: contact.email,
      description: `Course ${booking.reference}`,
      metadata: { bookingId: booking.id, reference: booking.reference },
    },
    { idempotencyKey: `pi-${booking.id}` }
  );

  await db.booking.update({ where: { id: booking.id }, data: { stripePaymentIntentId: intent.id } });

  return NextResponse.json({
    ok: true,
    bookingId: booking.id,
    reference: booking.reference,
    clientSecret: intent.client_secret,
    price: q.price,
  });
}
