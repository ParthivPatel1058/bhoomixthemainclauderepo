import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { ArrowRight } from 'lucide-react';

export interface RingItem {
  title: string;
  titleHi: string;
  img: string;
  href: string;
  cta: string;
  ctaHi: string;
}

interface FeatureRingProps {
  items: RingItem[];
  en: boolean;
}

/**
 * Apple-Photos-style circular ring of feature images. Each photo is tilted
 * tangent to the circle and links to its feature. Hovering a photo lifts it,
 * straightens it, and swaps the centre caption to that feature's name.
 */
export default function FeatureRing({ items, en }: FeatureRingProps) {
  const { tx } = useLanguage();
  const navigate = useNavigate();
  const [active, setActive] = useState<number | null>(null);
  const n = items.length;

  const centreTitle = active !== null
    ? tx(items[active].title, items[active].titleHi)
    : (tx('Explore BhoomiX', 'BhoomiX एक्सप्लोर करें'));
  const centreSub = active !== null
    ? tx(items[active].cta, items[active].ctaHi)
    : (tx('Everything you need — from seed to sale', 'बीज से बिक्री तक — सब कुछ यहाँ'));

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[300px] sm:max-w-[440px] lg:max-w-[560px]">
      {/* Centre caption */}
      <div className="absolute inset-0 flex items-center justify-center text-center px-8 pointer-events-none">
        <div className="transition-[transform,box-shadow,border-color,background-color,color,opacity,filter] duration-300">
          <h2 className="font-display text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">
            {centreTitle}
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 flex items-center justify-center gap-1.5">
            {centreSub}
            {active !== null && <ArrowRight className="h-3.5 w-3.5 text-primary" />}
          </p>
        </div>
      </div>

      {/* Ring of photos */}
      {items.map((item, i) => {
        const angle = (i / n) * Math.PI * 2 - Math.PI / 2; // start at top
        const R = 44; // radius, % of container
        const x = 50 + Math.cos(angle) * R;
        const y = 50 + Math.sin(angle) * R;
        const tilt = (i / n) * 360; // tangent to the circle
        const isActive = active === i;

        return (
          <button
            key={item.href + i}
            onMouseEnter={() => setActive(i)}
            onMouseLeave={() => setActive(null)}
            onClick={() => navigate(item.href)}
            aria-label={tx(item.title, item.titleHi)}
            className="absolute z-10 transition-[transform,box-shadow] duration-300 ease-out focus:outline-none"
            style={{
              left: `${x}%`,
              top: `${y}%`,
              transform: `translate(-50%, -50%) rotate(${isActive ? 0 : tilt}deg) scale(${isActive ? 1.18 : 1})`,
              zIndex: isActive ? 30 : 10,
            }}
          >
            <span
              className={`block h-[52px] w-[42px] sm:h-[76px] sm:w-[58px] lg:h-[92px] lg:w-[70px] overflow-hidden rounded-xl ring-1 ring-white/25 shadow-lg transition-shadow duration-300 ${
                isActive ? 'shadow-[0_18px_40px_rgba(8,15,30,0.5),0_0_24px_rgba(45,212,191,0.35)]' : ''
              }`}
            >
              <img
                src={item.img}
                alt=""
                aria-hidden
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </span>
          </button>
        );
      })}
    </div>
  );
}
