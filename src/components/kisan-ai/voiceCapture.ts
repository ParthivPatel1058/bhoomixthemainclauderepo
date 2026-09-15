/**
 * Always-on microphone capture with voice-activity detection.
 *
 * Replaces the browser's `SpeechRecognition` for the listening half of voice
 * mode. That API has to be told the language before it hears anything, so a
 * farmer whose UI is in English but who speaks Hindi was being transcribed by
 * an English recogniser — the transcript came out as nonsense and nothing
 * downstream could recover. Here we capture raw audio and let Sarvam identify
 * the language from the sound itself.
 *
 * Three details matter and are easy to get wrong:
 *
 *   Pre-roll. Voice detection always fires a fraction of a second after speech
 *   actually starts, which clips the first syllable — "कैसे" becomes "से". A
 *   rolling buffer means the clip begins slightly BEFORE the trigger.
 *
 *   Adaptive floor. A fixed threshold either misses quiet speech in a silent
 *   room or triggers constantly next to a running pump. The floor tracks the
 *   ambient level and sits a little above it.
 *
 *   Whisper gain. A whisper peaks around 1-2% of full scale. Measured against
 *   the live ASR, quiet audio still transcribes without help (0.975 confidence
 *   at RMS 0.0025 versus 0.995 once normalised), so this is a quality nudge
 *   rather than a rescue — the real whisper problem is DETECTION, which is why
 *   ABS_RMS_FLOOR below sits under the measured whisper level.
 */

/** Sarvam's ASR works at 16 kHz; anything higher is bandwidth for nothing. */
const TARGET_SAMPLE_RATE = 16_000;

/** Audio kept before the trigger, so the opening syllable survives. */
const PRE_ROLL_MS = 320;

/**
 * Speech must hold this long to start a clip — rejects clicks and taps.
 * Kept short so a whispered opening syllable still clears the bar.
 */
const SPEECH_CONFIRM_MS = 100;

/** Silence this long ends the utterance. Long enough to think mid-sentence. */
const SILENCE_END_MS = 900;

/** Hard stop, so a stuck-open mic cannot upload minutes of audio. */
const MAX_UTTERANCE_MS = 20_000;

/** Ignore anything shorter than this — a cough, a door. */
const MIN_UTTERANCE_MS = 260;

/**
 * Absolute RMS floor — the quietest sound treated as speech in a silent room.
 *
 * Measured, not guessed: a real Hindi clip attenuated to a whisper came in at
 * RMS 0.0025, so an earlier 0.0055 floor would have ignored whispers entirely
 * while still transcribing them perfectly if only they had been captured. This
 * sits under that measurement and above typical room tone (~0.0005-0.002).
 *
 * In a noisy field the adaptive `noiseFloor * NOISE_MULTIPLIER` term dominates
 * anyway, so lowering this does not make the detector trigger-happy outdoors.
 */
const ABS_RMS_FLOOR = 0.0018;

/** Speech must exceed the ambient noise estimate by this factor. */
const NOISE_MULTIPLIER = 2.1;

/** Peak the normaliser aims for. Below 1.0 to leave headroom against clipping. */
const NORMALISE_TARGET = 0.94;

/**
 * Cap on normalisation gain. Without it, a silent room is amplified until the
 * noise floor sounds like speech and ASR hallucinates words from hiss.
 */
const MAX_NORMALISE_GAIN = 22;

export interface VoiceCaptureHandlers {
  /** Speech began — used to duck the assistant for barge-in. */
  onSpeechStart?: () => void;
  /** A finished utterance, already encoded as base64 16 kHz mono WAV. */
  onUtterance?: (wavBase64: string, durationMs: number) => void;
  /** Smoothed 0-1 input level, for the orb and the mic indicator. */
  onLevel?: (level: number) => void;
}

export class VoiceCapture {
  private ctx: AudioContext | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private processor: ScriptProcessorNode | null = null;
  private sink: GainNode | null = null;
  private handlers: VoiceCaptureHandlers = {};

  private running = false;
  /** Muted while the assistant speaks through the same speakers. */
  private paused = false;

  private preRoll: Float32Array[] = [];
  private preRollSamples = 0;
  private recorded: Float32Array[] = [];
  private recordedSamples = 0;

  private speaking = false;
  private speechHeldMs = 0;
  private silenceHeldMs = 0;
  private utteranceMs = 0;

  /** Running estimate of the room, seeded high so it settles downward. */
  private noiseFloor = 0.02;
  private smoothedLevel = 0;

