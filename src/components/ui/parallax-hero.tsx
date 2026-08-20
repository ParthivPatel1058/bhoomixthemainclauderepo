import { useEffect, useRef, type ReactNode } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { cn } from '@/lib/utils';

/**
 * Scroll parallax for the landing hero.
 *
 * The Osmo reference this is based on stacks four stock images and moves each
 * at its own rate. That technique needs a photograph pre-separated into
 * layers, which this project does not have — the hero is one field photo. So
 * the depth is built from the elements that are actually here: the backdrop,
 * the headline, and the figures each travel at a different speed, which is
 * the same illusion by the same means.
 *
 * Rates are negative and increase toward the front. The backdrop lags the
 * scroll, the headline leads it. That ordering matters: things nearer the
 * viewer must move further across the frame than things behind them, and
 * getting it backwards reads as a glitch rather than as depth even though the
 * amount of movement is identical.
 *
 * Everything animates `y`, a compositor property, so
 * a scrub-linked timeline does not lay out or paint on the main thread while
 * the user is dragging the scrollbar.
 *
 * Nothing here runs under `prefers-reduced-motion`: parallax is one of the
 * most reliable triggers for motion sickness there is.
 */

interface ParallaxLayerProps {
  children: ReactNode;
  /**
   * Travel over the hero's scroll length, in **pixels**. Negative moves up —
   * against the scroll direction. Larger magnitude reads as nearer the viewer.
   *
   * Pixels, not the reference's `yPercent`. Percent is measured against each
   * element's own height, so a tall copy block at -14% and a short stat card
   * at -30% both landed within a third of a pixel of each other — identical
   * travel, and therefore no depth at all. That works in the original only
   * because every layer there is a full-bleed image of the same height.
   */
  speed: number;
  className?: string;
}

export function ParallaxLayer({ children, speed, className }: ParallaxLayerProps) {
  return (
    <div data-parallax-layer={speed} className={cn('will-change-transform', className)}>
      {children}
    </div>
  );
}

interface ParallaxHeroProps {
  children: ReactNode;
  className?: string;
}

export default function ParallaxHero({ children, className }: ParallaxHeroProps) {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    const el = root.current;
    if (!el) return;

    gsap.registerPlugin(ScrollTrigger);

    // Scoped so the cleanup reverts only what this hero created, rather than
    // killing every ScrollTrigger on the page including other components'.
    const ctx = gsap.context(() => {
      const layers = el.querySelectorAll<HTMLElement>('[data-parallax-layer]');
      if (!layers.length) return;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: el,
          start: 'top top',
          end: 'bottom top',
          scrub: 0.6,
        },
      });

      layers.forEach((layer, i) => {
        const speed = Number(layer.dataset.parallaxLayer ?? 0);
        tl.to(layer, { y: speed, ease: 'none' }, i === 0 ? undefined : '<');
      });
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} className={className}>
      {children}
    </section>
  );
}
