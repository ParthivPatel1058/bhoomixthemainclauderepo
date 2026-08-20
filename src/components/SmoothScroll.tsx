import { useEffect } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * Momentum scrolling for the whole app, and the clock that GSAP's
 * ScrollTrigger runs on.
 *
 * This is the single change that does most of the work in making a site feel
 * expensive. A native wheel event jumps in fixed increments; Lenis eases
 * between them, so a page with parallax reads as one surface moving rather
 * than several elements catching up with each other after every notch.
 *
 * `@studio-freight/lenis` from the reference snippet is deprecated — the
 * package was renamed to plain `lenis`, and installing the old name gets you
 * a two-year-old build plus a deprecation warning on every npm install.
 *
 * Two things this must not break:
 *
 * Nested scrollers. Lenis hijacks wheel events on the document, which would
 * otherwise mean the sidebar's own overflow-y stops responding and drawers
 * scroll the page behind them. Anything with `data-lenis-prevent` keeps
 * native scrolling; the sidebar nav and the dialog primitives carry it.
 *
 * Reduced motion. Momentum scrolling is exactly the kind of thing that makes
 * people motion-sick, and it is not decorative — it changes how the primary
 * navigation of the page behaves. When the visitor has asked for less motion
 * this mounts nothing at all and the browser's own scrolling is left alone.
 */
export default function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

    gsap.registerPlugin(ScrollTrigger);

    const lenis = new Lenis({
      // Slightly longer than the default. The page is photographic and the
      // hero is large; a quick stop makes big images feel like they snapped.
      duration: 1.15,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      // Touch devices already have momentum from the OS, and doubling it up
      // feels like the page is sliding on ice.
      smoothWheel: true,
      syncTouch: false,
      // Respect any scrollable region that opts out.
      prevent: (node: HTMLElement) => node.hasAttribute('data-lenis-prevent'),
    });

    // One ticker drives both, so ScrollTrigger reads positions Lenis has
    // already applied this frame instead of trailing it by one.
    const raf = (time: number) => lenis.raf(time * 1000);
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
    };
  }, []);

  return null;
}
