import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import SpotlightSearch from '@/components/ui/spotlight-search';
import { GooeyInput } from '@/components/ui/gooey-input';

/**
 * The home page's search field.
 *
 * It does not search inline. Both this and the top bar's field open the same
 * spotlight palette, because two search boxes that look alike and behave
 * differently is worse than either one alone — this used to require a submit
 * and a page navigation to show anything, while the palette answers as you
 * type over the same catalogues.
 *
 * The pill is therefore an affordance, not an input: `readOnlyTrigger` keeps it
 * from taking the caret, so it never competes with the palette it opened. Its
 * expansion is driven by the palette's own open state, so the goo plays on the
 * way in and reverses when the palette closes.
 */
export default function SearchBar() {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);

  return (
    <>
      <SpotlightSearch open={open} onClose={() => setOpen(false)} />

      <div className="flex w-full max-w-2xl justify-center">
        <GooeyInput
          open={open}
          onOpenChange={setOpen}
          readOnlyTrigger
          placeholder={t('searchPlaceholder')}
          aria-label={t('searchPlaceholder')}
          collapsedWidth={190}
          expandedWidth={300}
          expandedOffset={56}
          classNames={{
            // The default surface is `bg-foreground`, which on this page reads
            // as a black slab over the field photograph. Primary green keeps
            // the pill legible against the hero without inverting the page.
            trigger: 'bg-primary text-primary-foreground ring-primary/40',
            bubbleSurface: 'bg-primary text-primary-foreground ring-primary/40',
            input: 'text-primary-foreground placeholder:text-primary-foreground/70',
          }}
        />
      </div>
    </>
  );
}
