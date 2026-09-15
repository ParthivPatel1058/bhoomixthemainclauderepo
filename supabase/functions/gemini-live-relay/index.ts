/**
 * WebSocket relay between the browser and the Gemini Live API.
 *
 * Gemini Live is a bidirectional socket: the client streams microphone PCM and
 * camera frames up, and audio comes back as it is generated, with barge-in
 * handled by the model rather than by us. Talking to it directly from the
 * browser would mean shipping GEMINI_API_KEY to every visitor, so the socket
 * terminates here and a second socket is opened upstream with the key.
 *
 *   supabase secrets set GEMINI_API_KEY=...
 *   supabase secrets set GEMINI_LIVE_MODEL=...        # optional, pins the model
 *
 * Connect with the caller's Supabase access token in the query string:
 *
 *   wss://<project>.functions.supabase.co/gemini-live-relay?token=<jwt>&lang=hi
 *
 * A browser cannot set an Authorization header on a WebSocket, which is why
 * the token travels as a query parameter and why this function runs with
 * `verify_jwt = false` — the gateway cannot check a header that cannot be
 * sent, so the check is done here instead. That makes the token check below
 * the only thing standing between an anonymous visitor and a billable model
 * session; it must not be removed.
 *
 * The session configuration (model, system instruction, modalities) is sent by
 * this relay, never by the client. A client that could write its own setup
 * frame could point the socket at any model and any prompt on our key.
 */

const GEMINI_WS =
  'wss://generativelanguage.googleapis.com/ws/' +
  'google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent';

/**
 * Live model ids move faster than deploys, and which of them a given key is
 * entitled to is not knowable from here. Rather than pin one and dead-end on a
 * rejected handshake, each is tried in order until one accepts the setup
 * frame. A name that no longer exists costs one failed handshake.
 *
 * Ordered best-sounding first: the native-audio dialog models produce markedly
 * more natural speech than the older flash-live ones.
 */
const MODEL_CANDIDATES = [
  'models/gemini-2.5-flash-preview-native-audio-dialog',
  'models/gemini-live-2.5-flash-preview',
  'models/gemini-2.0-flash-live-001',
  'models/gemini-2.0-flash-exp',
];

/** An explicit secret wins outright — no probing, no surprises. */
function modelsToTry(): string[] {
  const pinned = Deno.env.get('GEMINI_LIVE_MODEL');
  return pinned ? [pinned] : MODEL_CANDIDATES;
}

/** Each candidate gets this long to acknowledge the setup frame. */
const UPSTREAM_OPEN_TIMEOUT_MS = 8_000;

/**
 * Frames queued while the upstream handshake is still in flight. A few hundred
 * milliseconds of 16 kHz PCM is a handful of frames; the cap exists so a
 * client that never stops talking cannot grow this without bound.
 */
const MAX_PENDING_FRAMES = 200;

/** Endonyms, so the instruction names each language as its speakers do. */
const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English', hi: 'Hindi', as: 'Assamese', bn: 'Bengali', brx: 'Bodo',
  doi: 'Dogri', gu: 'Gujarati', kn: 'Kannada', ks: 'Kashmiri', kok: 'Konkani',
  mai: 'Maithili', ml: 'Malayalam', mni: 'Manipuri', mr: 'Marathi',
  ne: 'Nepali', or: 'Odia', pa: 'Punjabi', sa: 'Sanskrit', sat: 'Santali',
  sd: 'Sindhi', ta: 'Tamil', te: 'Telugu', ur: 'Urdu',
};

/* The identity guardrail the text advisory uses. Without it the model
   introduces itself as Gemini, contradicting every other surface. */
const IDENTITY =
  'Your name is BhoomiX AgriNova, an AI assistant trained by BhoomiX for Indian agriculture. ' +
  'If anyone asks what model, AI, LLM, or company you are, who built or trained you, or which ' +
  'technology powers you, you must ONLY reply that you are trained by BhoomiX AgriNova. ' +
  'Never mention Anthropic, Claude, OpenAI, ChatGPT, GPT, Google, Gemini, Meta, Llama, DeepSeek, ' +
  'NVIDIA, Sarvam, or any other company, provider, gateway or model name.';

