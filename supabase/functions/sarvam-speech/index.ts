/**
 * Sarvam text-to-speech — natural Indic voices for the advisory.
 *
 * The browser's own `speechSynthesis` reads Indian languages with whatever
 * voice the device happens to ship, which on most Android handsets means a
 * flat English voice mangling Devanagari. Sarvam returns a real voice for
 * eleven of the languages, so those go through here and the rest fall back to
 * the browser client-side.
 *
 *   supabase secrets set SARVAM_API_KEY=sk_...
 *
 * The key is server-side only. A VITE_ variable would compile it into the
 * public bundle.
 *
 * POST { text: string, language: string }  ->  { audio: base64Wav, format, sampleRate }
 *
 * Verified against the live API on 15 Sep 2026:
 *   - `bulbul:v2` is DEPRECATED and 400s; `bulbul:v3` is current.
 *   - v3 speakers are a different set from v2 (`anushka` 400s on v3).
 *   - Output is mono 16-bit PCM WAV at 22.05 kHz.
 */

import { corsHeaders as buildCorsHeaders, rateLimited, tooManyRequests } from '../_shared/http.ts';
import { toSarvamCode } from '../_shared/sarvam.ts';

const SARVAM_TTS_URL = 'https://api.sarvam.ai/text-to-speech';

/** Current model. v2 is deprecated and rejected outright. */
const TTS_MODEL = 'bulbul:v3';

/**
 * Pinned rather than left to the default, so the assistant keeps one voice.
 * A farmer learns the voice; silently changing it reads as a different app.
 */
const TTS_SPEAKER = 'priya';

/**
 * The eleven languages Sarvam actually voices — probed against the live API,
 * the other twelve return 400. Kept here as the server-side gate; the client
 * has the same list so it can skip the round trip entirely.
 */
const VOICED = new Set([
  'en', 'hi', 'bn', 'gu', 'kn', 'ml', 'mr', 'or', 'pa', 'ta', 'te',
]);

/** Advisory replies are 2-3 sentences; this is a guard, not a limit users hit. */
const MAX_CHARS = 1000;

const TIMEOUT_MS = 15_000;

/* Synthesis costs money per call and returns ~100 KB a time. Twenty a minute
   covers a farmer listening to every answer and replaying a few, and stops a
   script turning the endpoint into a bill. */
const RATE = { limit: 20, windowMs: 60_000 };

Deno.serve(async (req) => {
  // Fresh per invocation — see create-staff-account/index.ts for why this is
  // not a module-level variable.
  const corsHeaders = buildCorsHeaders(req);
  function json(body: unknown, status = 200) {
    return new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  if (rateLimited(req, RATE)) return tooManyRequests(corsHeaders, 60);

  const apiKey = Deno.env.get('SARVAM_API_KEY');
  if (!apiKey) {
    console.error('sarvam-speech is not configured (SARVAM_API_KEY missing)');
    return json({ error: 'Speech is not configured' }, 500);
  }

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return json({ error: 'Invalid JSON in request body' }, 400);
  }

  const { text, language } = (raw ?? {}) as Record<string, unknown>;

  if (typeof text !== 'string' || text.trim().length === 0) {
    return json({ error: 'text is required' }, 400);
  }
  if (typeof language !== 'string' || !VOICED.has(language)) {
    // Not an error: the client is expected to fall back to the browser voice.
    return json({ error: 'No Sarvam voice for this language', voiced: false }, 422);
  }

  const targetCode = toSarvamCode(language);
  if (!targetCode) return json({ error: 'Unknown language', voiced: false }, 422);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(SARVAM_TTS_URL, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'api-subscription-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: text.trim().slice(0, MAX_CHARS),
        target_language_code: targetCode,
        model: TTS_MODEL,
        speaker: TTS_SPEAKER,
      }),
    });

    if (!res.ok) {
      // Log the reason but never return it — Sarvam echoes request details.
      const detail = (await res.text()).slice(0, 300);
      console.error('Sarvam TTS failed', res.status, targetCode, detail);

      if (res.status === 401 || res.status === 403) {
        return json({ error: 'The speech key was rejected. Check SARVAM_API_KEY.' }, 502);
      }
      if (res.status === 429) {
        return json({ error: 'Too many requests. Please try again in a moment.' }, 429);
      }
      return json({ error: 'Speech is unavailable right now' }, 502);
    }

    const body = await res.json();
    const audio = body?.audios?.[0];

    if (typeof audio !== 'string' || audio.length === 0) {
      console.error('Sarvam TTS returned no audio', JSON.stringify(body).slice(0, 300));
      return json({ error: 'Speech returned no audio' }, 502);
    }

    return json({ audio, format: 'wav', sampleRate: 22050 });
  } catch (e) {
    if (e instanceof DOMException && e.name === 'AbortError') {
      console.error('Sarvam TTS timed out after', TIMEOUT_MS, 'ms');
      return json({ error: 'Speech timed out' }, 504);
    }
    console.error('Sarvam TTS threw', e instanceof Error ? e.message : String(e));
    return json({ error: 'Speech is unavailable right now' }, 502);
  } finally {
    clearTimeout(timer);
  }
});
