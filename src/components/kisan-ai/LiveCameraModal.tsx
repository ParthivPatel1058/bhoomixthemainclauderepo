import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, SwitchCamera, Mic, MicOff, Loader2, Camera, Radio } from 'lucide-react';
import { audioService, isVoiceFallback, languageLabel } from './audioService';
import { VoiceCapture } from './voiceCapture';
import { GeminiLiveSession, type LiveStatus } from './geminiLive';
import { VoiceStatus, SpokenAnswer } from './types';

interface LiveCameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Answers a spoken question about the captured frame. */
  onAsk: (frameDataUrl: string, question: string) => Promise<SpokenAnswer | undefined>;
  language: string;
}

/**
 * Live crop advisory through the back camera.
 *
 * The farmer points the phone at the plant and asks out loud; the moment a
 * sentence completes, the current video frame is grabbed and sent with the
 * question. This is deliberately frame-based rather than a continuous video
 * upload — the advisory model takes stills, and a village connection cannot
 * carry a live stream anyway. One still per question is what actually works
 * on a 3G handset standing in a field.
 */
const MAX_FRAME_EDGE = 1024;
const JPEG_QUALITY = 0.82;

export const LiveCameraModal: React.FC<LiveCameraModalProps> = ({
  isOpen,
  onClose,
  onAsk,
  language,
}) => {
  const [status, setStatus] = useState<VoiceStatus>('idle');
  const [facing, setFacing] = useState<'environment' | 'user'>('environment');
  const [transcript, setTranscript] = useState('');
  const [answer, setAnswer] = useState('');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [micSupported, setMicSupported] = useState(true);
  /**
   * Live mode streams continuously to Gemini instead of recording one question
   * at a time. Off by default: the turn-based path works without the relay
   * deployed, so it stays the thing that happens if nothing is configured.
   */
  const [liveMode, setLiveMode] = useState(false);
  const [liveStatus, setLiveStatus] = useState<LiveStatus>('idle');
  const [liveNotice, setLiveNotice] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  /** Language detected from speech; overrides the UI language for the reply. */
  const [heardLanguage, setHeardLanguage] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const captureRef = useRef<VoiceCapture | null>(null);
  const liveRef = useRef<GeminiLiveSession | null>(null);
  const frameTimerRef = useRef<number | null>(null);
  const sttFailuresRef = useRef(0);
  const statusRef = useRef<VoiceStatus>('idle');
  const sessionActiveRef = useRef(false);
  const busyRef = useRef(false);

  const setPhase = useCallback((next: VoiceStatus) => {
    statusRef.current = next;
    setStatus(next);
  }, []);

  /** Grab the current video frame as a downscaled JPEG data URL. */
  const captureFrame = useCallback((): string | null => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return null;

    const scale = Math.min(1, MAX_FRAME_EDGE / Math.max(video.videoWidth, video.videoHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(video.videoWidth * scale);
    canvas.height = Math.round(video.videoHeight * scale);

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    return canvas.toDataURL('image/jpeg', JPEG_QUALITY);
  }, []);

  const startRecognition = useCallback(() => {
    if (!sessionActiveRef.current || !recognitionRef.current) return;
    try {
      recognitionRef.current.start();
    } catch {
      // Already running — InvalidStateError is expected and harmless here.
    }
  }, []);

  /** Capture + ask + speak, then hand the mic back. */
  const ask = useCallback(
    async (question: string, detected: string | null = null) => {
      if (!sessionActiveRef.current || busyRef.current) return;

      const frame = captureFrame();
      if (!frame) return;

      try {
        recognitionRef.current?.stop();
      } catch {
        /* already stopped */
      }

      busyRef.current = true;
      setIsBusy(true);
      setPhase('processing');
      setAnswer('');

      try {
        const result = await onAsk(frame, question);
        if (!sessionActiveRef.current) return;

        if (!result?.reply) {
          setPhase('listening');
          startRecognition();
          return;
        }

        setAnswer(result.reply);
        setPhase('speaking');

        audioService.speakText(
          result.reply,
          // Spoken question wins over the UI language, same as in chat.
          result.language || detected || language,
          () => setPhase('speaking'),
          () => {
            if (!sessionActiveRef.current) return;
            setTranscript('');
            setPhase('listening');
            startRecognition();
          },
        );
      } catch {
        if (!sessionActiveRef.current) return;
        setPhase('listening');
        startRecognition();
      } finally {
        busyRef.current = false;
        setIsBusy(false);
      }
    },
    [captureFrame, language, onAsk, setPhase, startRecognition],
  );

  const askRef = useRef(ask);
  useEffect(() => {
    askRef.current = ask;
  }, [ask]);

  /** Manual shutter, for noisy fields or browsers without recognition. */
  const handleManualAsk = () => {
    void askRef.current(transcript.trim(), heardLanguage);
  };

  /** Degraded listening when Sarvam is unreachable: guesses the UI language. */
  const startBrowserAsr = useCallback(() => {
    if (recognitionRef.current || !sessionActiveRef.current) return;

    const recognition = audioService.createRecognition(
      (text, isFinal) => {
        if (!sessionActiveRef.current) return;
        setTranscript(text);
        if (isFinal && text.trim()) void askRef.current(text, null);
      },
      () => {
        /* onend restarts */
      },
      () => {
        if (sessionActiveRef.current && statusRef.current === 'listening') startRecognition();
      },
      language,
    );

    if (!recognition) {
      setMicSupported(false);
      setPhase('listening');
      return;
    }

    setMicSupported(true);
    recognitionRef.current = recognition;
    setPhase('listening');
    startRecognition();
  }, [language, setPhase, startRecognition]);

  /**
   * Switch between continuous Live streaming and the turn-based path.
   *
   * The two cannot run together: both want the microphone, and leaving the
   * recogniser running would transcribe the assistant's own voice coming back
   * out of the speaker and answer it.
   */
  const toggleLive = useCallback(async () => {
    setLiveNotice(null);

    if (liveRef.current) {
      if (frameTimerRef.current !== null) {
        window.clearInterval(frameTimerRef.current);
        frameTimerRef.current = null;
      }
      liveRef.current.close();
      liveRef.current = null;
      setLiveMode(false);
      setLiveStatus('idle');
      setPhase('listening');
      return;
    }

    const stream = audioService.getMicStream();
    if (!stream) {
      setLiveNotice('A microphone is needed for live mode.');
      return;
    }

    // Hand the microphone over from the turn-based recogniser.
    captureRef.current?.stop();
    captureRef.current = null;
    try {
      recognitionRef.current?.stop();
    } catch {
      /* already stopped */
    }
    recognitionRef.current = null;
    audioService.stopSpeaking();

    const session = new GeminiLiveSession();
    const ok = await session.connect(
      stream,
      {
        onStatus: (st) => {
          setLiveStatus(st);
          setPhase(st === 'speaking' ? 'speaking' : st === 'connecting' ? 'processing' : 'listening');
        },
          onUserText: (t) => setTranscript(t),
        onAssistantText: (t) => setAnswer(t),
        onError: (msg) => {
          setLiveNotice(msg);
          setLiveMode(false);
          setLiveStatus('idle');
        },
        onClose: () => {
          setLiveMode(false);
          setLiveStatus('idle');
        },
      },
      language,
    );

    if (!ok) {
      // connect() already reported why; fall back to the turn-based path.
      setLiveMode(false);
      startBrowserAsr();
      return;
    }

    liveRef.current = session;
    setLiveMode(true);

    /* One frame a second. The Live API is built for roughly this rate, and a
       video-rate stream would spend the farmer's data for no extra
       understanding. */
    frameTimerRef.current = window.setInterval(() => {
      const frame = captureFrame();
      if (frame) session.sendVideoFrame(frame);
    }, 1000);
  }, [captureFrame, language, setPhase, startBrowserAsr]);

  const stopEverything = useCallback(() => {
    sessionActiveRef.current = false;
    audioService.stopSpeaking();

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        /* already stopped */
      }
      recognitionRef.current = null;
    }

    captureRef.current?.stop();
    captureRef.current = null;

    if (frameTimerRef.current !== null) {
      window.clearInterval(frameTimerRef.current);
      frameTimerRef.current = null;
    }
    liveRef.current?.close();
    liveRef.current = null;
    setLiveStatus('idle');

    audioService.stopMicrophone();

    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;

    statusRef.current = 'idle';
    setStatus('idle');
    setTranscript('');
    setAnswer('');
  }, []);

  useEffect(() => {
    if (!isOpen) {
      stopEverything();
      return;
    }

    let cancelled = false;

    const start = async () => {
      sessionActiveRef.current = true;
      setCameraError(null);
      setAnswer('');
      setTranscript('');
      setHeardLanguage(null);
      sttFailuresRef.current = 0;
      audioService.primeVoices();

      // 1. Camera. `ideal` rather than `exact` so a laptop with only a front
      //    camera still opens instead of throwing OverconstrainedError.
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error('This browser cannot open the camera.');
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: facing }, width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });

        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {
            /* autoplay rejection — the frame still paints once decoded */
          });
        }
      } catch (err) {
        if (cancelled) return;
        const message =
          err instanceof DOMException && err.name === 'NotAllowedError'
            ? 'Camera permission was denied. Allow camera access to show your crop.'
            : 'Could not open the camera on this device.';
        setCameraError(message);
        setPhase('idle');
        return;
      }

      /* 2. Speech. Sarvam identifies the language from the audio, so a farmer
            can point the camera and ask in Hindi while the UI sits in English.
            The shutter button covers devices with no microphone at all. */
      await audioService.startMicrophone();
      if (cancelled) return;

      const micStream = audioService.getMicStream();

      if (micStream) {
        const capture = new VoiceCapture();
        const started = capture.start(micStream, {
          onUtterance: (wavBase64) => {
            if (!sessionActiveRef.current || busyRef.current) return;

            void (async () => {
              setPhase('processing');
              const heard = await audioService.transcribe(wavBase64, 'unknown');
              if (!sessionActiveRef.current) return;

              if (!heard) {
                sttFailuresRef.current += 1;
                // Unreachable function, not a mumble — drop to the browser.
                if (sttFailuresRef.current >= 2 && !recognitionRef.current) {
                  capture.stop();
                  startBrowserAsr();
                }
                if (statusRef.current === 'processing') setPhase('listening');
                return;
              }

              sttFailuresRef.current = 0;
              setTranscript(heard.transcript);
              setHeardLanguage(heard.language);
              await askRef.current(heard.transcript, heard.language);
            })();
          },
        });

        if (started) {
          captureRef.current = capture;
          setMicSupported(true);
          setPhase('listening');
          return;
        }
      }

      startBrowserAsr();
    };

    void start();

    return () => {
      cancelled = true;
      stopEverything();
    };
  }, [isOpen, facing, language, setPhase, startRecognition, startBrowserAsr, stopEverything]);

  if (!isOpen) return null;

  const hint: Record<VoiceStatus, string> = {
    idle: '',
    listening: liveMode
      ? 'Live — just talk, you can interrupt any time'
      : micSupported
        ? 'Point at the crop and ask your question'
        : 'Tap the shutter to ask',
    processing: liveMode ? 'Connecting…' : 'Looking at your crop…',
    speaking: '',
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
        className="fixed inset-0 z-[70] flex flex-col bg-black text-white select-none overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-label="Live crop camera"
      >
        {/* Camera feed fills the screen; controls float above it. */}
        <video
          ref={videoRef}
          playsInline
          muted
          autoPlay
          className="absolute inset-0 h-full w-full object-cover"
          style={facing === 'user' ? { transform: 'scaleX(-1)' } : undefined}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-transparent to-black/75" />

        <header className="relative z-10 flex items-center justify-between px-5 py-4">
          <span className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur text-[11px] font-mono uppercase tracking-widest text-white/75">
            <span
              className={
                'w-1.5 h-1.5 rounded-full ' +
                (status === 'processing'
                  ? 'bg-amber-400 animate-pulse'
                  : status === 'speaking'
                    ? 'bg-emerald-400'
                    : 'bg-red-500 animate-pulse')
              }
            />
            {languageLabel(heardLanguage || language)}
            {isVoiceFallback(heardLanguage || language) && ' · nearest voice'}
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => void toggleLive()}
              aria-pressed={liveMode}
              title={liveMode ? 'Stop live conversation' : 'Start live conversation'}
              aria-label={liveMode ? 'Stop live conversation' : 'Start live conversation'}
              className={
                'flex items-center gap-1.5 rounded-full px-3 py-2 text-[11px] font-semibold uppercase tracking-wide backdrop-blur transition-all active:scale-95 ' +
                (liveMode
                  ? 'bg-red-500/90 text-white'
                  : 'bg-black/40 text-white/80 hover:bg-white/20 hover:text-white')
              }
            >
              <Radio className={'w-4 h-4 ' + (liveMode ? 'animate-pulse' : '')} />
              Live
            </button>

            <button
              type="button"
              onClick={() => setFacing((f) => (f === 'environment' ? 'user' : 'environment'))}
              aria-label="Switch camera"
              title="Switch camera"
              className="p-2.5 rounded-full bg-black/40 backdrop-blur hover:bg-white/20 text-white/80 hover:text-white transition-all active:scale-95"
            >
              <SwitchCamera className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close camera"
              className="p-2.5 rounded-full bg-black/40 backdrop-blur hover:bg-white/20 text-white/80 hover:text-white transition-all active:scale-95"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        <main className="relative z-10 flex-1 flex flex-col items-center justify-end px-5 pb-8">
          {cameraError ? (
            <div className="m-auto flex flex-col items-center gap-3 text-center max-w-xs">
              <Camera className="w-12 h-12 text-white/30" />
              <p className="text-sm text-white/70 leading-relaxed">{cameraError}</p>
            </div>
          ) : (
            <>
              <div className="w-full max-w-lg text-center mb-6 min-h-[72px] flex flex-col justify-end gap-2">
                {liveNotice && (
                  <p role="status" className="text-xs text-amber-300 bg-black/50 backdrop-blur rounded-xl px-3 py-2">
                    {liveNotice}
                  </p>
                )}
                {answer ? (
                  <motion.p
                    key="answer"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm sm:text-base leading-relaxed text-white bg-black/55 backdrop-blur rounded-2xl px-4 py-3 line-clamp-5"
                  >
                    {answer}
                  </motion.p>
                ) : transcript ? (
                  <motion.p
                    key="transcript"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm sm:text-base font-medium text-white bg-black/45 backdrop-blur rounded-2xl px-4 py-2.5"
                  >
                    {transcript}
                  </motion.p>
                ) : (
                  <p className="text-xs text-white/60">{hint[status]}</p>
                )}
              </div>

              <div className="flex items-center gap-6">
                <span className="w-11 flex justify-center">
                  {micSupported ? (
                    <Mic
                      className={
                        'w-5 h-5 ' +
                        (liveMode || status === 'listening'
                          ? 'text-red-400 animate-pulse'
                          : 'text-white/40')
                      }
                    />
                  ) : (
                    <MicOff className="w-5 h-5 text-white/30" />
                  )}
                </span>

                <button
                  type="button"
                  onClick={handleManualAsk}
                  disabled={isBusy || liveMode}
                  title={liveMode ? 'Not needed in live mode — just speak' : 'Capture and ask'}
                  aria-label="Capture and ask"
                  className="w-[68px] h-[68px] rounded-full border-4 border-white/85 flex items-center justify-center transition-transform active:scale-95 disabled:opacity-60"
                >
                  {isBusy ? (
                    <Loader2 className="w-7 h-7 animate-spin text-white" />
                  ) : (
                    <span className="w-[52px] h-[52px] rounded-full bg-white" />
                  )}
                </button>

                <span className="w-11" />
              </div>
            </>
          )}
        </main>
      </motion.div>
    </AnimatePresence>
  );
};
