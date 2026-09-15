import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MicOff, Loader2 } from 'lucide-react';
import { BigAudioReactiveOrb } from './BigAudioReactiveOrb';
import { audioService, isVoiceFallback, languageLabel } from './audioService';
import { VoiceCapture } from './voiceCapture';
import { VoiceStatus, SpokenAnswer } from './types';

interface VoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendMessage: (text: string) => Promise<SpokenAnswer | undefined>;
  /** UI language — a fallback only; the spoken language wins when detected. */
  language: string;
}

/**
 * Hands-free advisory: listen, transcribe, answer, speak, listen again.
 *
 * Listening goes through `VoiceCapture` + Sarvam rather than the browser's
 * `SpeechRecognition`, because that API must be told the language in advance.
 * A farmer browsing in English who speaks Hindi was being run through an
 * English recogniser and transcribed into nonsense. Sarvam identifies the
 * language from the audio, so speaking Hindi now answers in Hindi whatever the
 * UI is set to.
 *
 * The browser recogniser remains as a fallback for when the edge functions are
 * unreachable — degraded (it guesses the UI language) but never silent.
 */

/**
 * Barge-in is ignored for this long after playback starts. Echo cancellation
 * is good but not instant, and the assistant's own opening syllable would
 * otherwise register as an interruption and cut it off mid-word.
 */
const BARGE_IN_GRACE_MS = 700;

