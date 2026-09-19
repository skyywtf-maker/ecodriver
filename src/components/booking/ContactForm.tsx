"use client";

import { useState } from "react";
import { contactSchema } from "@/lib/validation";

export type Contact = { firstName: string; lastName: string; phone: string; email: string; note?: string };

type Props = { initial: Contact | null; onSubmit: (c: Contact) => void; onBack: () => void };

export function ContactForm({ initial, onSubmit, onBack }: Props) {
  const [c, setC] = useState<Contact>(initial ?? { firstName: "", lastName: "", phone: "", email: "", note: "" });
  const [errors, setErrors] = useState<Partial<Record<keyof Contact, string>>>({});

  const set = (k: keyof Contact) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setC((prev) => ({ ...prev, [k]: e.target.value }));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const r = contactSchema.safeParse(c);
    if (!r.success) {
      const errs: Partial<Record<keyof Contact, string>> = {};
      for (const issue of r.error.issues) errs[issue.path[0] as keyof Contact] ??= issue.message;
      setErrors(errs);
      return;
    }
    setErrors({});
    onSubmit({ ...r.data, note: r.data.note || "" });
  }

  const filled = c.firstName && c.lastName && c.phone && c.email;

  return (
    <form onSubmit={submit} noValidate className="flex h-full flex-col gap-[22px]">
      <h1 className="mb-2.5 font-display text-4xl font-bold leading-none tracking-[-0.04em] md:text-[44px]">
        À qui <span className="serif-accent">s&apos;adresse-t-on ?</span>
      </h1>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Prénom" error={errors.firstName}>
          <input className="field-input" autoComplete="given-name" value={c.firstName} onChange={set("firstName")} />
        </Field>
        <Field label="Nom" error={errors.lastName}>
          <input className="field-input" autoComplete="family-name" value={c.lastName} onChange={set("lastName")} />
        </Field>
        <Field label="Téléphone" error={errors.phone}>
          <input className="field-input" type="tel" autoComplete="tel" value={c.phone} onChange={set("phone")} />
        </Field>
        <Field label="Email" error={errors.email}>
          <input className="field-input" type="email" autoComplete="email" value={c.email} onChange={set("email")} />
        </Field>
      </div>
      <label className="field flex min-h-[130px] flex-col gap-2 px-5 py-[18px]">
        <span className="field-label">Note pour le chauffeur (facultatif)</span>
        <textarea
          className="field-input min-h-[60px] flex-1 resize-none text-[15px] font-medium"
          placeholder="Ex. : valise volumineuse, siège enfant"
          maxLength={500}
          value={c.note}
          onChange={set("note")}
        />
      </label>
      <div className="mt-auto flex items-center justify-between gap-3 pt-2">
        <button type="button" onClick={onBack} className="btn-ghost">Retour</button>
        <button type="submit" disabled={!filled} className="btn-primary">
          Continuer vers le paiement
        </button>
      </div>
    </form>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className={`field flex h-16 flex-col justify-center gap-0.5 px-5 ${error ? "!border-[#FF453A]" : ""}`}>
        <span className="field-label">{label}</span>
        {children}
      </label>
      {error && <span className="px-1 text-xs font-medium text-[#FF6961]">{error}</span>}
    </div>
  );
}
