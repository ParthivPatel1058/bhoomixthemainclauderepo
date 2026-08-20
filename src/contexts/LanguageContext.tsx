import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AUTHORED, LANGUAGE_MAP, isRTL, type LanguageCode } from '@/i18n/languages';
import { ensureScriptFor, fontStackFor } from '@/lib/fonts';
import { translations } from '@/i18n/strings';

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  /** Look up a hand-authored key from the string table. */
  t: (key: string) => string;
  /**
   * Inline pair used throughout the pages: `tx('Orders', 'ऑर्डर')`.
   * English and Hindi are returned as written; any other language resolves
   * through the machine-translation cache, falling back to English until it
   * arrives.
   */
  tx: (en: string, hi: string) => string;
  /** True while strings for a newly selected language are still loading. */
  translating: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const cacheKey = (lang: string) => `bx_i18n_${lang}`;

function readCache(lang: string): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(cacheKey(lang)) ?? '{}');
  } catch {
    return {};
  }
}

function writeCache(lang: string, dict: Record<string, string>) {
  try {
    localStorage.setItem(cacheKey(lang), JSON.stringify(dict));
  } catch {
    // Quota exceeded — the server cache still makes the next load fast.
  }
}

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    const saved = localStorage.getItem('language');
    return saved && LANGUAGE_MAP[saved] ? saved : 'en';
  });

  const [dict, setDict] = useState<Record<string, string>>(() =>
    AUTHORED.has(language) ? {} : readCache(language),
  );
  const [translating, setTranslating] = useState(false);

  // Strings seen during render that have no translation yet. Collected in a
  // ref so requesting them never itself triggers a render.
  const pending = useRef<Set<string>>(new Set());
  const timer = useRef<number | null>(null);
  const inFlight = useRef<Set<string>>(new Set());

  const flush = useCallback(async () => {
    const lang = language;
    if (AUTHORED.has(lang)) return;

    const batch = [...pending.current].filter((s) => !inFlight.current.has(s)).slice(0, 100);
    pending.current.clear();
    if (batch.length === 0) return;

    batch.forEach((s) => inFlight.current.add(s));
    setTranslating(true);
    try {
      const { data, error } = await supabase.functions.invoke('translate', {
        body: { lang, texts: batch },
      });
      if (!error && data?.translations) {
        // Language may have changed while the request was in flight.
        setDict((prev) => {
          if (language !== lang) return prev;
          const next = { ...prev, ...data.translations };
          writeCache(lang, next);
          return next;
        });
      }
    } catch {
      // Leave the English fallback in place.
    } finally {
      batch.forEach((s) => inFlight.current.delete(s));
      setTranslating(false);
    }
  }, [language]);

  const request = useCallback(
    (text: string) => {
      pending.current.add(text);
      if (timer.current !== null) window.clearTimeout(timer.current);
      // Batch everything one render pass produces into a single call.
      timer.current = window.setTimeout(() => void flush(), 60);
    },
    [flush],
  );

  const setLanguage = useCallback((lang: LanguageCode) => {
    if (!LANGUAGE_MAP[lang]) return;
    setLanguageState(lang);
    localStorage.setItem('language', lang);
    setDict(AUTHORED.has(lang) ? {} : readCache(lang));
    pending.current.clear();
    inFlight.current.clear();
  }, []);

  // Scripts like Urdu, Kashmiri and Sindhi run right to left.
  //
  // The webfont for the language's script is requested here too. Without it
  // every non-Latin language fell back to a system face, so the app was
  // designed in English and improvised in the other twenty-two.
  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = isRTL(language) ? 'rtl' : 'ltr';
    ensureScriptFor(language);
    document.documentElement.style.setProperty('--font-script', fontStackFor(language));
  }, [language]);

  // Warm the cache with the whole static table so the shell is translated in
  // one call instead of trickling in per component.
  useEffect(() => {
    if (AUTHORED.has(language)) return;
    const cached = readCache(language);
    const missing = Object.values(translations.en).filter((v) => !(v in cached));
    if (missing.length === 0) return;
    missing.slice(0, 100).forEach((v) => pending.current.add(v));
    void flush();
  }, [language, flush]);

  const resolve = useCallback(
    (english: string): string => {
      const hit = dict[english];
      if (hit) return hit;
      if (english.trim()) request(english);
      return english;
    },
    [dict, request],
  );

  const t = useCallback(
    (key: string): string => {
      const en = translations.en[key as keyof typeof translations.en];
      if (language === 'en') return en ?? key;
      if (language === 'hi') return translations.hi[key as keyof typeof translations.hi] ?? en ?? key;
      return en ? resolve(en) : key;
    },
    [language, resolve],
  );

  const tx = useCallback(
    (en: string, hi: string): string => {
      if (language === 'en') return en;
      if (language === 'hi') return hi;
      return resolve(en);
    },
    [language, resolve],
  );

  const value = useMemo(
    () => ({ language, setLanguage, t, tx, translating }),
    [language, setLanguage, t, tx, translating],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
