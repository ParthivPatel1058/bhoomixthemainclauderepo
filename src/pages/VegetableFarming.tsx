import Navigation from '@/components/Navigation';
import BackButton from '@/components/BackButton';
import Reveal from '@/components/Reveal';
import { useLanguage } from '@/contexts/LanguageContext';
import { Leaf, Droplets, Sun, Wrench, Ruler, Sprout } from 'lucide-react';
import tomatoesImg from '@/assets/tomatoes.jpg';
import potatoesImg from '@/assets/potatoes.jpg';
import onionsImg from '@/assets/onions.jpg';
import cauliflowerImg from '@/assets/cauliflower.jpg';
import cabbageImg from '@/assets/cabbage.jpg';
import eggplantImg from '@/assets/eggplant.jpg';
import okraImg from '@/assets/okra.jpg';
import spinachImg from '@/assets/spinach.jpg';
import carrotsImg from '@/assets/carrots.jpg';
import peppersImg from '@/assets/peppers.jpg';
import cucumberImg from '@/assets/cucumber.jpg';
import radishImg from '@/assets/radish.jpg';

interface Veg {
  name: string;
  nameHi: string;
  season: string;
  seasonHi: string;
  duration: string;
  durationHi: string;
  method: string;
  methodHi: string;
  seeds: string;
  seedsHi: string;
  tools: string[];
  toolsHi: string[];
  water: string;
  waterHi: string;
  spacing: string;
  image: string;
}

