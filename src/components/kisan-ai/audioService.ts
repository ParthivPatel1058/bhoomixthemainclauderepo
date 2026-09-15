/**
 * Microphone analysis, speech recognition and speech synthesis for the Kisan
 * voice assistant.
 *
 * Capture is entirely browser-native (Web Audio, Web Speech): microphone audio
 * never leaves the device — only the transcript is sent onward, never the
 * recording. Playback prefers Sarvam's Indic voices, which means the reply
 * TEXT is sent to the `sarvam-speech` edge function and audio comes back; the
 * browser's own voice is the fallback.
 *
 * A single shared instance is exported because the browser has one
 * `speechSynthesis` queue and one sensible microphone stream; two instances
 * would fight over both.
 */

import { LANGUAGE_MAP } from '@/i18n/languages';
import { supabase } from '@/integrations/supabase/client';

/* ------------------------------------------------------------------ */
/* Language mapping                                                   */
/* ------------------------------------------------------------------ */

/**
 * App language code → BCP-47 tag for the Web Speech API.
 *
 * The Eighth Schedule languages that browsers ship neither a recogniser nor a
 * voice for fall back to the nearest widely-supported relative rather than
 * failing outright — a Konkani speaker gets Marathi phonetics, which is far
 * more usable than silence. `fallback: true` marks those so the UI can say so
 * instead of pretending it is the real thing.
 */
const VOICE_LOCALES: Record<string, { tag: string; fallback?: boolean }> = {
  en: { tag: 'en-IN' },
  hi: { tag: 'hi-IN' },
  as: { tag: 'as-IN' },
  bn: { tag: 'bn-IN' },
  brx: { tag: 'hi-IN', fallback: true }, // Bodo — Devanagari, no browser voice
  doi: { tag: 'hi-IN', fallback: true }, // Dogri — Devanagari, no browser voice
  gu: { tag: 'gu-IN' },
  kn: { tag: 'kn-IN' },
  ks: { tag: 'ur-IN', fallback: true }, // Kashmiri — Perso-Arabic, nearest is Urdu
  kok: { tag: 'mr-IN', fallback: true }, // Konkani — nearest recogniser is Marathi
  mai: { tag: 'hi-IN', fallback: true }, // Maithili — Devanagari, no browser voice
  ml: { tag: 'ml-IN' },
  mni: { tag: 'bn-IN', fallback: true }, // Manipuri — Bengali script in practice
  mr: { tag: 'mr-IN' },
  ne: { tag: 'ne-NP' },
  or: { tag: 'or-IN' },
  pa: { tag: 'pa-IN' },
  sa: { tag: 'hi-IN', fallback: true }, // Sanskrit — Devanagari, no browser voice
  sat: { tag: 'hi-IN', fallback: true }, // Santali — Ol Chiki, no browser voice
  sd: { tag: 'ur-IN', fallback: true }, // Sindhi — Perso-Arabic, nearest is Urdu
  ta: { tag: 'ta-IN' },
  te: { tag: 'te-IN' },
  ur: { tag: 'ur-IN' },
};

/**
 * The eleven languages Sarvam gives a real voice to — probed against the live
 * API; the rest return 400. Mirrors the server-side gate in `sarvam-speech`,
 * so an unvoiced language skips the round trip instead of paying for a 422.
 */
const SARVAM_VOICED = new Set(['en', 'hi', 'bn', 'gu', 'kn', 'ml', 'mr', 'or', 'pa', 'ta', 'te']);

/** True when Sarvam can speak this language, rather than the device voice. */
export function hasNaturalVoice(language: string): boolean {
  return SARVAM_VOICED.has(language);
}

/** BCP-47 tag to drive recognition and synthesis for an app language code. */
export function voiceLocaleFor(language: string): string {
  return VOICE_LOCALES[language]?.tag ?? 'en-IN';
}

/** True when the language is voiced by a stand-in rather than its own voice. */
export function isVoiceFallback(language: string): boolean {
  return Boolean(VOICE_LOCALES[language]?.fallback);
}

/** Endonym for the language, for UI labels. Falls back to the code itself. */
export function languageLabel(language: string): string {
  return LANGUAGE_MAP[language]?.native ?? language;
}

/* ------------------------------------------------------------------ */
/* Service                                                            */
/* ------------------------------------------------------------------ */

