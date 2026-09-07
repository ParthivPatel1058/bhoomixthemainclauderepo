import Navigation from '@/components/Navigation';
import BackButton from '@/components/BackButton';
import { useLanguage } from '@/contexts/LanguageContext';
import { Bot, Cog, Wrench, MapPin } from 'lucide-react';
import { Card } from '@/components/ui/card';
import PageHeader from '@/components/layout/PageHeader';
/* Drone types a farmer in India can actually hire today. Hire rates are the
   headline figure because almost nobody at this farm size buys one. */
const DRONES = [
  {
    en: 'Spraying drone (10 L)', hi: 'स्प्रे ड्रोन (10 लीटर)',
    useEn: 'Pesticide and liquid fertiliser over standing crop. Reaches the middle of a wet field where a sprayer cannot walk.',
    useHi: 'खड़ी फसल पर कीटनाशक और तरल उर्वरक। गीले खेत के बीच तक पहुँचता है जहाँ पंप लेकर चलना मुश्किल है।',
    hire: '₹400–600/acre', buy: '₹5–7 lakh', coverage: '25–30 acres',
  },
  {
    en: 'Spraying drone (16 L)', hi: 'स्प्रे ड्रोन (16 लीटर)',
    useEn: 'Same job on bigger holdings — fewer refills, so a full day covers noticeably more ground.',
    useHi: 'बड़े खेतों के लिए वही काम — बार-बार भरना नहीं पड़ता, इसलिए दिन भर में ज़्यादा ज़मीन कवर होती है।',
    hire: '₹350–500/acre', buy: '₹7–10 lakh', coverage: '40–50 acres',
  },
  {
    en: 'Crop health drone', hi: 'फसल स्वास्थ्य ड्रोन',
    useEn: 'A multispectral camera shows stress before your eye can — patchy nitrogen, water shortage, an infestation starting in one corner.',
    useHi: 'मल्टीस्पेक्ट्रल कैमरा तनाव आँख से पहले दिखा देता है — नाइट्रोजन की कमी, पानी की कमी, या किसी कोने में शुरू होता प्रकोप।',
    hire: '₹150–300/acre', buy: '₹1.5–5 lakh', coverage: '100+ acres',
  },
  {
    en: 'Seeding drone', hi: 'बुवाई ड्रोन',
    useEn: 'Broadcasts seed and granules. Mostly used for direct-seeded rice and for cover crops on wet ground.',
    useHi: 'बीज और दाना छिड़कता है। मुख्यतः सीधी धान बुवाई और गीली ज़मीन पर कवर फसल के लिए।',
    hire: '₹500–800/acre', buy: '₹6–9 lakh', coverage: '20–25 acres',
  },
  {
    en: 'Survey drone', hi: 'सर्वे ड्रोन',
    useEn: 'Maps plot boundaries and area. The output is what an insurance or land record claim will accept as evidence.',
    useHi: 'खेत की सीमा और क्षेत्रफल मापता है। इसका नतीजा बीमा या भूमि रिकॉर्ड दावे में सबूत के तौर पर माना जाता है।',
    hire: '₹100–200/acre', buy: '₹1–3 lakh', coverage: '200+ acres',
  },
  {
    en: 'Kisan Drone (subsidised)', hi: 'किसान ड्रोन (सब्सिडी वाला)',
    useEn: 'The government-scheme package: drone, training and a spares kit, sold mainly to FPOs and custom hiring centres.',
    useHi: 'सरकारी योजना का पैकेज: ड्रोन, ट्रेनिंग और स्पेयर किट — मुख्यतः FPO और कस्टम हायरिंग सेंटर के लिए।',
    hire: '₹300–450/acre', buy: '₹4–6 lakh', coverage: '30–35 acres',
  },
];

