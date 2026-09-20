"use client";

import { use } from "react";
import { Logo } from "@/components/Logo";
import { resetPassword } from "../../actions";
import { ActionForm, Field } from "../../ui";

export default function ReinitialiserPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);

  return (
    <main className="flex min-h-[100svh] items-center justify-center px-4">
      <div className="glass flex w-full max-w-[400px] flex-col gap-4 rounded-5xl p-8">
        <Logo className="text-2xl" />
        <div className="mb-1 flex flex-col gap-1.5">
          <h1 className="font-display text-2xl font-bold tracking-[-0.03em]">Nouveau mot de passe</h1>
          <p className="text-[14px] text-label">Dix caractères minimum. Ce lien ne fonctionne qu&apos;une fois.</p>
        </div>
        <ActionForm action={resetPassword} submitLabel="Enregistrer" pendingLabel="Enregistrement…">
          <input type="hidden" name="token" value={token} />
          <Field label="Nouveau mot de passe" name="password" type="password" required autoComplete="new-password" />
          <Field label="Confirmer" name="confirm" type="password" required autoComplete="new-password" />
        </ActionForm>
      </div>
    </main>
  );
}
