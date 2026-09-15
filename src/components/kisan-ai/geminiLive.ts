/**
 * Live voice-and-vision session, streamed through the `gemini-live-relay`
 * edge function.
 *
 * This is a different shape from the rest of `kisan-ai`. `voiceCapture` records
 * a whole sentence, waits for silence, uploads it, waits for an answer and
 * plays it — a walkie-talkie. Here the microphone streams continuously, audio
 * comes back while it is still being generated, and the model decides when the
 * farmer has interrupted. The result is a conversation rather than an exchange.
 *
 * The socket never talks to Google directly: the relay holds the API key. See
 * `supabase/functions/gemini-live-relay/index.ts`.
 *
 * Audio contract, fixed by the Live API:
 *   up    16 kHz mono 16-bit PCM, base64, as `audio/pcm;rate=16000`
 *   down  24 kHz mono 16-bit PCM, base64
 */

import { supabase } from '@/integrations/supabase/client';

/** The Live API will not resample for us. */
const SEND_RATE = 16_000;
const RECEIVE_RATE = 24_000;

/** ~64 ms of audio per frame at 16 kHz — small enough to feel immediate. */
const CAPTURE_BUFFER = 1024;

/**
 * Playback is scheduled slightly ahead of the clock. Without this cushion,
 * each chunk is scheduled at "now" and the gaps between them are audible as
 * clicking; with it, chunks butt against each other seamlessly.
 */
const PLAYBACK_LEAD_S = 0.08;

export type LiveStatus = 'idle' | 'connecting' | 'listening' | 'speaking' | 'error';

export interface GeminiLiveHandlers {
  onStatus?: (status: LiveStatus) => void;
  /** Running transcript of what the farmer said. */
  onUserText?: (text: string) => void;
  /** Running transcript of the answer being spoken. */
  onAssistantText?: (text: string) => void;
  /** Fatal, human-readable. The session is closed by the time this fires. */
  onError?: (message: string) => void;
  onClose?: () => void;
}

function base64FromBytes(bytes: Uint8Array): string {
  let binary = '';
  const CHUNK = 0x8000;
  for (let i = 0; i < bytes.length; i += CHUNK) {
    binary += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
  }
  return btoa(binary);
}

function bytesFromBase64(b64: string): Uint8Array {
  const binary = atob(b64);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) out[i] = binary.charCodeAt(i);
  return out;
}

/** Average each source window down to the target rate. */
function downsample(input: Float32Array, fromRate: number, toRate: number): Float32Array {
  if (toRate >= fromRate) return input;
  const ratio = fromRate / toRate;
  const outLength = Math.floor(input.length / ratio);
  const out = new Float32Array(outLength);
  for (let i = 0; i < outLength; i++) {
    const start = Math.floor(i * ratio);
    const end = Math.min(input.length, Math.floor((i + 1) * ratio));
    let sum = 0;
    for (let j = start; j < end; j++) sum += input[j];
    out[i] = end > start ? sum / (end - start) : 0;
  }
  return out;
}

export class GeminiLiveSession {
  private ws: WebSocket | null = null;
  private handlers: GeminiLiveHandlers = {};

  private captureCtx: AudioContext | null = null;
  private captureSource: MediaStreamAudioSourceNode | null = null;
  private processor: ScriptProcessorNode | null = null;
  private captureSink: GainNode | null = null;

  private playbackCtx: AudioContext | null = null;
  /** Sources currently scheduled, so an interruption can silence them all. */
  private scheduled: AudioBufferSourceNode[] = [];
  /** Clock position the next chunk should start at, for gapless playback. */
  private nextStartTime = 0;

  private closed = false;
  private status: LiveStatus = 'idle';

