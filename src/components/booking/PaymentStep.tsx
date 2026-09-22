"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { loadStripe, type Appearance } from "@stripe/stripe-js";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import type { TripDraft } from "@/lib/draft";
import { euros } from "@/lib/pricing";
import type { Contact } from "./ContactForm";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "");

const appearance: Appearance = {
  theme: "night",
  variables: {
    colorPrimary: "#0A84FF",
    colorBackground: "#23252A",
    colorText: "#FFFFFF",
    colorTextSecondary: "rgba(235,235,245,0.6)",
    colorDanger: "#FF6961",
    fontFamily: "Montserrat, system-ui, sans-serif",
    borderRadius: "10px",
    spacingUnit: "4px",
  },
  rules: {
    ".Input": { border: "1px solid rgba(255,255,255,0.08)", boxShadow: "none", padding: "16px" },
    ".Input:focus": { border: "1px solid #0A84FF", boxShadow: "none" },
    ".Label": { fontSize: "12px", fontWeight: "500" },
    ".Tab": { border: "1px solid rgba(255,255,255,0.08)", boxShadow: "none" },
  },
};

type Props = { draft: TripDraft; contact: Contact; onBack: () => void };

export function PaymentStep(props: Props) {
  const [amount, setAmount] = useState(props.draft.quote.price.totalCents);
  const options = useMemo(
    () => ({ mode: "payment" as const, amount, currency: "eur", appearance, locale: "fr" as const }),
    [amount]
  );
  return (
    <Elements stripe={stripePromise} options={options}>
      <Checkout {...props} amount={amount} onAmountChange={setAmount} />
    </Elements>
  );
}

function Checkout({ draft, contact, onBack, amount, onAmountChange }: Props & { amount: number; onAmountChange: (n: number) => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [accepted, setAccepted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function pay(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements || !accepted) return;
    setBusy(true);
    setError(null);

    const { error: submitError } = await elements.submit();
    if (submitError) {
      setError(submitError.message ?? "Vérifiez vos informations de paiement.");
      setBusy(false);
      return;
    }

    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        trip: { from: draft.from, to: draft.to, date: draft.date, time: draft.time, passengers: draft.passengers, luggage: draft.luggage },
        contact,
        acceptedTerms: true,
      }),
    });
    const data = await res.json();
    if (!data.ok) {
      setError(data.message ?? "Réservation impossible. Réessayez.");
      setBusy(false);
      return;
    }
    if (data.price.totalCents !== amount) {
      // Le prix recalculé côté serveur fait foi (ex. l'horaire est passé en tarif nuit).
      onAmountChange(data.price.totalCents);
      setError(`Le prix a été mis à jour : ${euros(data.price.total)}. Vérifiez puis confirmez à nouveau.`);
      setBusy(false);
      return;
    }

    const { error: payError } = await stripe.confirmPayment({
      elements,
      clientSecret: data.clientSecret,
      confirmParams: { return_url: `${window.location.origin}/reserver/confirmation?booking=${data.bookingId}` },
    });
    // En cas de succès, Stripe redirige. On n'arrive ici qu'en cas d'erreur.
    setError(payError?.message ?? "Le paiement n'a pas abouti.");
    setBusy(false);
  }

  return (
    <form onSubmit={pay} className="flex h-full flex-col gap-6">
      <h1 className="font-display text-4xl font-bold leading-none tracking-[-0.04em] md:text-[44px]">
        Paiement <span className="serif-accent">sécurisé.</span>
      </h1>
      <PaymentElement options={{ layout: "tabs" }} />
      <label className="flex cursor-pointer items-start gap-3 text-sm text-white/80">
        <input
          type="checkbox"
          checked={accepted}
          onChange={(e) => setAccepted(e.target.checked)}
          className="mt-0.5 h-5 w-5 shrink-0 accent-[#0A84FF]"
        />
        <span>
          J&apos;accepte les{" "}
          <Link href="/cgv" target="_blank" className="underline underline-offset-2">
            conditions générales de vente
          </Link>
          .
        </span>
      </label>
      {error && (
        <p role="alert" className="rounded-2xl bg-[#FF453A]/12 px-4 py-3 text-sm font-medium text-[#FF6961]">
          {error}
        </p>
      )}
      <div className="mt-auto flex items-center justify-between gap-3">
        <button type="button" onClick={onBack} disabled={busy} className="btn-ghost">Retour</button>
        <button type="submit" disabled={!accepted || busy || !stripe} className="btn-primary">
          {busy ? "Paiement en cours…" : `Payer ${euros(amount / 100)} et réserver`}
        </button>
      </div>
      <p className="text-xs text-white/50">
        Vous êtes débité maintenant. Si le chauffeur ne peut pas assurer la course, vous êtes remboursé intégralement.
      </p>
    </form>
  );
}
