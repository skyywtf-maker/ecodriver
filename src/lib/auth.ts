import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { db } from "./db";
import { getDriver } from "./driver";

export const SESSION_COOKIE = "ed_session";
/** Déconnexion après 2 h, prolongée à chaque page consultée par le middleware. */
const MAX_AGE = 60 * 60 * 2;
/** Durée de validité d'un lien de réinitialisation. */
const RESET_TTL_MS = 60 * 60 * 1000;

function secret() {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 32) throw new Error("AUTH_SECRET manquant ou trop court (32 caractères min.)");
  return new TextEncoder().encode(s);
}

/**
 * Vérifie les identifiants.
 *
 * La fiche en base fait foi. Les variables d'environnement servent de secours
 * tant qu'aucun chauffeur n'a été créé, pour que le premier accès reste
 * possible après un déploiement neuf.
 *
 * La comparaison bcrypt est exécutée même lorsque l'email est faux, afin que
 * la durée de la réponse ne révèle pas l'existence du compte.
 */
export async function checkCredentials(email: string, password: string) {
  const given = email.trim().toLowerCase();
  const driver = await getDriver().catch(() => null);

  const expectedEmail = driver?.email.toLowerCase() ?? process.env.DRIVER_EMAIL?.trim().toLowerCase();
  const hash =
    driver?.passwordHash ??
    (process.env.DRIVER_PASSWORD_HASH_B64
      ? Buffer.from(process.env.DRIVER_PASSWORD_HASH_B64, "base64").toString("utf8")
      : null);

  if (!expectedEmail || !hash) return false;

  const passOk = await bcrypt.compare(password, hash);
  return given === expectedEmail && passOk;
}

export async function createSession() {
  const token = await new SignJWT({ role: "driver" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secret());
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    // strict : le cookie ne part jamais depuis un autre site.
    sameSite: "strict",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function destroySession() {
  (await cookies()).delete(SESSION_COOKIE);
}

export async function isDriver() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, secret());
    return payload.role === "driver";
  } catch {
    return false;
  }
}

/** À appeler en tête de chaque page et action du chauffeur. */
export async function requireDriver() {
  if (!(await isDriver())) redirect("/chauffeur/connexion");
}

/** Hachage bcrypt, unique endroit où un mot de passe en clair est transformé. */
export function hashPassword(plain: string) {
  return bcrypt.hashSync(plain, 12);
}

/** Empreinte du jeton de réinitialisation : seule elle est stockée. */
function fingerprint(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

/**
 * Crée un lien de réinitialisation.
 *
 * Renvoie null si l'email ne correspond à aucun chauffeur — l'appelant doit
 * malgré tout afficher le même message, pour ne pas révéler quelle adresse
 * existe.
 */
export async function createPasswordReset(email: string): Promise<string | null> {
  const driver = await getDriver().catch(() => null);
  if (!driver || driver.email.toLowerCase() !== email.trim().toLowerCase()) return null;

  const token = randomBytes(32).toString("base64url");
  await db.passwordReset.create({
    data: {
      tokenHash: fingerprint(token),
      driverId: driver.id,
      expiresAt: new Date(Date.now() + RESET_TTL_MS),
    },
  });
  return token;
}

/** Consomme un jeton et change le mot de passe. Usage unique. */
export async function consumePasswordReset(token: string, newPassword: string): Promise<boolean> {
  const reset = await db.passwordReset.findUnique({ where: { tokenHash: fingerprint(token) } });
  if (!reset || reset.usedAt || reset.expiresAt < new Date()) return false;

  // Le jeton est marqué utilisé dans la même transaction que le changement :
  // deux requêtes simultanées ne peuvent pas le rejouer.
  await db.$transaction([
    db.driver.update({ where: { id: reset.driverId }, data: { passwordHash: hashPassword(newPassword) } }),
    db.passwordReset.update({ where: { id: reset.id }, data: { usedAt: new Date() } }),
  ]);
  return true;
}
