"use client";

import { useActionState } from "react";
import { login } from "../actions";
import { Logo } from "@/components/Logo";

export default function ConnexionPage() {
  const [state, action, pending] = useActionState(login, undefined);
  return (
    <main className="flex min-h-[100svh] items-center justify-center px-4">
      <form action={action} className="glass flex w-full max-w-[400px] flex-col gap-4 rounded-5xl p-8">
        <Logo className="text-2xl" />
        <h1 className="mb-2 font-display text-2xl font-bold tracking-[-0.03em]">Espace chauffeur</h1>
        <label className="field flex h-16 flex-col justify-center gap-0.5 px-5">
          <span className="field-label">Email</span>
          <input name="email" type="email" required autoComplete="username" className="field-input" />
        </label>
        <label className="field flex h-16 flex-col justify-center gap-0.5 px-5">
          <span className="field-label">Mot de passe</span>
          <input name="password" type="password" required autoComplete="current-password" className="field-input" />
        </label>
        {state?.error && <p role="alert" className="text-sm font-medium text-[#FF6961]">{state.error}</p>}
        <button type="submit" disabled={pending} className="btn-primary mt-2 w-full">
          {pending ? "Connexion…" : "Se connecter"}
        </button>
      </form>
    </main>
  );
}
