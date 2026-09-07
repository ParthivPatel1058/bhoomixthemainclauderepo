import React from 'react';
import {
  WobloCropAiIcon,
  WobloMarketIcon,
  WobloAdvisoryIcon,
  WobloSchemesIcon,
  WobloBotIcon,
  WobloLeafIcon,
} from '@/components/ui/WobloIcon';
import { Carrot } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import FarmAdvisory from '@/components/FarmAdvisory';
import FollowUpPrompt from '@/components/FollowUpPrompt';
import SearchBar from '@/components/SearchBar';
import GalleryHoverGrid from '@/components/ui/gallery-hover-carousel';
import { cn } from '@/lib/utils';
import CountUp from '@/components/CountUp';
import ParallaxHero, { ParallaxLayer } from '@/components/ui/parallax-hero';
import HeroImage from '@/components/ui/hero-image';
import TubelightNavBar from '@/components/ui/tubelight-navbar';
import Reveal, { RevealWords } from '@/components/Reveal';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';
import { LiquidMetalButton } from '@/components/ui/liquid-metal-button';

/* Curated agriculture photography (Unsplash, verified). */
const W = (id: string) => `https://images.unsplash.com/photo-${id}?w=900&q=80&auto=format&fit=crop`;
const imgDisease = W('1416879595882-3373a0480b5b');   // greenhouse, warm light
const imgMarket = W('1523348837708-15d4a09cfac2');    // fresh vegetables
const imgAdvisory = W('1625246333195-78d9c38ad449');  // Indian farmer
const imgSchemes = W('1500382017468-9049fed747ef');   // wheat field
const imgRobotic = W('1595246140625-573b715d11dc');   // agri drone / tech
const imgOrganic = W('1592982537447-7440770cbfc9');   // hands in soil, warm
const imgVegetable = W('1464226184884-fa280b87c399'); // field at golden hour

interface Feature {
  title: string;
  titleHi: string;
  description: string;
  descriptionHi: string;
  icon: React.ComponentType<{ className?: string; size?: number | string }>;
  emoji: string;
  img: string;
  href: string;
  cta: string;
  ctaHi: string;
  gradient: 'primary' | 'secondary';
  badge?: string;
  badgeHi?: string;
}

const FEATURES: Feature[] = [
  { title: 'Crop Intelligence', titleHi: 'फसल इंटेलिजेंस', description: 'Scan crop photos to identify diseases, browse the disease library, and get treatment advice', descriptionHi: 'फसल की फोटो स्कैन करके रोग पहचानें और उपचार की सलाह पाएं', icon: WobloCropAiIcon, emoji: '🔬', img: imgDisease, href: '/crop-disease', cta: 'Scan Now', ctaHi: 'स्कैन करें', gradient: 'primary', badge: 'New', badgeHi: 'नया' },
  { title: 'Agri Market', titleHi: 'कृषि बाज़ार', description: 'Seeds, fertilizers, tools, and crop protection', descriptionHi: 'बीज, उर्वरक, उपकरण और फसल सुरक्षा', icon: WobloMarketIcon, emoji: '🛒', img: imgMarket, href: '/agri-market', cta: 'Browse Products', ctaHi: 'उत्पाद देखें', gradient: 'secondary' },
  { title: 'Crop Advisory', titleHi: 'फसल सलाह', description: 'Ask a question or identify crop disease from a photo', descriptionHi: 'प्रश्न पूछें या फोटो से फसल रोग पहचानें', icon: WobloAdvisoryIcon, emoji: '👨‍🌾', img: imgAdvisory, href: '/kisan-help', cta: 'Get Advice', ctaHi: 'सलाह लें', gradient: 'secondary' },
  { title: 'Government Schemes', titleHi: 'सरकारी योजनाएं', description: 'Explore latest government benefits and schemes for farmers', descriptionHi: 'किसानों के लिए नवीनतम सरकारी लाभ और योजनाओं का अन्वेषण करें', icon: WobloSchemesIcon, emoji: '🏛️', img: imgSchemes, href: '/gov-schemes', cta: 'View Schemes', ctaHi: 'योजनाएं देखें', gradient: 'primary' },
  { title: 'Robotic Farming', titleHi: 'रोबोटिक कृषि', description: 'Discover modern farming robots and automation technology', descriptionHi: 'आधुनिक कृषि रोबोट और स्वचालन प्रौद्योगिकी की खोज करें', icon: WobloBotIcon, emoji: '🤖', img: imgRobotic, href: '/robotic-farming', cta: 'Explore Tech', ctaHi: 'तकनीक जानें', gradient: 'secondary' },
  { title: 'Organic Farming', titleHi: 'जैविक खेती', description: 'Complete guide to organic farming with certified seeds and natural fertilizers', descriptionHi: 'प्रमाणित बीजों और प्राकृतिक उर्वरकों के साथ जैविक खेती की संपूर्ण मार्गदर्शिका', icon: WobloLeafIcon, emoji: '🌱', img: imgOrganic, href: '/organic-farming', cta: 'Explore Organic', ctaHi: 'जैविक खेती देखें', gradient: 'primary' },
  { title: 'Vegetable Farming', titleHi: 'सब्जी की खेती', description: 'Comprehensive guide to all vegetables, farming methods, and tools', descriptionHi: 'सभी सब्जियों, खेती के तरीकों और उपकरणों की व्यापक मार्गदर्शिका', icon: Carrot, emoji: '🥕', img: imgVegetable, href: '/vegetable-farming', cta: 'View Guide', ctaHi: 'मार्गदर्शिका देखें', gradient: 'secondary' },
];

