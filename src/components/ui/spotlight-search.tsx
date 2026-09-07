import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  ChevronRight,
  IndianRupee,
  Landmark,
  Leaf,
  Package,
  ScanSearch,
  Search,
  ShieldAlert,
  ShoppingBag,
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { AGRI_PRODUCTS } from '@/data/agriProducts';
import { cn } from '@/lib/utils';

/**
 * Spotlight search — a full-screen command palette over the whole app.
 *
 * Adapted from the Apple-spotlight reference rather than pasted. The reference
 * is a demo: it ships a hardcoded list of macOS apps, links out with
 * `<a target="_blank">`, and paints itself in fixed light greys. Those choices
 * are all wrong here, and each is fixed below and noted where it matters.
 *
 * ## What it searches
 *
 * The same catalogues `/search` reads — Agri Market and AgriNova Mart — plus
 * the app's own destinations. Results are live as you type instead of only
 * after a submit, so the box answers the question rather than handing it to
 * another page. Matching runs over both scripts, so a Hindi query finds Hindi
 * product names, which is the behaviour `SearchResults` already had and would
 * have been a regression to lose.
 *
 * ## Keyboard
 *
 * Cmd/Ctrl-K opens it. The top bar has advertised that shortcut for a while
 * with a `⌘K` badge, but it only focused the inline input — this is what the
 * badge always implied. Arrow keys move, Enter opens, Escape closes. A command
 * palette without arrow keys is unusable by the people most likely to reach
 * for one, and the reference has none.
 *
 * ## Presentation
 *
 * The gooey `url(#blob)` morph is kept — it is the thing that makes the
 * reference feel expensive — but the filter id is suffixed per instance, since
 * SVG filter ids are global and two mounted palettes would fight over one.
 * The filter is also dropped entirely once the panel settles: leaving a
 * `feGaussianBlur` live over live text keeps a full-screen offscreen buffer
 * around and softens every glyph underneath it.
 *
 * Colours come from tokens. The reference's `bg-neutral-100` / `text-black`
 * would render black-on-black the moment the theme flips.
 */

interface Destination {
  label: string;
  labelHi: string;
  hint: string;
  hintHi: string;
  to: string;
  icon: typeof Search;
}

const DESTINATIONS: Destination[] = [
  { label: 'Crop Intelligence', labelHi: 'फसल इंटेलिजेंस', hint: 'Scan a leaf, name the disease', hintHi: 'पत्ती स्कैन करें, रोग जानें', to: '/crop-disease', icon: ScanSearch },
  { label: 'Mandi Prices', labelHi: 'मंडी भाव', hint: "Today's government rates", hintHi: 'आज के सरकारी भाव', to: '/mandi-prices', icon: IndianRupee },
  { label: 'Agri Market', labelHi: 'कृषि बाज़ार', hint: 'Seeds, fertiliser, tools', hintHi: 'बीज, उर्वरक, उपकरण', to: '/agri-market', icon: ShoppingBag },
  { label: 'Damage Claim', labelHi: 'नुकसान दावा', hint: 'Report inside the 72-hour window', hintHi: '72 घंटे के भीतर रिपोर्ट करें', to: '/damage-report', icon: ShieldAlert },
  { label: 'Schemes', labelHi: 'योजनाएं', hint: 'Central and state benefits', hintHi: 'केंद्र और राज्य की योजनाएं', to: '/gov-schemes', icon: Landmark },
  { label: 'Orders', labelHi: 'ऑर्डर', hint: 'Track and reorder', hintHi: 'ट्रैक करें और दोबारा ऑर्डर करें', to: '/orders', icon: Package },
  { label: 'Organic Farming', labelHi: 'जैविक खेती', hint: 'Certified seed and natural inputs', hintHi: 'प्रमाणित बीज और प्राकृतिक सामग्री', to: '/organic-farming', icon: Leaf },
];

interface Hit {
  key: string;
  label: string;
  hint: string;
  to: string;
  icon: typeof Search;
}

const MAX_HITS = 8;

interface SpotlightSearchProps {
  open: boolean;
  onClose: () => void;
}