const DRONE_RULES = [
  { en: 'The pilot needs a Remote Pilot Certificate. A drone school course runs about a week; the operator you hire should be able to show you theirs.', hi: 'पायलट के पास रिमोट पायलट सर्टिफिकेट होना चाहिए। ड्रोन स्कूल का कोर्स लगभग एक हफ्ते का होता है; जिस ऑपरेटर को बुलाएँ, उससे सर्टिफिकेट दिखाने को कहें।' },
  { en: 'Every drone must carry a UIN — a registration number from the DigitalSky portal. No number, no legal flight.', hi: 'हर ड्रोन पर UIN यानी डिजिटलस्काई पोर्टल से मिला रजिस्ट्रेशन नंबर होना चाहिए। नंबर नहीं तो उड़ान वैध नहीं।' },
  { en: 'Check the airspace zone before flying. Green is open, yellow needs permission, red is barred — near airports and defence land in particular.', hi: 'उड़ान से पहले एयरस्पेस ज़ोन देखें। हरा खुला है, पीले में अनुमति चाहिए, लाल में मनाही — खासकर हवाई अड्डों और रक्षा भूमि के पास।' },
  { en: 'Only use pesticides cleared for drone spraying. The dose is not the same as a knapsack sprayer, and the label will say so.', hi: 'सिर्फ़ वही कीटनाशक इस्तेमाल करें जो ड्रोन छिड़काव के लिए मंज़ूर हैं। मात्रा नैपसैक पंप जैसी नहीं होती — लेबल पर लिखा रहता है।' },
  { en: 'Do not spray in wind above about 15 km/h. The chemical drifts onto the next field and you pay for it twice.', hi: 'लगभग 15 किमी/घंटा से तेज़ हवा में छिड़काव न करें। दवा बगल के खेत में उड़ जाती है और नुकसान दोहरा होता है।' },
];

const DRONE_SUBSIDY = [
  { en: 'Individual farmer: 40–50% of the cost, up to ₹4 lakh.', hi: 'व्यक्तिगत किसान: लागत का 40–50%, अधिकतम ₹4 लाख।' },
  { en: 'SC/ST, small, marginal and women farmers, and farmers in the North East: 50%, up to ₹5 lakh.', hi: 'अनुसूचित जाति/जनजाति, छोटे, सीमांत और महिला किसान तथा पूर्वोत्तर के किसान: 50%, अधिकतम ₹5 लाख।' },
  { en: 'Farmer Producer Organisations: up to 75% for demonstration on members’ fields.', hi: 'किसान उत्पादक संगठन (FPO): सदस्यों के खेतों पर प्रदर्शन हेतु 75% तक।' },
  { en: 'Custom hiring centres: 40%, up to ₹4 lakh — this is the route most villages actually get a drone through.', hi: 'कस्टम हायरिंग सेंटर: 40%, अधिकतम ₹4 लाख — ज़्यादातर गाँवों तक ड्रोन इसी रास्ते पहुँचता है।' },
  { en: 'Agriculture graduates setting up a hiring centre: 50%, up to ₹5 lakh.', hi: 'हायरिंग सेंटर शुरू करने वाले कृषि स्नातक: 50%, अधिकतम ₹5 लाख।' },
];