/**
 * Build the session prompt.
 *
 * `hint` is the language the interface is set to. It is offered only as a
 * tie-breaker for the opening moments, before anyone has spoken: the rule that
 * matters is to follow the language actually heard. A farmer browsing in
 * English who speaks Marathi must be answered in Marathi, and pinning the
 * session to the UI language is precisely the bug this replaces.
 */
function systemInstructionFor(hint: string | null): string {
  const hinted = hint && LANGUAGE_NAMES[hint] ? LANGUAGE_NAMES[hint] : null;

  const lines = [
    IDENTITY,
    '',
    'You are an expert agricultural advisor for Indian farmers, speaking with them live.',
    '',
    'LANGUAGE. This matters more than anything else here:',
    '1. Detect the language the farmer is SPEAKING and reply in that same language, using that',
    '   script. Never answer in a language they did not use.',
    '2. Expect any of: ' + Object.values(LANGUAGE_NAMES).join(', ') + '.',
    '3. Romanised speech still counts. Someone saying "mera gehun kharab ho raha hai" is',
    '   speaking Hindi and must be answered in Hindi, in Devanagari.',
    '4. If they switch language mid-conversation, switch with them immediately.',
    hinted
      ? '5. Before anyone has spoken, assume ' +
        hinted +
        '. Abandon that assumption the moment you hear something else.'
      : '',
    '',
    'MANNER:',
    '- Two or three sentences. This is being listened to, not read.',
    '- Plain spoken language. No markdown, no bullet points, no headings.',
    '- Give the practical step first, the reason after.',
    '- Use the units a farmer uses: acre, bigha, quintal, kg per acre.',
    '',
    'WHEN SHOWN A CROP:',
    '- Say what you can actually see before naming anything.',
    '- If the image is dark, blurred, or too far away to judge, say so and ask them to move',
    '  closer or into better light. Never guess a disease from an image you cannot read.',
    '- Mention what is NOT wrong when that is reassuring.',
    '',
    'Never recommend a specific pesticide product or dose. For pest control, tell them to',
    'confirm with their local Krishi Vigyan Kendra.',
  ];

  return lines.filter(Boolean).join('\n');
}

