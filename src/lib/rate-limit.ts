import "server-only";

/**
 * Limitation de débit par IP, en mémoire.
 *
 * ⚠️ La mémoire n'est pas partagée entre les instances serverless de Vercel :
 * chaque instance applique le quota de son côté, donc le plafond réel est un
 * multiple de celui configuré ici. C'est suffisant pour freiner un script et
 * protéger le compte Stripe des essais de cartes en rafale, pas pour un
 * attaquant déterminé. Pour un vrai plafond global, il faudra un magasin
 * partagé (Upstash Redis, ou Vercel KV).
 */
type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

/** Purge les seaux expirés pour que la Map ne grossisse pas indéfiniment. */
function sweep(now: number) {
  if (buckets.size < 500) return;
  for (const [k, b] of buckets) if (b.resetAt <= now) buckets.delete(k);
}

export type RateLimitResult = { ok: true } | { ok: false; retryAfterSeconds: number };

export function rateLimit(key: string, limit: number, windowSeconds: number): RateLimitResult {
  const now = Date.now();
  sweep(now);

  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowSeconds * 1000 });
    return { ok: true };
  }

  bucket.count++;
  if (bucket.count > limit) {
    return { ok: false, retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)) };
  }
  return { ok: true };
}

/**
 * IP de l'appelant.
 *
 * On lit le premier segment de x-forwarded-for, celui que Vercel place en
 * tête. L'en-tête est falsifiable derrière un proxy mal configuré, mais sur
 * Vercel il est réécrit à chaque requête.
 */
export function clientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return req.headers.get("x-real-ip")?.trim() || "inconnue";
}

/** Réponse normalisée quand le quota est dépassé. */
export function tooManyRequests(retryAfterSeconds: number) {
  return Response.json(
    { ok: false, message: "Trop de tentatives. Patientez un instant avant de réessayer." },
    { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } }
  );
}
