import React, { useState } from 'react';
import {
  Lightbulb,
  Copy,
  Check,
  RotateCw,
  Volume2,
  ThumbsUp,
  ThumbsDown,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
} from 'lucide-react';
import { ChatMessageItem } from './types';
import { DynamicAvatar } from './DynamicAvatar';

interface ChatMessageProps {
  message: ChatMessageItem;
  onRetry?: () => void;
  onSpeak?: (text: string) => void;
  onLike?: (isLiked: boolean) => void;
}

/**
 * One turn of the advisory conversation.
 *
 * User turns are a right-aligned bubble; assistant turns are full-width with
 * the avatar and an action row, which is the layout farmers already read as
 * "the answer" rather than "a reply to me".
 */
export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  onRetry,
  onSpeak,
  onLike,
}) => {
  const [isCopied, setIsCopied] = useState(false);
  const [isThinkingOpen, setIsThinkingOpen] = useState(false);
  const isUser = message.sender === 'user';

  const handleCopy = async () => {
    try {
      if (!navigator.clipboard) return;
      await navigator.clipboard.writeText(message.text);
      setIsCopied(true);
      window.setTimeout(() => setIsCopied(false), 1800);
    } catch {
      // Clipboard unavailable — the text is still selectable by hand.
    }
  };

  if (isUser) {
    return (
      <div className="w-full flex justify-end mb-5 px-2">
        <div className="max-w-[85%] sm:max-w-[70%]">
          {message.image && (
            <div className="mb-2 rounded-xl overflow-hidden border border-white/10 max-h-60">
              <img src={message.image} alt="Attached crop photo" className="w-full h-full object-cover" />
            </div>
          )}
          {message.text && (
            <div className="px-4 py-2.5 rounded-2xl rounded-tr-sm bg-[#222226] text-white text-sm sm:text-base leading-relaxed shadow-sm inline-block whitespace-pre-wrap break-words">
              {message.text}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex gap-3 mb-6 px-2">
      <div className="flex-shrink-0 pt-0.5">
        <DynamicAvatar size={32} animation="idle" />
      </div>

      <div className="flex-1 min-w-0">
        {message.thinking && !message.isError && (
          <div className="mb-2">
            <button
              type="button"
              onClick={() => setIsThinkingOpen(!isThinkingOpen)}
              aria-expanded={isThinkingOpen}
              className="flex items-center gap-1.5 text-[11px] text-white/45 hover:text-white/70 transition-colors"
            >
              <Lightbulb className="w-3 h-3" />
              <span>Reasoning</span>
              {isThinkingOpen ? (
                <ChevronUp className="w-3 h-3" />
              ) : (
                <ChevronDown className="w-3 h-3" />
              )}
            </button>
            {isThinkingOpen && (
              <p className="mt-1.5 pl-4 border-l border-white/10 text-[11px] text-white/50 leading-relaxed whitespace-pre-wrap">
                {message.thinking}
              </p>
            )}
          </div>
        )}

        <div
          className={`text-sm sm:text-base leading-relaxed whitespace-pre-wrap break-words ${
            message.isError ? 'text-amber-200/90' : 'text-white/90'
          }`}
        >
          {message.isError && (
            <AlertTriangle className="inline-block w-4 h-4 mr-1.5 -mt-0.5 text-amber-400" />
          )}
          {message.text}
        </div>

        <div className="flex items-center gap-0.5 mt-2.5 -ml-1.5">
          <button
            type="button"
            onClick={handleCopy}
            title="Copy"
            aria-label="Copy answer"
            className="p-1.5 rounded-md hover:bg-white/10 text-white/40 hover:text-white/80 transition-colors"
          >
            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          <button
            type="button"
            onClick={() => onSpeak?.(message.text)}
            title="Listen"
            aria-label="Listen to this answer"
            className="p-1.5 rounded-md hover:bg-white/10 text-white/40 hover:text-white/80 transition-colors"
          >
            <Volume2 className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={onRetry}
            title="Ask again"
            aria-label="Ask again"
            className="p-1.5 rounded-md hover:bg-white/10 text-white/40 hover:text-white/80 transition-colors"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>

          {!message.isError && (
            <>
              <button
                type="button"
                onClick={() => onLike?.(true)}
                title="Helpful"
                aria-label="Mark answer helpful"
                aria-pressed={message.isLiked === true}
                className={`p-1.5 rounded-md hover:bg-white/10 transition-colors ${
                  message.isLiked === true ? 'text-emerald-400' : 'text-white/40 hover:text-white/80'
                }`}
              >
                <ThumbsUp className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onLike?.(false)}
                title="Not helpful"
                aria-label="Mark answer not helpful"
                aria-pressed={message.isLiked === false}
                className={`p-1.5 rounded-md hover:bg-white/10 transition-colors ${
                  message.isLiked === false ? 'text-red-400' : 'text-white/40 hover:text-white/80'
                }`}
              >
                <ThumbsDown className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
