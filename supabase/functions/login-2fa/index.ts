/**
 * Two-factor sign-in.
 *
 * The browser never calls `signInWithPassword` itself. It posts credentials
 * here, this function checks them, and it returns *no session* until the
 * emailed code comes back. That ordering is the entire security value: a
 * password check done in the browser hands over a working token immediately,
 * so any "enter your code" screen rendered afterwards is decoration an
 * attacker skips by calling the API directly.
 *
 * Two actions:
 *   start  { email, password }        -> { needsCode: true, challengeId } | { needsCode: false, tokenHash }
 *   verify { challengeId, code }      -> { tokenHash }
 *
 * `tokenHash` is exchanged by the client for a real session via
 * `supabase.auth.verifyOtp({ token_hash, type: 'magiclink' })`.
 *
 * Secrets: SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY (auto),
 *          RESEND_API_KEY, MFA_FROM_EMAIL, MFA_ADMIN_EMAIL, MFA_REQUIRED.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';
import { corsHeaders as buildCorsHeaders, timingSafeEqual } from '../_shared/http.ts';

const CODE_TTL_MINUTES = 10;
const MAX_ATTEMPTS = 5;
/** Codes requested per address per window, before we stop sending. */
const MAX_SENDS_PER_WINDOW = 5;
const SEND_WINDOW_MINUTES = 15;

