import Navigation from '@/components/Navigation';
import BackButton from '@/components/BackButton';
import Reveal from '@/components/Reveal';
import { useLanguage } from '@/contexts/LanguageContext';
import { Leaf, Package, ShoppingBag, BookOpen } from 'lucide-react';
import organicWheatSeeds from '@/assets/organic-wheat-seeds.jpg';
import organicPaddySeeds from '@/assets/organic-paddy-seeds.jpg';
import organicVegetableSeeds from '@/assets/organic-vegetable-seeds.jpg';
import organicMaizeSeeds from '@/assets/organic-maize-seeds.jpg';
import vermicompost from '@/assets/vermicompost.jpg';
import neemCake from '@/assets/neem-cake.jpg';
import boneMeal from '@/assets/bone-meal.jpg';
import cowDungManure from '@/assets/cow-dung-manure.jpg';
import compost from '@/assets/compost.jpg';
import greenManure from '@/assets/green-manure.jpg';
import neemOil from '@/assets/neem-oil.jpg';
import panchagavya from '@/assets/panchagavya.jpg';
import garlicExtract from '@/assets/garlic-extract.jpg';
import tobaccoDecoction from '@/assets/tobacco-decoction.jpg';
import manualWeeder from '@/assets/manual-weeder.jpg';
import organicSprayer from '@/assets/organic-sprayer.jpg';
import compostMaker from '@/assets/compost-maker.jpg';
import mulchSpreader from '@/assets/mulch-spreader.jpg';

interface Item {
  name: string;
  nameHi: string;
  price: string;
  description: string;
  descriptionHi: string;
  image: string;
}

interface Category {
  category: string;
  categoryHi: string;
  icon: typeof Leaf;
  items: Item[];
}

