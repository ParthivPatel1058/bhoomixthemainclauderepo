import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * Looping timelapse behind the hero.
 *
 * The source was 3840x2160 at 16 Mbps with an audio track — 9.9 MB for five
 * muted seconds. Re-encoded to 1920 and 1280 wide with the audio stripped, it
 * is 0.30 MB and 0.12 MB, and at hero size the 4K detail was never visible.
 *
 * The poster paints first and is also the permanent fallback. Anyone who never
 * gets the video still sees the field, so the hero is never empty.
 *
 * Four conditions have to hold before a single byte of video is fetched, which
 * matters here more than on most sites: the people this product is for are on
 * rural connections and metered data.
 *
 *   1. `prefers-reduced-motion` is not set. A looping background is exactly the
 *      kind of ambient motion that setting exists to stop.
 *   2. The browser is not reporting Save-Data. If someone has explicitly asked
 *      their phone to use less data, a decorative loop is the first thing that
 *      should go.
 *   3. The connection is not 2g. Only 2g and slow-2g are blocked, not 3g: the
 *      1080p file is 0.30 MB, which a 3g link finishes in a second or two.
 *
 *      This is re-checked on the connection's `change` event rather than read
 *      once at mount. `effectiveType` degrades while a page is loading and many
 *      requests are in flight, so a single reading taken during startup reported
 *      a slow link on a fast connection and blocked the video permanently.
 *   4. The hero is actually on screen. Off-screen playback decodes frames nobody
 *      is looking at, and on a phone that is measurable battery.
 *
 * Screens narrower than 900px get the 720p file. Serving 1080p to a 390px phone
 * is four times the pixels it can show.
 */

interface HeroVideoProps {
  className?: string;
}

/** Network Information API, which TypeScript's DOM lib still does not declare. */
type NetworkInformation = {
  saveData?: boolean;
  effectiveType?: 'slow-2g' | '2g' | '3g' | '4g';
  addEventListener?: (t: string, fn: () => void) => void;
  removeEventListener?: (t: string, fn: () => void) => void;
};

export default function HeroVideo({ className }: HeroVideoProps) {
  const ref = useRef<HTMLVideoElement>(null);
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

    const net = (navigator as Navigator & { connection?: NetworkInformation }).connection;

    const decide = () => {
      if (net?.saveData) return;
      // Only the genuinely unusable tiers are blocked. `undefined` means the
      // browser does not report it, which is most of them — assume a usable
      // link rather than withholding the video from every Safari visitor.
      if (net?.effectiveType === '2g' || net?.effectiveType === 'slow-2g') return;

      setSrc(
        window.matchMedia('(max-width: 900px)').matches
          ? '/media/hero-field-720.mp4'
          : '/media/hero-field-1080.mp4',
      );
    };

    decide();
    // effectiveType settles after the page finishes loading, so a reading taken
    // at mount can be wrong in both directions.
    net?.addEventListener?.('change', decide);
    return () => net?.removeEventListener?.('change', decide);
  }, []);

  // Play only while visible. `play()` rejects if the browser blocks autoplay,
  // and an unhandled rejection there would surface as a console error on every
  // load, so it is swallowed deliberately.
  useEffect(() => {
    const el = ref.current;
    if (!el || !src) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) void el.play().catch(() => {});
        else el.pause();
      },
      { threshold: 0.05 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [src]);

  return (
    <div aria-hidden className={cn('absolute inset-0 overflow-hidden', className)}>
      <video
        ref={ref}
        poster="/media/hero-field-poster.jpg"
        muted
        loop
        playsInline
        preload="none"
        className="h-full w-full object-cover"
      >
        {src && <source src={src} type="video/mp4" />}
      </video>

      {/* The scrim the headline sits on. Heaviest at the bottom left, where the
          type actually is, rather than an even wash over the whole frame. */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-black/70 via-black/35 to-black/10" />
    </div>
  );
}
