"use client";

import Link from "next/link";
import { Logo } from "@/components/Logo";
import { requestPasswordReset } from "../actions";
import { ActionForm, Field } from "../ui";

export default function MotDePasseOubliePage() {
  return (
    <main className="flex min-h-[100svh] items-center justify-center px-4">
      <div className="glass flex w-full max-w-[400px] flex-col gap-4 rounded-5xl p-8">
        <Logo className="text-2xl" />
        <div className="mb-1 flex flex-col gap-1.5">
          <h1 className="font-display text-2xl font-bold tracking-[-0.03em]">Mot de passe oublié</h1>
          <p className="text-[14px] text-label">
            Indiquez votre email de connexion. Vous recevrez un lien valable une heure.
          </p>
        </div>
        <ActionForm action={requestPasswordReset} submitLabel="Envoyer le lien" pendingLabel="Envoi…">
          <Field label="Email" name="email" type="email" required autoComplete="username" />
        </ActionForm>
        <Link href="/chauffeur/connexion" className="text-center text-sm font-medium text-label hover:text-white">
          Retour à la connexion
        </Link>
      </div>
    </main>
  );
}
