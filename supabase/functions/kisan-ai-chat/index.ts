/**
 * Kisan advisory chat — text questions and crop-photo analysis.
 *
 * Backed by NVIDIA NIM (https://integrate.api.nvidia.com/v1), an
 * OpenAI-compatible gateway. The key is a server-side secret so it never
 * reaches the browser:
 *
 *   supabase secrets set NVIDIA_API_KEY=nvapi-...
 *   supabase secrets set NVIDIA_MODEL=meta/llama-3.2-11b-vision-instruct  # optional
 *
 * On the model default: the 90B sibling reads like the obvious choice and is
 * not usable here — verified 6 Sep 2026, it did not answer a one-word text
 * prompt inside 40s, which is past the deadline below and past what a farmer
 * on a village connection will wait. The 11B answers in a couple of seconds
 * and takes the same inline image payloads.
 *
 * The base URL, model and key all come from secrets rather than the source, so
 * moving provider is a secret change instead of a redeploy. If NVIDIA_API_KEY
 * is absent the function falls back to the previous AgentRouter secrets, so
 * chat keeps working in the window between deploying this and setting them.
 *
 * POST { message?: string, image?: dataUrl, type?: 'text' | 'image', language?: 'en' | 'hi' }
 * ->   { reply: string }  |  { error: string }
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const NVIDIA_BASE = 'https://integrate.api.nvidia.com/v1';
const NVIDIA_MODEL = 'meta/llama-3.2-11b-vision-instruct';

const AGENTROUTER_BASE = 'https://agentrouter.org/v1';
const AGENTROUTER_MODEL = 'claude-opus-5';

interface Provider {
  /** Names the secrets in error text, so a 401 says which key to check. */
  name: string;
  url: string;
  key: string;
  model: string;
  keyVar: string;
  modelVar: string;
}

/** NVIDIA when its key is set; otherwise the AgentRouter secrets already in place. */
function resolveProvider(): Provider | null {
  const nvidia = Deno.env.get('NVIDIA_API_KEY');
  if (nvidia) {
    return {
      name: 'NVIDIA NIM',
      url: `${Deno.env.get('NVIDIA_BASE_URL') ?? NVIDIA_BASE}/chat/completions`,
      key: nvidia,
      model: Deno.env.get('NVIDIA_MODEL') ?? NVIDIA_MODEL,
      keyVar: 'NVIDIA_API_KEY',
      modelVar: 'NVIDIA_MODEL',
    };
  }

  const agentRouter = Deno.env.get('AGENTROUTER_API_KEY');
  if (agentRouter) {
    return {
      name: 'AgentRouter',
      url: `${AGENTROUTER_BASE}/chat/completions`,
      key: agentRouter,
      model: Deno.env.get('AGENTROUTER_MODEL') ?? AGENTROUTER_MODEL,
      keyVar: 'AGENTROUTER_API_KEY',
      modelVar: 'AGENTROUTER_MODEL',
    };
  }

  return null;
}

// The previous version had no timeout. When the upstream stalled, the worker
// ran until Supabase killed it — the platform answered HTTP 546
// WORKER_RESOURCE_LIMIT and the UI sat on "Working on it..." forever. A hard
// deadline well inside the platform limit turns that into a real error.
const TIMEOUT_MS = 25_000;

const MAX_MESSAGE_CHARS = 2_000;
const MAX_IMAGE_CHARS = 7_000_000; // ~5 MB once base64-encoded

