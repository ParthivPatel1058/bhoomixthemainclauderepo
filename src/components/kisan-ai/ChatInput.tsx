import React, { useEffect, useRef, useState } from 'react';
import { ArrowUp, Image as ImageIcon, X, Mic, AudioLines, Loader2, Video } from 'lucide-react';
import { BorderBeam } from 'border-beam';
import { audioService } from './audioService';

interface ChatInputProps {
  onSendMessage: (text: string, image?: string) => void;
  onOpenVoice: () => void;
  /** Opens the live back-camera advisory. */
  onOpenCamera: () => void;
  isLoading?: boolean;
  placeholder: string;
  /** App language code, so dictation transcribes in the farmer's language. */
  language: string;
}

/** Crop photos come straight off a phone camera; anything larger is a mistake. */
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

/**
 * The composer: crop-photo attachment, push-to-talk dictation, and send.
 *
 * Dictation writes into the textarea rather than sending immediately, so a
 * mis-heard word can be corrected before it costs an API round trip — Indic
 * recognition is good but not good enough to trust blind.
 */
export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  onOpenVoice,
  onOpenCamera,
  isLoading = false,
  placeholder,
  language,
}) => {
  const [inputText, setInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDictating, setIsDictating] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  /** Text already committed before dictation started, so results append. */
  const baseTextRef = useRef('');

  // Stop dictation if the component unmounts mid-listen, or the mic stays hot.
  useEffect(() => {
    return () => {
      try {
        recognitionRef.current?.stop();
      } catch {
        /* already stopped */
      }
      recognitionRef.current = null;
    };
  }, []);

  const stopDictation = () => {
    try {
      recognitionRef.current?.stop();
    } catch {
      /* already stopped */
    }
    recognitionRef.current = null;
    setIsDictating(false);
  };

  const flashNotice = (text: string) => {
    setNotice(text);
    window.setTimeout(() => setNotice(null), 4000);
  };

  const toggleDictation = () => {
    if (isDictating) {
      stopDictation();
      return;
    }

    baseTextRef.current = inputText ? inputText.trimEnd() + ' ' : '';

    const recognition = audioService.createRecognition(
      (text, isFinal) => {
        setInputText(baseTextRef.current + text);
        if (isFinal) baseTextRef.current = baseTextRef.current + text + ' ';
      },
      () => stopDictation(),
      () => setIsDictating(false),
      language,
    );

    if (!recognition) {
      flashNotice('Voice typing is not supported in this browser. Please type instead.');
      return;
    }

    recognitionRef.current = recognition;
    try {
      recognition.start();
      setIsDictating(true);
    } catch {
      setIsDictating(false);
    }
  };

  const readImage = (file: File) => {
    setNotice(null);
    if (!file.type.startsWith('image/')) {
      flashNotice('That file is not an image.');
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      flashNotice('That photo is larger than 8 MB. Please pick a smaller one.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setSelectedImage(reader.result as string);
    reader.onerror = () => flashNotice('Could not read that photo. Please try again.');
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if ((!inputText.trim() && !selectedImage) || isLoading) return;

    if (isDictating) stopDictation();

    onSendMessage(inputText.trim(), selectedImage || undefined);
    setInputText('');
    setSelectedImage(null);
    baseTextRef.current = '';
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const canSubmit = (inputText.trim().length > 0 || selectedImage !== null) && !isLoading;

  return (
    <div
      className="w-full px-3 pb-3 sm:px-4 sm:pb-4 relative z-10"
      onDrop={(e) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (file) readImage(file);
      }}
      onDragOver={(e) => e.preventDefault()}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) readImage(file);
          e.target.value = '';
        }}
        accept="image/*"
        className="hidden"
        aria-hidden="true"
        tabIndex={-1}
      />

      {notice && (
        <p role="status" className="mb-2 px-2 text-xs text-amber-300">
          {notice}
        </p>
      )}

      <BorderBeam size="md" colorVariant="colorful" strength={0.7} theme="dark" className="w-full block">
        <div className="relative w-full rounded-[22px] sm:rounded-[26px] bg-[#141416]/90 backdrop-blur-xl border border-white/10 shadow-2xl p-3 transition-all">
          {selectedImage && (
            <div className="mb-2 relative inline-block">
              <img
                src={selectedImage}
                alt="Crop photo to send"
                className="h-16 w-16 object-cover rounded-xl border border-white/20 shadow-md"
              />
              <button
                type="button"
                onClick={() => setSelectedImage(null)}
                aria-label="Remove photo"
                className="absolute -top-1.5 -right-1.5 p-0.5 rounded-full bg-red-600 text-white hover:bg-red-700 shadow-md transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          <div className="min-h-[40px] flex items-center">
            <textarea
              ref={textareaRef}
              rows={1}
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 160) + 'px';
              }}
              onKeyDown={handleKeyDown}
              placeholder={isDictating ? 'Listening…' : placeholder}
              aria-label={placeholder}
              disabled={isLoading}
              className="w-full bg-transparent text-white placeholder-white/35 text-sm sm:text-base outline-none resize-none leading-relaxed px-0.5 disabled:opacity-60"
            />
          </div>

          <div className="flex items-center justify-between pt-2 mt-1">
            <div className="flex items-center gap-1.5">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  aria-haspopup="menu"
                  aria-expanded={isMenuOpen}
                  aria-label="Attach or speak"
                  className="w-8 h-8 rounded-full bg-white/[0.07] hover:bg-white/15 text-white/70 hover:text-white flex items-center justify-center text-sm font-semibold transition-colors"
                >
                  @
                </button>

                {isMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setIsMenuOpen(false)} />
                    <div
                      role="menu"
                      className="absolute left-0 bottom-full mb-2 w-52 rounded-xl bg-[#222227] border border-white/10 shadow-2xl py-1 z-40 text-xs text-white/90"
                    >
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          fileInputRef.current?.click();
                          setIsMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 flex items-center gap-2.5 hover:bg-white/10 transition-colors"
                      >
                        <ImageIcon className="w-4 h-4 text-emerald-400" />
                        <span>Upload crop photo</span>
                      </button>
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          onOpenVoice();
                          setIsMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 flex items-center gap-2.5 hover:bg-white/10 transition-colors"
                      >
                        <AudioLines className="w-4 h-4 text-emerald-400" />
                        <span>Voice conversation</span>
                      </button>
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          onOpenCamera();
                          setIsMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 flex items-center gap-2.5 hover:bg-white/10 transition-colors"
                      >
                        <Video className="w-4 h-4 text-emerald-400" />
                        <span>Show crop on camera</span>
                      </button>
                    </div>
                  </>
                )}
              </div>

              <button
                type="button"
                onClick={toggleDictation}
                aria-pressed={isDictating}
                title={isDictating ? 'Stop voice typing' : 'Voice typing'}
                aria-label={isDictating ? 'Stop voice typing' : 'Voice typing'}
                className={
                  'w-8 h-8 rounded-full flex items-center justify-center transition-colors ' +
                  (isDictating
                    ? 'bg-red-500/20 text-red-300 animate-pulse'
                    : 'bg-white/[0.07] hover:bg-white/15 text-white/70 hover:text-white')
                }
              >
                <Mic className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={onOpenVoice}
                title="Open voice assistant"
                aria-label="Open voice assistant"
                className="w-8 h-8 rounded-full bg-white/[0.07] hover:bg-white/15 text-white/70 hover:text-white flex items-center justify-center transition-colors"
              >
                <AudioLines className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={onOpenCamera}
                title="Show your crop on camera"
                aria-label="Show your crop on camera"
                className="w-8 h-8 rounded-full bg-white/[0.07] hover:bg-white/15 text-white/70 hover:text-white flex items-center justify-center transition-colors"
              >
                <Video className="w-4 h-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => handleSubmit()}
              disabled={!canSubmit}
              aria-label="Send message"
              className={
                'w-8 h-8 rounded-full flex items-center justify-center transition-all ' +
                (canSubmit
                  ? 'bg-white text-black hover:bg-white/90 shadow-md active:scale-95'
                  : 'bg-white/[0.08] text-white/35 cursor-not-allowed')
              }
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ArrowUp className="w-4 h-4 stroke-[2.2]" />
              )}
            </button>
          </div>
        </div>
      </BorderBeam>
    </div>
  );
};
