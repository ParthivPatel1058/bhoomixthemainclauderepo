import type * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * Still photograph behind the hero.
 *
 * This replaced a looping timelapse. The video carried real engineering —
 * connection-aware sources, Save-Data and reduced-motion opt-outs, pausing when
 * off-screen — but a single optimised still is cheaper than all of it, and
 * cheapest is what this audience needs: rural Android phones on 3G, where even
 * a 0.30 MB video competes with the rest of the page for bandwidth.
 *
 * `fetchpriority="high"` (lowercase, deliberately) because this is the LCP
 * element. React 18.3's DOM renderer has no entry for `fetchPriority` in its
 * known-attributes table, so the camelCase spelling both warns in the console
 * ("React does not recognize the `fetchPriority` prop") and, worse, sets the
 * attribute on the DOM node exactly as spelled — camelCased — which the
 * browser does not read as the `fetchpriority` HTML attribute at all, so the
 * priority hint silently did nothing. React passes an attribute it has no
 * entry for straight through under the name given, so lowercase is both the
 * warning-free spelling and the one a browser actually honours.
 *
 * The intrinsic width/height are set so the browser reserves the box before
 * the bytes arrive and the headline does not jump.
 */

interface HeroImageProps {
  className?: string;
}

/**
 * `@types/react`'s `ImgHTMLAttributes` has no entry for `fetchpriority`
 * either — it is a DOM lib gap, not just a React runtime one — so the
 * attribute needs its own three-value type here rather than a blanket `any`
 * on the element's props.
 */
type ImgWithFetchPriority = React.ImgHTMLAttributes<HTMLImageElement> & {
  fetchpriority?: 'high' | 'low' | 'auto';
};

export default function HeroImage({ className }: HeroImageProps) {
  const imgProps: ImgWithFetchPriority = {
    src: '/media/hero-mountains.jpg',
    alt: '',
    width: 2000,
    height: 1129,
    fetchpriority: 'high',
    decoding: 'async',
    className: 'h-full w-full object-cover',
  };

  return (
    <div aria-hidden className={cn('absolute inset-0 overflow-hidden', className)}>
      <img {...imgProps} />

      {/* The scrim the headline sits on. Heaviest at the bottom left, where the
          type actually is, rather than an even wash over the whole frame. */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-black/70 via-black/35 to-black/10" />
    </div>
  );
}
