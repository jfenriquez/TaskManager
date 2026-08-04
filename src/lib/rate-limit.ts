interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

const WINDOW_MS = 60_000;
const MAX_BUCKETS = 10_000;

function sweep() {
  if (buckets.size < MAX_BUCKETS) return;
  const now = Date.now();
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

/**
 * Rate limiting simple en memoria (sliding window por minuto).
 * Adecuado para un proyecto monousuario/producción pequeña; en un
 * despliegue multi-instancia debería reemplazarse por Redis.
 *
 * @returns true si la request está dentro del límite, false si excede.
 */
export function rateLimit(key: string, max = 20, windowMs = WINDOW_MS): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  bucket.count += 1;
  return bucket.count <= max;
}

/** Extrae la IP del cliente de forma segura (puede faltar en algunos proxies). */
export function clientIp(
  headers: Headers,
): string {
  const xff = headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]!.trim();
  return headers.get("x-real-ip") ?? "unknown";
}

export function rateLimitHeaders(limit: number, windowMs = WINDOW_MS): Record<string, string> {
  return {
    "X-RateLimit-Limit": String(limit),
    "X-RateLimit-Window": String(windowMs),
  };
}

// Evita que el Map crezca indefinidamente en despliegues largos.
setInterval(sweep, WINDOW_MS * 5).unref?.();
