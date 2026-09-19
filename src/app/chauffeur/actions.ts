"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { checkCredentials, createSession, destroySession, requireDriver } from "@/lib/auth";
import { acceptBooking, completeBooking, refundBooking } from "@/lib/bookings";
import { db } from "@/lib/db";

export async function login(_: { error?: string } | undefined, form: FormData) {
  const email = String(form.get("email") ?? "");
  const password = String(form.get("password") ?? "");
  if (!(await checkCredentials(email, password))) {
    return { error: "Email ou mot de passe incorrect." };
  }
  await createSession();
  redirect("/chauffeur/tableau-de-bord");
}

export async function logout() {
  await destroySession();
  redirect("/chauffeur/connexion");
}

async function act(id: string, fn: () => Promise<void>) {
  await requireDriver();
  await fn();
  revalidatePath("/chauffeur/tableau-de-bord");
  revalidatePath(`/chauffeur/course/${id}`);
}

export async function accept(id: string) {
  await act(id, () => acceptBooking(id));
}
export async function refuse(id: string) {
  await act(id, () => refundBooking(id, "refused"));
}
export async function cancel(id: string) {
  await act(id, () => refundBooking(id, "cancelled"));
}
export async function complete(id: string) {
  await act(id, () => completeBooking(id));
}

export async function setAvailable(value: boolean) {
  await requireDriver();
  await db.setting.upsert({
    where: { key: "available_today" },
    create: { key: "available_today", value: String(value) },
    update: { value: String(value) },
  });
  revalidatePath("/chauffeur/tableau-de-bord");
}
