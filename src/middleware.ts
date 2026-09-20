import { NextResponse, type NextRequest } from "next/server";
import { SignJWT, jwtVerify } from "jose";

const SESSION_COOKIE = "ed_session";
/** Doit rester aligné sur MAX_AGE de src/lib/auth.ts. */
const MAX_AGE = 60 * 60 * 2;

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname.startsWith("/chauffeur/connexion")) return NextResponse.next();

  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const secret = process.env.AUTH_SECRET;

  if (token && secret) {
    const key = new TextEncoder().encode(secret);
    try {
      await jwtVerify(token, key);

      // Session glissante : chaque page consultée repousse l'échéance de 2 h.
      // Sans cela, MAX_AGE serait une durée de vie fixe, pas un délai
      // d'inactivité. Le cookie ne peut être réécrit que depuis le middleware
      // ou une route handler, jamais depuis une page.
      const res = NextResponse.next();
      const refreshed = await new SignJWT({ role: "driver" })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime(`${MAX_AGE}s`)
        .sign(key);

      res.cookies.set(SESSION_COOKIE, refreshed, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: MAX_AGE,
      });
      return res;
    } catch {}
  }

  return NextResponse.redirect(new URL("/chauffeur/connexion", req.url));
}

export const config = { matcher: ["/chauffeur/:path*"] };
