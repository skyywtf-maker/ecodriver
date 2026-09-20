"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import {
  checkCredentials,
  consumePasswordReset,
  createPasswordReset,
  createSession,
  destroySession,
  hashPassword,
  requireDriver,
} from "@/lib/auth";
import { acceptBooking, completeBooking, markArrived, markOnTheWay, refundBooking } from "@/lib/bookings";
import { db } from "@/lib/db";
import { getDriver } from "@/lib/driver";
import { notifyPasswordReset } from "@/lib/notify";
import { rateLimit } from "@/lib/rate-limit";
import { SITE } from "@/config/site";

export type FormState = { error?: string; success?: string } | undefined;

/** IP de l'appelant, pour la limitation de débit des actions serveur. */
async function ip() {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip")?.trim() || "inconnue";
}

export async function login(_: FormState, form: FormData): Promise<FormState> {
  // Cinq tentatives par quart d'heure : de quoi se tromper, pas de quoi
  // parcourir un dictionnaire de mots de passe.
  const limit = rateLimit(`login:${await ip()}`, 5, 15 * 60);
  if (!limit.ok) {
    return { error: `Trop de tentatives. Réessayez dans ${Math.ceil(limit.retryAfterSeconds / 60)} minutes.` };
  }

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

/**
 * Demande de réinitialisation.
 *
 * Le message de retour est le même que l'adresse existe ou non : révéler
 * laquelle est la bonne reviendrait à confirmer l'identifiant du chauffeur.
 */
export async function requestPasswordReset(_: FormState, form: FormData): Promise<FormState> {
  const limit = rateLimit(`reset:${await ip()}`, 5, 15 * 60);
  if (!limit.ok) return { error: "Trop de demandes. Réessayez dans quelques minutes." };

  const email = String(form.get("email") ?? "").trim();
  const token = await createPasswordReset(email);
  if (token) {
    await notifyPasswordReset(email, `${SITE.url}/chauffeur/mot-de-passe-oublie/${token}`);
  }
  return { success: "Si cette adresse correspond à un compte, un lien vient d'être envoyé. Il est valable une heure." };
}

export async function resetPassword(_: FormState, form: FormData): Promise<FormState> {
  const token = String(form.get("token") ?? "");
  const password = String(form.get("password") ?? "");
  const confirm = String(form.get("confirm") ?? "");

  if (password.length < 10) return { error: "Choisissez un mot de passe d'au moins 10 caractères." };
  if (password !== confirm) return { error: "Les deux mots de passe ne correspondent pas." };

  if (!(await consumePasswordReset(token, password))) {
    return { error: "Ce lien a expiré ou a déjà servi. Demandez-en un nouveau." };
  }
  redirect("/chauffeur/connexion?reinitialise=1");
}

export async function changePassword(_: FormState, form: FormData): Promise<FormState> {
  await requireDriver();
  const driver = await getDriver();
  if (!driver) return { error: "Aucune fiche chauffeur en base." };

  const current = String(form.get("current") ?? "");
  const password = String(form.get("password") ?? "");
  const confirm = String(form.get("confirm") ?? "");

  if (!(await bcrypt.compare(current, driver.passwordHash))) {
    return { error: "Mot de passe actuel incorrect." };
  }
  if (password.length < 10) return { error: "Choisissez un mot de passe d'au moins 10 caractères." };
  if (password !== confirm) return { error: "Les deux mots de passe ne correspondent pas." };

  await db.driver.update({ where: { id: driver.id }, data: { passwordHash: hashPassword(password) } });
  return { success: "Mot de passe modifié." };
}

export async function updateContact(_: FormState, form: FormData): Promise<FormState> {
  await requireDriver();
  const driver = await getDriver();
  if (!driver) return { error: "Aucune fiche chauffeur en base." };

  const contactEmail = String(form.get("contactEmail") ?? "").trim();
  const contactPhone = String(form.get("contactPhone") ?? "").trim();
  if (contactEmail && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(contactEmail)) {
    return { error: "Adresse email invalide." };
  }

  await db.driver.update({ where: { id: driver.id }, data: { contactEmail, contactPhone } });
  revalidatePath("/chauffeur/parametres");
  return { success: "Coordonnées enregistrées." };
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
export async function onTheWay(id: string) {
  await act(id, () => markOnTheWay(id));
}
export async function arrived(id: string) {
  await act(id, () => markArrived(id));
}

export async function setAvailable(value: boolean) {
  await requireDriver();
  const driver = await getDriver();
  if (driver) {
    await db.driver.update({ where: { id: driver.id }, data: { availableToday: value } });
  }
  revalidatePath("/chauffeur/tableau-de-bord");
}
