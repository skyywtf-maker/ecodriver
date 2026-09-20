import { NextResponse } from "next/server";
import { searchPlaces } from "@/lib/geo";

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("q") ?? "";
  const places = await searchPlaces(q.slice(0, 200));
  return NextResponse.json({ places });
}
