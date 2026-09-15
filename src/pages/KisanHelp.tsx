import { useCallback, useEffect, useRef, useState } from 'react';
import Navigation from '@/components/Navigation';
import BackButton from '@/components/BackButton';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { kisanChat, kisanImageAnalysis, kisanVisionChat, isGeminiConfigured } from '@/lib/geminiApi';
import type { KisanReply } from '@/lib/geminiApi';
import { ChatHeader } from '@/components/kisan-ai/ChatHeader';
import { ChatMessage } from '@/components/kisan-ai/ChatMessage';
import { ChatInput } from '@/components/kisan-ai/ChatInput';
import { VoiceAssistantModal } from '@/components/kisan-ai/VoiceAssistantModal';
import { LiveCameraModal } from '@/components/kisan-ai/LiveCameraModal';
import { DynamicAvatar } from '@/components/kisan-ai/DynamicAvatar';
import { ThinkingOrbDisplay } from '@/components/kisan-ai/ThinkingOrbDisplay';
import { audioService, languageLabel } from '@/components/kisan-ai/audioService';
import type { ChatMessageItem } from '@/components/kisan-ai/types';

/**
 * Kisan advisory: one conversation that handles both questions and crop photos.
 *
 * Replaces the previous two-panel layout (a separate upload box beside a chat
 * box). A photo is now just another turn in the thread, which is how a farmer
 * actually asks — "what is wrong with this plant?" is a question *about* an
 * image, not a separate mode.
 *
 * Every model call goes through `@/lib/geminiApi`, which invokes the Supabase
 * edge functions. No provider key reaches the browser and no extra server
 * listens on a port — the advisory runs entirely on the existing backend.
 */
