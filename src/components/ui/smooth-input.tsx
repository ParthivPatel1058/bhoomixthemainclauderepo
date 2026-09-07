/**
 * Text input with a caret that springs to its new position instead of jumping.
 *
 * The native caret is hidden (`caret-color: transparent`) and replaced with a
 * motion div. On every selection change the text before the caret is measured
 * in a hidden span mirroring the input's own computed font, which gives the
 * caret's x offset; a spring then animates it there.
 *
 * Adapted from a Next.js snippet. Four things had to change to run here:
 *   - the `dialkit` live-tuning panel is gone. It is a development tool, and
 *     shipping it would put a debug UI in front of farmers. Its knobs are
 *     ordinary props now.
 *   - `bg-muted2` / `outline-muted3` do not exist in this Tailwind config.
 *   - `bg-linear-to-b` is Tailwind v4; this project is on v3.
 *   - `navigator` is read lazily rather than at module scope.
 *
 * Font size is deliberately not set here — the caret measures whatever the
 * cascade gives the input, so it follows the surrounding type automatically.
 */

import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from 'framer-motion';
import {
  type ComponentPropsWithoutRef,
  useEffect,
  useRef,
  useState,
} from 'react';

import { cn } from '@/lib/utils';

/** Firefox paints a larger masking dot, so it needs a different glyph. */
let cachedPasswordChar: string | null = null;
function passwordChar() {
  if (cachedPasswordChar === null) {
    cachedPasswordChar = /firefox|fxios/i.test(navigator.userAgent) ? '●' : '•';
  }
  return cachedPasswordChar;
}

const DEFAULT_SPRING = { stiffness: 500, damping: 30, mass: 0.5 };

/** Reduced motion still needs the caret to arrive — just without the travel. */
const INSTANT_SPRING = { stiffness: 10000, damping: 100, mass: 0.1 };

export type SmoothInputProps = Omit<ComponentPropsWithoutRef<'input'>, 'type'> & {
  type?: 'text' | 'password';
  /** Classes for the outer box. Put padding, background and radius here. */
  wrapperClassName?: string;
  /** Classes for the caret itself, e.g. to recolour it. */
  caretClassName?: string;
  spring?: { stiffness: number; damping: number; mass: number };
};

