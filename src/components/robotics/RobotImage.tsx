import { useState } from 'react';
import { Bot } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

interface RobotImageProps {
  src?: string;
  alt: string;
  /** `contain` for cut-outs on a plate, `cover` for field photography. */
  fit?: 'contain' | 'cover';
  className?: string;
  /** Above the fold — skip lazy loading and decode eagerly. */
  priority?: boolean;
}

/**
 * A machine photograph, or an honest absence of one.
 *
 * Three states, and the third is the reason this component exists. A row can
 * have a working photo; a photo that fails to load; or no photo at all,
 * because the manufacturer has not published one — which is genuinely the case
 * for the FarmRobo R5. All three land on a designed surface rather than a
 * broken-image glyph or a stock picture of somebody else's robot, and the
 * empty state says which it is instead of pretending the picture is coming.
 *
 * The plate behind the image is a flat tinted panel rather than glass. Product
 * cut-outs read badly over a blurred backdrop, and the page needs some
 * surfaces that are simply solid.
 */
export default function RobotImage({
  src,
  alt,
  fit = 'cover',
  className,
  priority = false,
}: RobotImageProps) {
  const { tx } = useLanguage();
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const showImage = Boolean(src) && !failed;

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-md',
        // A warm neutral bed in light, a cool one in dark. Both are opaque:
        // a cut-out with a transparent background needs something to sit on.
        'bg-[hsl(var(--muted))] dark:bg-white/[0.04]',
        className,
      )}
    >
      {showImage ? (
        <>
          {/* Holds the box's shape while the file arrives, so a grid of
              twelve cards does not reflow as each one lands. */}
          {!loaded && <div aria-hidden className="absolute inset-0 animate-pulse bg-foreground/5" />}
          <img
            src={src}
            alt={alt}
            loading={priority ? 'eager' : 'lazy'}
            decoding={priority ? 'sync' : 'async'}
            onLoad={() => setLoaded(true)}
            onError={() => setFailed(true)}
            className={cn(
              'h-full w-full transition-opacity duration-700 ease-[var(--ease-editorial)]',
              fit === 'contain' ? 'object-contain p-4' : 'object-cover',
              loaded ? 'opacity-100' : 'opacity-0',
            )}
          />
        </>
      ) : (
        <div
          role="img"
          aria-label={alt}
          className="flex h-full w-full flex-col items-center justify-center gap-2 p-6 text-center"
        >
          <Bot aria-hidden className="h-7 w-7 text-muted-foreground/60" />
          <span className="max-w-[18rem] text-[11px] font-medium leading-snug text-muted-foreground">
            {failed
              ? tx('Photograph unavailable', 'तस्वीर उपलब्ध नहीं')
              : tx(
                  'The manufacturer has not published a photograph of this machine',
                  'निर्माता ने इस मशीन की कोई तस्वीर प्रकाशित नहीं की है',
                )}
          </span>
        </div>
      )}
    </div>
  );
}