  public get isRunning(): boolean {
    return this.running;
  }

  /** Current input level, 0-1, for callers that poll rather than subscribe. */
  public get level(): number {
    return this.smoothedLevel;
  }

  /**
   * Begin listening on an existing microphone stream.
   *
   * The stream is owned by the caller — this does not stop its tracks, because
   * the same stream also drives the orb's spectrum.
   */
  public start(stream: MediaStream, handlers: VoiceCaptureHandlers = {}): boolean {
    this.stop();

    try {
      const Ctor =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return false;

      this.ctx = new Ctor();
      if (this.ctx.state === 'suspended') void this.ctx.resume();

      this.handlers = handlers;
      this.source = this.ctx.createMediaStreamSource(stream);

      /* ScriptProcessorNode is deprecated in favour of AudioWorklet, and is
         used anyway: this app targets low-end Android handsets whose WebView
         predates AudioWorklet, and the per-frame work here is a sum of squares
         and an array copy — far too light to trouble the main thread. */
      this.processor = this.ctx.createScriptProcessor(2048, 1, 1);
      this.processor.onaudioprocess = (e) => this.onFrame(e);

      /* A ScriptProcessor only runs while connected to the destination. Route
         it through a silent gain node so nothing is actually played back —
         otherwise the farmer hears themselves. */
      this.sink = this.ctx.createGain();
      this.sink.gain.value = 0;

      this.source.connect(this.processor);
      this.processor.connect(this.sink);
      this.sink.connect(this.ctx.destination);

      this.running = true;
      return true;
    } catch {
      this.stop();
      return false;
    }
  }

  public stop(): void {
    this.running = false;
    this.paused = false;

    try {
      if (this.processor) {
        this.processor.onaudioprocess = null;
        this.processor.disconnect();
      }
      this.source?.disconnect();
      this.sink?.disconnect();
    } catch {
      /* already torn down */
    }

    this.processor = null;
    this.source = null;
    this.sink = null;

    if (this.ctx) {
      const ctx = this.ctx;
      this.ctx = null;
      void ctx.close().catch(() => {
        /* already closed */
      });
    }

    this.resetUtterance();
    this.preRoll = [];
    this.preRollSamples = 0;
    this.smoothedLevel = 0;
  }

  /**
   * Stop evaluating input without dropping the stream.
   *
   * Used while the assistant speaks: the microphone hears the speakers, and
   * without this the assistant would answer itself in a loop.
   */
  public setPaused(paused: boolean): void {
    this.paused = paused;
    if (paused) {
      this.resetUtterance();
      this.preRoll = [];
      this.preRollSamples = 0;
    }
  }

  private resetUtterance(): void {
    this.recorded = [];
    this.recordedSamples = 0;
    this.speaking = false;
    this.speechHeldMs = 0;
    this.silenceHeldMs = 0;
    this.utteranceMs = 0;
  }

  private onFrame(event: AudioProcessingEvent): void {
    if (!this.running || !this.ctx) return;

    const input = event.inputBuffer.getChannelData(0);
    const frameMs = (input.length / this.ctx.sampleRate) * 1000;

    let sumSquares = 0;
    for (let i = 0; i < input.length; i++) sumSquares += input[i] * input[i];
    const rms = Math.sqrt(sumSquares / input.length);

    this.smoothedLevel += (rms - this.smoothedLevel) * 0.3;
    this.handlers.onLevel?.(Math.min(1, this.smoothedLevel * 12));

    if (this.paused) return;

    /* Track the quiet moments only, and let the estimate rise slowly and fall
       quickly, so one loud sentence does not deafen the detector for seconds
       afterwards. */
    if (!this.speaking) {
      const rate = rms < this.noiseFloor ? 0.2 : 0.02;
      this.noiseFloor += (rms - this.noiseFloor) * rate;
    }

    const threshold = Math.max(ABS_RMS_FLOOR, this.noiseFloor * NOISE_MULTIPLIER);
    const isVoice = rms > threshold;

    // A copy is required: the event buffer is reused by the audio thread.
    const frame = new Float32Array(input);

    if (!this.speaking) {
      this.preRoll.push(frame);
      this.preRollSamples += frame.length;
      const maxPreRoll = (PRE_ROLL_MS / 1000) * this.ctx.sampleRate;
      while (this.preRollSamples > maxPreRoll && this.preRoll.length > 1) {
        const dropped = this.preRoll.shift();
        if (dropped) this.preRollSamples -= dropped.length;
      }

      if (isVoice) {
        this.speechHeldMs += frameMs;
        if (this.speechHeldMs >= SPEECH_CONFIRM_MS) {
          this.speaking = true;
          this.silenceHeldMs = 0;
          this.utteranceMs = 0;
          // Seed the clip with the pre-roll so the first syllable survives.
          this.recorded = [...this.preRoll];
          this.recordedSamples = this.preRollSamples;
          this.preRoll = [];
          this.preRollSamples = 0;
          this.handlers.onSpeechStart?.();
        }
      } else {
        this.speechHeldMs = 0;
      }
      return;
    }

    this.recorded.push(frame);
    this.recordedSamples += frame.length;
    this.utteranceMs += frameMs;

    if (isVoice) {
      this.silenceHeldMs = 0;
    } else {
      this.silenceHeldMs += frameMs;
    }

    if (this.silenceHeldMs >= SILENCE_END_MS || this.utteranceMs >= MAX_UTTERANCE_MS) {
      this.finishUtterance();
    }
  }

