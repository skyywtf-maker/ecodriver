import { NextResponse } from "next/server";
import { z } from "zod";
import { sendEmail } from "@/lib/brevo";
import { driverContact } from "@/lib/driver";
import { clientIp, rateLimit, tooManyRequests } from "@/lib/rate-limit";
import { serviceBySlug } from "@/config/services";

const schema = z.object({
  service: z.string().min(1).max(60),
  name: z.string().trim().min(1, "Nom requis").max(120),
  company: z.string().trim().max(160).optional().or(z.literal("")),
  email: z.string().trim().email("Adresse email invalide").max(200),
  phone: z.string().trim().min(6).max(30).regex(/^[+0-9 ().-]+$/, "Numéro invalide"),
  need: z.string().trim().max(120).optional().or(z.literal("")),
  frequency: z.string().trim().max(120).optional().or(z.literal("")),
  message: z.string().trim().min(1, "Message requis").max(2000),
});

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

/** Demande de devis : partie par email au chauffeur, rien n'est stocké. */
export async function POST(req: Request) {
  const limit = rateLimit(`devis:${clientIp(req)}`, 5, 15 * 60);
  if (!limit.ok) return tooManyRequests(limit.retryAfterSeconds);

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, message: "Formulaire incomplet ou invalide." }, { status: 400 });
  }

  const d = parsed.data;
  const service = serviceBySlug(d.service);
  const subject = service ? service.subject : "Demande de devis";

  const row = (k: string, v: string) =>
    v ? `<tr><td style="padding:6px 0;color:#8E8E93;font-size:14px">${k}</td><td style="padding:6px 0;font-size:14px">${escapeHtml(v)}</td></tr>` : "";

  const { email: to } = await driverContact();
  if (!to) {
    console.error("Demande de devis reçue mais aucune adresse de notification configurée.");
    return NextResponse.json({ ok: false, message: "Impossible de transmettre la demande." }, { status: 500 });
  }

  await sendEmail(
    to,
    `${subject} — ${d.name}`,
    `<!doctype html><html><body style="margin:0;background:#0A0B0D;font-family:Helvetica,Arial,sans-serif;color:#fff">
<div style="max-width:560px;margin:0 auto;padding:40px 24px">
<h1 style="font-size:22px;margin:0 0 20px">${escapeHtml(subject)}</h1>
<table style="width:100%;border-collapse:collapse;border-top:1px solid #2C2C2E">
${row("Nom", d.name)}${row("Structure", d.company ?? "")}${row("Email", d.email)}${row("Téléphone", d.phone)}${row("Besoin", d.need ?? "")}${row("Fréquence", d.frequency ?? "")}
</table>
<p style="color:#C7C7CC;line-height:1.6;white-space:pre-wrap;margin-top:20px">${escapeHtml(d.message)}</p>
<p style="margin-top:32px;font-size:12px;color:#8E8E93">Répondre directement à ${escapeHtml(d.email)}</p>
</div></body></html>`
  );

  return NextResponse.json({ ok: true });
}