type Parsed = {
  message?: string;
  image?: string;
  type?: 'text' | 'image';
  language: 'en' | 'hi';
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function validate(raw: unknown): { error: string } | { parsed: Parsed } {
  if (!raw || typeof raw !== 'object') return { error: 'Invalid request body' };

  const { message, image, type, language } = raw as Record<string, unknown>;

  if (type !== undefined && type !== 'text' && type !== 'image') {
    return { error: 'Invalid type. Must be "text" or "image"' };
  }

  if (type !== 'image') {
    if (typeof message !== 'string' || message.trim().length === 0) {
      return { error: 'Message is required and must be a non-empty string' };
    }
    if (message.length > MAX_MESSAGE_CHARS) {
      return { error: `Message must be ${MAX_MESSAGE_CHARS} characters or less` };
    }
  }

  if (type === 'image') {
    if (typeof image !== 'string' || !image.startsWith('data:image/')) {
      return { error: 'Image must be a base64 data URL starting with "data:image/"' };
    }
    if (image.length > MAX_IMAGE_CHARS) {
      return { error: 'Image is too large. Maximum 5MB allowed' };
    }
  }

  return {
    parsed: {
      message: typeof message === 'string' ? message.trim() : undefined,
      image: typeof image === 'string' ? image : undefined,
      type: type as 'text' | 'image' | undefined,
      language: language === 'hi' ? 'hi' : 'en',
    },
  };
}

/**
 * Identity guardrail: the assistant presents only as BhoomiX AgriNova and
 * never names the model or the company behind it. The blocklist has to cover
 * every provider reachable through the gateway, not just the current one.
 */
const IDENTITY_EN =
  'Your name is BhoomiX AgriNova, an AI assistant trained by BhoomiX for Indian agriculture. ' +
  'If anyone asks what model, AI, LLM, or company you are, who built or trained you, or which ' +
  'technology powers you, you must ONLY reply that you are trained by BhoomiX AgriNova. ' +
  'Never mention Anthropic, Claude, OpenAI, ChatGPT, GPT, Google, Gemini, Meta, Llama, DeepSeek, ' +
  'NVIDIA, AgentRouter, or any other company, provider, gateway or model name. ';

const IDENTITY_HI =
  'आपका नाम BhoomiX AgriNova है, जो भारतीय कृषि के लिए BhoomiX द्वारा प्रशिक्षित एक AI सहायक है। ' +
  'यदि कोई पूछे कि आप कौन-सा मॉडल, AI, LLM या कंपनी हैं, आपको किसने बनाया या प्रशिक्षित किया, या ' +
  'आपको कौन-सी तकनीक चलाती है, तो आपको केवल यह कहना है कि आप BhoomiX AgriNova द्वारा प्रशिक्षित हैं। ' +
  'Anthropic, Claude, OpenAI, ChatGPT, GPT, Google, Gemini, Meta, Llama, DeepSeek, NVIDIA, ' +
  'AgentRouter या किसी अन्य कंपनी, प्रदाता या मॉडल का नाम कभी न बताएं। ';

function systemPromptFor(parsed: Parsed): string {
  const isHindi = parsed.language === 'hi';
  const identity = isHindi ? IDENTITY_HI : IDENTITY_EN;

  if (parsed.type === 'image') {
    return isHindi
      ? identity +
          'आप फसल रोगों में विशेषज्ञता रखने वाले एक पादप रोगविज्ञानी हैं। ' +
          'पहले यह तय करें कि तस्वीर में वाकई कोई पौधा है या नहीं। यदि नहीं, या तस्वीर धुंधली या बहुत अंधेरी है, तो यही स्पष्ट कहें और प्रभावित पत्तियों की साफ़ तस्वीर माँगें — किसी रोग का नाम न बताएँ। अन्यथा केवल मुख्य बिंदुओं में संक्षिप्त विश्लेषण दें:\n' +
          '• रोग का नाम\n• गंभीरता\n• उपचार (1-2 उपाय)\n• रोकथाम टिप\n\nलंबा विवरण न दें, केवल मुख्य बातें।'
      : identity +
          'You are an expert plant pathologist. First decide whether the image actually shows a ' +
          'plant. If it does not, or it is too blurred or too dark to read, say exactly that and ask ' +
          'for a clearer photo of the affected leaves — do NOT name a disease. Otherwise give a ' +
          'BRIEF analysis in key highlights only:\n' +
          '• Disease name\n• Severity level\n• Treatment (1-2 methods)\n• Prevention tip\n\n' +
          'Do NOT write long descriptions. Keep it brief and highlight main points only.';
  }

  return isHindi
    ? identity +
        'आप भारतीय किसानों की मदद करने वाले एक विशेषज्ञ कृषि सलाहकार हैं। फसलों, उर्वरकों, कीट नियंत्रण ' +
        'और खेती की तकनीकों के बारे में स्पष्ट, व्यावहारिक सलाह दें। जवाब 2-3 वाक्यों में संक्षिप्त और कार्रवाई योग्य रखें।'
    : identity +
        'You are an expert agricultural advisor helping Indian farmers. Provide clear, practical ' +
        'advice about crops, fertilizers, pest control, and farming techniques. Keep answers concise ' +
        'and actionable in 2-3 sentences.';
}

/** OpenAI-compatible content: a plain string for text, a parts array for vision. */
function userContentFor(parsed: Parsed) {
  if (parsed.type === 'image' && parsed.image) {
    const prompt =
      parsed.language === 'hi'
        ? 'इस फसल की तस्वीर का विश्लेषण करें। केवल मुख्य बिंदुओं में संक्षिप्त जवाब दें।'
        : 'Analyze this crop image. Provide brief answer in key highlights only.';

    return [
      { type: 'text', text: prompt },
      { type: 'image_url', image_url: { url: parsed.image } },
    ];
  }

  return parsed.message ?? '';
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const provider = resolveProvider();
  if (!provider) {
    console.error('No AI key configured (looked for NVIDIA_API_KEY, AGENTROUTER_API_KEY)');
    return json(
      { error: 'AI is not configured. Add NVIDIA_API_KEY to the Edge Function secrets.' },
      500,
    );
  }

  const model = provider.model;

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return json({ error: 'Invalid JSON in request body' }, 400);
  }

  const checked = validate(raw);
  if ('error' in checked) return json({ error: checked.error }, 400);
  const parsed = checked.parsed;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(provider.url, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${provider.key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPromptFor(parsed) },
          { role: 'user', content: userContentFor(parsed) },
        ],
        max_tokens: 500,
        temperature: 0.6,
      }),
    });

    if (!res.ok) {
      // Log the provider's reason for debugging, but never return it to the
      // browser — it can echo the key, the model, or the gateway's identity.
      const detail = (await res.text()).slice(0, 500);
      console.error(provider.name, 'error', res.status, 'model:', model, detail);

      if (res.status === 401 || res.status === 403) {
        return json({ error: `The AI key was rejected. Check ${provider.keyVar}.` }, 502);
      }
      if (res.status === 404) {
        // NVIDIA answers 404 for a model the account is not entitled to, not
        // only for one that does not exist — phi-3-vision does this.
        return json(
          { error: `Model "${model}" is unavailable on this account. Check ${provider.modelVar}.` },
          502,
        );
      }
      if (res.status === 429) {
        return json({ error: 'Too many requests. Please try again in a moment.' }, 429);
      }
      return json({ error: 'The AI service is unavailable right now' }, 502);
    }

    const body = await res.json();
    const reply = body?.choices?.[0]?.message?.content;

    if (typeof reply !== 'string' || reply.trim().length === 0) {
      console.error(provider.name, 'returned no content', JSON.stringify(body).slice(0, 500));
      return json({ error: 'The AI returned an empty response' }, 502);
    }

    return json({ reply });
  } catch (e) {
    if (e instanceof DOMException && e.name === 'AbortError') {
      console.error(provider.name, 'timed out after', TIMEOUT_MS, 'ms; model:', model);
      return json({ error: 'The AI took too long to respond. Please try again.' }, 504);
    }
    console.error('kisan-ai-chat failed', e);
    return json({ error: 'Could not reach the AI service right now' }, 500);
  } finally {
    clearTimeout(timer);
  }
});
