import React, { useState } from 'react';
import { ChevronDown, Plus, Trash2, Sparkles, Check, Share2, Languages } from 'lucide-react';

interface ChatHeaderProps {
  chatTitle: string;
  /** Endonym of the active language, e.g. "हिन्दी". */
  languageLabel: string;
  onNewChat: () => void;
  onClearHistory: () => void;
  onOpenVoice: () => void;
}

/**
 * Title bar for the advisory chat: conversation menu on the left, share on the
 * right, and the active language shown as a static chip so a farmer can see
 * which language the assistant will answer in without opening a menu. The chip
 * is deliberately not a picker — language is owned by the app-wide switcher in
 * the main navigation, and two controls for one setting invites drift.
 */
export const ChatHeader: React.FC<ChatHeaderProps> = ({
  chatTitle,
  languageLabel,
  onNewChat,
  onClearHistory,
  onOpenVoice,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const handleShare = async () => {
    try {
      if (!navigator.clipboard) return;
      await navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      window.setTimeout(() => setIsCopied(false), 2000);
    } catch {
      // Clipboard blocked (insecure context or denied) — silently skip.
    }
  };

  return (
    <header className="relative w-full flex items-center justify-between px-4 py-3 sm:px-5 sm:py-3.5 bg-[#0f0f11] border-b border-white/10 text-white select-none z-20 rounded-t-3xl">
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          aria-haspopup="menu"
          aria-expanded={isDropdownOpen}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-white/5 transition-colors text-base sm:text-lg font-medium tracking-tight text-white/95"
        >
          <span>{chatTitle}</span>
          <ChevronDown className="w-4 h-4 text-white/60" />
        </button>

        {isDropdownOpen && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setIsDropdownOpen(false)} />
            <div
              role="menu"
              className="absolute left-0 mt-2 w-52 rounded-xl bg-[#1a1a1e] border border-white/10 shadow-2xl py-1.5 z-40 text-xs text-white/90"
            >
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  onNewChat();
                  setIsDropdownOpen(false);
                }}
                className="w-full text-left px-3 py-2 flex items-center gap-2.5 hover:bg-white/10 transition-colors"
              >
                <Plus className="w-3.5 h-3.5 text-emerald-400" />
                <span>New chat</span>
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  onOpenVoice();
                  setIsDropdownOpen(false);
                }}
                className="w-full text-left px-3 py-2 flex items-center gap-2.5 hover:bg-white/10 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>Voice assistant</span>
              </button>
              <div className="my-1 border-t border-white/10" />
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  onClearHistory();
                  setIsDropdownOpen(false);
                }}
                className="w-full text-left px-3 py-2 flex items-center gap-2.5 hover:bg-red-500/15 text-red-300 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear messages</span>
              </button>
            </div>
          </>
        )}
      </div>

      <div className="flex items-center gap-1.5">
        <span className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.06] border border-white/10 text-[11px] text-white/70">
          <Languages className="w-3 h-3" />
          {languageLabel}
        </span>
        <button
          type="button"
          onClick={handleShare}
          title="Copy link to this page"
          aria-label="Copy link to this page"
          className="p-2 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors"
        >
          {isCopied ? (
            <Check className="w-4 h-4 text-emerald-400" />
          ) : (
            <Share2 className="w-4 h-4" />
          )}
        </button>
      </div>
    </header>
  );
};
