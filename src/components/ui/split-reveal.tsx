import { useRef } from 'react';
import { gsap, useGSAP, SplitText } from '@/lib/gsap';
import { cn } from '@/lib/utils';

/**
 * Line-by-line headline reveal, built on SplitText.
 *
 * ## Why this replaces the hand-rolled version
 *
 * `RevealWords` split on a hardcoded `\n` in the source string — the hero read
 * `"Grow\nSmarter"`. That break was authored for English and copied for Hindi,
 * so in the other twenty-one languages the headline arrived as one long run
 * with no break at all and simply overflowed. Real line detection removes the
 * need for anyone to guess where a translated headline wraps.
 *
 * `autoSplit` re-splits when the width changes **and when fonts finish
 * loading**, which matters more here than in most projects: the Noto family
 * for a given script is fetched on demand when the language changes, so a
 * headline split before that arrives is measured in a fallback face and
 * breaks in the wrong places.
 *
 * ## Lines and words only — never characters
 *
 * This is the important constraint. BhoomiX runs twenty-three languages
 * across eleven scripts, and the Indic ones build syllables from a base
 * consonant plus combining marks: `स्मार्ट` is not seven independent letters.
 * Splitting that into characters puts each combining mark in its own element,
 * where it has nothing to combine with, and the headline renders as detached
 * vowel signs and viramas. Chars are safe for Latin and quietly destroy
 * everything else, so the type is fixed here rather than exposed as a prop.
 *
 * The mask wrappers give each line an `overflow: clip` parent, so lines rise
 * out of a hard edge instead of fading in mid-air.
 */

interface SplitRevealProps {
  children: string;
  /** Seconds before the first line moves. */
  delay?: number;
  /** Seconds between lines. */
  stagger?: number;
  className?: string;
}

export default function SplitReveal({
  children,
  delay = 0.15,
  stagger = 0.12,
  className,
}: SplitRevealProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;

      if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
        gsap.set(el, { opacity: 1 });
        return;
      }

      SplitText.create(el, {
        type: 'lines',
        mask: 'lines',
        autoSplit: true,
        linesClass: 'split-line',
        // Returning the animation lets SplitText revert and re-sync it when a
        // font lands or the box is resized, instead of leaving a dead tween
        // pointing at elements that no longer exist.
        onSplit: (self) =>
          gsap.from(self.lines, {
            yPercent: 110,
            opacity: 0,
            duration: 0.9,
            ease: 'power3.out',
            stagger,
            delay,
          }),
      });
    },
    // Re-runs when the text changes, which is what a language switch is.
    { scope: ref, dependencies: [children, delay, stagger] },
  );

  return (
    <span ref={ref} className={cn('block', className)}>
      {children}
    </span>
  );
}