class AudioService {
  private audioContext: AudioContext | null = null;
  private micStream: MediaStream | null = null;
  private micAnalyser: AnalyserNode | null = null;
  private isSpeaking = false;
  private speechIntensity = 0;
  private simulatedFrequencies: number[] = new Array(16).fill(0);
  private speechAnimFrame = 0;

  /* Sarvam playback. Unlike `speechSynthesis`, this is real audio through Web
     Audio, so the orb can read the actual spectrum instead of a synthesised
     envelope — the difference is visible, the orb moves with the consonants. */
  private ttsSource: AudioBufferSourceNode | null = null;
  private ttsAnalyser: AnalyserNode | null = null;
  /* Bumped on every stop/new utterance so an in-flight fetch that resolves
     late cannot start playing over whatever is speaking now. */
  private speakToken = 0;

  /**
   * Chrome populates the voice list asynchronously and returns an empty array
   * on the first call, so a voice picked during the very first utterance would
   * silently be the wrong one. Warm it once and remember that it is ready.
   */
  private voicesReady = false;

  public initAudioContext(): AudioContext | null {
    try {
      if (!this.audioContext) {
        const Ctor =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (!Ctor) return null;
        this.audioContext = new Ctor();
      }
      if (this.audioContext.state === 'suspended') {
        void this.audioContext.resume();
      }
      return this.audioContext;
    } catch {
      return null;
    }
  }

  public async startMicrophone(): Promise<AnalyserNode | null> {
    try {
      if (!this.initAudioContext() || !this.audioContext) return null;
      if (!navigator.mediaDevices?.getUserMedia) return null;

      this.micStream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });

      const source = this.audioContext.createMediaStreamSource(this.micStream);
      this.micAnalyser = this.audioContext.createAnalyser();
      this.micAnalyser.fftSize = 128;
      this.micAnalyser.smoothingTimeConstant = 0.8;
      source.connect(this.micAnalyser);

