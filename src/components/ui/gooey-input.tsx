/**
 * Search pill that morphs open with a gooey blob effect.
 *
 * Two shapes sit inside one SVG `feGaussianBlur` + `feColorMatrix` filter: the
 * pill itself and a detached circular bubble. Blurring both and then crushing
 * the alpha ramp makes them appear to stretch and merge as they separate,
 * which is the whole trick — the shapes never actually touch.
 *
 * Adapted from a Next.js snippet:
 *   - `"use client"` dropped; it does nothing under Vite.
 *   - imports `framer-motion` rather than `motion/react`. Both packages are in
 *     this project, but a shared `layoutId` only morphs when both elements come
 *     from the same motion runtime, so the two must not be mixed.
 *   - `open` and `readOnlyTrigger` were added. This app routes all search
 *     through the spotlight palette, so the pill needs to collapse when that
 *     palette closes, and must not fight it for the caret.
 */

import {
  useState,
  useRef,
  useEffect,
  useId,
  useMemo,
  useCallback,
  type ChangeEvent,
} from 'react';
import { motion } from 'framer-motion';

import { cn } from '@/lib/utils';

function GooeyFilter({ filterId, blur }: { filterId: string; blur: number }) {
  return (
    <svg className="absolute hidden h-0 w-0" aria-hidden>
      <defs>
        <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation={blur} result="blur" />
          {/* The high alpha multiplier with a negative offset turns the soft
              blur back into a hard edge, so the two blurred shapes read as one
              stretching blob rather than as fog. */}
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

function SearchIcon({ layoutId }: { layoutId: string }) {
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
      className="size-4 shrink-0"
      aria-hidden
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </motion.svg>
  );
}

const transition = { duration: 0.4, type: 'spring' as const, bounce: 0.25 };

const iconBubbleVariants = {
  collapsed: { scale: 0, opacity: 0 },
  expanded: { scale: 1, opacity: 1 },
};

export interface GooeyInputClassNames {
  root?: string;
  filterWrap?: string;
  buttonRow?: string;
  trigger?: string;
  input?: string;
  bubble?: string;
  bubbleSurface?: string;
}

export interface GooeyInputProps {
  placeholder?: string;
  className?: string;
  classNames?: GooeyInputClassNames;
  /** Collapsed control width in px */
  collapsedWidth?: number;
  /** Expanded control width in px */
  expandedWidth?: number;
  /** Horizontal offset when expanded (px), aligns the detached bubble */
  expandedOffset?: number;
  /** Gaussian blur amount for the gooey SVG filter */
  gooeyBlur?: number;
  /** Controlled expansion. Omit to let the pill manage its own. */
  open?: boolean;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
  /**
   * Render the field as an affordance only: it shows the placeholder and
   * animates, but never takes focus or accepts typing. Use when the real
   * search happens elsewhere — a command palette, say — so the two do not
   * fight over the caret.
   */
  readOnlyTrigger?: boolean;
  'aria-label'?: string;
}

export function GooeyInput({
  placeholder = 'Type to search...',
  className,
  classNames,
  collapsedWidth = 115,
  expandedWidth = 200,
  expandedOffset = 50,
  gooeyBlur = 5,
  open: openProp,
  value: valueProp,
  defaultValue = '',
  onValueChange,
  onOpenChange,
  disabled = false,
  readOnlyTrigger = false,
  'aria-label': ariaLabel,
}: GooeyInputProps) {
  // useId returns colons, which are not valid inside a CSS url() reference.
  const safeId = useId().replace(/:/g, '');
  const filterId = `gooey-filter-${safeId}`;
  const iconLayoutId = `gooey-input-icon-${safeId}`;
  const inputLayoutId = `gooey-input-field-${safeId}`;

  const inputRef = useRef<HTMLInputElement>(null);
  const prevExpandedRef = useRef(false);

  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);

  const isOpenControlled = openProp !== undefined;
  const isExpanded = isOpenControlled ? openProp : uncontrolledOpen;

  const isValueControlled = valueProp !== undefined;
  const searchText = isValueControlled ? valueProp : uncontrolledValue;

  const setSearchText = useCallback(
    (next: string) => {
      if (!isValueControlled) setUncontrolledValue(next);
      onValueChange?.(next);
    },
    [isValueControlled, onValueChange],
  );

  const setExpanded = useCallback(
    (next: boolean) => {
      if (!isOpenControlled) setUncontrolledOpen(next);
      onOpenChange?.(next);
    },
    [isOpenControlled, onOpenChange],
  );

  useEffect(() => {
    // A trigger must not steal focus — whatever it opened wants the caret.
    if (isExpanded) {
      if (!readOnlyTrigger) inputRef.current?.focus();
    } else if (prevExpandedRef.current) {
      setSearchText('');
    }
    prevExpandedRef.current = isExpanded;
  }, [isExpanded, readOnlyTrigger, setSearchText]);

  const buttonVariants = useMemo(
    () => ({
      collapsed: { width: collapsedWidth, marginLeft: 0 },
      expanded: { width: expandedWidth, marginLeft: expandedOffset },
    }),
    [collapsedWidth, expandedWidth, expandedOffset],
  );

  const handleExpand = useCallback(() => {
    if (!disabled) setExpanded(true);
  }, [disabled, setExpanded]);

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => setSearchText(e.target.value),
    [setSearchText],
  );

  const handleBlur = useCallback(() => {
    if (!searchText) setExpanded(false);
  }, [searchText, setExpanded]);

  const surfaceClass = 'bg-foreground text-background shadow-sm ring-1 ring-border/60';

  return (
    <div
      className={cn('relative flex items-center justify-center', className, classNames?.root)}
    >
      <GooeyFilter filterId={filterId} blur={gooeyBlur} />

      <div
        className={cn('relative flex h-10 items-center justify-center', classNames?.filterWrap)}
        style={{ filter: `url(#${filterId})` }}
      >
        <motion.div
          className={cn('flex h-10 items-center justify-center', classNames?.buttonRow)}
          variants={buttonVariants}
          initial="collapsed"
          animate={isExpanded ? 'expanded' : 'collapsed'}
          transition={transition}
        >
          <button
            type="button"
            disabled={disabled}
            onClick={handleExpand}
            aria-label={ariaLabel ?? placeholder}
            aria-expanded={isExpanded}
            className={cn(
              'flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-full px-4 text-sm font-medium outline-none',
              'transition-[color,box-shadow] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
              'disabled:pointer-events-none disabled:opacity-50',
              surfaceClass,
              classNames?.trigger,
            )}
          >
            {!isExpanded ? <SearchIcon layoutId={iconLayoutId} /> : null}

            <motion.input
              layoutId={inputLayoutId}
              ref={inputRef}
              type="search"
              enterKeyHint="search"
              autoComplete="off"
              tabIndex={-1}
              value={searchText}
              onChange={handleChange}
              onBlur={handleBlur}
              readOnly={readOnlyTrigger}
              disabled={disabled || (!readOnlyTrigger && !isExpanded)}
              placeholder={placeholder}
              className={cn(
                'h-full min-w-0 flex-1 bg-transparent text-sm text-background outline-none',
                // The native clear affordance sits oddly on a pill this size.
                '[&::-webkit-search-cancel-button]:hidden',
                isExpanded
                  ? 'placeholder:text-background/50'
                  : 'pointer-events-none placeholder:text-background/80',
                readOnlyTrigger && 'pointer-events-none cursor-pointer',
                classNames?.input,
              )}
            />
          </button>
        </motion.div>

        {/* The detached bubble — the second half of the blob. As it scales in
            beside the pill, the filter stretches the gap between them. */}
        <motion.div
          className={cn(
            'absolute left-0 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center',
            classNames?.bubble,
          )}
          variants={iconBubbleVariants}
          initial="collapsed"
          animate={isExpanded ? 'expanded' : 'collapsed'}
          transition={transition}
        >
          <div
            className={cn(
              'flex size-10 items-center justify-center rounded-full',
              surfaceClass,
              classNames?.bubbleSurface,
            )}
          >
            <SearchIcon layoutId={iconLayoutId} />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
