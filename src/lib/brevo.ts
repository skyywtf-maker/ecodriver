import "server-only";

/**
 * Brevo — envoi des emails transactionnels et des SMS.
 *
 * Une seule clé d'API pour les deux canaux. Si elle n'est pas renseignée, les
 * envois sont journalisés et ignorés : le site reste utilisable en local sans
 * consommer de crédits, et une panne d'envoi ne doit jamais faire échouer une
 * réservation déjà payée.
 */
const KEY = process.env.BREVO_API_KEY;
const BASE = "https://api.brevo.com/v3";

/** Expéditeur des emails. Le domaine doit être validé dans Brevo. */
function sender() {
  const raw = process.env.EMAIL_FROM ?? "Eco Driver <contact@eco-driver.fr>";
  const match = raw.match(/^(.*?)\s*<(.+)>$/);
  return match ? { name: match[1]!.trim(), email: match[2]! } : { name: "Eco Driver", email: raw };
}

async function call(path: string, body: unknown) {
  if (!KEY) {
    console.warn(`[Brevo désactivé] ${path}`, JSON.stringify(body).slice(0, 160));
    return;
  }
  try {
    const res = await fetch(`${BASE}${path}`, {
      method: "POST",
      headers: { "api-key": KEY, "Content-Type": "application/json", accept: "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) console.error(`Brevo ${path} a répondu ${res.status}`, (await res.text()).slice(0, 300));
  } catch (e) {
    console.error(`Échec d'appel Brevo ${path}`, e);
  }
}

export async function sendEmail(to: string, subject: string, htmlContent: string) {
  if (!to) return;
  await call("/smtp/email", { sender: sender(), to: [{ email: to }], subject, htmlContent });
}

/**
 * Normalise un numéro français au format E.164 attendu par Brevo.
 * Renvoie null si le résultat n'est pas plausible, plutôt que d'envoyer un
 * SMS à un numéro inventé.
 */
export function toE164(raw: string): string | null {
  const digits = raw.replace(/[^\d+]/g, "");
  if (digits.startsWith("+")) return /^\+\d{8,15}$/.test(digits) ? digits : null;
  if (/^0\d{9}$/.test(digits)) return `+33${digits.slice(1)}`;
  if (/^33\d{9}$/.test(digits)) return `+${digits}`;
  return null;
}

export async function sendSms(to: string, content: string) {
  const recipient = toE164(to);
  if (!recipient) {
    console.warn("SMS ignoré, numéro non normalisable :", to);
    return;
  }
  await call("/transactionalSMS/sms", {
    // Onze caractères maximum pour l'expéditeur alphanumérique.
    sender: "EcoDriver",
    recipient,
    content,
    type: "transactional",
  });
}