const VEGETABLES: Veg[] = [
  { name: 'Tomato', nameHi: 'टमाटर', season: 'Kharif & Rabi', seasonHi: 'खरीफ और रबी', duration: '60-80 days', durationHi: '60-80 दिन', method: 'Transplanting', methodHi: 'रोपाई', seeds: '200-250g/acre', seedsHi: '200-250 ग्राम/एकड़', tools: ['Trowel', 'Pruning shears', 'Stakes'], toolsHi: ['खुरपी', 'कैंची', 'सहारा'], water: 'Regular watering, drip irrigation recommended', waterHi: 'नियमित सिंचाई, ड्रिप सिंचाई अनुशंसित', spacing: '60x45 cm', image: tomatoesImg },
  { name: 'Potato', nameHi: 'आलू', season: 'Rabi', seasonHi: 'रबी', duration: '90-120 days', durationHi: '90-120 दिन', method: 'Tuber planting', methodHi: 'कंद रोपण', seeds: '15-20 quintals/acre', seedsHi: '15-20 क्विंटल/एकड़', tools: ['Potato planter', 'Ridger', 'Harvester'], toolsHi: ['आलू प्लांटर', 'रिजर', 'हार्वेस्टर'], water: 'Moderate, avoid waterlogging', waterHi: 'मध्यम, जलभराव से बचें', spacing: '60x20 cm', image: potatoesImg },
  { name: 'Onion', nameHi: 'प्याज', season: 'Rabi', seasonHi: 'रबी', duration: '120-150 days', durationHi: '120-150 दिन', method: 'Transplanting', methodHi: 'रोपाई', seeds: '8-10 kg/acre', seedsHi: '8-10 किलो/एकड़', tools: ['Seed drill', 'Weeder', 'Bulb harvester'], toolsHi: ['सीड ड्रिल', 'निराई यंत्र', 'बल्ब हार्वेस्टर'], water: 'Regular light irrigation', waterHi: 'नियमित हल्की सिंचाई', spacing: '15x10 cm', image: onionsImg },
  { name: 'Cabbage', nameHi: 'पत्ता गोभी', season: 'Rabi', seasonHi: 'रबी', duration: '70-120 days', durationHi: '70-120 दिन', method: 'Transplanting', methodHi: 'रोपाई', seeds: '250-300g/acre', seedsHi: '250-300 ग्राम/एकड़', tools: ['Transplanter', 'Cultivator'], toolsHi: ['ट्रांसप्लांटर', 'कल्टीवेटर'], water: 'Frequent irrigation', waterHi: 'बार-बार सिंचाई', spacing: '45x45 cm', image: cabbageImg },
  { name: 'Cauliflower', nameHi: 'फूल गोभी', season: 'Rabi', seasonHi: 'रबी', duration: '70-100 days', durationHi: '70-100 दिन', method: 'Transplanting', methodHi: 'रोपाई', seeds: '250-300g/acre', seedsHi: '250-300 ग्राम/एकड़', tools: ['Transplanter', 'Hand hoe'], toolsHi: ['ट्रांसप्लांटर', 'हाथ कुदाल'], water: 'Regular irrigation', waterHi: 'नियमित सिंचाई', spacing: '45x45 cm', image: cauliflowerImg },
  { name: 'Brinjal (Eggplant)', nameHi: 'बैंगन', season: 'Year-round', seasonHi: 'साल भर', duration: '120-140 days', durationHi: '120-140 दिन', method: 'Transplanting', methodHi: 'रोपाई', seeds: '200g/acre', seedsHi: '200 ग्राम/एकड़', tools: ['Stakes', 'Pruning shears'], toolsHi: ['सहारा', 'कैंची'], water: 'Regular, avoid water stress', waterHi: 'नियमित, पानी की कमी से बचें', spacing: '60x60 cm', image: eggplantImg },
  { name: 'Okra (Bhindi)', nameHi: 'भिंडी', season: 'Kharif & Summer', seasonHi: 'खरीफ और गर्मी', duration: '50-60 days', durationHi: '50-60 दिन', method: 'Direct seeding', methodHi: 'सीधी बुवाई', seeds: '4-5 kg/acre', seedsHi: '4-5 किलो/एकड़', tools: ['Seed drill', 'Weeder'], toolsHi: ['सीड ड्रिल', 'निराई यंत्र'], water: 'Regular watering', waterHi: 'नियमित सिंचाई', spacing: '30x15 cm', image: okraImg },
  { name: 'Carrot', nameHi: 'गाजर', season: 'Rabi', seasonHi: 'रबी', duration: '90-120 days', durationHi: '90-120 दिन', method: 'Direct seeding', methodHi: 'सीधी बुवाई', seeds: '4-5 kg/acre', seedsHi: '4-5 किलो/एकड़', tools: ['Seed drill', 'Harvester'], toolsHi: ['सीड ड्रिल', 'हार्वेस्टर'], water: 'Moderate, consistent', waterHi: 'मध्यम, नियमित', spacing: '20x5 cm', image: carrotsImg },
  { name: 'Cucumber', nameHi: 'खीरा', season: 'Summer', seasonHi: 'गर्मी', duration: '50-70 days', durationHi: '50-70 दिन', method: 'Direct seeding', methodHi: 'सीधी बुवाई', seeds: '2-3 kg/acre', seedsHi: '2-3 किलो/एकड़', tools: ['Trellis', 'Drip system'], toolsHi: ['जाली', 'ड्रिप सिस्टम'], water: 'Frequent irrigation', waterHi: 'बार-बार सिंचाई', spacing: '100x60 cm', image: cucumberImg },
  { name: 'Spinach', nameHi: 'पालक', season: 'Winter', seasonHi: 'सर्दी', duration: '40-50 days', durationHi: '40-50 दिन', method: 'Direct seeding', methodHi: 'सीधी बुवाई', seeds: '8-10 kg/acre', seedsHi: '8-10 किलो/एकड़', tools: ['Seed drill', 'Hand harvester'], toolsHi: ['सीड ड्रिल', 'हाथ हार्वेस्टर'], water: 'Light, frequent', waterHi: 'हल्की, बार-बार', spacing: '20x5 cm', image: spinachImg },
  { name: 'Radish', nameHi: 'मूली', season: 'Winter', seasonHi: 'सर्दी', duration: '30-40 days', durationHi: '30-40 दिन', method: 'Direct seeding', methodHi: 'सीधी बुवाई', seeds: '8-10 kg/acre', seedsHi: '8-10 किलो/एकड़', tools: ['Seed drill'], toolsHi: ['सीड ड्रिल'], water: 'Regular irrigation', waterHi: 'नियमित सिंचाई', spacing: '20x5 cm', image: radishImg },
  { name: 'Bell Pepper', nameHi: 'शिमला मिर्च', season: 'Summer', seasonHi: 'गर्मी', duration: '90-120 days', durationHi: '90-120 दिन', method: 'Transplanting', methodHi: 'रोपाई', seeds: '2-3 kg/acre', seedsHi: '2-3 किलो/एकड़', tools: ['Stakes', 'Mulcher'], toolsHi: ['सहारा', 'मल्चर'], water: 'Moderate irrigation', waterHi: 'मध्यम सिंचाई', spacing: '60x45 cm', image: peppersImg },
];

const TOOLS = [
  { name: 'Hand Trowel', nameHi: 'खुरपी', price: '₹150', use: 'Planting, weeding', useHi: 'रोपण, निराई' },
  { name: 'Garden Fork', nameHi: 'बगीचा कांटा', price: '₹400', use: 'Soil preparation', useHi: 'मिट्टी तैयारी' },
  { name: 'Pruning Shears', nameHi: 'कटाई कैंची', price: '₹350', use: 'Trimming plants', useHi: 'पौधों की छंटाई' },
  { name: 'Watering Can', nameHi: 'पानी का डिब्बा', price: '₹250', use: 'Manual watering', useHi: 'हाथ से सिंचाई' },
  { name: 'Drip Irrigation Kit', nameHi: 'ड्रिप सिंचाई किट', price: '₹5,000/acre', use: 'Automated irrigation', useHi: 'स्वचालित सिंचाई' },
  { name: 'Sprinkler System', nameHi: 'स्प्रिंकलर सिस्टम', price: '₹8,000/acre', use: 'Overhead irrigation', useHi: 'ऊपरी सिंचाई' },
  { name: 'Rotavator', nameHi: 'रोटावेटर', price: '₹75,000', use: 'Soil preparation', useHi: 'मिट्टी तैयारी' },
  { name: 'Vegetable Transplanter', nameHi: 'सब्जी ट्रांसप्लांटर', price: '₹1,20,000', use: 'Mechanized transplanting', useHi: 'मशीनी रोपाई' },
];

