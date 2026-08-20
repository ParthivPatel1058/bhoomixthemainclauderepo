import React from 'react';
import {
  WobloCropAiIcon,
  WobloMarketIcon,
  WobloMartIcon,
  WobloAdvisoryIcon,
  WobloSchemesIcon,
  WobloBotIcon,
  WobloLeafIcon,
  WobloTruckIcon,
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
import TubelightNavBar from '@/components/ui/tubelight-navbar';
import Reveal, { RevealWords } from '@/components/Reveal';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';
import { LiquidMetalButton } from '@/components/ui/liquid-metal-button';

/* Curated agriculture photography (Unsplash, verified). */
const W = (id: string) => `https://images.unsplash.com/photo-${id}?w=900&q=80&auto=format&fit=crop`;
const imgDisease = W('1416879595882-3373a0480b5b');   // greenhouse, warm light
const imgMarket = W('1523348837708-15d4a09cfac2');    // fresh vegetables
const imgMart = W('1488459716781-31db52582fe9');      // produce market
const imgAdvisory = W('1625246333195-78d9c38ad449');  // Indian farmer
const imgSchemes = W('1500382017468-9049fed747ef');   // wheat field
const imgRobotic = W('1595246140625-573b715d11dc');   // agri drone / tech
const imgOrganic = W('1592982537447-7440770cbfc9');   // hands in soil, warm
const imgVegetable = W('1464226184884-fa280b87c399'); // field at golden hour
const imgDelivery = W('1530267981375-f0de937f5f13');  // logistics / cargo

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
  { title: 'AgriNova Mart', titleHi: 'एग्रीनोवा मार्ट', description: 'Everyday groceries and farm household supplies', descriptionHi: 'रोज़मर्रा का किराना और घरेलू सामान', icon: WobloMartIcon, emoji: '🏪', img: imgMart, href: '/kisan-mart', cta: 'Browse Store', ctaHi: 'स्टोर देखें', gradient: 'primary' },
  { title: 'Crop Advisory', titleHi: 'फसल सलाह', description: 'Ask a question or identify crop disease from a photo', descriptionHi: 'प्रश्न पूछें या फोटो से फसल रोग पहचानें', icon: WobloAdvisoryIcon, emoji: '👨‍🌾', img: imgAdvisory, href: '/kisan-help', cta: 'Get Advice', ctaHi: 'सलाह लें', gradient: 'secondary' },
  { title: 'Government Schemes', titleHi: 'सरकारी योजनाएं', description: 'Explore latest government benefits and schemes for farmers', descriptionHi: 'किसानों के लिए नवीनतम सरकारी लाभ और योजनाओं का अन्वेषण करें', icon: WobloSchemesIcon, emoji: '🏛️', img: imgSchemes, href: '/gov-schemes', cta: 'View Schemes', ctaHi: 'योजनाएं देखें', gradient: 'primary' },
  { title: 'Robotic Farming', titleHi: 'रोबोटिक कृषि', description: 'Discover modern farming robots and automation technology', descriptionHi: 'आधुनिक कृषि रोबोट और स्वचालन प्रौद्योगिकी की खोज करें', icon: WobloBotIcon, emoji: '🤖', img: imgRobotic, href: '/robotic-farming', cta: 'Explore Tech', ctaHi: 'तकनीक जानें', gradient: 'secondary' },
  { title: 'Organic Farming', titleHi: 'जैविक खेती', description: 'Complete guide to organic farming with certified seeds and natural fertilizers', descriptionHi: 'प्रमाणित बीजों और प्राकृतिक उर्वरकों के साथ जैविक खेती की संपूर्ण मार्गदर्शिका', icon: WobloLeafIcon, emoji: '🌱', img: imgOrganic, href: '/organic-farming', cta: 'Explore Organic', ctaHi: 'जैविक खेती देखें', gradient: 'primary' },
  { title: 'Vegetable Farming', titleHi: 'सब्जी की खेती', description: 'Comprehensive guide to all vegetables, farming methods, and tools', descriptionHi: 'सभी सब्जियों, खेती के तरीकों और उपकरणों की व्यापक मार्गदर्शिका', icon: Carrot, emoji: '🥕', img: imgVegetable, href: '/vegetable-farming', cta: 'View Guide', ctaHi: 'मार्गदर्शिका देखें', gradient: 'secondary' },
  { title: 'Delivery Partner', titleHi: 'डिलीवरी पार्टनर', description: 'Join as a delivery partner and start earning with flexible hours', descriptionHi: 'डिलीवरी पार्टनर के रूप में शामिल हों और लचीले घंटों में कमाई शुरू करें', icon: WobloTruckIcon, emoji: '🚚', img: imgDelivery, href: '/partner-registration', cta: 'Join Now', ctaHi: 'अभी जुड़ें', gradient: 'primary' },
];

const Index = () => {
  const { t, language, tx } = useLanguage();
  const navigate = useNavigate();
  const en = language === 'en';

  return (
    <div className="min-h-screen">
      <Navigation />

      <main className="pt-4 md:pt-5 pb-16">
        {/* Hero — glass editorial over the fixed cinematic backdrop */}
        <section className="relative px-6 lg:px-14 pt-10 pb-16 min-h-[86vh] flex flex-col justify-center">
          <div className="max-w-3xl">
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
                {tx('with BhoomiX', 'BhoomiX के साथ')}
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
          </div>

          {/* Glass stat card, lower right — like the reference */}
          <Reveal immediate delay={1} from="right" className="hidden lg:block absolute right-14 bottom-20 max-w-xs">
            <div className="glass !rounded-3xl p-6">
              <p
                className="text-white text-2xl mb-2"
                style={{ fontFamily: 'var(--font-serif)', lineHeight: 1.15 }}
              >
                {tx('Trusted by 25,000+ farmers', '25,000+ किसानों का भरोसा')}
              </p>
              <p className="text-sm text-white/70 leading-relaxed">
                {tx('AI crop diagnosis, live mandi prices, and direct market access — across India.', 'AI फसल निदान, लाइव मंडी भाव और सीधी बाज़ार पहुँच — पूरे भारत में।')}
              </p>
            </div>
          </Reveal>
        </section>

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
                { name: tx('Mart', 'मार्ट'), url: '/kisan-mart', icon: WobloMartIcon },
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
      </main>

      <Footer />
    </div>
  );
};

export default Index;