/** SHA-256, hex. Codes are never stored in the clear. */
async function sha256(input: string): Promise<string> {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
  return Array.from(new Uint8Array(bytes))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/** Six digits from the CSPRNG, not Math.random. */
function generateCode(): string {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return String(buf[0] % 1_000_000).padStart(6, '0');
}

function codeEmailHtml(code: string): string {
  return `<!doctype html><html><body style="margin:0;padding:24px;background:#f5f5f0;font-family:system-ui,sans-serif">
  <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:16px;padding:32px">
    <h1 style="margin:0 0 8px;font-size:20px;color:#1f4720">Your BhoomiX sign-in code</h1>
    <p style="margin:0 0 24px;color:#5c6b5c;font-size:14px">
      Enter this code to finish signing in. It expires in ${CODE_TTL_MINUTES} minutes.
    </p>
    <div style="font-size:34px;font-weight:700;letter-spacing:10px;text-align:center;
                color:#1f4720;background:#eef4e6;border-radius:12px;padding:18px 0">${code}</div>
    <p style="margin:24px 0 0;color:#8a8a80;font-size:12px;line-height:1.5">
      If you did not try to sign in, someone has your password. Change it now.
      Never share this code with anyone.
    </p>
  </div></body></html>`;
}

Deno.serve(async (req) => {
  // Fresh per invocation — see create-staff-account/index.ts for why this is
  // not a module-level variable.
  const corsHeaders = buildCorsHeaders(req);
  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
  const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
  const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const RESEND_KEY = Deno.env.get('RESEND_API_KEY');
  const FROM = Deno.env.get('MFA_FROM_EMAIL') ?? 'onboarding@resend.dev';
  const ADMIN_EMAIL = (Deno.env.get('MFA_ADMIN_EMAIL') ?? '').trim().toLowerCase();
  // Off by default. Turning this on before a sending domain is verified would
  // lock out every user whose inbox the provider cannot reach.
  const MFA_REQUIRED = (Deno.env.get('MFA_REQUIRED') ?? 'false').toLowerCase() === 'true';

  const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Invalid JSON' }, 400);
  }

  const action = String(body.action ?? '');

  /* ─────────────── start ─────────────── */
  if (action === 'start') {
    const email = String(body.email ?? '').trim().toLowerCase();
    const password = String(body.password ?? '');

    if (!email || !password) return json({ error: 'Email and password are required' }, 400);

    // Throwaway inboxes are refused before the password is even checked, so a
    // blocked domain cannot be used to probe which passwords are valid.
    const domain = email.split('@')[1] ?? '';
    const { data: blocked } = await admin
      .from('blocked_email_domains')
      .select('domain')
      .eq('domain', domain)
      .maybeSingle();
    if (blocked) {
      return json(
        { error: 'Use a permanent email address. Temporary inboxes are not accepted.' },
        403,
      );
    }

    // Password check happens on a throwaway anon client. Its session stays
    // here and is discarded; the browser gets nothing from this step.
    const probe = createClient(SUPABASE_URL, ANON_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { data: signIn, error: signInError } = await probe.auth.signInWithPassword({
      email,
      password,
    });
    if (signInError || !signIn.user) {
      // One message for both wrong-password and no-such-account: telling them
      // apart turns this endpoint into a way to enumerate who has an account.
      return json({ error: 'Invalid email or password' }, 401);
    }
    const userId = signIn.user.id;
    await probe.auth.signOut().catch(() => {});

    const isAdmin = ADMIN_EMAIL !== '' && email === ADMIN_EMAIL;

    // The admin account skips the code, and everyone skips it while the
    // feature is switched off, so sign-in keeps working until a verified
    // sending domain exists.
    if (isAdmin || !MFA_REQUIRED) {
      const { data: link, error: linkError } = await admin.auth.admin.generateLink({
        type: 'magiclink',
        email,
      });
      if (linkError || !link.properties?.hashed_token) {
        return json({ error: 'Could not complete sign-in' }, 500);
      }
      return json({ needsCode: false, tokenHash: link.properties.hashed_token });
    }

    if (!RESEND_KEY) {
      console.error('RESEND_API_KEY missing; cannot send a code');
      return json({ error: 'Sign-in codes are unavailable right now' }, 503);
    }

    // Rate limit by address so one account cannot be used to spray mail.
    const windowStart = new Date(Date.now() - SEND_WINDOW_MINUTES * 60_000).toISOString();
    const { count } = await admin
      .from('mfa_challenges')
      .select('id', { count: 'exact', head: true })
      .eq('email', email)
      .gte('created_at', windowStart);
    if ((count ?? 0) >= MAX_SENDS_PER_WINDOW) {
      return json({ error: 'Too many code requests. Wait a few minutes.' }, 429);
    }

    const code = generateCode();
    const { data: challenge, error: insertError } = await admin
      .from('mfa_challenges')
      .insert({
        email,
        user_id: userId,
        code_hash: await sha256(code),
        expires_at: new Date(Date.now() + CODE_TTL_MINUTES * 60_000).toISOString(),
      })
      .select('id')
      .single();
    if (insertError || !challenge) {
      console.error('could not store challenge:', insertError?.message);
      return json({ error: 'Could not start sign-in' }, 500);
    }

    const mail = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM,
        to: email,
        subject: `${code} is your BhoomiX sign-in code`,
        html: codeEmailHtml(code),
      }),
    });

    if (!mail.ok) {
      // Do not leave a live challenge behind for a code nobody received.
      await admin.from('mfa_challenges').delete().eq('id', challenge.id);
      console.error('code email failed:', mail.status, await mail.text());
      return json({ error: 'Could not send the code. Try again shortly.' }, 502);
    }

    return json({ needsCode: true, challengeId: challenge.id });
  }

  /* ─────────────── verify ─────────────── */
  if (action === 'verify') {
    const challengeId = String(body.challengeId ?? '');
    const code = String(body.code ?? '').trim();

    if (!challengeId || !/^\d{6}$/.test(code)) {
      return json({ error: 'Enter the six digit code' }, 400);
    }

    const { data: challenge } = await admin
      .from('mfa_challenges')
      .select('id, email, code_hash, expires_at, consumed_at, attempts')
      .eq('id', challengeId)
      .maybeSingle();

    if (!challenge) return json({ error: 'This code has expired. Sign in again.' }, 400);
    if (challenge.consumed_at) return json({ error: 'This code was already used.' }, 400);
    if (new Date(challenge.expires_at) < new Date()) {
      return json({ error: 'This code has expired. Sign in again.' }, 400);
    }
    if (challenge.attempts >= MAX_ATTEMPTS) {
      return json({ error: 'Too many wrong attempts. Sign in again.' }, 429);
    }

    const ok = timingSafeEqual(await sha256(code), challenge.code_hash);

    if (!ok) {
      await admin
        .from('mfa_challenges')
        .update({ attempts: challenge.attempts + 1 })
        .eq('id', challenge.id);
      const left = MAX_ATTEMPTS - (challenge.attempts + 1);
      return json(
        { error: left > 0 ? `That code is not right. ${left} tries left.` : 'Too many wrong attempts.' },
        401,
      );
    }

    // Burn it before minting a session, so a replayed request finds it spent
    // even if the caller fires the same code twice.
    const { error: consumeError } = await admin
      .from('mfa_challenges')
      .update({ consumed_at: new Date().toISOString() })
      .eq('id', challenge.id)
      .is('consumed_at', null);
    if (consumeError) return json({ error: 'Could not complete sign-in' }, 500);

    const { data: link, error: linkError } = await admin.auth.admin.generateLink({
      type: 'magiclink',
      email: challenge.email,
    });
    if (linkError || !link.properties?.hashed_token) {
      return json({ error: 'Could not complete sign-in' }, 500);
    }

    return json({ tokenHash: link.properties.hashed_token });
  }

  return json({ error: 'Unknown action' }, 400);
});