const VegetableFarming = () => {
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
            {tx('Vegetable Farming', 'सब्जी की खेती')}
          </h1>
          <p className="text-base leading-relaxed text-muted-foreground md:text-lg">
            {tx('Complete information on all types of vegetables, farming methods, and tools used.', 'सभी प्रकार की सब्जियों, खेती के तरीकों और उपयोग किए जाने वाले उपकरणों की संपूर्ण जानकारी।')}
          </p>
        </Reveal>

        {/* Vegetables */}
        <div className="mb-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {VEGETABLES.map((veg, i) => (
            <Reveal key={veg.name} delay={(i % 3) * 0.07} distance={30}>
              <article className="glass lift group h-full overflow-hidden rounded-[2rem]">
                <div className="img-zoom h-48 overflow-hidden">
                  <img
                    src={veg.image}
                    alt={tx(veg.name, veg.nameHi)}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="p-6">
                  <h3
                    className="mb-4 text-2xl font-semibold text-foreground"
                    style={{ fontFamily: 'var(--font-serif)' }}
                  >
                    {tx(veg.name, veg.nameHi)}
                  </h3>

                  <dl className="space-y-3.5">
                    <div className="flex items-start gap-2.5">
                      <Sun className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
                      <div className="min-w-0">
                        <dt className="text-sm text-muted-foreground">{tx('Season', 'मौसम')}</dt>
                        <dd className="font-semibold text-foreground">{tx(veg.season, veg.seasonHi)}</dd>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <Leaf className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
                      <div className="min-w-0">
                        <dt className="text-sm text-muted-foreground">
                          {tx('Duration & Method', 'अवधि और विधि')}
                        </dt>
                        <dd className="text-foreground">{tx(veg.duration, veg.durationHi)}</dd>
                        <dd className="text-foreground">{tx(veg.method, veg.methodHi)}</dd>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <Droplets className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
                      <div className="min-w-0">
                        <dt className="text-sm text-muted-foreground">
                          {tx('Water Requirements', 'पानी की आवश्यकता')}
                        </dt>
                        <dd className="text-sm text-foreground">{tx(veg.water, veg.waterHi)}</dd>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <Sprout className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
                      <div className="min-w-0">
                        <dt className="text-sm text-muted-foreground">
                          {tx('Seeds Required', 'बीज की आवश्यकता')}
                        </dt>
                        <dd className="font-semibold text-foreground">{tx(veg.seeds, veg.seedsHi)}</dd>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <Ruler className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
                      <div className="min-w-0">
                        <dt className="text-sm text-muted-foreground">{tx('Spacing', 'दूरी')}</dt>
                        <dd className="font-semibold text-foreground">{veg.spacing}</dd>
                      </div>
                    </div>

                    <div>
                      <dt className="mb-2 text-sm text-muted-foreground">
                        {tx('Tools Needed', 'आवश्यक उपकरण')}
                      </dt>
                      <dd className="flex flex-wrap gap-2">
                        {veg.tools.map((tool, i) => (
                          <span
                            key={tool}
                            className="rounded-full bg-primary/10 px-2.5 py-1 text-xs text-primary"
                          >
                            {tx(tool, veg.toolsHi[i] ?? tool)}
                          </span>
                        ))}
                      </dd>
                    </div>
                  </dl>
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        {/* Common tools */}
        <Reveal distance={30}>
          <section className="glass mb-12 rounded-3xl p-6 md:p-8">
            <div className="mb-6 flex items-center gap-3">
              <Wrench className="h-7 w-7 text-primary" />
              <h2
                className="text-2xl font-semibold text-foreground md:text-3xl"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                {tx('Common Tools for Vegetable Farming', 'सब्जी की खेती के सामान्य उपकरण')}
              </h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {TOOLS.map((tool) => (
                <div key={tool.name} className="glass lift rounded-xl p-4">
                  <h3 className="mb-1.5 text-lg font-semibold text-foreground">
                    {tx(tool.name, tool.nameHi)}
                  </h3>
                  <p className="mb-1.5 text-xl font-bold text-primary">{tool.price}</p>
                  <p className="text-sm text-muted-foreground">{tx(tool.use, tool.useHi)}</p>
                </div>
              ))}
            </div>
          </section>
        </Reveal>
      </div>
    </div>
  );
};

export default VegetableFarming;
