import "server-only";
import { Resend } from "resend";
import type { Booking } from "@prisma/client";
import { SITE } from "@/config/site";
import { euros } from "./pricing";
import { formatParis } from "./time";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM = process.env.EMAIL_FROM ?? "Eco Driver <onboarding@resend.dev>";

async function sendEmail(to: string, subject: string, html: string) {
  if (!resend) {
    console.warn(`[email désactivé] ${subject} → ${to}`);
    return;
  }
  try {
    await resend.emails.send({ from: FROM, to, subject, html });
  } catch (e) {
    console.error("Échec envoi email", e);
  }
}

/** SMS via l'API REST Twilio. Silencieux si non configuré. */
async function sendSms(to: string, body: string) {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM_NUMBER;
  if (!sid || !token || !from) return;
  const normalized = to.replace(/[^\d+]/g, "").replace(/^0/, "+33");
  try {
    await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
      method: "POST",
      headers: {
        Authorization: "Basic " + Buffer.from(`${sid}:${token}`).toString("base64"),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ To: normalized, From: from, Body: body }),
    });
  } catch (e) {
    console.error("Échec envoi SMS", e);
  }
}

function layout(title: string, body: string) {
  return `<!doctype html><html><body style="margin:0;background:#0A0B0D;font-family:Helvetica,Arial,sans-serif;color:#FFFFFF">
<div style="max-width:560px;margin:0 auto;padding:40px 24px">
<div style="font-size:20px;font-weight:700;margin-bottom:32px">Eco Driver</div>
<h1 style="font-size:26px;line-height:1.2;margin:0 0 20px">${title}</h1>
${body}
<p style="margin-top:40px;font-size:12px;color:#8E8E93">${SITE.name} · Chauffeur privé, Grand Est</p>
</div></body></html>`;
}

function recap(b: Booking) {
  const row = (k: string, v: string) =>
    `<tr><td style="padding:8px 0;color:#8E8E93;font-size:14px">${k}</td><td style="padding:8px 0;font-size:14px;text-align:right">${v}</td></tr>`;
  return `<table style="width:100%;border-collapse:collapse;border-top:1px solid #2C2C2E;margin:16px 0">
${row("Référence", b.reference)}
${row("Départ", b.fromLabel)}
${row("Arrivée", b.toLabel)}
${row("Date", formatParis(b.pickupAt))}
${row("Passagers", String(b.passengers))}
${row("Montant payé", euros(b.priceCents / 100))}
</table>`;
}

function trackUrl(b: Booking) {
  return `${SITE.url}/suivi/${b.id}`;
}

function button(href: string, label: string) {
  return `<a href="${href}" style="display:inline-block;margin-top:16px;padding:14px 22px;border-radius:14px;background:#FFFFFF;color:#0A0B0D;font-weight:600;text-decoration:none">${label}</a>`;
}

export async function notifyBookingPaid(b: Booking) {
  await sendEmail(
    b.email,
    `Réservation ${b.reference} reçue`,
    layout(
      "Votre réservation est enregistrée",
      `<p style="color:#C7C7CC;line-height:1.6">Votre paiement est validé. Votre chauffeur va confirmer la course sous peu, vous recevrez un message dès que ce sera fait.</p>${recap(b)}${button(trackUrl(b), "Suivre ma réservation")}`
    )
  );
  const driverEmail = process.env.DRIVER_NOTIFICATION_EMAIL;
  if (driverEmail) {
    await sendEmail(
      driverEmail,
      `Nouvelle demande ${b.reference} · ${formatParis(b.pickupAt)}`,
      layout(
        "Nouvelle course à confirmer",
        `<p style="color:#C7C7CC">${b.firstName} ${b.lastName} · ${b.phone}</p>${recap(b)}${b.note ? `<p style="color:#C7C7CC">Note : ${escapeHtml(b.note)}</p>` : ""}${button(`${SITE.url}/chauffeur/course/${b.id}`, "Accepter ou refuser")}`
      )
    );
  }
  const driverPhone = process.env.DRIVER_PHONE_E164;
  if (driverPhone) {
    await sendSms(driverPhone, `Eco Driver : nouvelle demande ${b.reference}, ${formatParis(b.pickupAt)}. ${SITE.url}/chauffeur/course/${b.id}`);
  }
}

export async function notifyBookingConfirmed(b: Booking) {
  await sendEmail(
    b.email,
    `Course ${b.reference} confirmée`,
    layout(
      "Votre chauffeur a confirmé la course",
      `<p style="color:#C7C7CC;line-height:1.6">Rendez-vous le ${formatParis(b.pickupAt)}. Le jour J, vous pouvez joindre votre chauffeur au ${SITE.phoneDisplay}.</p>${recap(b)}${button(trackUrl(b), "Voir ma réservation")}`
    )
  );
  await sendSms(b.phone, `Eco Driver : votre course ${b.reference} du ${formatParis(b.pickupAt)} est confirmée.`);
}

export async function notifyBookingRefunded(b: Booking, reason: "refused" | "cancelled") {
  const title = reason === "refused" ? "Votre chauffeur ne peut pas assurer cette course" : "Votre course a été annulée";
  await sendEmail(
    b.email,
    `Course ${b.reference} : remboursement intégral`,
    layout(
      title,
      `<p style="color:#C7C7CC;line-height:1.6">Vous êtes remboursé intégralement (${euros(b.priceCents / 100)}). Le montant apparaît sur votre compte sous 5 à 10 jours ouvrés selon votre banque.</p>${recap(b)}`
    )
  );
  await sendSms(b.phone, `Eco Driver : votre course ${b.reference} est annulée, remboursement intégral en cours.`);
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}