  private finishUtterance(): void {
    if (!this.ctx) return;

    const spokenMs = this.utteranceMs - this.silenceHeldMs;
    const samples = flatten(this.recorded, this.recordedSamples);
    const sourceRate = this.ctx.sampleRate;

    this.resetUtterance();

    if (spokenMs < MIN_UTTERANCE_MS) return;

    const downsampled = downsample(samples, sourceRate, TARGET_SAMPLE_RATE);
    normalise(downsampled);
    const wav = encodeWav(downsampled, TARGET_SAMPLE_RATE);

    this.handlers.onUtterance?.(base64FromBytes(wav), Math.round(spokenMs));
  }
}

/* ------------------------------------------------------------------ */
/* Encoding helpers                                                   */
/* ------------------------------------------------------------------ */

function flatten(chunks: Float32Array[], total: number): Float32Array {
  const out = new Float32Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    out.set(chunk, offset);
    offset += chunk.length;
  }
  return out;
}

/**
 * Drop to the target rate by averaging each source window.
 *
 * Averaging rather than picking every Nth sample: plain decimation aliases
 * high frequencies down into the speech band, which ASR hears as sibilance.
 */
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

/**
 * Lift the clip so its loudest moment is near full scale.
 *
 * This is what lets a whisper be transcribed: quiet speech is scaled up to the
 * level ASR expects. The gain cap stops a near-silent clip being amplified
 * into audible hiss that the model would try to read as words.
 */
function normalise(samples: Float32Array): void {
  let peak = 0;
  for (let i = 0; i < samples.length; i++) {
    const abs = Math.abs(samples[i]);
    if (abs > peak) peak = abs;
  }
  if (peak < 1e-5) return;

  const gain = Math.min(MAX_NORMALISE_GAIN, NORMALISE_TARGET / peak);
  if (gain <= 1.01) return;

  for (let i = 0; i < samples.length; i++) {
    samples[i] = Math.max(-1, Math.min(1, samples[i] * gain));
  }
}

/** Wrap mono float samples as a 16-bit PCM WAV file. */
function encodeWav(samples: Float32Array, sampleRate: number): Uint8Array {
  const bytes = new Uint8Array(44 + samples.length * 2);
  const view = new DataView(bytes.buffer);

  const ascii = (offset: number, text: string) => {
    for (let i = 0; i < text.length; i++) view.setUint8(offset + i, text.charCodeAt(i));
  };

  ascii(0, 'RIFF');
  view.setUint32(4, 36 + samples.length * 2, true);
  ascii(8, 'WAVE');
  ascii(12, 'fmt ');
  view.setUint32(16, 16, true); // PCM chunk size
  view.setUint16(20, 1, true); // format: PCM
  view.setUint16(22, 1, true); // channels: mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true); // byte rate
  view.setUint16(32, 2, true); // block align
  view.setUint16(34, 16, true); // bits per sample
  ascii(36, 'data');
  view.setUint32(40, samples.length * 2, true);

  let offset = 44;
  for (let i = 0; i < samples.length; i++) {
    const clamped = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff, true);
    offset += 2;
  }

  return bytes;
}

/** Base64 without blowing the call stack on a long clip. */
function base64FromBytes(bytes: Uint8Array): string {
  let binary = '';
  const CHUNK = 0x8000;
  for (let i = 0; i < bytes.length; i += CHUNK) {
    binary += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
  }
  return btoa(binary);
}