export const SmoothInput = ({
  className,
  wrapperClassName,
  caretClassName,
  spring = DEFAULT_SPRING,
  type = 'text',
  value,
  defaultValue,
  onChange,
  onBlur,
  style,
  ...props
}: SmoothInputProps) => {
  const [internalValue, setInternalValue] = useState(defaultValue ?? '');
  const caretX = useMotionValue(0);
  const caretOpacity = useMotionValue(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);

  const prefersReducedMotion = useReducedMotion();
  const springCaretX = useSpring(
    caretX,
    prefersReducedMotion ? INSTANT_SPRING : spring,
  );

  const isControlled = value !== undefined;
  const inputValue = isControlled ? String(value) : internalValue;

  /** Copy the input's font metrics onto the measuring span. */
  const syncMeasureSpan = () => {
    const input = inputRef.current;
    const span = measureRef.current;
    if (!input || !span) return;

    const styles = window.getComputedStyle(input);
    let fontSize = styles.fontSize;

    // Outside Chrome the bullet glyph renders smaller than the masking dot the
    // browser actually paints, so measuring it undershoots.
    if (
      input.type === 'password' &&
      passwordChar() === '•' &&
      !/chrome|chromium|crios/i.test(navigator.userAgent)
    ) {
      fontSize = `${parseFloat(fontSize) + 6.25}px`;
    }

    span.style.font = `${styles.fontStyle} ${styles.fontWeight} ${fontSize} ${styles.fontFamily}`;
    span.style.letterSpacing = styles.letterSpacing;
    span.style.fontFeatureSettings = styles.fontFeatureSettings;
    span.style.fontVariationSettings = styles.fontVariationSettings;
  };

  const measurePrefixWidth = (text: string) => {
    const input = inputRef.current;
    const span = measureRef.current;
    if (!input || !span) return null;

    syncMeasureSpan();
    span.textContent = text;

    const paddingLeft =
      parseFloat(window.getComputedStyle(input).paddingLeft) || 0;

    return text.length > 0 ? span.offsetWidth + paddingLeft : paddingLeft - 1;
  };

  /** Keep the caret inside the visible strip when the text overflows. */
  const scrollCaretIntoView = (input: HTMLInputElement, absoluteX: number) => {
    const styles = window.getComputedStyle(input);
    const paddingLeft = parseFloat(styles.paddingLeft) || 0;
    const paddingRight = parseFloat(styles.paddingRight) || 0;
    const maxScroll = Math.max(0, input.scrollWidth - input.clientWidth);
    const visibleRight = input.scrollLeft + input.clientWidth - paddingRight;
    const visibleLeft = input.scrollLeft + paddingLeft;

    if (absoluteX > visibleRight) {
      input.scrollLeft = Math.min(
        absoluteX - input.clientWidth + paddingRight,
        maxScroll,
      );
      return;
    }

    if (absoluteX < visibleLeft) {
      input.scrollLeft = Math.max(0, absoluteX - paddingLeft);
    }
  };

  /** With a range selected, the caret sits at whichever end is moving. */
  const caretIndexOf = (input: HTMLInputElement) => {
    const start = input.selectionStart ?? 0;
    const end = input.selectionEnd ?? 0;
    if (start === end) return start;
    return input.selectionDirection === 'backward' ? start : end;
  };

  const updateCaret = (input: HTMLInputElement) => {
    const start = input.selectionStart ?? 0;
    const end = input.selectionEnd ?? 0;
    const hasSelection = start !== end;
    const index = caretIndexOf(input);

    const textBefore =
      input.type === 'password'
        ? passwordChar().repeat(index)
        : input.value.slice(0, index);

    const absoluteX = measurePrefixWidth(textBefore);
    if (absoluteX === null) return;

    scrollCaretIntoView(input, absoluteX);

    const styles = window.getComputedStyle(input);
    const paddingLeft = parseFloat(styles.paddingLeft) || 0;
    const paddingRight = parseFloat(styles.paddingRight) || 0;
    const x = absoluteX - input.scrollLeft;
    const minX = paddingLeft - 1;
    const maxX = input.clientWidth - paddingRight;

    caretX.set(Math.min(x, maxX));

    // Hidden while a range is selected, or once it scrolls out of view.
    caretOpacity.set(hasSelection || x < minX || x > maxX + 1 ? 0 : 1);
  };

  // The effects below run on identity-stable refs, so the handler is kept in a
  // ref rather than listed in dependency arrays.
  const updateCaretRef = useRef(updateCaret);
  updateCaretRef.current = updateCaret;

  useEffect(() => {
    const input = inputRef.current;
    if (input && document.activeElement === input) {
      updateCaretRef.current(input);
    }
  }, [inputValue, type]);

  useEffect(() => {
    const input = inputRef.current;
    const container = containerRef.current;
    if (!input || !container) return;

    const refreshIfFocused = () => {
      if (document.activeElement === input) updateCaretRef.current(input);
    };

    // selectionchange fires before the input has settled, hence the frame wait.
    const handleSelectionChange = () => {
      if (document.activeElement !== input) return;
      requestAnimationFrame(refreshIfFocused);
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    input.addEventListener('scroll', refreshIfFocused);

    // A late webfont changes every measurement, so re-measure when it lands.
    document.fonts?.addEventListener('loadingdone', refreshIfFocused);
    void document.fonts?.ready.then(refreshIfFocused);

    const resizeObserver = new ResizeObserver(refreshIfFocused);
    resizeObserver.observe(container);

    refreshIfFocused();

    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
      input.removeEventListener('scroll', refreshIfFocused);
      document.fonts?.removeEventListener('loadingdone', refreshIfFocused);
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div className={wrapperClassName}>
      <div
        ref={containerRef}
        className="relative grid grid-cols-1"
        style={{ caretColor: 'transparent' }}
      >
        <input
          {...props}
          ref={inputRef}
          type={type}
          value={inputValue}
          style={style}
          className={cn(
            'col-start-1 col-end-2 row-start-1 row-end-2',
            'w-full bg-transparent text-inherit outline-none placeholder:text-foreground/40',
            className,
          )}
          onChange={(e) => {
            if (!isControlled) setInternalValue(e.target.value);
            onChange?.(e);
            requestAnimationFrame(() => updateCaretRef.current(e.target));
          }}
          onBlur={(e) => {
            caretOpacity.set(0);
            onBlur?.(e);
          }}
        />

        <span
          ref={measureRef}
          aria-hidden
          className="pointer-events-none invisible absolute left-0 top-0 whitespace-pre"
        />

        <motion.div
          aria-hidden
          className={cn(
            'pointer-events-none col-start-1 col-end-2 row-start-1 row-end-2',
            'h-[1.1em] w-0.5 self-center rounded-full bg-primary',
            caretClassName,
          )}
          style={{ x: springCaretX, opacity: caretOpacity }}
        />
      </div>
    </div>
  );
};
