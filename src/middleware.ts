import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname.startsWith("/chauffeur/connexion")) return NextResponse.next();
  const token = req.cookies.get("ed_session")?.value;
  const secret = process.env.AUTH_SECRET;
  if (token && secret) {
    try {
      await jwtVerify(token, new TextEncoder().encode(secret));
      return NextResponse.next();
    } catch {}
  }
  return NextResponse.redirect(new URL("/chauffeur/connexion", req.url));
}

export const config = { matcher: ["/chauffeur/:path*"] };
