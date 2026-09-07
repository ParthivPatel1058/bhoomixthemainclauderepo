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

/* Field troubleshooting. Ordered by how often it is the answer, not by how
   interesting it is — nitrogen hunger and bad drainage between them explain
   most of what looks like a failing organic plot in the first two seasons. */
const PROBLEMS = [
  {
    symptomEn: 'Leaves yellowing from the bottom up',
    symptomHi: 'नीचे की पत्तियाँ पहले पीली पड़ रही हैं',
    causeEn: 'Nitrogen hunger. The plant is pulling nitrogen out of its old leaves to feed the new ones, so the oldest go first. Common in the first two organic seasons, when compost has not yet built a supply the soil can release on its own.',
    causeHi: 'नाइट्रोजन की कमी। पौधा पुरानी पत्तियों से नाइट्रोजन खींचकर नई पत्तियों को दे रहा है, इसलिए सबसे पुरानी पहले पीली होती हैं। पहले दो जैविक सीज़न में आम है, जब कम्पोस्ट ने अभी मिट्टी में भंडार नहीं बनाया।',
    doEn: 'Spray 3% jeevamrut or diluted cow-urine solution on the leaves in the evening, and repeat after ten days. A foliar feed acts in days; anything worked into the soil will take weeks.',
    doHi: 'शाम को पत्तियों पर 3% जीवामृत या पतला गोमूत्र घोल छिड़कें, दस दिन बाद दोहराएँ। पत्तियों पर छिड़काव कुछ ही दिनों में असर करता है; मिट्टी में डाली गई चीज़ हफ्तों लेती है।',
    preventEn: 'Sow a legume — dhaincha, sunhemp or cowpea — before the main crop and turn it in at flowering. It fixes nitrogen in place, which is cheaper than buying it every season.',
    preventHi: 'मुख्य फसल से पहले ढैंचा, सनई या लोबिया जैसी दलहन बोएँ और फूल आने पर मिट्टी में मिला दें। यह खेत में ही नाइट्रोजन बनाती है, जो हर सीज़न खरीदने से सस्ता है।',
  },
  {
    symptomEn: 'Plants stunted and pale, whole field looks even',
    symptomHi: 'पौधे बौने और फीके, पूरा खेत एक जैसा दिख रहा है',
    causeEn: 'Compacted soil. Roots cannot get down, so the plant lives off the top few inches. Evenness is the clue — a pest or disease would arrive in patches.',
    causeHi: 'मिट्टी दब गई है। जड़ें नीचे नहीं जा पातीं, पौधा ऊपर की कुछ इंच मिट्टी पर ही जीता है। एकरूपता ही संकेत है — कीट या रोग होता तो धब्बों में दिखता।',
    doEn: 'Dig a pit a foot and a half deep and look. A hard grey pan you can rap with a knuckle confirms it. Break it where you can with a chisel plough, and mulch heavily so the surface stops crusting.',
    doHi: 'डेढ़ फुट गहरा गड्ढा खोदकर देखें। सख्त भूरी परत, जिस पर उँगली ठोकने से आवाज़ आए, इसकी पुष्टि है। जहाँ संभव हो चिसल हल से तोड़ें और गाढ़ी मल्चिंग करें ताकि सतह पर पपड़ी न जमे।',
    preventEn: 'Keep heavy machinery off wet ground, and grow a deep-rooted crop such as pigeon pea or radish in the rotation to open the layer from below.',
    preventHi: 'गीली ज़मीन पर भारी मशीन न चलाएँ, और फसल चक्र में अरहर या मूली जैसी गहरी जड़ वाली फसल रखें जो परत को नीचे से खोल दे।',
  },
  {
    symptomEn: 'Wilting even though the soil is wet',
    symptomHi: 'मिट्टी गीली होने पर भी पौधे मुरझा रहे हैं',
    causeEn: 'Waterlogged roots, or a root rot that followed the water. Roots need air; standing water suffocates them and the plant wilts exactly as if it were dry.',
    causeHi: 'जड़ों में पानी भर गया है, या पानी के बाद जड़ सड़न लग गई है। जड़ों को हवा चाहिए; खड़ा पानी उन्हें दबा देता है और पौधा वैसे ही मुरझाता है जैसे सूखे में।',
    doEn: 'Cut a drainage channel to the lowest corner today. Pull one plant: healthy roots are white and firm, rotting roots are brown and slide apart between your fingers.',
    doHi: 'आज ही सबसे नीचे वाले कोने तक नाली काटें। एक पौधा उखाड़कर देखें: स्वस्थ जड़ें सफेद और मज़बूत होती हैं, सड़ी जड़ें भूरी होती हैं और उँगलियों में टूट जाती हैं।',
    preventEn: 'Plant on raised beds or ridges where water sits, and work compost in — it opens heavy soil so water drains instead of standing.',
    preventHi: 'जहाँ पानी रुकता हो वहाँ ऊँची क्यारी या मेड़ पर बुवाई करें, और कम्पोस्ट मिलाएँ — यह भारी मिट्टी को खोलकर पानी निकलने देता है।',
  },
  {
    symptomEn: 'Good leaves, but hardly any flowers or fruit',
    symptomHi: 'पत्तियाँ अच्छी, पर फूल या फल बहुत कम',
    causeEn: 'Too much nitrogen and not enough phosphorus and potash — the plant is spending everything on leaf. Undressed raw manure does this. A shortage of pollinators produces the same empty result.',
    causeHi: 'नाइट्रोजन ज़्यादा और फॉस्फोरस-पोटाश कम — पौधा सारी ताक़त पत्ती में लगा रहा है। बिना सड़ी कच्ची गोबर खाद से ऐसा होता है। परागण करने वाले कीटों की कमी से भी यही नतीजा मिलता है।',
    doEn: 'Stop all nitrogen feeds now. Give bone meal or rock phosphate, and wood ash for potash. Sow a strip of marigold or coriander along the edge to bring pollinators back.',
    doHi: 'नाइट्रोजन देना तुरंत बंद करें। हड्डी चूर्ण या रॉक फॉस्फेट दें, और पोटाश के लिए लकड़ी की राख। किनारे पर गेंदा या धनिया की पट्टी बोएँ ताकि परागण करने वाले कीट लौटें।',
    preventEn: 'Compost manure fully before it goes on the field, and get a soil test each year so you are feeding what is short rather than what is easy to buy.',
    preventHi: 'गोबर खाद को खेत में डालने से पहले पूरी तरह सड़ाएँ, और हर साल मिट्टी जाँच कराएँ ताकि जो कमी है वही दें, न कि जो आसानी से मिल जाए।',
  },
  {
    symptomEn: 'Holes in the leaves, insects visible',
    symptomHi: 'पत्तियों में छेद, कीट दिख रहे हैं',
    causeEn: 'A pest population with nothing eating it. It usually builds up where the same crop returns to the same field year after year and its predators have nowhere to live.',
    causeHi: 'कीटों की आबादी बढ़ गई है और उन्हें खाने वाला कोई नहीं। यह वहाँ होता है जहाँ हर साल एक ही खेत में एक ही फसल आती है और शिकारी कीटों के रहने की जगह नहीं बचती।',
    doEn: 'Spray 5% neem seed kernel extract at dusk — sunlight destroys it. Add sticky traps, and hand-pick the large caterpillars, which is faster than any spray at small scale.',
    doHi: 'शाम को 5% नीम बीज गिरी अर्क का छिड़काव करें — धूप में यह नष्ट हो जाता है। चिपचिपे ट्रैप लगाएँ और बड़ी इल्लियाँ हाथ से चुनें, छोटे खेत में यह किसी भी छिड़काव से तेज़ है।',
    preventEn: 'Rotate the crop family every season and keep a flowering border. Ladybirds and wasps live in that border and do the work for free all year.',
    preventHi: 'हर सीज़न फसल परिवार बदलें और खेत के किनारे फूलों की पट्टी रखें। लेडीबर्ड और ततैया वहीं रहते हैं और साल भर मुफ़्त में यह काम करते हैं।',
  },
  {
    symptomEn: 'Seed came up thin and patchy',
    symptomHi: 'बीज कम और छितराया हुआ उगा',
    causeEn: 'Old seed, sowing too deep, or a crusted surface the seedling could not push through. Cold or dry soil at sowing gives the same patchy stand.',
    causeHi: 'पुराना बीज, ज़्यादा गहरी बुवाई, या सतह पर जमी पपड़ी जिसे अंकुर तोड़ नहीं पाया। बुवाई के समय ठंडी या सूखी मिट्टी से भी ऐसा ही छितराव होता है।',
    doEn: 'Gap-fill now if the crop is still young enough to catch up. Test what is left of the seed: a hundred seeds on a damp cloth for a week tells you the germination rate before you sow it again.',
    doHi: 'फसल अभी छोटी है तो खाली जगह में दोबारा बुवाई करें। बचे बीज की जाँच करें: गीले कपड़े पर सौ बीज एक हफ्ते रखने से अंकुरण दर पता चल जाती है, दोबारा बोने से पहले।',
    preventEn: 'Sow no deeper than twice the seed’s width, treat with beejamrut before sowing, and irrigate lightly so the surface never sets hard.',
    preventHi: 'बीज की चौड़ाई से दोगुनी से ज़्यादा गहराई में न बोएँ, बुवाई से पहले बीजामृत से उपचार करें, और हल्की सिंचाई करें ताकि सतह सख़्त न हो।',
  },
];

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

        {/* Why it is not growing.
            The rest of this page sells inputs. This section is the part a
            farmer standing in a struggling field actually needs: start from
            what you can see, not from what you should have bought. Each entry
            names the symptom, the usual cause behind it, what to do this week,
            and what stops it happening again next season — organic answers
            throughout, since a chemical fix would cost the plot its
            certification. */}
        <Reveal distance={30}>
          <section className="mb-12">
            <h2
              className="mb-2 text-2xl font-semibold text-foreground md:text-3xl"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              {tx('Why is it not growing?', 'फसल क्यों नहीं बढ़ रही?')}
            </h2>
            <p className="mb-6 max-w-2xl text-muted-foreground">
              {tx(
                'Find what your field looks like, then read across. Organic answers only — a chemical fix would cost you the certification.',
                'अपने खेत जैसी हालत ढूँढें, फिर आगे पढ़ें। सभी उपाय जैविक हैं — रासायनिक इलाज से प्रमाणन चला जाएगा।',
              )}
            </p>

            <div className="grid gap-5 md:grid-cols-2">
              {PROBLEMS.map((p, i) => (
                <Reveal key={p.symptomEn} delay={(i % 2) * 0.07} distance={24}>
                  <article className="glass h-full rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-foreground">
                      {tx(p.symptomEn, p.symptomHi)}
                    </h3>

                    <dl className="mt-4 space-y-3 text-sm">
                      <div>
                        <dt className="font-semibold text-secondary-foreground">
                          {tx('Why it happens', 'ऐसा क्यों होता है')}
                        </dt>
                        <dd className="mt-0.5 leading-relaxed text-muted-foreground">
                          {tx(p.causeEn, p.causeHi)}
                        </dd>
                      </div>
                      <div>
                        <dt className="font-semibold text-primary">
                          {tx('Do this week', 'इस हफ्ते यह करें')}
                        </dt>
                        <dd className="mt-0.5 leading-relaxed text-muted-foreground">
                          {tx(p.doEn, p.doHi)}
                        </dd>
                      </div>
                      <div className="border-t border-border/60 pt-3">
                        <dt className="font-semibold text-foreground">
                          {tx('So it does not return', 'ताकि दोबारा न हो')}
                        </dt>
                        <dd className="mt-0.5 leading-relaxed text-muted-foreground">
                          {tx(p.preventEn, p.preventHi)}
                        </dd>
                      </div>
                    </dl>
                  </article>
                </Reveal>
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
