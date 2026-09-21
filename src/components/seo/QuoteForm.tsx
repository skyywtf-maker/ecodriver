"use client";

import { useState } from "react";

/**
 * Formulaire de devis des pages prestations.
 *
 * Les champs « type de besoin » et « fréquence » ne concernent que l'espace
 * professionnels : on les affiche à la demande plutôt que de servir le même
 * formulaire partout.
 */
export function QuoteForm({ service, pro = false }: { service: string; pro?: boolean }) {
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setState("sending");

    const form = new FormData(e.currentTarget);
    const payload = Object.fromEntries(form.entries());

    try {
      const res = await fetch("/api/devis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, service }),
      });
      const data = await res.json();
      if (!data.ok) {
        setError(data.message ?? "Envoi impossible. Réessayez.");
        setState("idle");
        return;
      }
      setState("sent");
    } catch {
      setError("Connexion impossible. Réessayez.");
      setState("idle");
    }
  }

  if (state === "sent") {
    return (
      <div className="glass flex flex-col gap-3 rounded-4xl p-8 text-center md:p-10">
        <h2 className="font-display text-2xl font-bold tracking-[-0.025em]">
          Demande <span className="serif-accent">envoyée.</span>
        </h2>
        <p className="text-[15px] leading-relaxed text-label">
          Vous recevez une réponse directement par email. Pour une demande urgente, le téléphone reste le plus rapide.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="glass flex flex-col gap-3 rounded-4xl p-7 md:p-9">
      <div className="mb-1 flex flex-col gap-1.5">
        <h2 className="font-display text-2xl font-bold tracking-[-0.025em]">
          Demander un <span className="serif-accent">devis.</span>
        </h2>
        <p className="text-[14px] text-label">Réponse par email. Rien n&apos;est engagé tant que vous n&apos;avez pas accepté.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Nom et prénom" name="name" required autoComplete="name" />
        <Field label={pro ? "Structure" : "Structure (facultatif)"} name="company" autoComplete="organization" />
        <Field label="Email" name="email" type="email" required autoComplete="email" />
        <Field label="Téléphone" name="phone" type="tel" required autoComplete="tel" />
      </div>

      {pro && (
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Type de besoin" name="need" placeholder="Transferts aéroport, navettes clients…" />
          <Field label="Fréquence estimée" name="frequency" placeholder="2 à 3 courses par semaine" />
        </div>
      )}

      <label className="field flex flex-col gap-1 px-[18px] py-3.5">
        <span className="field-label">Votre demande</span>
        <textarea
          name="message"
          required
          rows={5}
          placeholder="Dates, lieux, nombre de personnes, horaires envisagés…"
          className="field-input resize-y leading-relaxed"
        />
      </label>

      {error && (
        <p role="alert" className="text-sm font-medium text-[#FF6961]">
          {error}
        </p>
      )}

      <button type="submit" disabled={state === "sending"} className="btn-primary mt-1 w-full">
        {state === "sending" ? "Envoi…" : "Envoyer la demande"}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  autoComplete,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  autoComplete?: string;
  placeholder?: string;
}) {
  return (
    <label className="field flex h-16 flex-col justify-center gap-0.5 px-[18px]">
      <span className="field-label">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        autoComplete={autoComplete}
        placeholder={placeholder}
        className="field-input"
      />
    </label>
  );
}