Deno.serve(async (req) => {
  const apiKey = Deno.env.get('GEMINI_API_KEY');
  if (!apiKey) {
    console.error('gemini-live-relay is not configured (GEMINI_API_KEY missing)');
    return new Response('Live advisory is not configured', { status: 500 });
  }

  if (req.headers.get('upgrade')?.toLowerCase() !== 'websocket') {
    return new Response('Expected a WebSocket upgrade', { status: 426 });
  }

  /* ---------------------------------------------------------------- */
  /* Authorisation                                                     */
  /* ---------------------------------------------------------------- */
  const url = new URL(req.url);
  const token = url.searchParams.get('token');
  const langHint = url.searchParams.get('lang');
  if (!token) return new Response('Missing token', { status: 401 });

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
  if (!supabaseUrl || !anonKey) {
    console.error('gemini-live-relay: SUPABASE_URL / SUPABASE_ANON_KEY missing');
    return new Response('Live advisory is not configured', { status: 500 });
  }

  /* Verified over REST rather than by decoding the JWT here: signature and
     expiry checking belongs to the auth server, and a relay that trusts a
     self-decoded token is a relay that trusts a forged one. */
  const who = await fetch(supabaseUrl + '/auth/v1/user', {
    headers: { Authorization: 'Bearer ' + token, apikey: anonKey },
  });
  if (!who.ok) return new Response('Invalid token', { status: 401 });

  /* ---------------------------------------------------------------- */
  /* Sockets                                                           */
  /* ---------------------------------------------------------------- */
  const { socket: client, response } = Deno.upgradeWebSocket(req);

  let upstream: WebSocket | null = null;
  let closed = false;
  const pending: string[] = [];

  const shutdown = (reason: string) => {
    if (closed) return;
    closed = true;
    try {
      // 1000 is the only code it is safe to hand a browser here.
      if (client.readyState === WebSocket.OPEN) client.close(1000, reason.slice(0, 120));
    } catch {
      /* already closing */
    }
    try {
      if (upstream && upstream.readyState === WebSocket.OPEN) upstream.close(1000, 'relay closed');
    } catch {
      /* already closing */
    }
  };

  /* Buffer whatever the client sends while the handshake is still in flight. */
  client.onmessage = (event) => {
    if (typeof event.data !== 'string') return; // media arrives base64 in JSON
    if (upstream && upstream.readyState === WebSocket.OPEN) {
      try {
        upstream.send(event.data);
      } catch (e) {
        console.error('gemini-live-relay: upstream forward failed', e);
      }
      return;
    }
    if (pending.length >= MAX_PENDING_FRAMES) pending.shift();
    pending.push(event.data);
  };
  client.onerror = () => shutdown('client socket error');
  client.onclose = () => shutdown('client closed');

  const setupBase = {
    generationConfig: {
      responseModalities: ['AUDIO'],
      /* No languageCode on purpose: pinning one forces every reply into that
         language, which is the opposite of following the farmer. The prompt
         does the language work instead. */
      speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Aoede' } } },
      temperature: 0.7,
    },
    systemInstruction: { parts: [{ text: systemInstructionFor(langHint) }] },
    // Transcripts drive the on-screen captions in both directions.
    inputAudioTranscription: {},
    outputAudioTranscription: {},
  };

  /**
   * Try one model. Resolves with the socket once the service acknowledges the
   * setup frame, or null if it errors, closes, or stays silent.
   *
   * Frames arriving between the acknowledgement and the caller attaching its
   * own handler are kept in `early` and replayed, so nothing is lost.
   */
  function tryModel(model: string): Promise<{ socket: WebSocket; early: string[] } | null> {
    return new Promise((resolve) => {
      let settled = false;
      const early: string[] = [];
      let ws: WebSocket;

      try {
        ws = new WebSocket(GEMINI_WS + '?key=' + apiKey);
      } catch {
        resolve(null);
        return;
      }

      const finish = (value: { socket: WebSocket; early: string[] } | null) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        if (!value) {
          try {
            ws.close();
          } catch {
            /* never opened */
          }
        }
        resolve(value);
      };

      const timer = setTimeout(() => finish(null), UPSTREAM_OPEN_TIMEOUT_MS);

      ws.onopen = () => ws.send(JSON.stringify({ setup: { ...setupBase, model } }));

      ws.onmessage = async (event) => {
        const text =
          typeof event.data === 'string' ? event.data : await (event.data as Blob).text();
        if (settled) {
          early.push(text);
          return;
        }
        /* setupComplete is the only acknowledgement that the model exists and
           that this key may use it; an unusable model closes instead. */
        if (text.includes('setupComplete')) finish({ socket: ws, early });
        else early.push(text);
      };

      ws.onerror = () => finish(null);
      ws.onclose = () => finish(null);
    });
  }

  /* Deliberately not awaited: the upgrade response must be returned now, and
     the client buffers into `pending` until this resolves. */
  (async () => {
    const candidates = modelsToTry();
    let chosen: { socket: WebSocket; early: string[] } | null = null;
    let model = '';

    for (const candidate of candidates) {
      if (closed) return;
      chosen = await tryModel(candidate);
      if (chosen) {
        model = candidate;
        break;
      }
      console.error('gemini-live-relay: model unavailable, trying next:', candidate);
    }

    if (!chosen || closed) {
      console.error('gemini-live-relay: no usable Live model from', candidates.join(', '));
      shutdown('Live service unavailable');
      return;
    }

    console.log('gemini-live-relay: connected using', model);
    upstream = chosen.socket;

    upstream.onmessage = async (event) => {
      if (client.readyState !== WebSocket.OPEN) return;
      try {
        // Gemini answers with Blob frames in Deno; the browser wants text.
        const payload =
          typeof event.data === 'string' ? event.data : await (event.data as Blob).text();
        client.send(payload);
      } catch (e) {
        console.error('gemini-live-relay: downstream forward failed', e);
      }
    };
    upstream.onerror = () => {
      console.error('gemini-live-relay: upstream socket error');
      shutdown('Live service error');
    };
    upstream.onclose = (e) => shutdown('upstream closed (' + e.code + ')');

    // Anything the service said during the handshake, then anything the farmer
    // said while waiting for it.
    for (const frame of chosen.early) {
      if (client.readyState === WebSocket.OPEN) client.send(frame);
    }
    for (const frame of pending) {
      try {
        upstream.send(frame);
      } catch {
        /* socket died mid-drain; onclose tears the pair down */
      }
    }
    pending.length = 0;
  })();

  return response;
});
