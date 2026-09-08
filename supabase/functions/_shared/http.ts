/**
 * Shared HTTP concerns for the edge functions: CORS, rate limiting and
 * constant-time comparison.
 *
 * Every function previously answered `Access-Control-Allow-Origin: *` and had
 * no request throttling of any kind. Two of them — `translate` and
 * `kisan-ai-chat` — run with `verify_jwt = false` because they are needed
 * before sign-in, which means anyone who finds the URL can spend the project's
 * Gemini and NVIDIA quota in a loop.
 */

/**
 * Origins allowed to call the functions.
 *
 * Falls back to `*` when `ALLOWED_ORIGINS` is unset so that deploying this
 * change cannot break a running front-end. Set it in production:
 *
 *   supabase secrets set ALLOWED_ORIGINS=https://bhoomix.app,https://www.bhoomix.app
 */
export function corsHeaders(req: Request, extraHeaders = ''): Record<string, string> {
  const configured = (Deno.env.get('ALLOWED_ORIGINS') ?? '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  const origin = req.headers.get('Origin') ?? '';
  const allow =
    configured.length === 0 ? '*' : configured.includes(origin) ? origin : configured[0];

  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Headers':
      `authorization, x-client-info, apikey, content-type${extraHeaders ? `, ${extraHeaders}` : ''}`,
    // Tells caches that the response body depends on who asked.
    ...(configured.length > 0 ? { Vary: 'Origin' } : {}),
  };
}

/**
 * Fixed-window request counter, held in the isolate's memory.
 *
 * Be clear about what this is and is not. Supabase runs functions across
 * several isolates and recycles them, so the real ceiling is roughly
 * `limit × live isolates` and it resets whenever one is torn down. It is not a
 * distributed rate limit and it will not stop a determined, distributed
 * attacker.
 *
 * What it does stop is the cheap version: a single script hammering the
 * endpoint to burn model quota. That is the realistic threat against an
 * unauthenticated endpoint whose URL is visible in the browser's network tab,
 * and it costs no infrastructure to defend against. A durable limit needs a
 * Postgres counter table or an external store, which is a schema decision
 * rather than a patch.
 */
const buckets = new Map<string, { count: number; resetAt: number }>();

export interface RateLimit {
  /** Requests permitted per window. */
  limit: number;
  /** Window length in milliseconds. */
  windowMs: number;
}

export function rateLimited(req: Request, { limit, windowMs }: RateLimit): boolean {
  // `x-forwarded-for` is set by the platform edge, not the caller, so it is
  // the most trustworthy identifier available here. It is still spoofable by
  // anyone who can reach the origin directly, which is why this is a
  // speed bump rather than a control.
  const ip = (req.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() || 'unknown';
  const now = Date.now();
  const bucket = buckets.get(ip);

  if (!bucket || now > bucket.resetAt) {
    buckets.set(ip, { count: 1, resetAt: now + windowMs });

    // Opportunistic sweep so a long-lived isolate does not accumulate a bucket
    // per address it has ever seen.
    if (buckets.size > 5_000) {
      for (const [key, value] of buckets) {
        if (now > value.resetAt) buckets.delete(key);
      }
    }
    return false;
  }

  bucket.count += 1;
  return bucket.count > limit;
}

/** 429 with a Retry-After, so a well-behaved client backs off. */
export function tooManyRequests(headers: Record<string, string>, retryAfterSeconds: number) {
  return new Response(JSON.stringify({ error: 'Too many requests. Please wait and try again.' }), {
    status: 429,
    headers: { ...headers, 'Content-Type': 'application/json', 'Retry-After': String(retryAfterSeconds) },
  });
}

/**
 * Compares two strings without leaking their difference through timing.
 *
 * `a === b` returns as soon as it finds a mismatched byte, so the time it takes
 * is a function of how many leading bytes were correct. For a webhook
 * signature that is a side channel an attacker can walk, one byte at a time.
 */
export function timingSafeEqual(a: string, b: string): boolean {
  const ab = new TextEncoder().encode(a);
  const bb = new TextEncoder().encode(b);
  // Compare the length separately; the loop below must run over a fixed span.
  let mismatch = ab.length === bb.length ? 0 : 1;
  const span = Math.max(ab.length, bb.length);
  for (let i = 0; i < span; i++) {
    mismatch |= (ab[i] ?? 0) ^ (bb[i] ?? 0);
  }
  return mismatch === 0;
}
