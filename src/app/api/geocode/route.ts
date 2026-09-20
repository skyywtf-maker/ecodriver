import { NextResponse } from "next/server";
import { searchPlaces } from "@/lib/geo";
import { clientIp, rateLimit, tooManyRequests } from "@/lib/rate-limit";

export async function GET(req: Request) {
  const limit = rateLimit(`geocode:${clientIp(req)}`, 120, 60);
  if (!limit.ok) return tooManyRequests(limit.retryAfterSeconds);

  const q = new URL(req.url).searchParams.get("q") ?? "";
  const places = await searchPlaces(q.slice(0, 200));
  return NextResponse.json({ places });
}
