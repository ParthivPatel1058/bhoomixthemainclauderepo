/**
 * UI string translation into the Eighth Schedule languages.
 *
 * English and Hindi ship hand-authored in the bundle. Everything else is
 * translated here on first request and cached in `public.translations`, so a
 * given string costs one model call for the entire user base.
 *
 * POST { lang: 'ta', texts: string[] } -> { translations: Record<source, out> }
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { corsHeaders as buildCorsHeaders, rateLimited, tooManyRequests } from '../_shared/http.ts';

const MODEL = 'gemini-3.5-flash';
const MAX_TEXTS = 100;
/* These are UI strings — a label, a sentence of help text. Anything longer is
   not something this endpoint is for, and without a cap `MAX_TEXTS` alone
   permits a multi-megabyte body straight into a paid model. */
const MAX_TEXT_CHARS = 600;
const MAX_TOTAL_CHARS = 20_000;

/* Runs before sign-in (the welcome screen is localised), so a JWT cannot be
   required. The window is generous for a real page load — a fresh language
   fetches its strings in a couple of batched calls — and tight enough that a
   script cannot sit on the endpoint burning Gemini quota. */
const RATE = { limit: 30, windowMs: 60_000 };

const LANGUAGE_NAMES: Record<string, string> = {
  as: 'Assamese', bn: 'Bengali', brx: 'Bodo', doi: 'Dogri', gu: 'Gujarati',
  hi: 'Hindi', kn: 'Kannada', ks: 'Kashmiri', kok: 'Konkani', mai: 'Maithili',
  ml: 'Malayalam', mni: 'Manipuri (Meitei)', mr: 'Marathi', ne: 'Nepali',
  or: 'Odia', pa: 'Punjabi', sa: 'Sanskrit', sat: 'Santali', sd: 'Sindhi',
  ta: 'Tamil', te: 'Telugu', ur: 'Urdu',
};

/** Must match the client's hash exactly or the cache never hits. */
async function hash(text: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(digest))
    .slice(0, 16)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

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

  const apiKey = Deno.env.get('GEMINI_API_KEY');
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!apiKey || !supabaseUrl || !serviceKey) {
    console.error('translate is not configured');
    return json({ error: 'Translation is not configured' }, 500);
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Invalid JSON in request body' }, 400);
  }

  const lang = typeof body.lang === 'string' ? body.lang : '';
  const texts = Array.isArray(body.texts) ? body.texts.filter((t) => typeof t === 'string') : [];

  if (!LANGUAGE_NAMES[lang]) return json({ error: 'Unsupported language' }, 400);
  if (texts.length === 0) return json({ translations: {} });
  if (texts.length > MAX_TEXTS) return json({ error: `At most ${MAX_TEXTS} strings per call` }, 400);

  const oversize = (texts as string[]).find((t) => t.length > MAX_TEXT_CHARS);
  if (oversize !== undefined) {
    return json({ error: `Each string must be ${MAX_TEXT_CHARS} characters or less` }, 400);
  }
  const totalChars = (texts as string[]).reduce((n, t) => n + t.length, 0);
  if (totalChars > MAX_TOTAL_CHARS) {
    return json({ error: `At most ${MAX_TOTAL_CHARS} characters per call` }, 400);
  }

  const db = createClient(supabaseUrl, serviceKey);
  const unique = [...new Set(texts as string[])];
  const hashes = await Promise.all(unique.map(hash));
  const byHash = new Map(unique.map((t, i) => [hashes[i], t]));

  const out: Record<string, string> = {};

  // Serve whatever is already cached.
  const { data: cached } = await db
    .from('translations')
    .select('source_hash, translated')
    .eq('lang', lang)
    .in('source_hash', hashes);

  for (const row of cached ?? []) {
    const src = byHash.get(row.source_hash);
    if (src) out[src] = row.translated;
  }

  const missing = unique.filter((t) => !(t in out));
  if (missing.length === 0) return json({ translations: out, cached: unique.length, fresh: 0 });

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text:
                    `Translate each string into ${LANGUAGE_NAMES[lang]}, for the user interface ` +
                    `of an Indian farming and commerce app used by smallholder farmers.\n\n` +
                    `Rules:\n` +
                    `- Return a JSON array of translated strings, same length and order as the input.\n` +
                    `- Use the language's own script.\n` +
                    `- These are UI labels and buttons: keep them short and idiomatic, not literal.\n` +
                    `- Keep product names (BhoomiX, Kisan Mart, Agri Market) untranslated.\n` +
                    `- Preserve any leading/trailing punctuation, ellipses and "₹" symbols.\n` +
                    `- Placeholders in curly braces such as {id} or {q} are substituted at\n` +
                    `  runtime: copy them through exactly, and position them naturally.\n` +
                    `- Use the everyday word a farmer would use, not formal or Sanskritised register.\n\n` +
                    JSON.stringify(missing),
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.1,
            responseMimeType: 'application/json',
            responseSchema: { type: 'ARRAY', items: { type: 'STRING' } },
          },
        }),
      },
    );

    if (!res.ok) {
      console.error('Gemini error', res.status, (await res.text()).slice(0, 300));
      // Fall back to the English source rather than failing the page.
      return json({ translations: out, error: 'partial' });
    }

    const payload = await res.json();
    const raw = payload?.candidates?.[0]?.content?.parts?.[0]?.text;
    const list = raw ? JSON.parse(raw) : null;

    if (!Array.isArray(list) || list.length !== missing.length) {
      console.error('translate: length mismatch', list?.length, 'vs', missing.length);
      return json({ translations: out, error: 'partial' });
    }

    const rows = missing.map((src, i) => ({
      source_hash: hashes[unique.indexOf(src)],
      source_text: src,
      lang,
      translated: String(list[i]),
    }));

    for (const r of rows) out[r.source_text] = r.translated;

    // Concurrent callers may race on the same string; the unique constraint
    // makes that harmless.
    const { error } = await db.from('translations').upsert(rows, {
      onConflict: 'source_hash,lang',
      ignoreDuplicates: true,
    });
    if (error) console.error('cache write failed', error.message);

    return json({ translations: out, cached: unique.length - missing.length, fresh: missing.length });
  } catch (e) {
    console.error('translate failed', e);
    return json({ translations: out, error: 'partial' });
  }
});
