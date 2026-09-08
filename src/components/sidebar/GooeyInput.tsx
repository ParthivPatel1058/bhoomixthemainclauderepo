import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
} from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

/**
 * The search control in the sidebar header: a pill that stretches open, with
 * the magnifier detaching into its own bubble and the two surfaces melting
 * apart through an SVG goo filter.
 *
 * Ported from the design package with two changes. Its `motion/react` imports
 * became `framer-motion`, which is the same library under the name this
 * project already depends on. And the filter id is derived from `useId()`
 * rather than a constant, because two of these render at once during the
 * theme peel — the outgoing skin is a full second copy of the sidebar — and
 * duplicate SVG filter ids make both instances resolve to whichever node the
 * document happened to parse last.
 */

function GooeyFilter({ filterId, blur }: { filterId: string; blur: number }) {
  return (
    <svg className="pointer-events-none absolute -z-50 h-0 w-0 opacity-0" aria-hidden>
      <defs>
        <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation={blur} result="blur" />
          {/* The alpha ramp is what fuses the two shapes as they approach. */}
          <feColorMatrix
            in="blur"
            type="matrix"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -10"
            result="goo"
          />
          <feComposite in="SourceGraphic" in2="goo" operator="atop" />
        </filter>
      </defs>
    </svg>
  );
}

function SearchGlyph({ layoutId }: { layoutId: string }) {
  return (
    <motion.svg
      layoutId={layoutId}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      className="h-4 w-4 shrink-0"
      aria-hidden
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </motion.svg>
  );
}

const TRANSITION = { duration: 0.4, type: 'spring' as const, bounce: 0.25 };

const BUBBLE_VARIANTS = {
  collapsed: { scale: 0, opacity: 0 },
  expanded: { scale: 1, opacity: 1 },
};

export interface GooeyInputProps {
  id?: string;
  placeholder?: string;
  className?: string;
  collapsedWidth?: number;
  expandedWidth?: number;
  expandedOffset?: number;
  gooeyBlur?: number;
  value?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  /** Dark surfaces need the inverse fill; the sidebar owns both themes. */
  dark?: boolean;
}

export function GooeyInput({
  id,
  placeholder = 'Search…',
  className,
  collapsedWidth = 115,
  expandedWidth = 195,
  expandedOffset = 40,
  gooeyBlur = 4,
  value,
  onValueChange,
  disabled = false,
  dark = true,
}: GooeyInputProps) {
  const reactId = useId().replace(/:/g, '');
  const filterId = `gooey-${reactId}`;
  const iconLayoutId = `gooey-icon-${reactId}`;
  const inputLayoutId = `gooey-field-${reactId}`;

  const inputRef = useRef<HTMLInputElement>(null);
  const prevExpandedRef = useRef(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const text = value ?? '';

  // Clearing on close is deliberate: the collapsed pill has no room to show a
  // query, so leaving one set would silently filter the nav with no visible
  // cause.
  useEffect(() => {
    if (isExpanded) {
      inputRef.current?.focus();
    } else if (prevExpandedRef.current) {
      onValueChange?.('');
    }
    prevExpandedRef.current = isExpanded;
  }, [isExpanded, onValueChange]);

  const buttonVariants = useMemo(
    () => ({
      collapsed: { width: collapsedWidth, marginLeft: 0 },
      expanded: { width: expandedWidth, marginLeft: expandedOffset },
    }),
    [collapsedWidth, expandedWidth, expandedOffset],
  );

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => onValueChange?.(e.target.value),
    [onValueChange],
  );

  const surface = dark
    ? 'bg-white text-[#121015] shadow-sm ring-1 ring-black/10'
    : 'bg-[#121015] text-white shadow-sm ring-1 ring-white/10';

  return (
    <div className={cn('relative flex items-center justify-center', className)}>
      <GooeyFilter filterId={filterId} blur={gooeyBlur} />

      <div
        className="relative flex h-10 items-center justify-center"
        style={{ filter: `url(#${filterId})` }}
      >
        <motion.div
          className="flex h-10 items-center justify-center"
          variants={buttonVariants}
          initial="collapsed"
          animate={isExpanded ? 'expanded' : 'collapsed'}
          transition={TRANSITION}
        >
          <button
            type="button"
            disabled={disabled}
            onClick={() => !disabled && setIsExpanded(true)}
            aria-label={placeholder}
            aria-expanded={isExpanded}
            className={cn(
              'flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-full px-4 text-sm font-medium outline-none',
              'focus-visible:ring-2 focus-visible:ring-[#8AC637] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent',
              'disabled:pointer-events-none disabled:opacity-50',
              surface,
            )}
          >
            {!isExpanded && <SearchGlyph layoutId={iconLayoutId} />}
            <motion.input
              id={id}
              layoutId={inputLayoutId}
              ref={inputRef}
              type="search"
              enterKeyHint="search"
              autoComplete="off"
              value={text}
              onChange={handleChange}
              onBlur={() => !text && setIsExpanded(false)}
              disabled={disabled || !isExpanded}
              placeholder={placeholder}
              className={cn(
                'h-full min-w-0 flex-1 bg-transparent text-sm outline-none',
                dark ? 'text-[#121015]' : 'text-white',
                isExpanded
                  ? dark
                    ? 'placeholder:text-[#121015]/50'
                    : 'placeholder:text-white/50'
                  : cn(
                      'pointer-events-none',
                      dark ? 'placeholder:text-[#121015]/80' : 'placeholder:text-white/75',
                    ),
              )}
            />
          </button>
        </motion.div>

        <motion.div
          className="absolute left-0 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center"
          variants={BUBBLE_VARIANTS}
          initial="collapsed"
          animate={isExpanded ? 'expanded' : 'collapsed'}
          transition={TRANSITION}
          aria-hidden
        >
          <div className={cn('flex h-10 w-10 items-center justify-center rounded-full', surface)}>
            <SearchGlyph layoutId={iconLayoutId} />
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default GooeyInput;