const CATEGORIES: Category[] = [
  {
    category: 'Organic Seeds',
    categoryHi: 'जैविक बीज',
    icon: Package,
    items: [
      { name: 'Organic Wheat Seeds', nameHi: 'जैविक गेहूं बीज', price: '₹80/kg', description: 'Certified organic wheat seeds, high yield', descriptionHi: 'प्रमाणित जैविक गेहूं बीज, अधिक उपज', image: organicWheatSeeds },
      { name: 'Organic Paddy Seeds', nameHi: 'जैविक धान बीज', price: '₹120/kg', description: 'Chemical-free paddy seeds', descriptionHi: 'रसायन मुक्त धान के बीज', image: organicPaddySeeds },
      { name: 'Organic Vegetable Seeds Mix', nameHi: 'जैविक सब्जी बीज मिश्रण', price: '₹200/pack', description: 'Assorted organic vegetable seeds', descriptionHi: 'विविध जैविक सब्जी बीज', image: organicVegetableSeeds },
      { name: 'Organic Maize Seeds', nameHi: 'जैविक मक्का बीज', price: '₹90/kg', description: 'Non-GMO organic maize', descriptionHi: 'नॉन-जीएमओ जैविक मक्का', image: organicMaizeSeeds },
    ],
  },
  {
    category: 'Organic Fertilizers',
    categoryHi: 'जैविक उर्वरक',
    icon: Leaf,
    items: [
      { name: 'Vermicompost', nameHi: 'वर्मीकम्पोस्ट', price: '₹15/kg', description: 'Rich in nutrients, improves soil health', descriptionHi: 'पोषक तत्वों से भरपूर, मिट्टी की सेहत सुधारे', image: vermicompost },
      { name: 'Neem Cake', nameHi: 'नीम खली', price: '₹40/kg', description: 'Natural pest control and fertilizer', descriptionHi: 'प्राकृतिक कीट नियंत्रण और उर्वरक', image: neemCake },
      { name: 'Bone Meal', nameHi: 'हड्डी चूर्ण', price: '₹50/kg', description: 'High phosphorus organic fertilizer', descriptionHi: 'उच्च फॉस्फोरस जैविक उर्वरक', image: boneMeal },
      { name: 'Cow Dung Manure', nameHi: 'गोबर खाद', price: '₹8/kg', description: 'Traditional organic manure', descriptionHi: 'पारंपरिक जैविक खाद', image: cowDungManure },
      { name: 'Compost', nameHi: 'कम्पोस्ट', price: '₹12/kg', description: 'Decomposed organic matter', descriptionHi: 'सड़ा हुआ जैविक पदार्थ', image: compost },
      { name: 'Green Manure', nameHi: 'हरी खाद', price: '₹25/kg', description: 'Plant-based organic fertilizer', descriptionHi: 'पौधों से बना जैविक उर्वरक', image: greenManure },
    ],
  },
  {
    category: 'Organic Pest Control',
    categoryHi: 'जैविक कीट नियंत्रण',
    icon: ShoppingBag,
    items: [
      { name: 'Neem Oil', nameHi: 'नीम तेल', price: '₹350/liter', description: 'Natural pesticide and fungicide', descriptionHi: 'प्राकृतिक कीटनाशक और फफूंदनाशक', image: neemOil },
      { name: 'Panchagavya', nameHi: 'पंचगव्य', price: '₹200/liter', description: 'Traditional organic growth promoter', descriptionHi: 'पारंपरिक जैविक वृद्धि वर्धक', image: panchagavya },
      { name: 'Garlic Extract', nameHi: 'लहसुन अर्क', price: '₹180/liter', description: 'Natural pest repellent', descriptionHi: 'प्राकृतिक कीट प्रतिरोधक', image: garlicExtract },
      { name: 'Tobacco Decoction', nameHi: 'तंबाकू काढ़ा', price: '₹150/liter', description: 'Organic insecticide', descriptionHi: 'जैविक कीटनाशक', image: tobaccoDecoction },
    ],
  },
  {
    category: 'Organic Tools',
    categoryHi: 'जैविक उपकरण',
    icon: BookOpen,
    items: [
      { name: 'Manual Weeder', nameHi: 'हाथ निराई यंत्र', price: '₹450', description: 'Chemical-free weed removal', descriptionHi: 'रसायन मुक्त खरपतवार हटाना', image: manualWeeder },
      { name: 'Organic Sprayer', nameHi: 'जैविक स्प्रेयर', price: '₹1,200', description: 'For applying organic pesticides', descriptionHi: 'जैविक कीटनाशक छिड़काव हेतु', image: organicSprayer },
      { name: 'Compost Maker', nameHi: 'कम्पोस्ट मेकर', price: '₹3,500', description: 'DIY composting system', descriptionHi: 'स्वयं कम्पोस्ट बनाने की प्रणाली', image: compostMaker },
      { name: 'Mulch Spreader', nameHi: 'मल्च स्प्रेडर', price: '₹2,800', description: 'Organic mulch application', descriptionHi: 'जैविक मल्च का प्रयोग', image: mulchSpreader },
    ],
  },
];

const BENEFITS = [
  { en: 'No synthetic chemicals or pesticides', hi: 'कोई कृत्रिम रसायन या कीटनाशक नहीं' },
  { en: 'Improves soil health naturally', hi: 'मिट्टी की सेहत प्राकृतिक रूप से सुधारे' },
  { en: 'Better nutrition and taste', hi: 'बेहतर पोषण और स्वाद' },
  { en: 'Environmentally sustainable', hi: 'पर्यावरण के अनुकूल' },
  { en: 'Higher market value', hi: 'बाज़ार में अधिक मूल्य' },
  { en: 'Safe for farmers and consumers', hi: 'किसानों और उपभोक्ताओं के लिए सुरक्षित' },
];

