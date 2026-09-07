import RippleDistortion from '@/components/ui/ripple-distortion';
import brandMark from '@/assets/bhoomix-logo-main.jpg';
import { useLanguage } from '@/contexts/LanguageContext';

/**
 * The bhoomix mark as a water surface the pointer disturbs.
 *
 * The tuning lives here rather than in each auth screen: three pages showing
 * the same panel with three separately-pasted prop lists is three chances for
 * them to drift apart, and the settings below were arrived at together —
 * `swirl` and `rings` in particular only look right in combination.
 */
export default function BrandRipple({ className }: { className?: string }) {
  const { tx } = useLanguage();

  return (
    <>
      <RippleDistortion
        src={brandMark}
        brushSize={190}
        strength={0.16}
        swirl={1.1}
        rings={5}
        spread={5}
        fade={2.6}
        spacing={12}
        glint={0.35}
        /* Heavy dispersion reads as an RGB glitch rather than
           refraction; a light split is enough to suggest water
           bending light. */
        dispersion={0.12}
        /* Grayscale is off because the mark's blue is the only colour in the
           panel and it is the thing worth keeping. The tint then tips the
           disturbed water toward that same blue, so the ripples read as part
           of the logo rather than as an effect laid over it. */
        tint="#4d7cff"
        tintAmount={0.35}
        highlightColor="#dbe6ff"
        grayscale={false}
        trigger="both"
        clickStrength={2.4}
        quality="medium"
        className={`absolute inset-0 !bg-black ${className ?? ''}`.trim()}
      />

      {/* The canvas is decorative and announces nothing, so the panel's
          meaning is given to screen readers here instead. */}
      <span className="sr-only">
        {tx('bhoomix logo on water', 'पानी पर bhoomix लोगो')}
      </span>
    </>
  );
}
