/**
 * Receives Resend delivery events and mirrors them into `email_events`.
 *
 * Supabase records that it asked Resend to send a password reset, never
 * whether it arrived. That gap is exactly the question worth answering when a
 * farmer says the email never came: bounced and never-sent look identical from
 * inside Supabase and need opposite fixes.
 *
 * Configure at resend.com/webhooks pointing to:
 *   https://<project>.supabase.co/functions/v1/resend-webhook
 * then set the signing secret:
 *   supabase secrets set RESEND_WEBHOOK_SECRET=whsec_...
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';
import { corsHeaders as buildCorsHeaders, timingSafeEqual } from '../_shared/http.ts';

// Resend's servers call this directly — not a browser, so CORS (which only a
// browser enforces) has no real effect on who can reach it; the actual guard
// is the Svix signature check below. Kept for consistency with the other
// functions, and in case anyone ever calls this from a browser-based
// admin tool.
const SVIX_HEADERS = 'svix-id, svix-timestamp, svix-signature';

/** Resend signs with Svix: HMAC-SHA256 over "id.timestamp.body". */
async function signatureValid(
  secret: string,
  id: string,
  timestamp: string,
  body: string,
  header: string,
): Promise<boolean> {
  // Reject anything older than five minutes so a captured request cannot be
  // replayed later to inject fabricated delivery events.
  const age = Math.abs(Date.now() / 1000 - Number(timestamp));
  if (!Number.isFinite(age) || age > 300) return false;

  const keyBytes = Uint8Array.from(atob(secret.replace(/^whsec_/, '')), (c) => c.charCodeAt(0));
  const key = await crypto.subtle.importKey(
    'raw',
    keyBytes,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const mac = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${id}.${timestamp}.${body}`));
  const expected = btoa(String.fromCharCode(...new Uint8Array(mac)));

  // The header carries one or more space-separated "v1,<sig>" pairs.
  //
  // Compared in constant time: `===` short-circuits on the first differing
  // byte, which turns the response latency into an oracle an attacker can walk
  // to forge a signature one byte at a time.
  const offered = header.split(' ').map((p) => p.split(',')[1] ?? '');
  let matched = false;
  for (const sig of offered) {
    // No early break — the loop must cost the same whichever entry matches.
    matched = timingSafeEqual(sig, expected) || matched;
  }
  return matched;
}

Deno.serve(async (req) => {
  // Fresh per invocation — see create-staff-account/index.ts for why this is
  // not a module-level variable.
  const corsHeaders = buildCorsHeaders(req, SVIX_HEADERS);

  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: corsHeaders });

  const raw = await req.text();
  const secret = Deno.env.get('RESEND_WEBHOOK_SECRET');

  if (secret) {
    const id = req.headers.get('svix-id') ?? '';
    const ts = req.headers.get('svix-timestamp') ?? '';
    const sig = req.headers.get('svix-signature') ?? '';
    if (!id || !ts || !sig || !(await signatureValid(secret, id, ts, raw, sig))) {
      console.error('rejected webhook: bad signature');
      return new Response('Invalid signature', { status: 401, headers: corsHeaders });
    }
  } else {
    // Without a secret anyone who finds the URL can write rows. Refuse rather
    // than quietly accept forged delivery data.
    console.error('RESEND_WEBHOOK_SECRET is not set — refusing unverified events');
    return new Response('Webhook not configured', { status: 503, headers: corsHeaders });
  }

  let event: Record<string, unknown>;
  try {
    event = JSON.parse(raw);
  } catch {
    return new Response('Invalid JSON', { status: 400, headers: corsHeaders });
  }

  const rawType = String(event.type ?? '');

  // A webhook subscribed to everything also delivers contact.* and domain.*
  // events, which carry no recipient and would fill the log with rows that
  // are not emails. Acknowledge them so Resend stops retrying, store nothing.
  if (!rawType.startsWith('email.')) {
    return new Response(JSON.stringify({ ok: true, ignored: rawType }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const data = (event.data ?? {}) as Record<string, unknown>;
  const to = Array.isArray(data.to) ? String(data.to[0]) : String(data.to ?? '');
  // Resend sends "email.delivered"; the leading namespace adds nothing here.
  const type = rawType.replace(/^email\./, '');

  const db = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );

  const { error } = await db.from('email_events').insert({
    message_id: data.email_id ?? null,
    event_type: type || 'unknown',
    recipient: to,
    subject: data.subject ?? null,
    from_address: data.from ?? null,
    reason: (data.reason ?? (data.bounce as Record<string, unknown>)?.message) ?? null,
    occurred_at: event.created_at ?? new Date().toISOString(),
    raw: event,
  });

  if (error) {
    console.error('could not record email event:', error.message);
    // 500 makes Resend retry, which is what we want for a transient failure.
    return new Response('Could not record event', { status: 500, headers: corsHeaders });
  }

  return new Response(JSON.stringify({ ok: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
