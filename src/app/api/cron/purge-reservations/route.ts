import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { purgeStalePendingPayments } from "@/lib/cleanup";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function authorized(req: Request) {
  const expected = process.env.CRON_SECRET;
  // Sans secret configuré, l'endpoint reste fermé : mieux vaut un cron muet
  // qu'une route publique capable de supprimer des réservations.
  if (!expected) return false;
  const got = req.headers.get("authorization") ?? "";
  const a = Buffer.from(got);
  const b = Buffer.from(`Bearer ${expected}`);
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Appelée une fois par jour par Vercel Cron (voir vercel.json). */
export async function GET(req: Request) {
  if (!authorized(req)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const report = await purgeStalePendingPayments();
  if (report.errors.length > 0) {
    console.error("[cron] purge des réservations : erreurs", report.errors);
  }
  console.log(
    `[cron] purge : ${report.examined} examinée(s), ${report.deleted} supprimée(s), ` +
      `${report.recovered} récupérée(s), ${report.cancelled} PaymentIntent annulé(s)`
  );

  return NextResponse.json({ ok: true, ...report });
}