      return this.micAnalyser;
    } catch {
      // Permission denied or no device — the orb falls back to idle breathing.
      return null;
    }
  }

  /** The live microphone stream, for VoiceCapture to attach its own graph to. */
  public getMicStream(): MediaStream | null {
    return this.micStream;
  }

  /**
   * Transcribe a recorded clip, letting Sarvam identify the language.
   *
   * Returns null when transcription is unavailable or the clip held no speech,
   * so callers can fall back to the browser recogniser rather than stalling.
   */
  public async transcribe(
    wavBase64: string,
    language: string = 'unknown',
  ): Promise<{ transcript: string; language: string | null } | null> {
    try {
      const { data, error } = await supabase.functions.invoke<{
        transcript?: string;
        language?: string | null;
      }>('sarvam-listen', { body: { audio: wavBase64, language } });

      if (error || !data || typeof data.transcript !== 'string') return null;
      if (!data.transcript.trim()) return null;

      return { transcript: data.transcript.trim(), language: data.language ?? null };
    } catch {
      return null;
    }
  }

  public stopMicrophone(): void {
    this.micStream?.getTracks().forEach((track) => track.stop());
    this.micStream = null;
    this.micAnalyser = null;
  }

  /** Read 16 bands + overall intensity from an analyser node. */
  private readAnalyser(analyser: AnalyserNode): { intensity: number; frequencies: number[] } {
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(dataArray);

    let sum = 0;
    const bands: number[] = [];
    const step = Math.max(1, Math.floor(bufferLength / 16));

    for (let i = 0; i < bufferLength; i += step) {
      let bandSum = 0;
      let count = 0;
      for (let j = i; j < Math.min(i + step, bufferLength); j++) {
        bandSum += dataArray[j];
        count++;
      }
      bands.push(count ? bandSum / count / 255 : 0);
      sum += bandSum;
    }

    const avg = bufferLength > 0 ? sum / (bufferLength * 255) : 0;
    return { intensity: Math.min(1, avg * 1.6), frequencies: bands.slice(0, 16) };
  }

  public getAudioFrequencyData(): { intensity: number; frequencies: number[] } {
    /* Sarvam playback is real audio, so the orb reads its actual spectrum.
       This outranks the microphone: while the assistant speaks, the mic is
       only picking up the speakers. */
    if (this.ttsAnalyser) return this.readAnalyser(this.ttsAnalyser);

    if (this.micAnalyser) return this.readAnalyser(this.micAnalyser);

    if (this.isSpeaking) {
      return {
        intensity: this.speechIntensity,
        frequencies: this.simulatedFrequencies.slice(0, 16),
      };
    }

    return { intensity: 0.05, frequencies: new Array(16).fill(0.04) };
  }

  /** Resolve the closest installed voice for a BCP-47 tag, or null. */
  private pickVoice(tag: string): SpeechSynthesisVoice | null {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length === 0) return null;

    const base = tag.split('-')[0];
    return (
      voices.find((v) => v.lang.replace('_', '-') === tag) ??
      voices.find((v) => v.lang.replace('_', '-').startsWith(`${base}-`)) ??
      voices.find((v) => v.lang.startsWith(base)) ??
      // Indian English is a better stand-in for Indic text than US English.
      voices.find((v) => v.lang === 'en-IN') ??
      null
    );
  }

  /** Warm Chrome's async voice list so the first utterance picks correctly. */
  public primeVoices(): void {
    if (this.voicesReady || typeof window.speechSynthesis === 'undefined') return;
    const done = () => {
      this.voicesReady = true;
    };
    if (window.speechSynthesis.getVoices().length > 0) {
      done();
      return;
    }
    window.speechSynthesis.addEventListener('voiceschanged', done, { once: true });
  }

  /**
   * Speak `text` in `language`.
   *
   * Sarvam first for the eleven languages it voices — the device's own voice
   * reads Indic scripts badly, often with an English engine. Everything else,
   * and every failure, falls through to `speechSynthesis`, so speech never
   * simply stops working.
   */
  public speakText(text: string, language = 'en', onStart?: () => void, onEnd?: () => void): void {
    const trimmed = text.trim();
    if (!trimmed) {
      onStart?.();
      window.setTimeout(() => onEnd?.(), 300);
      return;
    }

    this.stopSpeaking();
    const token = ++this.speakToken;

    if (SARVAM_VOICED.has(language)) {
      void this.speakViaSarvam(trimmed, language, token, onStart, onEnd);
      return;
    }

    this.speakViaBrowser(trimmed, language, onStart, onEnd);
  }

  /**
   * Fetch synthesised audio and play it through Web Audio.
   *
   * Falls back to the browser voice on any failure — an unconfigured secret, a
   * rate limit, an offline handset. The farmer still hears an answer.
   */
  private async speakViaSarvam(
    text: string,
    language: string,
    token: number,
    onStart?: () => void,
    onEnd?: () => void,
  ): Promise<void> {
    try {
      const { data, error } = await supabase.functions.invoke<{ audio?: string }>('sarvam-speech', {
        body: { text, language },
      });

      // A newer utterance started, or stopSpeaking ran, while we were waiting.
      if (token !== this.speakToken) return;

      if (error || !data?.audio) {
        this.speakViaBrowser(text, language, onStart, onEnd);
        return;
      }

      const ctx = this.initAudioContext();
      if (!ctx) {
        this.speakViaBrowser(text, language, onStart, onEnd);
        return;
      }

      // base64 -> ArrayBuffer. The payload is a complete WAV file.
      const binary = atob(data.audio);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

      const buffer = await ctx.decodeAudioData(bytes.buffer);
      if (token !== this.speakToken) return;

      const source = ctx.createBufferSource();
      source.buffer = buffer;

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 128;
      analyser.smoothingTimeConstant = 0.8;

      source.connect(analyser);
      analyser.connect(ctx.destination);

      this.ttsSource = source;
      this.ttsAnalyser = analyser;
      this.isSpeaking = true;

      source.onended = () => {
        if (token !== this.speakToken) return;
        this.clearTtsPlayback();
        onEnd?.();
      };

      source.start();
      onStart?.();
    } catch {
      if (token !== this.speakToken) return;
      this.clearTtsPlayback();
      this.speakViaBrowser(text, language, onStart, onEnd);
    }
  }

  /** Tear down the Web Audio graph for a finished or cancelled utterance. */
  private clearTtsPlayback(): void {
    if (this.ttsSource) {
      try {
        this.ttsSource.onended = null;
        this.ttsSource.stop();
      } catch {
        /* already stopped */
      }
      try {
        this.ttsSource.disconnect();
      } catch {
        /* already disconnected */
      }
      this.ttsSource = null;
    }
    if (this.ttsAnalyser) {
      try {
        this.ttsAnalyser.disconnect();
      } catch {
        /* already disconnected */
      }
      this.ttsAnalyser = null;
    }
    this.isSpeaking = false;
  }

  /**
   * The device's own voice, driving the orb from a synthesised envelope.
   *
   * The Web Speech API exposes no output analyser, so the orb cannot read the
   * real waveform here. The envelope below is a syllable-rate approximation —
   * it moves with the speech rather than merely looping, which is what sells
   * it. Sarvam playback does not need this; it has real audio to read.
   */
  private speakViaBrowser(
    text: string,
    language: string,
    onStart?: () => void,
    onEnd?: () => void,
  ): void {
    if (typeof window.speechSynthesis === 'undefined') {
      onStart?.();
      window.setTimeout(() => onEnd?.(), 600);
      return;
    }

    const tag = voiceLocaleFor(language);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = tag;
    // Indic synthesis runs hot; a touch under 1.0 stays intelligible aloud.
    utterance.rate = tag.startsWith('en') ? 1.0 : 0.94;
    utterance.pitch = 1.0;

    const voice = this.pickVoice(tag);
    if (voice) utterance.voice = voice;

    utterance.onstart = () => {
      this.isSpeaking = true;
      this.startVoiceSimulation();
      onStart?.();
    };
    utterance.onboundary = () => {
      this.speechIntensity = Math.min(1, this.speechIntensity + 0.35);
    };
    utterance.onend = () => {
      this.isSpeaking = false;
      this.stopVoiceSimulation();
      onEnd?.();
    };
    utterance.onerror = () => {
      this.isSpeaking = false;
      this.stopVoiceSimulation();
      onEnd?.();
    };

    window.speechSynthesis.speak(utterance);
  }

  public stopSpeaking(): void {
    // Invalidates any in-flight synthesis fetch so it cannot start playing.
    this.speakToken++;
    this.clearTtsPlayback();
    if (typeof window.speechSynthesis !== 'undefined') window.speechSynthesis.cancel();
    this.isSpeaking = false;
    this.stopVoiceSimulation();
  }

  private startVoiceSimulation(): void {
    let t = 0;
    const animate = () => {
      if (!this.isSpeaking) return;
      t += 0.12;

      const syllablePulse = 0.5 + 0.45 * Math.sin(t * 3.5) * Math.sin(t * 1.8);
      const target = 0.4 + syllablePulse * 0.55;
      this.speechIntensity += (target - this.speechIntensity) * 0.25;

      for (let i = 0; i < 16; i++) {
        const harmonic = Math.sin(t * 4 + i * 0.85);
        const formant =
          Math.exp(-Math.pow((i - 4) / 3, 2)) * 0.9 + Math.exp(-Math.pow((i - 10) / 4, 2)) * 0.7;
        this.simulatedFrequencies[i] = Math.max(
          0.08,
          Math.min(1, (formant * syllablePulse + harmonic * 0.25) * this.speechIntensity),
        );
      }

      this.speechAnimFrame = requestAnimationFrame(animate);
    };
    this.speechAnimFrame = requestAnimationFrame(animate);
  }

  private stopVoiceSimulation(): void {
    cancelAnimationFrame(this.speechAnimFrame);
    this.speechIntensity = 0;
    this.simulatedFrequencies.fill(0);
  }

  /** True when this browser can transcribe speech at all. */
  public isRecognitionSupported(): boolean {
    return Boolean(
      (window as unknown as { SpeechRecognition?: unknown }).SpeechRecognition ||
        (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition,
    );
  }

  /**
   * Build a recogniser for `language`. Returns null when unsupported, which the
   * caller surfaces as "type instead" rather than a dead microphone button.
   */
  public createRecognition(
    onResult: (text: string, isFinal: boolean) => void,
    onError: (err: unknown) => void,
    onEnd: () => void,
    language = 'en',
  ): SpeechRecognition | null {
    const Ctor =
      (window as unknown as { SpeechRecognition?: new () => SpeechRecognition }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognition })
        .webkitSpeechRecognition;

    if (!Ctor) return null;

    const recognition = new Ctor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = voiceLocaleFor(language);

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = '';
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) final += result[0].transcript;
        else interim += result[0].transcript;
      }
      if (final) onResult(final, true);
      else if (interim) onResult(interim, false);
    };
    recognition.onerror = (err: unknown) => onError(err);
    recognition.onend = () => onEnd();

    return recognition;
  }
}

export const audioService = new AudioService();
