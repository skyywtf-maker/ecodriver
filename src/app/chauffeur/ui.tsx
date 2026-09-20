"use client";

import { useActionState, useTransition } from "react";
import type { FormState } from "./actions";

/** Bouton d'action avec confirmation facultative (refus, annulation). */
export function ActionButton({
  action,
  label,
  confirmText,
  variant = "primary",
}: {
  action: () => Promise<void>;
  label: string;
  confirmText?: string;
  variant?: "primary" | "ghost" | "danger";
}) {
  const [pending, start] = useTransition();
  const cls =
    variant === "primary"
      ? "btn-primary"
      : variant === "danger"
        ? "flex h-14 items-center justify-center rounded-2xl bg-[#FF453A]/15 px-6 text-[15px] font-semibold text-[#FF6961] hover:bg-[#FF453A]/25 disabled:opacity-40"
        : "btn-ghost";
  return (
    <button
      type="button"
      disabled={pending}
      className={`${cls} flex-1`}
      onClick={() => {
        if (confirmText && !window.confirm(confirmText)) return;
        start(() => action());
      }}
    >
      {pending ? "…" : label}
    </button>
  );
}

export function AvailabilityToggle({ value, onToggle }: { value: boolean; onToggle: (v: boolean) => Promise<void> }) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      role="switch"
      aria-checked={value}
      disabled={pending}
      onClick={() => start(() => onToggle(!value))}
      className="flex h-11 items-center gap-3 rounded-full bg-white/[0.06] pl-4 pr-1.5 text-sm font-medium"
    >
      Disponible aujourd&apos;hui
      <span className={`relative h-8 w-[52px] rounded-full transition-colors ${value ? "bg-[#30D158]" : "bg-white/20"}`}>
        <span className={`absolute top-1 h-6 w-6 rounded-full bg-white transition-all ${value ? "left-[24px]" : "left-1"}`} />
      </span>
    </button>
  );
}

/**
 * Formulaire piloté par une action serveur, avec son message de retour.
 *
 * Mutualise l'état d'envoi et l'affichage succès/erreur des trois formulaires
 * de l'espace chauffeur, tous bâtis sur les mêmes classes que le site public.
 */
export function ActionForm({
  action,
  submitLabel,
  pendingLabel,
  children,
}: {
  action: (state: FormState, form: FormData) => Promise<FormState>;
  submitLabel: string;
  pendingLabel: string;
  children: React.ReactNode;
}) {
  const [state, dispatch, pending] = useActionState(action, undefined);

  return (
    <form action={dispatch} className="flex flex-col gap-3">
      {children}
      {state?.error && (
        <p role="alert" className="text-sm font-medium text-[#FF6961]">
          {state.error}
        </p>
      )}
      {state?.success && (
        <p role="status" className="text-sm font-medium text-[#30D158]">
          {state.success}
        </p>
      )}
      <button type="submit" disabled={pending} className="btn-primary mt-1 w-full">
        {pending ? pendingLabel : submitLabel}
      </button>
    </form>
  );
}

/** Champ de saisie aux tokens du site : étiquette au-dessus, fond en verre. */
export function Field({
  label,
  name,
  type = "text",
  defaultValue,
  required,
  autoComplete,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
  required?: boolean;
  autoComplete?: string;
}) {
  return (
    <label className="field flex h-16 flex-col justify-center gap-0.5 px-5">
      <span className="field-label">{label}</span>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        required={required}
        autoComplete={autoComplete}
        className="field-input"
      />
    </label>
  );
}