  public get isOpen(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  private setStatus(next: LiveStatus) {
    if (this.status === next) return;
    this.status = next;
    this.handlers.onStatus?.(next);
  }

  /**
   * Open the relay socket and begin streaming `stream`'s audio.
   *
   * Returns false when the session could not be established — no signed-in
   * user, or the socket refused — so the caller can fall back rather than sit
   * on a dead connection.
   */
  public async connect(stream: MediaStream, handlers: GeminiLiveHandlers = {}): Promise<boolean> {
    this.handlers = handlers;
    this.closed = false;
    this.setStatus('connecting');

    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) {
      this.fail('You need to be signed in to use live advisory.');
      return false;
    }

    /* The functions host is derived from the project URL rather than hardcoded
       so this keeps working across projects and local development. */
    const base = import.meta.env.VITE_SUPABASE_URL as string | undefined;
    if (!base) {
      this.fail('Live advisory is not configured.');
      return false;
    }
    const wsUrl =
      base.replace(/^http/, 'ws').replace('.supabase.co', '.functions.supabase.co') +
      `/gemini-live-relay?token=${encodeURIComponent(token)}`;

    const opened = await new Promise<boolean>((resolve) => {
      let settled = false;
      let ws: WebSocket;
      try {
        ws = new WebSocket(wsUrl);
      } catch {
        resolve(false);
        return;
      }
      this.ws = ws;

      const done = (ok: boolean) => {
        if (settled) return;
        settled = true;
        resolve(ok);
      };

      ws.onopen = () => done(true);
      ws.onmessage = (e) => void this.onMessage(e);
      ws.onerror = () => {
        done(false);
        if (!this.closed) this.fail('Lost connection to the live advisory.');
      };
      ws.onclose = () => {
        done(false);
        if (!this.closed) {
          this.closed = true;
          this.teardownAudio();
          this.setStatus('idle');
          this.handlers.onClose?.();
        }
      };

      // A socket that never opens should not hang the caller forever.
      window.setTimeout(() => done(false), 12_000);
    });

    if (!opened) {
      this.fail('Could not reach the live advisory.');
      return false;
    }

    if (!this.startCapture(stream)) {
      this.fail('Could not open the microphone.');
      return false;
    }

    this.setStatus('listening');
    return true;
  }

  /** Begin streaming microphone audio up the socket. */
  private startCapture(stream: MediaStream): boolean {
    try {
      const Ctor =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return false;

      this.captureCtx = new Ctor();
      if (this.captureCtx.state === 'suspended') void this.captureCtx.resume();

      this.captureSource = this.captureCtx.createMediaStreamSource(stream);

      /* ScriptProcessorNode is deprecated in favour of AudioWorklet and used
         anyway: this app targets low-end Android handsets whose WebView
         predates AudioWorklet, and the work per frame is a downsample and a
         base64 encode. */
      this.processor = this.captureCtx.createScriptProcessor(CAPTURE_BUFFER, 1, 1);
      this.processor.onaudioprocess = (e) => this.onCaptureFrame(e);

      /* A ScriptProcessor only runs while connected to the destination; route
         it through a muted gain node so the farmer does not hear themselves. */
      this.captureSink = this.captureCtx.createGain();
      this.captureSink.gain.value = 0;

      this.captureSource.connect(this.processor);
      this.processor.connect(this.captureSink);
      this.captureSink.connect(this.captureCtx.destination);
      return true;
    } catch {
      return false;
    }
  }

