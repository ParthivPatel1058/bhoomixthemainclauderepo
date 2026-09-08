/**
 * Crop and disease image analysis, backed by Gemini.
 *
 * Runs server-side so GEMINI_API_KEY never reaches the browser — a Vite
 * `VITE_*` variable would be inlined into the public bundle.
 *
 * POST { image: dataUrl, mode: 'crop' | 'disease', language: 'en' | 'hi' }
 */

import { corsHeaders as buildCorsHeaders } from '../_shared/http.ts';

// Pinned deliberately. The `-latest` aliases move under you, and gemini-2.5-*
// is closed to new API keys ("no longer available to new users").
const MODEL = 'gemini-3.5-flash';
const MAX_IMAGE_CHARS = 7_000_000; // ~5 MB once base64-encoded

type Mode = 'crop' | 'disease';
type Lang = 'en' | 'hi';

interface Parsed {
  mimeType: string;
  data: string;
  mode: Mode;
  language: Lang;
}

function validate(raw: unknown): { error: string } | { parsed: Parsed } {
  if (!raw || typeof raw !== 'object') return { error: 'Invalid request body' };
  const { image, mode, language } = raw as Record<string, unknown>;

  if (mode !== 'crop' && mode !== 'disease') {
    return { error: 'mode must be "crop" or "disease"' };
  }
  if (typeof image !== 'string' || !image.startsWith('data:image/')) {
    return { error: 'image must be a base64 data URL starting with "data:image/"' };
  }
  if (image.length > MAX_IMAGE_CHARS) {
    return { error: 'Image is too large. Maximum 5MB allowed' };
  }

  const match = image.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
  if (!match) return { error: 'Image must be base64-encoded' };

  return {
    parsed: {
      mimeType: match[1],
      data: match[2],
      mode,
      language: language === 'hi' ? 'hi' : 'en',
    },
  };
}

/** Gemini returns JSON matching this shape, so the UI never parses prose. */
function schemaFor(mode: Mode) {
  const common = {
    isPlant: { type: 'BOOLEAN' },
    crop: { type: 'STRING' },
    confidence: { type: 'NUMBER' },
    summary: { type: 'STRING' },
    advisory: { type: 'ARRAY', items: { type: 'STRING' } },
  };

  if (mode === 'crop') {
    return {
      type: 'OBJECT',
      properties: {
        ...common,
        stage: { type: 'STRING' },
        health: { type: 'STRING', enum: ['Healthy', 'Stressed', 'Diseased', 'Unknown'] },
      },
      required: ['isPlant', 'crop', 'confidence', 'summary', 'advisory', 'stage', 'health'],
    };
  }

  return {
    type: 'OBJECT',
    properties: {
      ...common,
      disease: { type: 'STRING' },
      severity: { type: 'STRING', enum: ['High', 'Medium', 'Low', 'None'] },
      symptoms: { type: 'STRING' },
      treatment: { type: 'ARRAY', items: { type: 'STRING' } },
    },
    required: ['isPlant', 'crop', 'confidence', 'summary', 'advisory', 'disease', 'severity', 'symptoms', 'treatment'],
  };
}

function promptFor(mode: Mode, language: Lang) {
  const langLine =
    language === 'hi'
      ? 'Write EVERY string value in Hindi (Devanagari script), including crop and disease names. Do not use English.'
      : 'Write every string value in plain English.';

  const audience =
    'You are an agronomy assistant for smallholder farmers in India. Advice must be practical, ' +
    'low-cost, locally available, and safe. Prefer cultural and organic measures first; if you name ' +
    'a chemical, give the active ingredient rather than a brand.';

  const notPlant =
    'If the photo does not clearly show a plant or crop, set isPlant to false, set confidence to 0, ' +
    'and say so in summary instead of guessing.';

  if (mode === 'crop') {
    return `${audience}

Identify the crop in this photo. ${notPlant}

- crop: the crop or plant name.
- stage: growth stage you can see (seedling, vegetative, tillering, flowering, fruiting, maturity).
- health: overall condition visible in the photo.
- confidence: 0 to 1, how sure you are of the identification.
- summary: two or three sentences on what you see.
- advisory: 3 to 5 specific actions for this crop at this stage right now.

${langLine}`;
  }

  return `${audience}

Diagnose the problem visible on this crop. ${notPlant}

- crop: the affected crop.
- disease: the most likely disease, pest or deficiency. If the plant looks healthy, use the word for "no disease detected" and set severity to None.
- severity: how far it has progressed.
- confidence: 0 to 1, how sure you are of the diagnosis.
- symptoms: the visible signs you based the diagnosis on.
- summary: two or three sentences a farmer can act on.
- treatment: 3 to 5 concrete treatment steps, most urgent first.
- advisory: 2 to 4 measures to stop it returning next season.

${langLine}`;
}

Deno.serve(async (req) => {
  // Fresh per invocation — see create-staff-account/index.ts for why this is
  // not a module-level variable: concurrent requests on one isolate would
  // otherwise be able to overwrite each other's Origin before either finishes.
  const corsHeaders = buildCorsHeaders(req);
  function json(body: unknown, status = 200) {
    return new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const apiKey = Deno.env.get('GEMINI_API_KEY');
  if (!apiKey) {
    console.error('GEMINI_API_KEY is not configured');
    return json({ error: 'Analysis is not configured' }, 500);
  }

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return json({ error: 'Invalid JSON in request body' }, 400);
  }

  const checked = validate(raw);
  if ('error' in checked) return json({ error: checked.error }, 400);
  const { mimeType, data, mode, language } = checked.parsed;

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
                { text: promptFor(mode, language) },
                { inline_data: { mime_type: mimeType, data } },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.2,
            responseMimeType: 'application/json',
            responseSchema: schemaFor(mode),
          },
        }),
      },
    );

    if (!res.ok) {
      // Log the provider's reason, but don't hand it back to the client.
      console.error('Gemini error', res.status, (await res.text()).slice(0, 500));
      if (res.status === 429) return json({ error: 'Too many requests. Try again shortly.' }, 429);
      return json({ error: 'Could not analyse the image right now' }, 502);
    }

    const body = await res.json();
    const text = body?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      console.error('Gemini returned no content', JSON.stringify(body).slice(0, 500));
      return json({ error: 'Could not analyse the image right now' }, 502);
    }

    let result: Record<string, unknown>;
    try {
      result = JSON.parse(text);
    } catch {
      console.error('Gemini returned non-JSON', text.slice(0, 300));
      return json({ error: 'Could not analyse the image right now' }, 502);
    }

    return json({ mode, language, result });
  } catch (e) {
    console.error('crop-vision failed', e);
    return json({ error: 'Could not analyse the image right now' }, 500);
  }
});