const OrganicFarming = () => {
  const { tx } = useLanguage();

  return (
    <div className="min-h-screen">
      <Navigation />

      <div className="container mx-auto px-4 pb-20 pt-8 sm:px-6 lg:px-8">
        <div className="pt-5">
          <BackButton />
        </div>

        {/* Page header */}
        <Reveal className="max-w-3xl pb-10 pt-8" blur distance={22}>
          <h1 className="page-title mb-3 text-foreground">
            {tx('Organic Farming', 'जैविक खेती')}
          </h1>
          <p className="text-base leading-relaxed text-muted-foreground md:text-lg">
            {tx('Certified seeds, natural fertilizers, and chemical-free pest control — everything you need to farm organically.', 'प्रमाणित बीज, प्राकृतिक उर्वरक और रसायन मुक्त कीट नियंत्रण — जैविक खेती के लिए आवश्यक सब कुछ।')}
          </p>
        </Reveal>

        {/* Benefits */}
        <Reveal distance={30}>
          <section className="glass mb-12 rounded-3xl p-6 md:p-8">
            <h2
              className="mb-6 text-2xl font-semibold text-foreground md:text-3xl"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              {tx('Benefits of Organic Farming', 'जैविक खेती के लाभ')}
            </h2>
            <div className="grid gap-4 md:grid-cols-3">
              {BENEFITS.map((b) => (
                <div key={b.en} className="glass lift flex items-center gap-3 rounded-xl p-4">
                  <Leaf className="h-6 w-6 flex-shrink-0 text-primary" />
                  <p className="text-foreground">{tx(b.en, b.hi)}</p>
                </div>
              ))}
            </div>
          </section>
        </Reveal>

        {/* Product categories */}
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          return (
            <section key={cat.category} className="mb-12">
              <Reveal className="mb-6 flex items-center gap-3" distance={20}>
                <Icon className="h-7 w-7 text-primary" />
                <h2
                  className="text-2xl font-semibold text-foreground md:text-3xl"
                  style={{ fontFamily: 'var(--font-serif)' }}
                >
                  {tx(cat.category, cat.categoryHi)}
                </h2>
              </Reveal>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {cat.items.map((item, i) => (
                  <Reveal key={item.name} delay={(i % 3) * 0.07} distance={30}>
                    <article className="glass lift group h-full overflow-hidden rounded-[2rem]">
                      <div className="img-zoom h-48 overflow-hidden">
                        <img
                          src={item.image}
                          alt={tx(item.name, item.nameHi)}
                          loading="lazy"
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="p-6">
                        <h3 className="mb-2 text-xl font-semibold text-foreground transition-colors group-hover:text-primary">
                          {tx(item.name, item.nameHi)}
                        </h3>
                        <p className="mb-3 text-2xl font-bold text-primary">{item.price}</p>
                        <p className="leading-relaxed text-muted-foreground">
                          {tx(item.description, item.descriptionHi)}
                        </p>
                      </div>
                    </article>
                  </Reveal>
                ))}
              </div>
            </section>
          );
        })}

        {/* Certification */}
        <Reveal distance={30}>
          <section className="glass mb-12 rounded-3xl p-6 md:p-8">
            <h2
              className="mb-6 text-2xl font-semibold text-foreground md:text-3xl"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              {tx('Organic Certification', 'जैविक प्रमाणन')}
            </h2>
            <div className="space-y-4">
              <p className="text-foreground">
                <strong>
                  {tx('NPOP (National Programme for Organic Production):', 'एनपीओपी (राष्ट्रीय जैविक उत्पादन कार्यक्रम):')}
                </strong>{' '}
                {tx('Official organic certification by the Government of India', 'भारत सरकार द्वारा आधिकारिक जैविक प्रमाणन')}
              </p>
              <p className="text-foreground">
                <strong>{tx('Contact for Certification:', 'प्रमाणन हेतु संपर्क:')}</strong>{' '}
                {tx('Agricultural and Processed Food Products Export Development Authority (APEDA)', 'कृषि एवं प्रसंस्कृत खाद्य उत्पाद निर्यात विकास प्राधिकरण (APEDA)')}
              </p>
              <p className="text-foreground">
                <strong>{tx('Website:', 'वेबसाइट:')}</strong>{' '}
                <a
                  href="https://apeda.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-underline text-primary"
                >
                  apeda.gov.in
                </a>
              </p>
            </div>
          </section>
        </Reveal>
      </div>
    </div>
  );
};

export default OrganicFarming;
