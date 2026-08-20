import { useEffect, useMemo, useState } from 'react';
import { Check, Globe, Search, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { LANGUAGES, AUTHORED } from '@/i18n/languages';
import { cn } from '@/lib/utils';
import { ensureAllScripts } from '@/lib/fonts';

/**
 * Language chooser for all 22 Eighth Schedule languages plus English.
 * Each option is labelled in its own script, so it is legible to a speaker
 * who cannot read the language the app is currently showing.
 */
export default function LanguagePicker({ trigger }: { trigger?: React.ReactNode }) {
  const { language, setLanguage, tx, translating } = useLanguage();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  // Every endonym is on screen at once here, so this is the one place that
  // genuinely needs all eleven scripts. Requested on open rather than on mount
  // so the cost lands only on people who actually go looking for it.
  useEffect(() => {
    if (open) ensureAllScripts();
  }, [open]);

  const current = LANGUAGES.find((l) => l.code === language);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return LANGUAGES;
    return LANGUAGES.filter(
      (l) =>
        l.english.toLowerCase().includes(q) ||
        l.native.toLowerCase().includes(q) ||
        l.code.includes(q),
    );
  }, [query]);

  const choose = (code: string) => {
    setLanguage(code);
    setOpen(false);
    setQuery('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline" className="gap-2">
            <Globe className="h-4 w-4" />
            {current?.native ?? 'Language'}
            {translating && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-lg gap-0 p-0">
        <DialogHeader className="border-b border-border p-5 pb-4">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Globe className="h-5 w-5 text-primary" />
            {tx('Choose your language', 'अपनी भाषा चुनें')}
          </DialogTitle>
        </DialogHeader>

        <div className="p-5 pb-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={tx('Search language…', 'भाषा खोजें…')}
              className="pl-9"
            />
          </div>
        </div>

        <div className="max-h-[52vh] overflow-y-auto px-5 pb-5">
          {filtered.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              {tx('No language found', 'कोई भाषा नहीं मिली')}
            </p>
          ) : (
            <ul className="grid grid-cols-2 gap-2">
              {filtered.map((l) => {
                const active = l.code === language;
                return (
                  <li key={l.code}>
                    <button
                      onClick={() => choose(l.code)}
                      dir={l.rtl ? 'rtl' : 'ltr'}
                      className={cn(
                        'flex w-full items-center justify-between gap-2 rounded-xl border px-3 py-2.5 text-left transition-colors',
                        active
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/40 hover:bg-foreground/[0.04]',
                      )}
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold text-foreground">
                          {l.native}
                        </span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {l.english}
                        </span>
                      </span>
                      {active && <Check className="h-4 w-4 flex-shrink-0 text-primary" />}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          <p className="mt-4 border-t border-border pt-3 text-[11px] leading-snug text-muted-foreground">
            {tx(
              'English and Hindi are written by our team. Other languages are translated automatically — tell us if something reads wrong.',
              'अंग्रेज़ी और हिंदी हमारी टीम ने लिखी हैं। बाकी भाषाएँ अपने आप अनुवाद होती हैं — कुछ ग़लत लगे तो बताएं।',
            )}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/** True when the active language ships hand-authored strings. */
export const isAuthored = (code: string) => AUTHORED.has(code);
