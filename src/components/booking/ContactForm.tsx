"use client";

import { useState } from "react";
import { contactSchema } from "@/lib/validation";

export type Contact = { firstName: string; lastName: string; phone: string; email: string; note?: string };

type Props = { initial: Contact | null; onSubmit: (c: Contact) => void; onBack: () => void };

export function ContactForm({ initial, onSubmit, onBack }: Props) {
  const [c, setC] = useState<Contact>(initial ?? { firstName: "", lastName: "", phone: "", email: "", note: "" });
  const [errors, setErrors] = useState<Partial<Record<keyof Contact, string>>>({});
  // Note repliée par défaut : facultative, elle prenait un quart de l'écran.
  const [noteOpen, setNoteOpen] = useState(Boolean(initial?.note));

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
    <form onSubmit={submit} noValidate className="flex h-full flex-col gap-3.5 md:gap-[22px]">
      <h1 className="mb-1 font-display text-[26px] font-bold leading-none tracking-[-0.04em] md:mb-2.5 md:text-[44px]">
        À qui <span className="serif-accent">s&apos;adresse-t-on ?</span>
      </h1>
      <div className="grid grid-cols-2 gap-2 md:gap-3">
        <Field label="Prénom" error={errors.firstName}>
          <input className="field-input" autoComplete="given-name" value={c.firstName} onChange={set("firstName")} />
        </Field>
        <Field label="Nom" error={errors.lastName}>
          <input className="field-input" autoComplete="family-name" value={c.lastName} onChange={set("lastName")} />
        </Field>
        <Field label="Téléphone" error={errors.phone} className="col-span-2 sm:col-span-1">
          <input className="field-input" type="tel" autoComplete="tel" inputMode="tel" value={c.phone} onChange={set("phone")} />
        </Field>
        <Field label="Email" error={errors.email} className="col-span-2 sm:col-span-1">
          <input className="field-input" type="email" autoComplete="email" inputMode="email" value={c.email} onChange={set("email")} />
        </Field>
      </div>
      {noteOpen ? (
        <label className="field flex flex-col gap-1.5 px-4 py-3 md:px-5 md:py-4">
          <span className="field-label">Note pour le chauffeur (facultatif)</span>
          <textarea
            autoFocus={!initial?.note}
            rows={2}
            className="field-input resize-none text-[15px] font-medium"
            placeholder="Ex. : valise volumineuse, siège enfant"
            maxLength={500}
            value={c.note}
            onChange={set("note")}
          />
        </label>
      ) : (
        <button type="button" onClick={() => setNoteOpen(true)} className="self-start px-1 text-[13px] font-semibold text-accent hover:underline">
          + Ajouter une note pour le chauffeur
        </button>
      )}
      <div className="mt-auto flex items-center gap-2 pt-1 md:gap-3 md:pt-2">
        <button type="button" onClick={onBack} aria-label="Retour" className="btn-ghost w-12 shrink-0 px-0 md:w-auto md:px-6">
          <span aria-hidden className="md:hidden">←</span>
          <span className="hidden md:inline">Retour</span>
        </button>
        <button type="submit" disabled={!filled} className="btn-primary flex-1 whitespace-nowrap px-4">
          Continuer vers le paiement
        </button>
      </div>
    </form>
  );
}

function Field({ label, error, children, className = "" }: { label: string; error?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`flex min-w-0 flex-col gap-1.5 ${className}`}>
      <label className={`field flex h-[54px] flex-col justify-center gap-0.5 px-4 md:h-16 md:px-5 ${error ? "!border-[#FF453A]" : ""}`}>
        <span className="field-label">{label}</span>
        {children}
      </label>
      {error && <span className="px-1 text-xs font-medium text-[#FF6961]">{error}</span>}
    </div>
  );
}