const RoboticFarming = () => {
  const {
    t, language, tx } = useLanguage();
  
  const robotsByState = [{
    state: 'Punjab',
    robots: [{
      name: 'Happy Seeder',
      function: 'Paddy straw management & wheat sowing',
      price: '₹1,20,000 - ₹1,50,000',
      contact: 'Punjab Agricultural University - 0161-2401960',
      subsidy: '50% under SMAM'
    }, {
      name: 'Laser Land Leveler',
      function: 'Precision land leveling',
      price: '₹2,50,000 - ₹3,00,000',
      contact: 'Ludhiana Agri Machinery - 98765-43210',
      subsidy: '40% subsidy available'
    }, {
      name: 'Combine Harvester (Self-propelled)',
      function: 'Harvesting wheat, paddy',
      price: '₹25,00,000 - ₹40,00,000',
      contact: 'Preet Tractors, Patiala - 0175-2218000',
      subsidy: 'Custom hiring centers available'
    }]
  }, {
    state: 'Haryana',
    robots: [{
      name: 'Pneumatic Planter',
      function: 'Precision seeding for maize, cotton',
      price: '₹80,000 - ₹1,20,000',
      contact: 'Karnal Agri Works - 0184-2200500',
      subsidy: '50% under SMAM'
    }, {
      name: 'Rotavator',
      function: 'Soil preparation & stubble management',
      price: '₹60,000 - ₹1,00,000',
      contact: 'Sonalika Implements, Rohtak - 01262-255255',
      subsidy: '40% subsidy'
    }, {
      name: 'Multi-crop Thresher',
      function: 'Threshing wheat, paddy, pulses',
      price: '₹1,50,000 - ₹2,00,000',
      contact: 'Gurgaon Machinery Hub - 0124-4567890',
      subsidy: 'Available for SHGs'
    }]
  }, {
    state: 'Uttar Pradesh',
    robots: [{
      name: 'Sugarcane Planter',
      function: 'Automated sugarcane planting',
      price: '₹3,50,000 - ₹5,00,000',
      contact: 'Lucknow Agri Solutions - 0522-2234567',
      subsidy: '40% subsidy under SMAM'
    }, {
      name: 'Reaper Binder',
      function: 'Harvesting & binding wheat, paddy',
      price: '₹1,80,000 - ₹2,50,000',
      contact: 'Meerut Farm Equipment - 0121-2765432',
      subsidy: '50% for SC/ST farmers'
    }, {
      name: 'Power Tiller',
      function: 'Small farm mechanization',
      price: '₹80,000 - ₹1,20,000',
      contact: 'VST Tillers, Noida - 0120-2345678',
      subsidy: '40% subsidy'
    }]
  }, {
    state: 'Maharashtra',
    robots: [{
      name: 'Cotton Picker',
      function: 'Automated cotton harvesting',
      price: '₹8,00,000 - ₹12,00,000',
      contact: 'Nagpur Cotton Tech - 0712-2234567',
      subsidy: 'CHC subsidy available'
    }, {
      name: 'Drip Irrigation System',
      function: 'Precision water management',
      price: '₹50,000 - ₹1,50,000',
      contact: 'Jain Irrigation, Pune - 020-27420100',
      subsidy: '60% under PMKSY'
    }, {
      name: 'Grape Harvester',
      function: 'Mechanized grape picking',
      price: '₹6,00,000 - ₹8,00,000',
      contact: 'Nashik Agri Innovations - 0253-2234567',
      subsidy: 'Horticulture subsidy 40%'
    }]
  }, {
    state: 'Karnataka',
    robots: [{
      name: 'Arecanut Climber',
      function: 'Automated arecanut harvesting',
      price: '₹1,50,000 - ₹2,00,000',
      contact: 'Mangalore Agri Tech - 0824-2234567',
      subsidy: '50% subsidy'
    }, {
      name: 'Coffee Pulper',
      function: 'Coffee bean processing',
      price: '₹2,00,000 - ₹3,50,000',
      contact: 'Coorg Coffee Equipment - 08272-228844',
      subsidy: '40% under PMFME'
    }, {
      name: 'Paddy Transplanter',
      function: 'Automated rice transplanting',
      price: '₹1,50,000 - ₹2,50,000',
      contact: 'Bengaluru Farm Solutions - 080-22345678',
      subsidy: '50% subsidy'
    }]
  }, {
    state: 'Tamil Nadu',
    robots: [{
      name: 'Coconut De-husker',
      function: 'Automated coconut processing',
      price: '₹80,000 - ₹1,20,000',
      contact: 'Coimbatore Agri Machines - 0422-2234567',
      subsidy: '40% subsidy'
    }, {
      name: 'Banana Fiber Extractor',
      function: 'Fiber extraction from banana stem',
      price: '₹3,00,000 - ₹4,50,000',
      contact: 'Chennai Green Tech - 044-22345678',
      subsidy: '50% PMFME subsidy'
    }, {
      name: 'Drum Seeder',
      function: 'Direct seeding in paddy fields',
      price: '₹4,000 - ₹8,000',
      contact: 'Madurai Farm Tools - 0452-2345678',
      subsidy: '50% subsidy'
    }]
  }, {
    state: 'Gujarat',
    robots: [{
      name: 'Groundnut Digger',
      function: 'Mechanized groundnut harvesting',
      price: '₹60,000 - ₹1,00,000',
      contact: 'Rajkot Agri Equipment - 0281-2234567',
      subsidy: '50% subsidy'
    }, {
      name: 'Cotton Stalk Puller',
      function: 'Removing cotton stalks',
      price: '₹1,20,000 - ₹1,80,000',
      contact: 'Ahmedabad Farm Tech - 079-22345678',
      subsidy: '40% subsidy'
    }, {
      name: 'Potato Planter',
      function: 'Automated potato planting',
      price: '₹1,50,000 - ₹2,00,000',
      contact: 'Surat Agri Innovations - 0261-2234567',
      subsidy: '50% under SMAM'
    }]
  }, {
    state: 'West Bengal',
    robots: [{
      name: 'Jute Ribbon Maker',
      function: 'Jute processing machinery',
      price: '₹2,50,000 - ₹3,50,000',
      contact: 'Kolkata Jute Tech - 033-22345678',
      subsidy: '40% subsidy'
    }, {
      name: 'Mini Combine Harvester',
      function: 'Small farm harvesting',
      price: '₹8,00,000 - ₹12,00,000',
      contact: 'Burdwan Agri Works - 0342-2234567',
      subsidy: 'CHC subsidy available'
    }, {
      name: 'Zero Till Drill',
      function: 'Conservation agriculture',
      price: '₹80,000 - ₹1,20,000',
      contact: 'Siliguri Farm Solutions - 0353-2234567',
      subsidy: '50% subsidy'
    }]
  }, {
    state: 'Rajasthan',
    robots: [{
      name: 'Mustard Harvester',
      function: 'Mechanized mustard cutting',
      price: '₹1,50,000 - ₹2,00,000',
      contact: 'Jaipur Agri Equipment - 0141-2234567',
      subsidy: '50% subsidy'
    }, {
      name: 'Solar Water Pump',
      function: 'Solar-powered irrigation',
      price: '₹1,50,000 - ₹3,00,000',
      contact: 'Jodhpur Solar Solutions - 0291-2234567',
      subsidy: '60% under PMKUSUM'
    }, {
      name: 'Bajra Thresher',
      function: 'Pearl millet threshing',
      price: '₹60,000 - ₹1,00,000',
      contact: 'Udaipur Farm Tech - 0294-2234567',
      subsidy: '40% subsidy'
    }]
  }, {
    state: 'Madhya Pradesh',
    robots: [{
      name: 'Soybean Harvester',
      function: 'Automated soybean harvesting',
      price: '₹15,00,000 - ₹20,00,000',
      contact: 'Indore Agri Machines - 0731-2234567',
      subsidy: 'CHC support available'
    }, {
      name: 'Wheat Straw Baler',
      function: 'Straw baling for fodder',
      price: '₹2,50,000 - ₹4,00,000',
      contact: 'Bhopal Farm Equipment - 0755-2234567',
      subsidy: '40% subsidy'
    }, {
      name: 'Garlic Planter',
      function: 'Mechanized garlic planting',
      price: '₹1,00,000 - ₹1,50,000',
      contact: 'Jabalpur Agri Solutions - 0761-2234567',
      subsidy: '50% subsidy'
    }]
  }, {
    state: 'Andhra Pradesh',
    robots: [{
      name: 'Chili Harvester',
      function: 'Automated chili picking',
      price: '₹5,00,000 - ₹7,00,000',
      contact: 'Guntur Spice Tech - 0863-2234567',
      subsidy: '40% subsidy'
    }, {
      name: 'Turmeric Polisher',
      function: 'Turmeric processing',
      price: '₹1,50,000 - ₹2,50,000',
      contact: 'Vijayawada Agri Process - 0866-2234567',
      subsidy: '40% PMFME subsidy'
    }, {
      name: 'Aqua Pond Aerator',
      function: 'Fish pond aeration',
      price: '₹50,000 - ₹1,00,000',
      contact: 'Visakhapatnam Aqua Tech - 0891-2234567',
      subsidy: '40% subsidy'
    }]
  }, {
    state: 'Telangana',
    robots: [{
      name: 'Maize Sheller',
      function: 'Automated corn shelling',
      price: '₹80,000 - ₹1,20,000',
      contact: 'Hyderabad Agri Equipment - 040-22345678',
      subsidy: '50% subsidy'
    }, {
      name: 'Turmeric Boiler',
      function: 'Turmeric curing equipment',
      price: '₹2,00,000 - ₹3,00,000',
      contact: 'Warangal Spice Machinery - 0870-2234567',
      subsidy: '40% subsidy'
    }, {
      name: 'Cotton Seed Delinter',
      function: 'Cotton seed processing',
      price: '₹3,50,000 - ₹5,00,000',
      contact: 'Karimnagar Cotton Tech - 0878-2234567',
      subsidy: '40% subsidy'
    }]
  }];
  const robots = [{
    name: 'Autonomous Tractor',
    function: 'GPS-guided field operations',
    price: '₹25-45 Lakhs',
    category: 'General Purpose'
  }, {
    name: 'Crop Monitoring Drone',
    function: 'AI-powered crop health monitoring',
    price: '₹1.5-5 Lakhs',
    category: 'Monitoring'
  }, {
    name: 'Precision Seeding Robot',
    function: 'Automated precise seed placement',
    price: '₹8-15 Lakhs',
    category: 'Seeding'
  }, {
    name: 'Automated Spraying System',
    function: 'Smart targeted pesticide application',
    price: '₹12-20 Lakhs',
    category: 'Pest Control'
  }, {
    name: 'Harvesting Robot',
    function: 'AI vision-based selective harvesting',
    price: '₹18-35 Lakhs',
    category: 'Harvesting'
  }, {
    name: 'Weeding Robot',
    function: 'Mechanical chemical-free weeding',
    price: '₹6-12 Lakhs',
    category: 'Weed Management'
  }];
  return <div className="min-h-screen">
      <Navigation />

      <div className="px-4 lg:px-6 pt-5">
        <BackButton />
      </div>
      
      <div className="container mx-auto px-4 pb-20 pt-8 sm:px-6 lg:px-8">
        <div className="mb-12">
          <PageHeader
        eyebrow={tx('Technology', 'तकनीक')}
        title={tx('Agricultural Robotics', 'कृषि रोबोटिक्स')}
      />
        </div>


        {/* General Information */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {robots.map((robot, idx) => <div key={idx} className="glass rounded-2xl p-6 hover:shadow-xl transition-[transform,box-shadow,border-color,background-color,color,opacity,filter]">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-xl bg-primary/10">
                  <Bot className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">{robot.name}</h3>
                  <p className="text-xs text-muted-foreground">{tx(robot.category, robot.category)}</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-3">{tx(robot.function, robot.function)}</p>
              <p className="text-xl font-bold text-primary">{robot.price}</p>
            </div>)}
        </div>

        {/* Drones.
            Given a section of their own rather than one card in the grid
            above, because a drone is the only machine on this page a
            smallholder can realistically reach: spraying is sold by the acre
            through a service provider, so the number that matters is the hire
            rate, not the ₹5 lakh purchase price. The rules are here for the
            same reason — flying one legally needs a licence and a
            registration number, and finding that out after paying is the
            expensive way to learn it. */}
        <div className="mb-16">
          <h2 className="mb-2 flex items-center gap-3 text-3xl font-bold text-foreground">
            <Bot className="h-8 w-8 text-primary" />
            {tx('Drones for farming', 'खेती के लिए ड्रोन')}
          </h2>
          <p className="mb-8 max-w-2xl text-muted-foreground">
            {tx(
              'You do not have to buy one. Most farmers hire a drone and an operator by the acre — the rates below are what that costs.',
              'ड्रोन खरीदना ज़रूरी नहीं। ज़्यादातर किसान प्रति एकड़ के हिसाब से ड्रोन और ऑपरेटर किराए पर लेते हैं — नीचे उसी की दरें हैं।',
            )}
          </p>

          <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {DRONES.map((d) => (
              <div
                key={d.en}
                className="glass rounded-2xl p-6 transition-[transform,box-shadow,border-color,background-color,color,opacity,filter] hover:shadow-xl"
              >
                <h3 className="text-lg font-bold text-foreground">{tx(d.en, d.hi)}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{tx(d.useEn, d.useHi)}</p>
                <dl className="mt-4 space-y-1.5 border-t border-border/60 pt-3 text-sm">
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted-foreground">{tx('Hire rate', 'किराया')}</dt>
                    <dd className="font-semibold text-primary" data-numeric>{d.hire}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted-foreground">{tx('To buy', 'खरीदने पर')}</dt>
                    <dd className="font-medium text-foreground" data-numeric>{d.buy}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted-foreground">{tx('Covers per day', 'प्रतिदिन कवरेज')}</dt>
                    <dd className="font-medium text-foreground" data-numeric>{d.coverage}</dd>
                  </div>
                </dl>
              </div>
            ))}
          </div>

          {/* Rules and money. Both are things a farmer gets wrong expensively. */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="glass rounded-2xl p-6">
              <h3 className="mb-3 text-lg font-bold text-foreground">
                {tx('Before you fly one', 'उड़ाने से पहले')}
              </h3>
              <ul className="space-y-2.5 text-sm text-muted-foreground">
                {DRONE_RULES.map((r) => (
                  <li key={r.en} className="flex gap-2.5">
                    <span aria-hidden className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary" />
                    <span>{tx(r.en, r.hi)}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="glass rounded-2xl p-6">
              <h3 className="mb-3 text-lg font-bold text-foreground">
                {tx('What the government pays', 'सरकार कितना देती है')}
              </h3>
              <ul className="space-y-2.5 text-sm text-muted-foreground">
                {DRONE_SUBSIDY.map((r) => (
                  <li key={r.en} className="flex gap-2.5">
                    <span aria-hidden className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary" />
                    <span>{tx(r.en, r.hi)}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 border-t border-border/60 pt-3 text-xs text-muted-foreground">
                {tx(
                  'Rates and subsidy slabs change. Confirm the current figure with your Krishi Vigyan Kendra before you commit money.',
                  'दरें और सब्सिडी बदलती रहती हैं। पैसा लगाने से पहले अपने कृषि विज्ञान केंद्र से मौजूदा आंकड़ा ज़रूर पुष्टि करें।',
                )}
              </p>
            </div>
          </div>
        </div>

        {/* State-wise Robots */}
        <div>
          <h2 className="text-3xl font-bold mb-8 text-foreground flex items-center gap-3">
            <MapPin className="h-8 w-8 text-primary" />
            {tx('State-Wise Agricultural Machinery', 'राज्यवार कृषि मशीनरी')}
          </h2>
          <div className="space-y-8">
            {robotsByState.map((stateData, idx) => <div key={idx} className="glass rounded-3xl p-8">
                <h3 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                  <MapPin className="h-6 w-6 text-primary" />
                  {tx(stateData.state, stateData.state)}
                </h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {stateData.robots.map((robot, robotIdx) => <div key={robotIdx} className="glass rounded-2xl p-6 hover:shadow-xl transition-[transform,box-shadow,border-color,background-color,color,opacity,filter]">
                      <h4 className="text-xl font-bold text-foreground mb-3">{robot.name}</h4>
                      <div className="space-y-2 mb-4">
                        <p className="text-sm text-muted-foreground">
                          <strong className="text-foreground">{tx('Function:', 'कार्य:')}</strong> {tx(robot.function, robot.function)}
                        </p>
                        <p className="text-xl font-bold text-primary">{robot.price}</p>
                        <p className="text-sm text-green-600 font-semibold">{tx(robot.subsidy, robot.subsidy)}</p>
                      </div>
                      <div className="pt-3 border-t border-border">
                        <p className="text-sm text-muted-foreground mb-1">
                          <strong className="text-foreground">{tx('Contact:', 'संपर्क:')}</strong>
                        </p>
                        <p className="text-sm text-foreground">{robot.contact}</p>
                      </div>
                    </div>)}
                </div>
              </div>)}
          </div>
        </div>
      </div>
    </div>;
};
export default RoboticFarming;