const Index = () => {
  const { t, language, tx } = useLanguage();
  const navigate = useNavigate();
  const en = language === 'en';

  return (
    <div className="min-h-screen">
      <Navigation />

      <main className="pt-4 md:pt-5 pb-16">
        {/* Hero — parallax over the fixed cinematic backdrop.
            Three depths: the eyebrow and lede sit furthest back, the headline
            leads, and the figures travel between them. The headline moving
            fastest is what makes the field behind it read as distance rather
            than as wallpaper. */}
        <ParallaxHero className="relative flex min-h-[86vh] flex-col justify-center overflow-hidden px-6 pb-16 pt-10 lg:px-14">
          {/* Still photograph behind the hero. Carries its own scrim, and is the
              LCP element - see hero-image.tsx. */}
          <HeroImage />

          <ParallaxLayer speed={-60} className="relative z-10 max-w-3xl">
            <Reveal immediate delay={0.05} distance={16}>
              <span className="eyebrow text-white/70">
                {tx('Tools & advisory for every farming decision', 'हर कृषि निर्णय के लिए उपकरण और सलाह')}
              </span>
            </Reveal>

            <h1 className="hero-display text-white mt-6 mb-4 drop-shadow-[0_2px_30px_rgba(0,0,0,0.45)]">
              <RevealWords
                immediate
                key={language}
                text={tx(`Grow
Smarter`, `स्मार्ट
खेती`)}
                delay={0.15}
                stagger={0.14}
              />
            </h1>

            <Reveal immediate delay={0.5} distance={18} blur>
              <p
                className="text-gold italic mb-9"
                style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.4rem,3vw,2.4rem)', lineHeight: 1.1 }}
              >
                {tx('with bhoomix', 'bhoomix के साथ')}
              </p>
            </Reveal>

            <Reveal immediate delay={0.65}>
              <p className="text-base md:text-lg leading-relaxed text-white/80 max-w-lg mb-10">
                {t('tagline')}
              </p>
            </Reveal>

            <Reveal immediate className="flex flex-wrap items-center gap-4" delay={0.8}>
              <LiquidMetalButton
                width={language === 'en' ? 186 : 168}
                label={tx('Crop Intelligence', 'फसल इंटेलिजेंस')}
                onClick={() => navigate('/crop-disease')}
              />
              <InteractiveHoverButton
                text={tx('Explore Market', 'बाज़ार देखें')}
                onClick={() => navigate('/agri-market')}
              />
            </Reveal>
          </ParallaxLayer>

          {/* The rate strip — the hero's signature.
              What stood here was "Trusted by 25,000+ farmers", a number
              nobody could stand behind if a judge or an investor asked for
              the source. Every figure below is checkable: the language count
              is the length of the Eighth Schedule list this app ships,
              the rates come from the Government of India's open data
              platform, and the seventy-two hours is the PMFBY reporting
              window, not a product claim at all.

              Set in tabular figures on purpose. This is a product for people
              who read numbers off a board at the mandi gate, and a column of
              figures that lines up is the whole reason those boards work. */}
          <ParallaxLayer speed={-170} className="absolute bottom-20 right-14 z-10 hidden lg:block">
          <Reveal immediate delay={1} from="right" className="w-[19rem]">
            <dl className="glass overflow-hidden rounded-lg">
              {([
                { n: 23, suffix: '', l: tx('Indian languages, in their own script', '23 भारतीय भाषाएं, अपनी लिपि में') },
                { v: tx('Daily', 'रोज़'), l: tx('Mandi rates from government open data', 'सरकारी ओपन डेटा से मंडी भाव') },
                { v: '72h', l: tx('The PMFBY claim window, counted for you', 'पीएमएफबीवाई दावा समय, आपके लिए गिना गया') },
              ] as { n?: number; suffix?: string; v?: string; l: string }[]).map((row, i) => (
                <div
                  key={row.l}
                  className={cn(
                    'flex items-baseline gap-4 px-5 py-3.5',
                    i > 0 && 'border-t border-white/15',
                  )}
                >
                  <dt
                    data-numeric
                    className="flex min-w-[3.25rem] items-baseline text-2xl font-semibold leading-none tracking-tight text-white"
                  >
                    {/* The two real quantities count up; "Daily" is a word and
                        stays put. Animating a number that is not a measurement
                        is the kind of flourish that reads as decoration. */}
                    {typeof row.n === 'number' ? (
                      <>
                        <CountUp to={row.n} duration={1.4} delay={1.1 + i * 0.12} />
                        {row.suffix}
                      </>
                    ) : (
                      row.v
                    )}
                  </dt>
                  <dd className="text-[13px] leading-snug text-white/70">{row.l}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
          </ParallaxLayer>
        </ParallaxHero>

        {/* Everything below the hero sits on a ground of its own.
            The field photograph is the hero's backdrop, not the page's: with
            it running the full height, the gallery heading was white type over
            a bright sky and simply disappeared. The automated contrast sweep
            never caught it because it skips elements whose background is an
            image — there is no colour behind them to measure against. */}
        <div className="relative">
          {/* The photograph runs the whole page now, so this no longer ends it
              — it only darkens it enough to read against. The old version
              faded to the opaque page ground, which is what put a slab of
              white under the hero and stopped the picture dead. This is the
              same ink the inner pages use, ramped in over 20rem so the
              landscape carries on and simply gets quieter.
              Pointer-events off so it never eats a click. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 -top-80 h-80 bg-gradient-to-b from-transparent to-[hsl(162_28%_7%_/_0.88)]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 bg-[hsl(162_28%_7%_/_0.88)]"
          />
        <div className="container mx-auto px-4 pb-20 pt-8 sm:px-6 lg:px-8">
          {/* Mobile search */}
          <div className="mt-6 md:hidden">
            <SearchBar />
          </div>

          {/* Premium gooey quick-nav */}
          <Reveal className="scrollbar-hide mt-14 flex justify-center overflow-x-auto px-4" delay={0.05}>
            <TubelightNavBar
              items={[
                { name: tx('Crop AI', 'फसल एआई'), url: '/crop-disease', icon: WobloCropAiIcon },
                { name: tx('Market', 'बाज़ार'), url: '/agri-market', icon: WobloMarketIcon },
                { name: tx('Advisory', 'सलाह'), url: '/kisan-help', icon: WobloAdvisoryIcon },
                { name: tx('Schemes', 'योजनाएं'), url: '/gov-schemes', icon: WobloSchemesIcon },
              ]}
            />
          </Reveal>

          {/* Follow-up advisory */}
          <div className="mt-12">
            <FollowUpPrompt />
          </div>

          {/* Feature gallery — hover-reveal bento grid.
              Negative margins cancel the parent container's padding so the
              grid runs edge to edge instead of sitting in a column. */}
          <section className="mt-16 mb-8 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10">
            <GalleryHoverGrid
              heading={tx('Everything you need', 'आपकी हर ज़रूरत')}
              subheading={tx('From seed to sale — explore every tool in one place.', 'बीज से बिक्री तक — हर टूल एक ही जगह।')}
              items={FEATURES.map((f) => ({
                id: f.href,
                title: tx(f.title, f.titleHi),
                summary: tx(f.description, f.descriptionHi),
                url: f.href,
                image: f.img,
              }))}
            />
          </section>

          {/* Farm Advisory */}
          <div className="mt-16">
            <FarmAdvisory />
          </div>
        </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