export const VoiceAssistantModal: React.FC<VoiceAssistantModalProps> = ({
  isOpen,
  onClose,
  onSendMessage,
  language,
}) => {
  const [voiceStatus, setVoiceStatus] = useState<VoiceStatus>('idle');
  const [userTranscript, setUserTranscript] = useState('');
  const [aiSpeechText, setAiSpeechText] = useState('');
  const [spokenLanguage, setSpokenLanguage] = useState<string | null>(null);
  const [unsupported, setUnsupported] = useState(false);
  const [usingBrowserAsr, setUsingBrowserAsr] = useState(false);

  const captureRef = useRef<VoiceCapture | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const statusRef = useRef<VoiceStatus>('idle');
  const sessionActiveRef = useRef(false);
  const speakingStartedAtRef = useRef(0);
  /** Guards against two clips being transcribed and answered at once. */
  const busyRef = useRef(false);
  /** Consecutive transcription failures before giving up on Sarvam. */
  const sttFailuresRef = useRef(0);

  const setStatus = useCallback((next: VoiceStatus) => {
    statusRef.current = next;
    setVoiceStatus(next);
  }, []);

  /* ---------------------------------------------------------------- */
  /* Answering                                                         */
  /* ---------------------------------------------------------------- */

  const answer = useCallback(
    async (question: string, detected: string | null) => {
      if (!question.trim() || !sessionActiveRef.current || busyRef.current) return;

      busyRef.current = true;
      setUserTranscript(question);
      setStatus('processing');

      try {
        const result = await onSendMessage(question);
        if (!sessionActiveRef.current) return;

        if (!result?.reply) {
          setStatus('listening');
          return;
        }

        const replyLang = result.language || detected || language;
        setAiSpeechText(result.reply);
        setSpokenLanguage(replyLang);
        setStatus('speaking');
        speakingStartedAtRef.current = Date.now();

        audioService.speakText(
          result.reply,
          replyLang,
          () => {
            speakingStartedAtRef.current = Date.now();
            setStatus('speaking');
          },
          () => {
            if (!sessionActiveRef.current) return;
            setUserTranscript('');
            setStatus('listening');
          },
        );
      } catch {
        if (sessionActiveRef.current) setStatus('listening');
      } finally {
        busyRef.current = false;
      }
    },
    [language, onSendMessage, setStatus],
  );

  const answerRef = useRef(answer);
  useEffect(() => {
    answerRef.current = answer;
  }, [answer]);

  /* ---------------------------------------------------------------- */
  /* Browser fallback                                                  */
  /* ---------------------------------------------------------------- */

  const startBrowserAsr = useCallback(() => {
    if (recognitionRef.current || !sessionActiveRef.current) return;

    const recognition = audioService.createRecognition(
      (text, isFinal) => {
        if (!sessionActiveRef.current) return;
        setUserTranscript(text);
        if (isFinal && text.trim()) void answerRef.current(text, null);
      },
      () => {
        /* onend restarts */
      },
      () => {
        if (sessionActiveRef.current && statusRef.current === 'listening') {
          try {
            recognitionRef.current?.start();
          } catch {
            /* already running */
          }
        }
      },
      language,
    );

    if (!recognition) {
      setUnsupported(true);
      return;
    }

    recognitionRef.current = recognition;
    setUsingBrowserAsr(true);
    try {
      recognition.start();
    } catch {
      /* already running */
    }
  }, [language]);

  /* ---------------------------------------------------------------- */
  /* Session                                                           */
  /* ---------------------------------------------------------------- */

  const teardown = useCallback(() => {
    sessionActiveRef.current = false;
    busyRef.current = false;

    captureRef.current?.stop();
    captureRef.current = null;

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        /* already stopped */
      }
      recognitionRef.current = null;
    }

    audioService.stopSpeaking();
    audioService.stopMicrophone();

    statusRef.current = 'idle';
    setVoiceStatus('idle');
    setUserTranscript('');
    setUsingBrowserAsr(false);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      teardown();
      return;
    }

    let cancelled = false;

    const start = async () => {
      sessionActiveRef.current = true;
      setUnsupported(false);
      setUsingBrowserAsr(false);
      setUserTranscript('');
      setAiSpeechText('');
      setSpokenLanguage(null);
      sttFailuresRef.current = 0;
      audioService.primeVoices();
      setStatus('listening');

      await audioService.startMicrophone();
      if (cancelled) return;

      const stream = audioService.getMicStream();

      // No microphone at all — offer the browser recogniser, then give up.
      if (!stream) {
        startBrowserAsr();
        return;
      }

      const capture = new VoiceCapture();
      const started = capture.start(stream, {
        onSpeechStart: () => {
          if (!sessionActiveRef.current) return;

          /* Barge-in: talking over the assistant stops it, the way a person
             would stop mid-sentence when interrupted. */
          if (
            statusRef.current === 'speaking' &&
            Date.now() - speakingStartedAtRef.current > BARGE_IN_GRACE_MS
          ) {
            audioService.stopSpeaking();
            setAiSpeechText('');
            setStatus('listening');
          }
        },
        onUtterance: (wavBase64) => {
          if (!sessionActiveRef.current || busyRef.current) return;

          void (async () => {
            setStatus('processing');
            // 'unknown' lets Sarvam pick the language from the audio itself.
            const heard = await audioService.transcribe(wavBase64, 'unknown');
            if (!sessionActiveRef.current) return;

            if (!heard) {
              sttFailuresRef.current += 1;
              /* Two failures in a row means the function is unreachable, not
                 that the farmer mumbled — fall back rather than sit mute. */
              if (sttFailuresRef.current >= 2 && !recognitionRef.current) {
                capture.stop();
                startBrowserAsr();
              }
              if (statusRef.current === 'processing') setStatus('listening');
              return;
            }

            sttFailuresRef.current = 0;
            await answerRef.current(heard.transcript, heard.language);
          })();
        },
      });

      if (!started) {
        startBrowserAsr();
        return;
      }

      captureRef.current = capture;
    };

    void start();

    return () => {
      cancelled = true;
      teardown();
    };
  }, [isOpen, language, setStatus, startBrowserAsr, teardown]);

  if (!isOpen) return null;

  const statusLabel: Record<VoiceStatus, string> = {
    idle: '',
    listening: 'Listening — speak in any language',
    processing: 'Thinking…',
    speaking: 'Speaking',
  };

  /* The chip names the language actually being spoken once there is one, so a
     farmer can see it understood them without reading the transcript. */
  const chipLanguage = spokenLanguage || language;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
        className="fixed inset-0 z-[60] flex flex-col bg-black text-white select-none overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-label="Voice assistant"
      >
        <header className="relative z-10 flex items-center justify-between px-6 py-5">
          <span className="text-[11px] font-mono tracking-widest uppercase text-white/40">
            {languageLabel(chipLanguage)}
            {isVoiceFallback(chipLanguage) && ' · nearest voice'}
            {usingBrowserAsr && ' · basic mode'}
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close voice assistant"
            className="p-2.5 rounded-full bg-white/[0.06] hover:bg-white/15 text-white/70 hover:text-white transition-all active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-8">
          <div className="relative flex items-center justify-center my-auto">
            {unsupported ? (
              <div className="flex flex-col items-center gap-4 text-center max-w-xs">
                <MicOff className="w-12 h-12 text-white/30" />
                <p className="text-sm text-white/60 leading-relaxed">
                  No microphone is available in this browser. You can still type your question in
                  the chat.
                </p>
              </div>
            ) : (
              <BigAudioReactiveOrb
                size={typeof window !== 'undefined' && window.innerWidth < 640 ? 260 : 340}
                status={voiceStatus}
                isActive
                isAiSpeaking={voiceStatus === 'speaking'}
              />
            )}
          </div>

          <div className="w-full max-w-lg text-center px-4 mt-auto mb-10 min-h-[74px] flex flex-col items-center justify-center">
            {!unsupported && (
              <p className="flex items-center gap-1.5 text-[10px] font-mono tracking-widest text-white/35 uppercase mb-2">
                {voiceStatus === 'processing' && <Loader2 className="w-3 h-3 animate-spin" />}
                {statusLabel[voiceStatus]}
              </p>
            )}

            {voiceStatus === 'speaking' && aiSpeechText ? (
              <motion.p
                key="ai-text"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="text-sm sm:text-base text-white/90 leading-relaxed line-clamp-4"
              >
                {aiSpeechText}
              </motion.p>
            ) : userTranscript ? (
              <motion.p
                key="user-transcript"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="text-sm sm:text-base font-medium text-white/90"
              >
                {userTranscript}
              </motion.p>
            ) : null}
          </div>
        </main>
      </motion.div>
    </AnimatePresence>
  );
};
