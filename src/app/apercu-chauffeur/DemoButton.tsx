"use client";

/** Bouton de l'aperçu : il a l'air vrai, mais explique qu'il est désactivé. */
export function DemoButton({ label, className }: { label: string; className: string }) {
  return (
    <button type="button" className={className} onClick={() => window.alert("Aperçu : cette action est désactivée.")}>
      {label}
    </button>
  );
}
