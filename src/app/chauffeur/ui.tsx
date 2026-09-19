"use client";

import { useTransition } from "react";

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
