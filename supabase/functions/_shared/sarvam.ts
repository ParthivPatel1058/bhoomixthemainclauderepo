/**
 * Sarvam AI — language identification and translation for the Eighth Schedule.
 *
 * The advisory model answers well in English and Hindi and poorly in the other
 * twenty languages. Sarvam closes that gap: detect what the farmer actually
 * wrote, ask the model in English, translate the answer back. The farmer sees
 * only their own language.
 *
 *   supabase secrets set SARVAM_API_KEY=sk_...
 *
 * The key is a server-side secret. It must never be exposed as a VITE_
 * variable — that would compile it into the public bundle.
 *
 * Verified against the live API on 15 Sep 2026:
 *   - `text-lid` identifies Devanagari Hindi AND romanised Hinglish as hi-IN
 *     (script_code 'Latn'), which is what makes "hi kaise ho" answer in Hindi.
 *   - `translate` with the DEFAULT model covers only 10 Indian languages.
 *     `sarvam-translate:v1` covers all 22, including Bodo, Santali, Manipuri,
 *     Kashmiri and Sindhi — so that model is pinned below, not the default.
 */

const SARVAM_BASE = 'https://api.sarvam.ai';

/** The only model that covers all 22 scheduled languages. See note above. */
const TRANSLATE_MODEL = 'sarvam-translate:v1';

/** Sarvam rejects oversized bodies; advisory replies are 2-3 sentences anyway. */
const MAX_TRANSLATE_CHARS = 1800;

const TIMEOUT_MS = 12_000;

/**
 * App language code → Sarvam code.
 *
 * Odia is the trap: the app uses the ISO 639-1 `or`, Sarvam expects `od-IN`
 * and returns 400 for `or-IN`. Verified against the live API.
 */
const TO_SARVAM: Record<string, string> = {
  en: 'en-IN', hi: 'hi-IN', as: 'as-IN', bn: 'bn-IN', brx: 'brx-IN',
  doi: 'doi-IN', gu: 'gu-IN', kn: 'kn-IN', ks: 'ks-IN', kok: 'kok-IN',
  mai: 'mai-IN', ml: 'ml-IN', mni: 'mni-IN', mr: 'mr-IN', ne: 'ne-IN',
  or: 'od-IN', pa: 'pa-IN', sa: 'sa-IN', sat: 'sat-IN', sd: 'sd-IN',
  ta: 'ta-IN', te: 'te-IN', ur: 'ur-IN',
};

const FROM_SARVAM: Record<string, string> = Object.fromEntries(
  Object.entries(TO_SARVAM).map(([app, sarvam]) => [sarvam, app]),
);

export function toSarvamCode(appCode: string): string | null {
  return TO_SARVAM[appCode] ?? null;
}

export function fromSarvamCode(sarvamCode: string): string | null {
  return FROM_SARVAM[sarvamCode] ?? null;
}

/** Every language the round-trip can serve. */
export function isTranslatable(appCode: string): boolean {
  return appCode in TO_SARVAM;
}

async function sarvamFetch(path: string, key: string, body: unknown): Promise<unknown | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(`${SARVAM_BASE}${path}`, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'api-subscription-key': key,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      // Never surface Sarvam's body to the browser — it can echo the key.
      console.error('Sarvam', path, 'failed', res.status, (await res.text()).slice(0, 300));
      return null;
    }

    return await res.json();
  } catch (e) {
    console.error('Sarvam', path, 'threw', e instanceof Error ? e.message : String(e));
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Identify the language of `text`, as an app language code.
 *
 * Returns null when Sarvam cannot tell — the caller then falls back to the
 * language the user picked in the UI rather than guessing.
 */
export async function detectLanguage(text: string, key: string): Promise<string | null> {
  const trimmed = text.trim();
  // Two or three characters carry no signal; a wrong guess here would answer
  // an entire conversation in the wrong language.
  if (trimmed.length < 4) return null;

  const data = await sarvamFetch('/text-lid', key, {
    input: trimmed.slice(0, MAX_TRANSLATE_CHARS),
  });
  if (!data || typeof data !== 'object') return null;

  const code = (data as { language_code?: unknown }).language_code;
  if (typeof code !== 'string') return null;

  return fromSarvamCode(code);
}

/**
 * Translate `text` between two app language codes.
 *
 * Returns null on any failure so the caller can fall back to the untranslated
 * text — a reply in the wrong language still beats no reply at all.
 */
export async function translateText(
  text: string,
  fromApp: string,
  toApp: string,
  key: string,
): Promise<string | null> {
  const trimmed = text.trim();
  if (!trimmed) return null;
  if (fromApp === toApp) return trimmed;

  const source = toSarvamCode(fromApp);
  const target = toSarvamCode(toApp);
  if (!source || !target) return null;

  const data = await sarvamFetch('/translate', key, {
    input: trimmed.slice(0, MAX_TRANSLATE_CHARS),
    source_language_code: source,
    target_language_code: target,
    model: TRANSLATE_MODEL,
  });
  if (!data || typeof data !== 'object') return null;

  const out = (data as { translated_text?: unknown }).translated_text;
  return typeof out === 'string' && out.trim() ? out.trim() : null;
}
