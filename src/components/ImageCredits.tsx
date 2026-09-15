import { useState } from 'react';
import { ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { PHOTO_CREDITS } from '@/data/imageCredits';

/**
 * Photo credits for the Agri Market catalogue.
 *
 * Catalogue photographs come from Wikimedia Commons, chosen to prefer CC0 and
 * public domain — neither of which requires credit. A handful of products had
 * no free-of-obligation image available, so a CC BY or CC BY-SA file was used
 * instead, and those licences require the author to be named wherever the work
 * is shown. This component is that notice; removing it would put the app in
 * breach of the licence.
 *
 * Only the entries that actually carry an obligation are listed. Naming the
 * CC0 files too would bury the few that legally matter among dozens that do
 * not.
 */
const ImageCredits = () => {
  const { tx } = useLanguage();
  const [open, setOpen] = useState(false);

  if (PHOTO_CREDITS.length === 0) return null;

  return (
    <div className="glass rounded-2xl p-6">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-2 text-left"
      >
        <span className="font-semibold text-lg">{tx('Photo credits', 'चित्र आभार')}</span>
        {open ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>

      {open && (
        <div className="mt-4 space-y-3">
          <p className="text-sm text-muted-foreground">
            {tx(
              'Catalogue photographs come from Wikimedia Commons. Most are public domain or CC0. These require attribution:',
              'सूची के चित्र विकिमीडिया कॉमन्स से हैं। अधिकांश सार्वजनिक डोमेन या CC0 हैं। इनके लिए आभार आवश्यक है:',
            )}
          </p>

          <ul className="space-y-2">
            {PHOTO_CREDITS.map((a) => (
              <li key={a.asset} className="text-xs leading-relaxed text-muted-foreground">
                <span className="font-medium text-foreground">{a.author || 'Unknown'}</span>
                {' — '}
                <span>{a.licence}</span>
                {a.source && (
                  <>
                    {' '}
                    <a
                      href={a.source}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="inline-flex items-center gap-0.5 text-primary underline underline-offset-2"
                    >
                      {tx('source', 'स्रोत')}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ImageCredits;
