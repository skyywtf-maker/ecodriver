import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";

export const SESSION_COOKIE = "ed_session";
const MAX_AGE = 60 * 60 * 24 * 7;

function secret() {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 32) throw new Error("AUTH_SECRET manquant ou trop court (32 caractères min.)");
  return new TextEncoder().encode(s);
}

export async function checkCredentials(email: string, password: string) {
  const expectedEmail = process.env.DRIVER_EMAIL?.trim().toLowerCase();
  const hashB64 = process.env.DRIVER_PASSWORD_HASH_B64;
  if (!expectedEmail || !hashB64) return false;
  const hash = Buffer.from(hashB64, "base64").toString("utf8");
  const emailOk = email.trim().toLowerCase() === expectedEmail;
  const passOk = await bcrypt.compare(password, hash);
  return emailOk && passOk;
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
    sameSite: "lax",
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