const KisanHelp = () => {
  const { t, language } = useLanguage();
  const { toast } = useToast();

  const [messages, setMessages] = useState<ChatMessageItem[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const scrollAreaRef = useRef<HTMLDivElement | null>(null);

  const configured = isGeminiConfigured();

  // Warm the synthesis voice list early; Chrome fills it asynchronously and the
  // first spoken reply would otherwise pick the wrong language.
  useEffect(() => {
    audioService.primeVoices();
  }, []);

  // Any audio must die with the page, or a reply keeps speaking after navigation.
  useEffect(() => {
    return () => {
      audioService.stopSpeaking();
      audioService.stopMicrophone();
    };
  }, []);

  useEffect(() => {
    // Scroll the thread container itself rather than the window, so the page
    // header stays put instead of the whole document jumping on every turn.
    const area = scrollAreaRef.current;
    if (area) area.scrollTo({ top: area.scrollHeight, behavior: 'smooth' });
  }, [messages, isGenerating]);

  const pushMessage = useCallback((message: ChatMessageItem) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  /**
   * Send one turn and append the answer.
   *
   * Returns the answer text so the voice modal can speak it — it needs the
   * string back, not just the side effect on the thread.
   */
  const handleSendMessage = useCallback(
    async (text: string, image?: string): Promise<KisanReply | undefined> => {
      if (!text.trim() && !image) return undefined;

      pushMessage({
        id: `user-${Date.now()}`,
        sender: 'user',
        text,
        image,
        timestamp: new Date().toISOString(),
      });

      setIsGenerating(true);

      try {
        if (!configured) {
          throw new Error('The advisory service is not configured for this build.');
        }

        const answer = image
          ? await kisanImageAnalysis(image, language)
          : await kisanChat(text, language);

        pushMessage({
          id: `assistant-${Date.now()}`,
          sender: 'assistant',
          text: answer.reply,
          thinking: image
            ? 'Analysed the crop photo through the crop-vision advisory model.'
            : undefined,
          timestamp: new Date().toISOString(),
          language: answer.language,
          isLiked: null,
        });

        return answer;
      } catch (error) {
        const description =
          error instanceof Error ? error.message : 'Could not reach the advisory service.';

        pushMessage({
          id: `assistant-error-${Date.now()}`,
          sender: 'assistant',
          text: description,
          timestamp: new Date().toISOString(),
          isError: true,
        });

        toast({
          title: 'Error',
          description,
          variant: 'destructive',
        });

        return undefined;
      } finally {
        setIsGenerating(false);
      }
    },
    [configured, language, pushMessage, toast],
  );

  /** Re-ask the question that produced a given answer. */
  const handleRetry = useCallback(
    (messageId: string) => {
      const index = messages.findIndex((m) => m.id === messageId);
      if (index <= 0) return;
      const previous = messages[index - 1];
      if (previous?.sender !== 'user') return;
      void handleSendMessage(previous.text, previous.image);
    },
    [messages, handleSendMessage],
  );

  /** Speak a turn in the language it was written in, not the UI language. */
  const handleSpeak = useCallback(
    (text: string, spokenLanguage?: string) => {
      audioService.speakText(text, spokenLanguage || language);
    },
    [language],
  );

  const handleLike = useCallback((messageId: string, isLiked: boolean) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === messageId ? { ...m, isLiked: m.isLiked === isLiked ? null : isLiked } : m,
      ),
    );
  }, []);

  /**
   * One live-camera exchange: the frame and the spoken question both land in
   * the thread, so the conversation still reads correctly after the camera
   * closes and the answer can be replayed or copied like any other.
   */
  const handleCameraAsk = useCallback(
    async (frame: string, question: string): Promise<KisanReply | undefined> => {
      pushMessage({
        id: `user-cam-${Date.now()}`,
        sender: 'user',
        text: question,
        image: frame,
        timestamp: new Date().toISOString(),
      });

      try {
        if (!configured) {
          throw new Error('The advisory service is not configured for this build.');
        }

        const answer = await kisanVisionChat(frame, question, language);

        pushMessage({
          id: `assistant-cam-${Date.now()}`,
          sender: 'assistant',
          text: answer.reply,
          thinking: 'Answered from a live camera frame.',
          timestamp: new Date().toISOString(),
          language: answer.language,
          isLiked: null,
        });

        return answer;
      } catch (error) {
        const description =
          error instanceof Error ? error.message : 'Could not reach the advisory service.';

        pushMessage({
          id: `assistant-cam-error-${Date.now()}`,
          sender: 'assistant',
          text: description,
          timestamp: new Date().toISOString(),
          isError: true,
        });

        return undefined;
      }
    },
    [configured, language, pushMessage],
  );

  const handleClear = useCallback(() => {
    audioService.stopSpeaking();
    setMessages([]);
  }, []);

  return (
    <div className="min-h-screen">
      <Navigation />

      <div className="px-4 lg:px-6 pt-5">
        <BackButton />
      </div>

      <div className="container mx-auto px-4 pb-8 pt-4 sm:px-6 lg:px-8">
        <div className="w-full">
          <div className="flex flex-col rounded-3xl bg-[#0d0d10] border border-white/10 shadow-2xl overflow-hidden h-[calc(100vh-11rem)] min-h-[34rem]">
            <ChatHeader
              chatTitle={t('aiAssistant')}
              languageLabel={languageLabel(language)}
              onNewChat={handleClear}
              onClearHistory={handleClear}
              onOpenVoice={() => setIsVoiceOpen(true)}
            />

            <main ref={scrollAreaRef} className="flex-1 overflow-y-auto py-4">
              <div className="mx-auto w-full max-w-3xl px-2 sm:px-4">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center px-8 gap-4">
                  <div className="p-2 rounded-full bg-white/[0.03] border border-white/10 shadow-lg">
                    <DynamicAvatar size={64} animation="idle" />
                  </div>
                  <h2 className="text-lg font-medium text-white/80">{t('askAIAssistant')}</h2>
                  <p className="text-sm text-white/40 max-w-sm leading-relaxed">
                    {t('cropDiseaseDetection')} — {t('clickToSelect')}
                  </p>
                </div>
              ) : (
                messages.map((message) => (
                  <ChatMessage
                    key={message.id}
                    message={message}
                    onRetry={() => handleRetry(message.id)}
                    onSpeak={(text) => handleSpeak(text, message.language)}
                    onLike={(liked) => handleLike(message.id, liked)}
                  />
                ))
              )}

              {isGenerating && (
                <div className="flex items-center gap-3 mb-6 px-2">
                  <div className="flex-shrink-0 w-8 flex items-center justify-center">
                    <ThinkingOrbDisplay state="working" size={20} scale={1.4} />
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white/60">
                    <span>{t('thinking')}</span>
                  </div>
                </div>
              )}
              </div>
            </main>

            <div className="mx-auto w-full max-w-3xl">
            <ChatInput
              onSendMessage={(text, image) => void handleSendMessage(text, image)}
              onOpenVoice={() => setIsVoiceOpen(true)}
              onOpenCamera={() => setIsCameraOpen(true)}
              isLoading={isGenerating}
              placeholder={t('askYourQuestion')}
              language={language}
            />
            </div>
          </div>
        </div>
      </div>

      <VoiceAssistantModal
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
        onSendMessage={handleSendMessage}
        language={language}
      />

      <LiveCameraModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onAsk={handleCameraAsk}
        language={language}
      />
    </div>
  );
};

export default KisanHelp;
