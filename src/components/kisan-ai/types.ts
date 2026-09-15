/**
 * Types for the Kisan AI assistant surface (chat + voice).
 *
 * Kept local to the feature rather than in a shared `src/types` module because
 * nothing outside `components/kisan-ai` and `pages/KisanHelp` consumes them.
 */

export type OrbState =
  | 'working'
  | 'searching'
  | 'solving'
  | 'listening'
  | 'connecting'
  | 'weaving'
  | 'composing'
  | 'breathing'
  | 'shaping';

export interface ChatMessageItem {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  /** Short summary of how the answer was produced; rendered behind a toggle. */
  thinking?: string;
  /** Data URL of an attached crop photo, when the turn carried one. */
  image?: string;
  isLiked?: boolean | null;
  /** Set when the turn failed, so the bubble can offer a retry. */
  isError?: boolean;
  /**
   * Language this turn is actually written in, detected server-side.
   *
   * Needed because it can differ from the UI language — a farmer browsing in
   * English who types Hinglish gets a Hindi answer, and speaking it aloud with
   * an English voice would be unintelligible.
   */
  language?: string;
}

export type VoiceStatus = 'idle' | 'listening' | 'processing' | 'speaking';

/**
 * An answer together with the language to speak it in.
 *
 * The voice surfaces need both: the detected language can differ from the UI
 * language, and the wrong voice makes a correct answer unusable.
 */
export interface SpokenAnswer {
  reply: string;
  language?: string;
}