export default function SpotlightSearch({ open, onClose }: SpotlightSearchProps) {
  const navigate = useNavigate();
  const { tx } = useLanguage();
  const reduced = useReducedMotion();

  const [value, setValue] = useState('');
  const [active, setActive] = useState(0);
  const [settled, setSettled] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // SVG filter ids are document-global; a suffix keeps two instances apart.
  const filterId = useRef(`blob-${Math.random().toString(36).slice(2, 8)}`).current;

  const hits = useMemo<Hit[]>(() => {
    const q = value.trim().toLowerCase();
    if (!q) return [];
    const has = (...fields: (string | undefined)[]) =>
      fields.filter(Boolean).join(' ').toLowerCase().includes(q);

    const pages: Hit[] = DESTINATIONS.filter((d) => has(d.label, d.labelHi, d.hint, d.hintHi)).map(
      (d) => ({ key: `p:${d.to}`, label: tx(d.label, d.labelHi), hint: tx(d.hint, d.hintHi), to: d.to, icon: d.icon }),
    );

    const agri: Hit[] = AGRI_PRODUCTS.filter((p) =>
      has(p.name, p.nameHi, p.category, p.description, p.descriptionHi),
    ).map((p) => ({
      key: `a:${p.id}`,
      label: tx(p.name, p.nameHi),
      hint: tx('Agri Market', 'कृषि बाज़ार'),
      to: `/search?q=${encodeURIComponent(value.trim())}`,
      icon: ShoppingBag,
    }));

    // Destinations first: someone typing "mandi" wants the page, not a sack of
    // seed whose description happens to contain the word.
    return [...pages, ...agri].slice(0, MAX_HITS);
  }, [value, tx]);

  useEffect(() => setActive(0), [value]);

  useEffect(() => {
    if (!open) {
      setValue('');
      setSettled(false);
      return;
    }
    // Focus after the open transition begins, or the browser scrolls the
    // page to the input before it has arrived.
    const id = window.setTimeout(() => inputRef.current?.focus(), 60);
    const settle = window.setTimeout(() => setSettled(true), reduced ? 0 : 620);
    return () => { window.clearTimeout(id); window.clearTimeout(settle); };
  }, [open, reduced]);

  const go = useCallback(
    (hit: Hit | undefined) => {
      const target = hit?.to ?? (value.trim() ? `/search?q=${encodeURIComponent(value.trim())}` : null);
      if (!target) return;
      onClose();
      navigate(target);
    },
    [navigate, onClose, value],
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); onClose(); return; }
      if (e.key === 'ArrowDown') { e.preventDefault(); setActive((i) => Math.min(i + 1, Math.max(hits.length - 1, 0))); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((i) => Math.max(i - 1, 0)); }
      else if (e.key === 'Enter') { e.preventDefault(); go(hits[active]); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, hits, active, go, onClose]);

  // Keep the highlighted row in view when arrowing past the fold.
  useEffect(() => {
    listRef.current?.querySelectorAll('[data-hit]')[active]?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  const panel = reduced
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, filter: `blur(18px) url(#${filterId})`, scaleX: 1.22, scaleY: 1.08, y: -12 },
        animate: { opacity: 1, filter: settled ? 'blur(0px)' : `blur(0px) url(#${filterId})`, scaleX: 1, scaleY: 1, y: 0 },
        exit: { opacity: 0, filter: `blur(18px) url(#${filterId})`, scaleX: 1.22, scaleY: 1.08, y: 10 },
      };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="spotlight"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          role="dialog"
          aria-modal="true"
          aria-label={tx('Search BhoomiX', 'BhoomiX में खोजें')}
          onClick={onClose}
          className="fixed inset-0 z-[100] flex items-start justify-center bg-black/45 px-4 pt-[14vh] backdrop-blur-md"
        >
          {!reduced && (
            <svg width="0" height="0" aria-hidden className="absolute">
              <filter id={filterId}>
                <feGaussianBlur stdDeviation="10" in="SourceGraphic" />
                <feColorMatrix
                  values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -9"
                  result="blob"
                />
                <feBlend in="SourceGraphic" in2="blob" />
              </filter>
            </svg>
          )}

          <motion.div
            {...panel}
            transition={{ type: 'spring', stiffness: 520, damping: 46 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl overflow-hidden rounded-lg border border-border bg-card shadow-floating"
          >
            <div className="flex h-16 items-center gap-3 px-5">
              <Search className="h-5 w-5 flex-shrink-0 text-muted-foreground" strokeWidth={1.75} />
              <input
                ref={inputRef}
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={tx('Search crops, products, advisory…', 'फसल, उत्पाद, सलाह खोजें…')}
                aria-label={tx('Search', 'खोजें')}
                autoComplete="off"
                spellCheck={false}
                className="h-full w-full bg-transparent text-lg text-foreground outline-none placeholder:text-muted-foreground"
              />
              <kbd className="hidden flex-shrink-0 rounded-sm border border-border px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:block">
                esc
              </kbd>
            </div>

            {value.trim() !== '' && (
              <div
                ref={listRef}
                data-lenis-prevent
                role="listbox"
                aria-label={tx('Results', 'परिणाम')}
                className="max-h-[52vh] overflow-y-auto border-t border-border p-2"
              >
                {hits.length === 0 ? (
                  <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                    {tx('Nothing matches that yet. Try a crop or a scheme name.', 'अभी कोई मेल नहीं। फसल या योजना का नाम आज़माएं।')}
                  </p>
                ) : (
                  hits.map((hit, i) => {
                    const Icon = hit.icon;
                    return (
                      <button
                        key={hit.key}
                        data-hit
                        type="button"
                        role="option"
                        aria-selected={i === active}
                        onMouseEnter={() => setActive(i)}
                        onClick={() => go(hit)}
                        className={cn(
                          'flex w-full items-center gap-3 rounded-sm px-3 py-2.5 text-left transition-colors',
                          i === active ? 'bg-muted text-foreground' : 'text-muted-foreground hover:bg-muted/60',
                        )}
                      >
                        <Icon className="h-5 w-5 flex-shrink-0" strokeWidth={1.75} />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-foreground">{hit.label}</span>
                          <span className="block truncate text-xs text-muted-foreground">{hit.hint}</span>
                        </span>
                        <ChevronRight
                          className={cn('h-4 w-4 flex-shrink-0 transition-opacity', i === active ? 'opacity-100' : 'opacity-0')}
                        />
                      </button>
                    );
                  })
                )}
              </div>
            )}

            {value.trim() === '' && (
              <div className="border-t border-border p-2">
                {DESTINATIONS.slice(0, 5).map((d) => {
                  const Icon = d.icon;
                  return (
                    <button
                      key={d.to}
                      type="button"
                      onClick={() => { onClose(); navigate(d.to); }}
                      className="flex w-full items-center gap-3 rounded-sm px-3 py-2.5 text-left text-muted-foreground transition-colors hover:bg-muted/60"
                    >
                      <Icon className="h-5 w-5 flex-shrink-0" strokeWidth={1.75} />
                      <span className="text-sm font-medium text-foreground">{tx(d.label, d.labelHi)}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
