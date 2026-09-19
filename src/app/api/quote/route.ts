import { NextResponse } from "next/server";
import { buildQuote } from "@/lib/quote";
import { tripSchema } from "@/lib/validation";

export async function POST(req: Request) {
  const parsed = tripSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, code: "INVALID", message: "Trajet incomplet." }, { status: 400 });
  }
  const q = await buildQuote(parsed.data);
  if (!q.ok) return NextResponse.json(q, { status: 422 });
  return NextResponse.json({
    ok: true,
    pickupAt: q.pickupAt.toISOString(),
    distanceKm: q.route.distanceKm,
    durationMin: q.route.durationMin,
    geometry: q.route.geometry,
    price: q.price,
  });
}
