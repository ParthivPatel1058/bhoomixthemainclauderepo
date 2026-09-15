/**
 * AI client for bhoomix crop vision and Kisan advisory chat.
 *
 * Calls the Supabase Edge Functions rather than a model provider directly, so
 * no provider key is ever shipped to the browser. A Vite `VITE_*` variable is
 * inlined into the public bundle at build time — anyone can read it in DevTools
 * — which is why the keys live in Supabase secrets instead.
 *
 *   crop-vision    structured crop identification and disease diagnosis
 *   kisan-ai-chat  advisory chat, text and image
 *
 * Set the provider keys once, server-side:
 *   supabase secrets set GEMINI_API_KEY=...   used by crop-vision and translate
 *   supabase secrets set NVIDIA_API_KEY=...   used by kisan-ai-chat
 *
 * The exported names are unchanged so the two calling pages (CropDisease,
 * KisanHelp) did not have to be touched.
 */

import { supabase } from '@/integrations/supabase/client';

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */

export interface CropVisionResult {
  isPlant: boolean;
  crop: string;
  confidence: number;
  summary: string;
  advisory: string[];
  stage?: string;
  health?: string;
  disease?: string;
  severity?: string;
  symptoms?: string;
  treatment?: string[];
}

/* ------------------------------------------------------------------ */
/* Internal helpers                                                   */
/* ------------------------------------------------------------------ */

/**
 * `crop-vision` still authors its prompts in English and Hindi only, so its
 * language argument is flattened. `kisan-ai-chat` no longer needs this — it
 * takes any Eighth Schedule code and handles the translation itself.
 */
function normaliseLanguage(language: string): 'en' | 'hi' {
  return language === 'hi' ? 'hi' : 'en';
}

/**
 * An advisory answer plus the language it is actually written in.
 *
 * `language` is not always the language that was requested: the function
 * detects what the farmer typed and answers in that instead, so someone
 * browsing in English who types "hi kaise ho" gets `language: 'hi'` back. The
 * browser needs to know, or it speaks Hindi text with an English voice.
 */
export interface KisanReply {
  reply: string;
  language: string;
}

/**
 * Older deployments of `kisan-ai-chat` answer with `{ reply }` alone. Falling
 * back to the requested language keeps this client working against a function
 * that has not been redeployed yet.
 */
function asKisanReply(data: { reply: string; language?: string }, requested: string): KisanReply {
  return { reply: data.reply, language: data.language || requested };
}

/**
 * The edge functions answer failures with `{ error: string }` and a non-2xx
 * status. supabase-js turns that into a FunctionsHttpError and hangs the raw
 * Response off `context`, so the readable message has to be dug out of there.
 */
async function readEdgeError(error: unknown): Promise<string | null> {
  const context = (error as { context?: unknown }).context;
  if (!context || typeof (context as Response).json !== 'function') return null;

  try {
    const payload = await (context as Response).json();
    return typeof payload?.error === 'string' ? payload.error : null;
  } catch {
    return null;
  }
}

async function invokeFunction<T>(name: string, body: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.functions.invoke<T>(name, { body });

  if (error) {
    const message = await readEdgeError(error);
    console.error(`Edge function "${name}" failed`, message ?? error);
    throw new Error(message ?? 'Could not reach the AI service right now');
  }

  if (!data) throw new Error('The AI returned an empty response');
  return data;
}

/* ------------------------------------------------------------------ */
/* Crop Vision (crop detection + disease diagnosis)                   */
/* ------------------------------------------------------------------ */

/**
 * Analyse a crop or disease image.
 *
 * The prompt, the response schema and the model all live in the `crop-vision`
 * edge function, so the diagnosis stays identical no matter which client asks.
 */
export async function analyzeCropImage(
  imageDataUrl: string,
  mode: 'crop' | 'disease',
  language: string,
): Promise<{ mode: string; language: string; result: CropVisionResult }> {
  if (!imageDataUrl.startsWith('data:image/')) {
    throw new Error('Image must be a base64 data URL');
  }

  return invokeFunction<{ mode: string; language: string; result: CropVisionResult }>(
    'crop-vision',
    { image: imageDataUrl, mode, language: normaliseLanguage(language) },
  );
}

/* ------------------------------------------------------------------ */
/* Kisan AI Chat (text + image)                                       */
/* ------------------------------------------------------------------ */

/**
 * Send a text question to the Kisan advisory chat.
 *
 * `language` is the UI language, used only as a fallback — the function
 * detects the language of `message` itself and answers in that.
 */
export async function kisanChat(message: string, language: string): Promise<KisanReply> {
  const data = await invokeFunction<{ reply: string; language?: string }>('kisan-ai-chat', {
    message,
    type: 'text',
    language,
    autoDetect: true,
  });

  return asKisanReply(data, language);
}

/** Analyse a crop photo through the Kisan advisory chat. */
export async function kisanImageAnalysis(
  imageDataUrl: string,
  language: string,
): Promise<KisanReply> {
  if (!imageDataUrl.startsWith('data:image/')) {
    throw new Error('Image must be a base64 data URL');
  }

  const data = await invokeFunction<{ reply: string; language?: string }>('kisan-ai-chat', {
    image: imageDataUrl,
    type: 'image',
    language,
    // Nothing was typed, so there is no text to detect from — honour the UI.
    autoDetect: false,
  });

  return asKisanReply(data, language);
}

/**
 * Ask a question *about* a camera frame.
 *
 * The live-camera advisory captures a still from the back camera and sends it
 * with whatever the farmer just said, so the answer addresses the actual
 * question ("is this ready to harvest?") rather than running a generic
 * diagnosis. Falls back to a plain diagnosis prompt server-side when the
 * question is empty.
 */
export async function kisanVisionChat(
  imageDataUrl: string,
  question: string,
  language: string,
): Promise<KisanReply> {
  if (!imageDataUrl.startsWith('data:image/')) {
    throw new Error('Image must be a base64 data URL');
  }

  const asked = question.trim();

  const data = await invokeFunction<{ reply: string; language?: string }>('kisan-ai-chat', {
    image: imageDataUrl,
    message: asked || undefined,
    type: 'image',
    language,
    // The spoken question carries the language signal when there is one.
    autoDetect: asked.length > 0,
  });

  return asKisanReply(data, language);
}

/**
 * Whether the AI features can be reached.
 *
 * The provider key is now a server-side secret the browser cannot see, so the
 * only thing checkable from here is that Supabase itself is configured. A
 * missing provider key surfaces later as a clear error from the edge function.
 */
export function isGeminiConfigured(): boolean {
  return Boolean(
    import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
  );
}