  private onCaptureFrame(event: AudioProcessingEvent) {
    if (!this.isOpen || !this.captureCtx) return;

    const input = event.inputBuffer.getChannelData(0);
    const down = downsample(input, this.captureCtx.sampleRate, SEND_RATE);

    const pcm = new Int16Array(down.length);
    for (let i = 0; i < down.length; i++) {
      const s = Math.max(-1, Math.min(1, down[i]));
      pcm[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }

    this.send({
      realtimeInput: {
        mediaChunks: [
          {
            mimeType: `audio/pcm;rate=${SEND_RATE}`,
            data: base64FromBytes(new Uint8Array(pcm.buffer)),
          },
        ],
      },
    });
  }

  /**
   * Send one camera frame.
   *
   * Called on a timer by the caller rather than per animation frame — the Live
   * API wants roughly one frame a second, and a video-rate stream would spend
   * the farmer's data for no extra understanding.
   */
  public sendVideoFrame(jpegDataUrl: string) {
    if (!this.isOpen) return;
    const comma = jpegDataUrl.indexOf(',');
    if (comma < 0) return;
    this.send({
      realtimeInput: {
        mediaChunks: [{ mimeType: 'image/jpeg', data: jpegDataUrl.slice(comma + 1) }],
      },
    });
  }

  /** Send a typed message, for when speaking aloud is not practical. */
  public sendText(text: string) {
    if (!this.isOpen || !text.trim()) return;
    this.send({
      clientContent: {
        turns: [{ role: 'user', parts: [{ text }] }],
        turnComplete: true,
      },
    });
  }

  private send(payload: unknown) {
    try {
      this.ws?.send(JSON.stringify(payload));
    } catch {
      /* socket closing; onclose will tear down */
    }
  }

  private async onMessage(event: MessageEvent) {
    let frame: Record<string, unknown>;
    try {
      const raw = typeof event.data === 'string' ? event.data : await (event.data as Blob).text();
      frame = JSON.parse(raw);
    } catch {
      return;
    }

    const server = frame.serverContent as Record<string, unknown> | undefined;
    if (!server) return;

    /* The farmer started talking over the answer. Everything already scheduled
       is now stale — playing it would talk over them in return. */
    if (server.interrupted) {
      this.flushPlayback();
      this.setStatus('listening');
      return;
    }

    const input = server.inputTranscription as { text?: string } | undefined;
    if (input?.text) this.handlers.onUserText?.(input.text);

    const output = server.outputTranscription as { text?: string } | undefined;
    if (output?.text) this.handlers.onAssistantText?.(output.text);

    const turn = server.modelTurn as { parts?: Array<Record<string, unknown>> } | undefined;
    for (const part of turn?.parts ?? []) {
      const inline = part.inlineData as { mimeType?: string; data?: string } | undefined;
      if (inline?.data && (inline.mimeType ?? '').startsWith('audio/')) {
        this.setStatus('speaking');
        this.enqueueAudio(inline.data);
      }
    }

    if (server.turnComplete) this.setStatus('listening');
  }

  /** Schedule one chunk of returned audio to follow the previous one. */
  private enqueueAudio(b64: string) {
    try {
      const Ctor =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return;
      if (!this.playbackCtx) this.playbackCtx = new Ctor();
      const ctx = this.playbackCtx;
      if (ctx.state === 'suspended') void ctx.resume();

      const bytes = bytesFromBase64(b64);
      const pcm = new Int16Array(bytes.buffer, bytes.byteOffset, bytes.byteLength / 2);
      if (pcm.length === 0) return;

      const buffer = ctx.createBuffer(1, pcm.length, RECEIVE_RATE);
      const channel = buffer.getChannelData(0);
      for (let i = 0; i < pcm.length; i++) channel[i] = pcm[i] / 0x8000;

      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);

      // Never schedule in the past: a late chunk starts from the cushion again.
      const startAt = Math.max(ctx.currentTime + PLAYBACK_LEAD_S, this.nextStartTime);
      source.start(startAt);
      this.nextStartTime = startAt + buffer.duration;

      this.scheduled.push(source);
      source.onended = () => {
        this.scheduled = this.scheduled.filter((s) => s !== source);
      };
    } catch {
      /* a malformed chunk should not kill the session */
    }
  }

  /** Silence everything already scheduled, for barge-in. */
  private flushPlayback() {
    for (const source of this.scheduled) {
      try {
        source.onended = null;
        source.stop();
      } catch {
        /* already finished */
      }
    }
    this.scheduled = [];
    this.nextStartTime = 0;
  }

  private fail(message: string) {
    if (this.closed) return;
    this.setStatus('error');
    this.handlers.onError?.(message);
    this.close();
  }

  private teardownAudio() {
    try {
      if (this.processor) {
        this.processor.onaudioprocess = null;
        this.processor.disconnect();
      }
      this.captureSource?.disconnect();
      this.captureSink?.disconnect();
    } catch {
      /* already torn down */
    }
    this.processor = null;
    this.captureSource = null;
    this.captureSink = null;

    if (this.captureCtx) {
      const ctx = this.captureCtx;
      this.captureCtx = null;
      void ctx.close().catch(() => {
        /* already closed */
      });
    }

    this.flushPlayback();
    if (this.playbackCtx) {
      const ctx = this.playbackCtx;
      this.playbackCtx = null;
      void ctx.close().catch(() => {
        /* already closed */
      });
    }
  }

  /** Close the socket and release every audio resource. Safe to call twice. */
  public close() {
    if (this.closed) return;
    this.closed = true;

    this.teardownAudio();

    try {
      if (this.ws && this.ws.readyState <= WebSocket.OPEN) this.ws.close(1000, 'client closed');
    } catch {
      /* already closing */
    }
    this.ws = null;
    this.setStatus('idle');
  }
}
