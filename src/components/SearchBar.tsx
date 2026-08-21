import { useState } from 'react';
import { Search } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import SpotlightSearch from '@/components/ui/spotlight-search';

/**
 * The home page's search field.
 *
 * It no longer searches inline. Both this and the top bar's field open the
 * same spotlight palette, because two search boxes that look alike and behave
 * differently is worse than either one alone — this used to require a submit
 * and a page navigation to show anything, while the palette answers as you
 * type over the same catalogues.
 *
 * The field stays as a button rather than becoming one, so the affordance a
 * visitor already recognises is unchanged; only what happens on click is.
 * `readOnly` rather than `disabled`, so it still takes focus and a keyboard
 * user reaches it in the normal tab order.
 */
export default function SearchBar() {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);

  return (
    <>
      <SpotlightSearch open={open} onClose={() => setOpen(false)} />

      <div className="group relative w-full max-w-2xl glass !rounded-full p-2 transition-[transform,box-shadow,border-color,background-color] duration-500 hover:shadow-elevated focus-within:border-primary/50 focus-within:shadow-glow-primary">
        <Search
          className="pointer-events-none absolute left-6 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground transition-colors duration-300 group-focus-within:text-primary"
          strokeWidth={1.75}
        />
        <input
          type="text"
          readOnly
          onFocus={() => setOpen(true)}
          onClick={() => setOpen(true)}
          placeholder={t('searchPlaceholder')}
          aria-label={t('searchPlaceholder')}
          className="h-14 w-full cursor-pointer rounded-full border-0 bg-transparent pl-14 pr-4 text-lg font-medium text-foreground outline-none placeholder:text-muted-foreground"
        />
      </div>
    </>
  );
}
