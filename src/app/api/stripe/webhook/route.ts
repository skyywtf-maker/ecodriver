import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { markPaid } from "@/lib/bookings";

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!sig || !secret) return NextResponse.json({ error: "config" }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe().webhooks.constructEvent(await req.text(), sig, secret);
  } catch {
    return NextResponse.json({ error: "signature" }, { status: 400 });
  }

  if (event.type === "payment_intent.succeeded") {
    await markPaid((event.data.object as Stripe.PaymentIntent).id);
  }
  return NextResponse.json({ received: true });
}
