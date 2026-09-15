/**
 * Sarvam speech-to-text — hears any Indian language and says which one.
 *
 * The browser's own `SpeechRecognition` must be told the language up front, so
 * a farmer whose UI is in English but who speaks Hindi gets transcribed by an
 * English recogniser and comes out as nonsense. Sarvam identifies the language
 * from the audio itself, which is what makes "speak Hindi, get Hindi" work
 * regardless of the UI setting.
 *
 *   supabase secrets set SARVAM_API_KEY=sk_...
 *
 * POST { audio: base64Wav, language?: appCode | 'unknown' }
 * ->   { transcript, language, confidence }
 *
 * Verified against the live API on 15 Sep 2026: `language_code: 'unknown'`
 * returns the detected code alongside the transcript — Hindi speech came back
 * as hi-IN at 0.996 confidence. The endpoint sniffs the real container rather
 * than trusting the declared MIME type.
 */

import { corsHeaders as buildCorsHeaders, rateLimited, tooManyRequests } from '../_shared/http.ts';
import { fromSarvamCode, toSarvamCode } from '../_shared/sarvam.ts';

const SARVAM_STT_URL = 'https://api.sarvam.ai/speech-to-text';

/** Current ASR model. Auto-detection lives here, not in the older saarika:v1. */
const STT_MODEL = 'saarika:v2.5';

/**
 * ~30 s of 16 kHz mono 16-bit PCM once base64 has inflated it by a third.
 * A spoken question is a few seconds; this is a guard, not a usage limit.
 */
const MAX_AUDIO_CHARS = 1_400_000;

const TIMEOUT_MS = 20_000;

/* Transcription is billed per call. Thirty a minute sustains a back-and-forth
   conversation with room for retries, and still caps what a loose script can
   spend. */
const RATE = { limit: 30, windowMs: 60_000 };

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
    console.error('sarvam-listen is not configured (SARVAM_API_KEY missing)');
    return json({ error: 'Listening is not configured' }, 500);
  }

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return json({ error: 'Invalid JSON in request body' }, 400);
  }

  const { audio, language } = (raw ?? {}) as Record<string, unknown>;

  if (typeof audio !== 'string' || audio.length === 0) {
    return json({ error: 'audio is required' }, 400);
  }
  if (audio.length > MAX_AUDIO_CHARS) {
    return json({ error: 'Recording is too long. Please ask a shorter question.' }, 413);
  }

  /* 'unknown' is the point of this endpoint — it lets Sarvam pick the language
     from the audio. A specific code is only honoured when the caller insists. */
  const requested =
    typeof language === 'string' && language !== 'unknown' ? toSarvamCode(language) : null;
  const languageCode = requested ?? 'unknown';

  let bytes: Uint8Array;
  try {
    const binary = atob(audio);
    bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  } catch {
    return json({ error: 'audio must be base64' }, 400);
  }

  const form = new FormData();
  form.append('file', new Blob([bytes], { type: 'audio/wav' }), 'speech.wav');
  form.append('model', STT_MODEL);
  form.append('language_code', languageCode);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(SARVAM_STT_URL, {
      method: 'POST',
      signal: controller.signal,
      // No Content-Type: fetch sets the multipart boundary itself.
      headers: { 'api-subscription-key': apiKey },
      body: form,
    });

    if (!res.ok) {
      const detail = (await res.text()).slice(0, 300);
      console.error('Sarvam STT failed', res.status, detail);

      if (res.status === 401 || res.status === 403) {
        return json({ error: 'The speech key was rejected. Check SARVAM_API_KEY.' }, 502);
      }
      if (res.status === 429) {
        return json({ error: 'Too many requests. Please try again in a moment.' }, 429);
      }
      return json({ error: 'Listening is unavailable right now' }, 502);
    }

    const body = await res.json();
    const transcript = typeof body?.transcript === 'string' ? body.transcript.trim() : '';

    /* Silence and unintelligible audio both come back empty; that is not an
       error, it just means there was nothing to answer. */
    const detected =
      typeof body?.language_code === 'string' ? fromSarvamCode(body.language_code) : null;

    return json({
      transcript,
      language: detected,
      confidence: typeof body?.language_probability === 'number' ? body.language_probability : null,
    });
  } catch (e) {
    if (e instanceof DOMException && e.name === 'AbortError') {
      console.error('Sarvam STT timed out after', TIMEOUT_MS, 'ms');
      return json({ error: 'Listening timed out' }, 504);
    }
    console.error('Sarvam STT threw', e instanceof Error ? e.message : String(e));
    return json({ error: 'Listening is unavailable right now' }, 502);
  } finally {
    clearTimeout(timer);
  }
});
