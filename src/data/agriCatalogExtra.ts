/**
 * The researched Agri Market catalogue: fertilisers, soil amendments and seed.
 *
 * Scope is deliberately limited to inputs that feed a crop or start one —
 * fertilisers, bio-fertilisers, micronutrients and seed. No pesticides,
 * herbicides or fungicides are listed: those are scheduled products whose sale
 * is licensed under the Insecticides Act, and they are out of scope here.
 *
 * What is listed reflects what is actually traded. The straight fertilisers
 * (urea, DAP, MOP, SSP) are the four that dominate world consumption; the
 * complexes are the grades Indian co-operatives stock; the bio-fertilisers are
 * the standard ICAR-recommended cultures. Seed varieties are named releases a
 * farmer would recognise at a dealer counter — HD-3086 wheat, Swarna paddy,
 * Arka Anamika okra — rather than invented names.
 *
 * Prices are indicative Indian retail in rupees, anchored on statutory or
 * commonly quoted rates where those exist (neem-coated urea and nano urea are
 * price-controlled; DAP and MOP track the subsidised MRP). They are a starting
 * point for the storefront, not a live price feed.
 *
 * IDs start at 100 so they can never collide with the legacy rows in
 * `agriProducts.ts`, whose ids are persisted on existing cart and order lines.
 *
 * Every row carries a real photograph. `ProductImage` still falls back to a
 * glyph tile if an asset ever fails to load, so the grid cannot break.
 */

import type { Product } from '@/data/agriProducts';

/* Photographs sourced from Wikimedia Commons, preferring CC0 and public
   domain. Credits for the CC BY / BY-SA files live in
   `src/assets/agri/attributions.json`. */
import imgUrea from '@/assets/agri/urea.png';
import imgAmmoniumSulphate from '@/assets/agri/ammonium-sulphate.png';
import imgCan from '@/assets/agri/can.jpg';
import imgDap from '@/assets/agri/dap.png';
import imgSsp from '@/assets/agri/ssp.jpg';
import imgTsp from '@/assets/agri/tsp.jpg';
import imgRockPhosphate from '@/assets/agri/rock-phosphate.jpg';
import imgMop from '@/assets/agri/mop.jpg';
import imgSop from '@/assets/agri/sop.jpg';
import imgNpk102626 from '@/assets/agri/npk-102626.jpg';
import imgNpk123216 from '@/assets/agri/npk-123216.jpg';
import imgNpk191919 from '@/assets/agri/npk-123216.jpg';
import imgNpk2020013 from '@/assets/agri/npk-2020013.jpg';
import imgNanoUrea from '@/assets/agri/urea.png';
import imgGypsum from '@/assets/agri/gypsum.jpg';
import imgZincSulphate from '@/assets/agri/zinc-sulphate.jpg';
import imgBorax from '@/assets/agri/borax.jpg';
import imgMagnesiumSulphate from '@/assets/agri/magnesium-sulphate.jpg';
import imgFerrousSulphate from '@/assets/agri/ferrous-sulphate.png';
import imgMicronutrientMix from '@/assets/agri/zinc-sulphate.jpg';
import imgRhizobium from '@/assets/agri/rhizobium.jpg';
import imgAzotobacter from '@/assets/agri/azotobacter.jpg';
import imgAzospirillum from '@/assets/agri/azospirillum.jpg';
import imgPsb from '@/assets/agri/psb.jpg';
import imgMycorrhiza from '@/assets/agri/mycorrhiza.jpg';
import imgKmb from '@/assets/agri/psb.jpg';
import imgSeaweedExtract from '@/assets/agri/seaweed-extract.jpg';
import imgHumicAcid from '@/assets/agri/humic-acid.jpg';
import imgMustardCake from '@/assets/neem-cake.jpg';
import imgPressMud from '@/assets/agri/press-mud.jpg';
import imgOrganicWheatSeeds from '@/assets/organic-wheat-seeds.jpg';
import imgOrganicPaddySeeds from '@/assets/organic-paddy-seeds.jpg';
import imgRice from '@/assets/rice.jpg';
import imgSeedBajra from '@/assets/agri/seed-bajra.jpg';
import imgSeedRagi from '@/assets/agri/seed-ragi.jpg';
import imgSeedJowar from '@/assets/agri/seed-jowar.jpg';
import imgSeedChickpea from '@/assets/agri/seed-chickpea.jpg';
import imgSeedPigeonpea from '@/assets/agri/seed-pigeonpea.jpg';
import imgSeedMoong from '@/assets/agri/seed-moong.jpg';
import imgSeedUrad from '@/assets/agri/seed-urad.jpg';
import imgSeedMasoor from '@/assets/agri/seed-masoor.jpg';
import imgSeedMustard from '@/assets/agri/seed-mustard.jpg';
import imgSeedGroundnut from '@/assets/agri/seed-groundnut.jpg';
import imgSeedSoybean from '@/assets/agri/seed-soybean.jpg';
import imgSeedSunflower from '@/assets/agri/seed-sunflower.jpg';
import imgSeedSesame from '@/assets/agri/seed-sesame.jpg';
import imgTomatoes from '@/assets/tomatoes.jpg';
import imgOkra from '@/assets/okra.jpg';
import imgPeppers from '@/assets/peppers.jpg';
import imgOnions from '@/assets/onions.jpg';
import imgEggplant from '@/assets/eggplant.jpg';
import imgCauliflower from '@/assets/cauliflower.jpg';
import imgCucumber from '@/assets/cucumber.jpg';
import imgSeedBottlegourd from '@/assets/agri/seed-bottlegourd.jpg';
import imgCarrots from '@/assets/carrots.jpg';
import imgSpinach from '@/assets/spinach.jpg';
import imgOrganicVegetableSeeds from '@/assets/organic-vegetable-seeds.jpg';
import imgGreenManure from '@/assets/green-manure.jpg';
import imgSeedBerseem from '@/assets/agri/seed-berseem.jpg';
import imgSeedLucerne from '@/assets/agri/seed-lucerne.jpg';
import imgSeedCotton from '@/assets/agri/seed-cotton.jpg';

export const EXTRA_AGRI_PRODUCTS: Product[] = [
  /* ---------------------------------------------------------------- */
  /* Straight nitrogen                                                 */
  /* ---------------------------------------------------------------- */
  {
    id: 100,
    name: 'Neem-Coated Urea 46% N',
    nameHi: 'नीम लेपित यूरिया 46% N',
    category: 'fertilizers',
    description:
      "The world's most used nitrogen fertiliser. Neem coating slows release, so less nitrogen is lost to leaching. Top-dress in 2-3 splits.",
    descriptionHi:
      'दुनिया में सबसे अधिक प्रयोग होने वाला नाइट्रोजन उर्वरक। नीम लेप धीमी गति से पोषक तत्व छोड़ता है। 2-3 बार में डालें।',
    price: '₹267',
    mrp: '₹295',
    onSale: true,
    unit: '/45kg bag',
    rating: 4.6,
    reviews: 1842,
    inStock: true,
    image: imgUrea,
  },
  {
    id: 101,
    name: 'Ammonium Sulphate 21% N + 24% S',
    nameHi: 'अमोनियम सल्फेट 21% N + 24% S',
    category: 'fertilizers',
    description:
      'Nitrogen plus sulphur in one bag. Suits oilseeds, pulses and tea, and mildly acidifies alkaline soils.',
    descriptionHi:
      'एक ही बैग में नाइट्रोजन और सल्फर। तिलहन, दलहन और चाय के लिए उपयुक्त। क्षारीय मिट्टी को हल्का अम्लीय करता है।',
    price: '₹1,090',
    unit: '/50kg bag',
    rating: 4.3,
    reviews: 412,
    inStock: true,
    image: imgAmmoniumSulphate,
  },
  {
    id: 102,
    name: 'Calcium Ammonium Nitrate (CAN) 25% N',
    nameHi: 'कैल्शियम अमोनियम नाइट्रेट (CAN) 25% N',
    category: 'fertilizers',
    description:
      'Quick-acting nitrogen that also supplies calcium. Preferred on acidic soils where urea would acidify further.',
    descriptionHi:
      'तेज़ी से काम करने वाली नाइट्रोजन, साथ में कैल्शियम। अम्लीय मिट्टी के लिए यूरिया से बेहतर।',
    price: '₹1,240',
    unit: '/50kg bag',
    rating: 4.2,
    reviews: 268,
    inStock: true,
    image: imgCan,
  },

  /* ---------------------------------------------------------------- */
  /* Phosphatic                                                        */
  /* ---------------------------------------------------------------- */
  {
    id: 110,
    name: 'DAP 18-46-0 (Di-Ammonium Phosphate)',
    nameHi: 'डीएपी 18-46-0 (डाई-अमोनियम फॉस्फेट)',
    category: 'fertilizers',
    description:
      'The standard basal dose across most crops. Highest phosphorus of the common straights, with starter nitrogen. Apply at sowing.',
    descriptionHi:
      'अधिकांश फसलों में बुवाई के समय दी जाने वाली मुख्य खुराक। सबसे अधिक फॉस्फोरस के साथ शुरुआती नाइट्रोजन।',
    price: '₹1,350',
    mrp: '₹1,450',
    onSale: true,
    unit: '/50kg bag',
    rating: 4.7,
    reviews: 2103,
    inStock: true,
    image: imgDap,
  },
  {
    id: 111,
    name: 'Single Super Phosphate (SSP) 16%',
    nameHi: 'सिंगल सुपर फॉस्फेट (SSP) 16%',
    category: 'fertilizers',
    description:
      'Cheapest phosphorus per bag, and the only common straight carrying both sulphur and calcium. Strong choice for groundnut and mustard.',
    descriptionHi:
      'सबसे सस्ता फॉस्फोरस स्रोत, जिसमें सल्फर और कैल्शियम दोनों हैं। मूंगफली और सरसों के लिए उत्तम।',
    price: '₹510',
    unit: '/50kg bag',
    rating: 4.4,
    reviews: 736,
    inStock: true,
    image: imgSsp,
  },
  {
    id: 112,
    name: 'Triple Super Phosphate (TSP) 46%',
    nameHi: 'ट्रिपल सुपर फॉस्फेट (TSP) 46%',
    category: 'fertilizers',
    description:
      'Concentrated phosphorus with no nitrogen, so the P dose can be set independently. Widely traded outside India.',
    descriptionHi:
      'बिना नाइट्रोजन के केंद्रित फॉस्फोरस, जिससे P की मात्रा अलग से तय की जा सकती है।',
    price: '₹1,580',
    unit: '/50kg bag',
    rating: 4.1,
    reviews: 154,
    inStock: true,
    image: imgTsp,
  },
  {
    id: 113,
    name: 'Rock Phosphate (Natural, 18-20%)',
    nameHi: 'रॉक फॉस्फेट (प्राकृतिक, 18-20%)',
    category: 'organic',
    description:
      'Slow-release mined phosphate, permitted in organic certification. Best on acidic soils and in long-duration orchards.',
    descriptionHi:
      'धीमी गति से घुलने वाला खनिज फॉस्फेट, जैविक खेती में मान्य। अम्लीय मिट्टी और बागों के लिए सर्वोत्तम।',
    price: '₹640',
    unit: '/50kg bag',
    rating: 4.0,
    reviews: 189,
    inStock: true,
    image: imgRockPhosphate,
  },

  /* ---------------------------------------------------------------- */
  /* Potassic                                                          */
  /* ---------------------------------------------------------------- */
  {
    id: 120,
    name: 'Muriate of Potash (MOP) 60% K2O',
    nameHi: 'म्यूरेट ऑफ पोटाश (MOP) 60% K2O',
    category: 'fertilizers',
    description:
      'The cheapest potassium per unit and the world standard. Improves grain filling and stalk strength. Avoid on chloride-sensitive crops.',
    descriptionHi:
      'सबसे सस्ता पोटैशियम स्रोत और विश्व मानक। दाना भरने और तने की मजबूती बढ़ाता है।',
    price: '₹1,700',
    mrp: '₹1,850',
    onSale: true,
    unit: '/50kg bag',
    rating: 4.5,
    reviews: 987,
    inStock: true,
    image: imgMop,
  },
  {
    id: 121,
    name: 'Sulphate of Potash (SOP) 50% K2O + 18% S',
    nameHi: 'सल्फेट ऑफ पोटाश (SOP) 50% K2O + 18% S',
    category: 'fertilizers',
    description:
      'Chloride-free potassium for tobacco, grape, potato and fruit, where MOP would damage quality. Also supplies sulphur.',
    descriptionHi:
      'क्लोराइड-मुक्त पोटैशियम — तंबाकू, अंगूर, आलू और फलों के लिए, जहाँ MOP गुणवत्ता बिगाड़ता है।',
    price: '₹3,150',
    unit: '/50kg bag',
    rating: 4.4,
    reviews: 221,
    inStock: true,
    image: imgSop,
  },

  /* ---------------------------------------------------------------- */
  /* NPK complexes                                                     */
  /* ---------------------------------------------------------------- */
  {
    id: 130,
    name: 'NPK 10:26:26 Complex',
    nameHi: 'एनपीके 10:26:26 कॉम्प्लेक्स',
    category: 'fertilizers',
    description:
      'Balanced P and K basal grade for pulses, cotton and potato. One bag replaces separate DAP and MOP applications.',
    descriptionHi:
      'दलहन, कपास और आलू के लिए संतुलित P और K। एक बैग DAP और MOP दोनों की जगह लेता है।',
    price: '₹1,470',
    unit: '/50kg bag',
    rating: 4.5,
    reviews: 644,
    inStock: true,
    image: imgNpk102626,
  },
  {
    id: 131,
    name: 'NPK 12:32:16 Complex',
    nameHi: 'एनपीके 12:32:16 कॉम्प्लेक्स',
    category: 'fertilizers',
    description:
      'High-phosphorus basal grade for cereals and oilseeds at sowing. Popular where soil tests show low available P.',
    descriptionHi:
      'बुवाई के समय अनाज और तिलहन के लिए उच्च फॉस्फोरस ग्रेड। कम P वाली मिट्टी के लिए उपयुक्त।',
    price: '₹1,500',
    unit: '/50kg bag',
    rating: 4.4,
    reviews: 519,
    inStock: true,
    image: imgNpk123216,
  },
  {
    id: 132,
    name: 'NPK 19:19:19 Water Soluble',
    nameHi: 'एनपीके 19:19:19 जल-घुलनशील',
    category: 'fertilizers',
    description:
      'Fully soluble balanced grade for drip fertigation and foliar spray. Dissolves clear, leaving no residue in emitters.',
    descriptionHi:
      'ड्रिप और पर्णीय छिड़काव के लिए पूर्ण घुलनशील संतुलित ग्रेड। पूरी तरह घुलकर कोई अवशेष नहीं छोड़ता।',
    price: '₹1,850',
    mrp: '₹2,050',
    onSale: true,
    unit: '/25kg bag',
    rating: 4.6,
    reviews: 803,
    inStock: true,
    image: imgNpk191919,
  },
  {
    id: 133,
    name: 'NPK 20:20:0:13 Complex',
    nameHi: 'एनपीके 20:20:0:13 कॉम्प्लेक्स',
    category: 'fertilizers',
    description:
      'Equal N and P plus 13% sulphur, for soils already rich in potassium. Common on wheat and maize in north India.',
    descriptionHi:
      'बराबर N और P के साथ 13% सल्फर — जहाँ मिट्टी में पोटाश पर्याप्त हो। उत्तर भारत में गेहूं और मक्का पर प्रचलित।',
    price: '₹1,400',
    unit: '/50kg bag',
    rating: 4.3,
    reviews: 388,
    inStock: true,
    image: imgNpk2020013,
  },
  {
    id: 134,
    name: 'Nano Urea Liquid (500 ml)',
    nameHi: 'नैनो यूरिया तरल (500 मिली)',
    category: 'fertilizers',
    description:
      'One 500 ml bottle substitutes roughly one bag of conventional urea as a foliar spray. Cuts transport weight dramatically.',
    descriptionHi:
      'एक 500 मिली बोतल पर्णीय छिड़काव में लगभग एक बोरी यूरिया की जगह लेती है। ढुलाई का भार बहुत घट जाता है।',
    price: '₹225',
    unit: '/500ml',
    rating: 4.0,
    reviews: 1276,
    inStock: true,
    image: imgNanoUrea,
  },

  /* ---------------------------------------------------------------- */
  /* Secondary nutrients and micronutrients                            */
  /* ---------------------------------------------------------------- */
  {
    id: 140,
    name: 'Agricultural Gypsum (Calcium Sulphate)',
    nameHi: 'कृषि जिप्सम (कैल्शियम सल्फेट)',
    category: 'micronutrients',
    description:
      'Reclaims sodic (usar) soil and supplies calcium with sulphur. The standard amendment for groundnut pegging.',
    descriptionHi:
      'ऊसर मिट्टी सुधारता है और कैल्शियम व सल्फर देता है। मूंगफली की फली बनने के लिए मानक।',
    price: '₹290',
    unit: '/50kg bag',
    rating: 4.3,
    reviews: 456,
    inStock: true,
    image: imgGypsum,
  },
  {
    id: 141,
    name: 'Zinc Sulphate 21% (Heptahydrate)',
    nameHi: 'जिंक सल्फेट 21% (हेप्टाहाइड्रेट)',
    category: 'micronutrients',
    description:
      'Zinc is the most widespread micronutrient deficiency in Indian soils. Corrects khaira disease in paddy and white bud in maize.',
    descriptionHi:
      'भारतीय मिट्टी में जिंक की कमी सबसे आम है। धान के खैरा रोग और मक्का की सफेद कली को ठीक करता है।',
    price: '₹1,150',
    mrp: '₹1,300',
    onSale: true,
    unit: '/25kg bag',
    rating: 4.6,
    reviews: 712,
    inStock: true,
    image: imgZincSulphate,
  },
  {
    id: 142,
    name: 'Borax (Boron 10.5%)',
    nameHi: 'बोरेक्स (बोरॉन 10.5%)',
    category: 'micronutrients',
    description:
      'Prevents hollow stem in cauliflower and poor seed set in mustard and pulses. Dose precisely — boron turns toxic close to sufficiency.',
    descriptionHi:
      'फूलगोभी में खोखला तना और सरसों-दलहन में कम बीज बनना रोकता है। मात्रा सटीक रखें — अधिक बोरॉन हानिकारक है।',
    price: '₹960',
    unit: '/25kg bag',
    rating: 4.2,
    reviews: 203,
    inStock: true,
    image: imgBorax,
  },
  {
    id: 143,
    name: 'Magnesium Sulphate (Epsom Salt)',
    nameHi: 'मैग्नीशियम सल्फेट (एप्सम सॉल्ट)',
    category: 'micronutrients',
    description:
      'Magnesium sits at the centre of the chlorophyll molecule, so deficiency yellows older leaves first. Common on sandy soils.',
    descriptionHi:
      'मैग्नीशियम क्लोरोफिल का केंद्र है — कमी से पहले पुरानी पत्तियाँ पीली होती हैं। रेतीली मिट्टी में आम।',
    price: '₹860',
    unit: '/25kg bag',
    rating: 4.3,
    reviews: 298,
    inStock: true,
    image: imgMagnesiumSulphate,
  },
  {
    id: 144,
    name: 'Ferrous Sulphate 19% Fe',
    nameHi: 'फेरस सल्फेट 19% Fe',
    category: 'micronutrients',
    description:
      'Corrects iron chlorosis — yellow leaves with green veins — typical of calcareous and high-pH soils.',
    descriptionHi:
      'लौह क्लोरोसिस ठीक करता है — हरी शिराओं के साथ पीली पत्तियाँ, जो चूनेदार मिट्टी में होती है।',
    price: '₹790',
    unit: '/25kg bag',
    rating: 4.1,
    reviews: 176,
    inStock: true,
    image: imgFerrousSulphate,
  },
  {
    id: 145,
    name: 'Chelated Micronutrient Mix (EDTA)',
    nameHi: 'चिलेटेड सूक्ष्म पोषक मिश्रण (EDTA)',
    category: 'micronutrients',
    description:
      'Zn, Fe, Mn, Cu and B chelated so they stay plant-available in alkaline soil where plain sulphates lock up. For foliar use.',
    descriptionHi:
      'Zn, Fe, Mn, Cu और B चिलेटेड रूप में — क्षारीय मिट्टी में भी उपलब्ध रहते हैं। पर्णीय छिड़काव हेतु।',
    price: '₹1,420',
    unit: '/5kg pack',
    rating: 4.5,
    reviews: 534,
    inStock: true,
    image: imgMicronutrientMix,
  },

  /* ---------------------------------------------------------------- */
  /* Bio-fertilisers                                                   */
  /* ---------------------------------------------------------------- */
  {
    id: 150,
    name: 'Rhizobium Culture (Pulse Inoculant)',
    nameHi: 'राइजोबियम कल्चर (दलहन टीका)',
    category: 'organic',
    description:
      'Fixes atmospheric nitrogen in root nodules of gram, pea, groundnut and soybean. Treat seed in shade just before sowing.',
    descriptionHi:
      'चना, मटर, मूंगफली और सोयाबीन की जड़ ग्रंथियों में वायुमंडलीय नाइट्रोजन स्थिर करता है। बुवाई से ठीक पहले छाया में बीजोपचार करें।',
    price: '₹120',
    unit: '/200g pack',
    rating: 4.4,
    reviews: 621,
    inStock: true,
    image: imgRhizobium,
  },
  {
    id: 151,
    name: 'Azotobacter Bio-Fertiliser',
    nameHi: 'एजोटोबैक्टर जैव-उर्वरक',
    category: 'organic',
    description:
      'Free-living nitrogen fixer for non-legumes — wheat, maize, cotton, vegetables. Can replace roughly 20 kg N per hectare.',
    descriptionHi:
      'गैर-दलहनी फसलों के लिए स्वतंत्र नाइट्रोजन स्थिरीकरण — गेहूं, मक्का, कपास, सब्ज़ियाँ। लगभग 20 किग्रा N/हेक्टेयर बचाता है।',
    price: '₹130',
    unit: '/200g pack',
    rating: 4.3,
    reviews: 487,
    inStock: true,
    image: imgAzotobacter,
  },
  {
    id: 152,
    name: 'Azospirillum Bio-Fertiliser',
    nameHi: 'एजोस्पिरिलम जैव-उर्वरक',
    category: 'organic',
    description:
      'Associative nitrogen fixer suited to cereals, millets, sugarcane and grasses. Also promotes root hair growth.',
    descriptionHi:
      'अनाज, बाजरा, गन्ना और घास के लिए सहजीवी नाइट्रोजन स्थिरीकरण। जड़ों की वृद्धि भी बढ़ाता है।',
    price: '₹130',
    unit: '/200g pack',
    rating: 4.2,
    reviews: 356,
    inStock: true,
    image: imgAzospirillum,
  },
  {
    id: 153,
    name: 'PSB — Phosphate Solubilising Bacteria',
    nameHi: 'पीएसबी — फॉस्फेट घोलक जीवाणु',
    category: 'organic',
    description:
      'Unlocks phosphorus already fixed in the soil, so less fresh P is needed. Pairs well with rock phosphate.',
    descriptionHi:
      'मिट्टी में पहले से बंधा फॉस्फोरस मुक्त करता है, जिससे कम P डालना पड़ता है। रॉक फॉस्फेट के साथ बेहतर।',
    price: '₹130',
    unit: '/200g pack',
    rating: 4.4,
    reviews: 598,
    inStock: true,
    image: imgPsb,
  },
  {
    id: 154,
    name: 'Mycorrhiza (VAM) Granules',
    nameHi: 'माइकोराइजा (VAM) दानेदार',
    category: 'organic',
    description:
      'Symbiotic fungus that extends the root system many times over, improving phosphorus and water uptake. Apply once at planting.',
    descriptionHi:
      'सहजीवी कवक जो जड़ प्रणाली को कई गुना बढ़ाता है, फॉस्फोरस और पानी का अवशोषण सुधारता है।',
    price: '₹460',
    unit: '/4kg pack',
    rating: 4.5,
    reviews: 312,
    inStock: true,
    image: imgMycorrhiza,
  },
  {
    id: 155,
    name: 'Potash Mobilising Bacteria (KMB)',
    nameHi: 'पोटाश गतिशील जीवाणु (KMB)',
    category: 'organic',
    description:
      'Releases potassium bound in soil minerals into plant-available form. Used alongside Azotobacter and PSB as a consortium.',
    descriptionHi:
      'मिट्टी के खनिजों में बंधे पोटैशियम को उपलब्ध रूप में बदलता है। एजोटोबैक्टर और PSB के साथ प्रयोग करें।',
    price: '₹140',
    unit: '/200g pack',
    rating: 4.1,
    reviews: 167,
    inStock: true,
    image: imgKmb,
  },

  /* ---------------------------------------------------------------- */
  /* Organic amendments and biostimulants                              */
  /* ---------------------------------------------------------------- */
  {
    id: 160,
    name: 'Seaweed Extract Concentrate',
    nameHi: 'समुद्री शैवाल सत्त्व',
    category: 'organic',
    description:
      'Ascophyllum-based biostimulant with natural cytokinins. Improves flowering, fruit set and recovery after heat or water stress.',
    descriptionHi:
      'प्राकृतिक साइटोकाइनिन युक्त जैव-उत्तेजक। फूल, फल बनने और गर्मी-सूखे के बाद पौधे की रिकवरी सुधारता है।',
    price: '₹560',
    mrp: '₹640',
    onSale: true,
    unit: '/1 litre',
    rating: 4.5,
    reviews: 429,
    inStock: true,
    image: imgSeaweedExtract,
  },
  {
    id: 161,
    name: 'Humic Acid 98% Granules',
    nameHi: 'ह्यूमिक एसिड 98% दानेदार',
    category: 'organic',
    description:
      'Improves soil structure and holds nutrients against leaching. Most useful on sandy or long-cultivated low-organic soils.',
    descriptionHi:
      'मिट्टी की संरचना सुधारता है और पोषक तत्वों को बहने से रोकता है। रेतीली और कम जैविक मिट्टी में सर्वाधिक उपयोगी।',
    price: '₹490',
    unit: '/1kg pack',
    rating: 4.4,
    reviews: 655,
    inStock: true,
    image: imgHumicAcid,
  },
  {
    id: 162,
    name: 'Mustard Oil Cake',
    nameHi: 'सरसों की खली',
    category: 'organic',
    description:
      'Slow-release organic nitrogen at roughly 5% N, plus it improves soil texture. Traditional top-dress for vegetables and fruit trees.',
    descriptionHi:
      'लगभग 5% N वाली धीमी गति की जैविक नाइट्रोजन, साथ में मिट्टी की बनावट सुधारती है। सब्ज़ियों और फलदार पेड़ों के लिए पारंपरिक।',
    price: '₹720',
    unit: '/50kg bag',
    rating: 4.3,
    reviews: 384,
    inStock: true,
    image: imgMustardCake,
  },
  {
    id: 163,
    name: 'Press Mud Compost (Sugar Mill)',
    nameHi: 'प्रेस मड कम्पोस्ट (चीनी मिल)',
    category: 'organic',
    description:
      'Sugar-mill filter cake composted into a bulky organic manure rich in calcium and phosphorus. Economical for large fields.',
    descriptionHi:
      'चीनी मिल की छनाई से बनी जैविक खाद, कैल्शियम और फॉस्फोरस से भरपूर। बड़े खेतों के लिए किफ़ायती।',
    price: '₹230',
    unit: '/50kg bag',
    rating: 4.0,
    reviews: 142,
    inStock: true,
    image: imgPressMud,
  },

  /* ---------------------------------------------------------------- */
  /* Seed — cereals                                                    */
  /* ---------------------------------------------------------------- */
  {
    id: 200,
    name: 'Wheat Seed HD-3086 (Pusa Gautami)',
    nameHi: 'गेहूं बीज HD-3086 (पूसा गौतमी)',
    category: 'seeds',
    description:
      'Timely-sown irrigated variety for north-west India. Matures in about 145 days with good yellow-rust resistance.',
    descriptionHi:
      'उत्तर-पश्चिम भारत के लिए समय पर बोई जाने वाली सिंचित किस्म। लगभग 145 दिन में पकती है, पीला रतुआ प्रतिरोधी।',
    price: '₹44',
    unit: '/kg',
    rating: 4.6,
    reviews: 918,
    inStock: true,
    image: imgOrganicWheatSeeds,
  },
  {
    id: 201,
    name: 'Wheat Seed DBW-187 (Karan Vandana)',
    nameHi: 'गेहूं बीज DBW-187 (करण वंदना)',
    category: 'seeds',
    description:
      'High-yielding early-sown variety for the eastern plains. Strong resistance to both yellow and brown rust.',
    descriptionHi:
      'पूर्वी मैदानों के लिए उच्च उपज वाली अगेती किस्म। पीले और भूरे रतुआ दोनों के प्रति प्रतिरोधी।',
    price: '₹46',
    mrp: '₹52',
    onSale: true,
    unit: '/kg',
    rating: 4.7,
    reviews: 1124,
    inStock: true,
    image: imgOrganicWheatSeeds,
  },
  {
    id: 202,
    name: 'Paddy Seed Swarna (MTU-7029)',
    nameHi: 'धान बीज स्वर्णा (MTU-7029)',
    category: 'seeds',
    description:
      'The most widely grown rice variety in eastern India. Long duration, around 145 days, and tolerant of low-input conditions.',
    descriptionHi:
      'पूर्वी भारत में सबसे अधिक बोई जाने वाली धान किस्म। लगभग 145 दिन की अवधि, कम लागत में भी अच्छी उपज।',
    price: '₹52',
    unit: '/kg',
    rating: 4.5,
    reviews: 1387,
    inStock: true,
    image: imgOrganicPaddySeeds,
  },
  {
    id: 203,
    name: 'Paddy Seed IR-64',
    nameHi: 'धान बीज IR-64',
    category: 'seeds',
    description:
      'IRRI-bred semi-dwarf grown across Asia. Medium duration at 115-120 days, with slender long grain.',
    descriptionHi:
      'IRRI द्वारा विकसित अर्ध-बौनी किस्म, पूरे एशिया में उगाई जाती है। 115-120 दिन, पतला लंबा दाना।',
    price: '₹48',
    unit: '/kg',
    rating: 4.4,
    reviews: 764,
    inStock: true,
    image: imgRice,
  },
  {
    id: 204,
    name: 'Pearl Millet (Bajra) Hybrid Seed',
    nameHi: 'बाजरा संकर बीज',
    category: 'seeds',
    description:
      'Drought-hardy cereal that yields on light soils and low rainfall where maize would fail. Matures in 75-85 days.',
    descriptionHi:
      'सूखा सहनशील अनाज, हल्की मिट्टी और कम वर्षा में भी उपज देता है। 75-85 दिन में पक जाता है।',
    price: '₹340',
    unit: '/1.5kg pack',
    rating: 4.4,
    reviews: 412,
    inStock: true,
    image: imgSeedBajra,
  },
  {
    id: 205,
    name: 'Finger Millet (Ragi) Seed',
    nameHi: 'रागी (मंडुआ) बीज',
    category: 'seeds',
    description:
      'Calcium-rich millet that stores for years without pest damage. Suits rainfed uplands and poor soils.',
    descriptionHi:
      'कैल्शियम से भरपूर मोटा अनाज, वर्षों तक बिना कीट के सुरक्षित रहता है। वर्षा आधारित और कमज़ोर मिट्टी के लिए।',
    price: '₹95',
    unit: '/kg',
    rating: 4.3,
    reviews: 236,
    inStock: true,
    image: imgSeedRagi,
  },
  {
    id: 206,
    name: 'Sorghum (Jowar) Seed',
    nameHi: 'ज्वार बीज',
    category: 'seeds',
    description:
      'Dual-purpose grain and fodder cereal for dryland. Deep roots let it recover from mid-season dry spells.',
    descriptionHi:
      'शुष्क भूमि के लिए अनाज और चारा दोनों देने वाली फसल। गहरी जड़ें सूखे से उबरने में मदद करती हैं।',
    price: '₹88',
    unit: '/kg',
    rating: 4.2,
    reviews: 198,
    inStock: true,
    image: imgSeedJowar,
  },

  /* ---------------------------------------------------------------- */
  /* Seed — pulses                                                     */
  /* ---------------------------------------------------------------- */
  {
    id: 210,
    name: 'Chickpea Seed JG-11 (Desi Gram)',
    nameHi: 'चना बीज JG-11 (देसी चना)',
    category: 'seeds',
    description:
      'Short-duration wilt-resistant desi chickpea, about 95-100 days. The mainstay variety of central India.',
    descriptionHi:
      'कम अवधि की उकठा प्रतिरोधी देसी चना किस्म, लगभग 95-100 दिन। मध्य भारत की प्रमुख किस्म।',
    price: '₹110',
    unit: '/kg',
    rating: 4.5,
    reviews: 587,
    inStock: true,
    image: imgSeedChickpea,
  },
  {
    id: 211,
    name: 'Pigeon Pea Seed ICPL-87119 (Asha)',
    nameHi: 'अरहर बीज ICPL-87119 (आशा)',
    category: 'seeds',
    description:
      'Long-duration tur with wilt and sterility-mosaic resistance. Fixes nitrogen, leaving the soil richer for the next crop.',
    descriptionHi:
      'लंबी अवधि की अरहर, उकठा और बांझपन-मोज़ेक प्रतिरोधी। नाइट्रोजन स्थिर कर मिट्टी समृद्ध करती है।',
    price: '₹135',
    unit: '/kg',
    rating: 4.4,
    reviews: 421,
    inStock: true,
    image: imgSeedPigeonpea,
  },
  {
    id: 212,
    name: 'Green Gram Seed IPM-02-3 (Moong)',
    nameHi: 'मूंग बीज IPM-02-3',
    category: 'seeds',
    description:
      'Very short duration at 60-65 days, so it fits between two main crops and adds nitrogen while doing so.',
    descriptionHi:
      'बहुत कम अवधि, 60-65 दिन — दो मुख्य फसलों के बीच बोई जा सकती है और नाइट्रोजन भी देती है।',
    price: '₹125',
    unit: '/kg',
    rating: 4.4,
    reviews: 366,
    inStock: true,
    image: imgSeedMoong,
  },
  {
    id: 213,
    name: 'Black Gram Seed (Urad)',
    nameHi: 'उड़द बीज',
    category: 'seeds',
    description:
      'Hardy pulse for kharif and summer sowing. Tolerates heavier soils than moong and improves soil nitrogen.',
    descriptionHi:
      'खरीफ और गर्मी दोनों में बोई जाने वाली मजबूत दलहन। भारी मिट्टी सहन करती है और नाइट्रोजन बढ़ाती है।',
    price: '₹128',
    unit: '/kg',
    rating: 4.2,
    reviews: 254,
    inStock: true,
    image: imgSeedUrad,
  },
  {
    id: 214,
    name: 'Lentil Seed (Masoor)',
    nameHi: 'मसूर बीज',
    category: 'seeds',
    description:
      'Cool-season pulse for rabi, needing little irrigation. Good on residual moisture after paddy.',
    descriptionHi:
      'रबी की ठंडी मौसम वाली दलहन, कम सिंचाई में तैयार। धान के बाद बची नमी में अच्छी।',
    price: '₹118',
    unit: '/kg',
    rating: 4.3,
    reviews: 289,
    inStock: true,
    image: imgSeedMasoor,
  },

  /* ---------------------------------------------------------------- */
  /* Seed — oilseeds                                                   */
  /* ---------------------------------------------------------------- */
  {
    id: 220,
    name: 'Mustard Seed Pusa Bold',
    nameHi: 'सरसों बीज पूसा बोल्ड',
    category: 'seeds',
    description:
      'Bold-seeded rabi oilseed with around 40% oil content. Responds strongly to sulphur application.',
    descriptionHi:
      'लगभग 40% तेल वाली रबी तिलहन, मोटे दाने वाली। सल्फर देने पर उपज काफी बढ़ती है।',
    price: '₹165',
    unit: '/kg',
    rating: 4.5,
    reviews: 673,
    inStock: true,
    image: imgSeedMustard,
  },
  {
    id: 221,
    name: 'Groundnut Seed TAG-24',
    nameHi: 'मूंगफली बीज TAG-24',
    category: 'seeds',
    description:
      'Semi-spreading Spanish bunch type, 100-105 days. Needs calcium at pegging — pair with gypsum.',
    descriptionHi:
      'अर्ध-फैलावदार स्पेनिश गुच्छेदार किस्म, 100-105 दिन। फली बनते समय कैल्शियम चाहिए — जिप्सम के साथ दें।',
    price: '₹145',
    unit: '/kg',
    rating: 4.4,
    reviews: 398,
    inStock: true,
    image: imgSeedGroundnut,
  },
  {
    id: 222,
    name: 'Soybean Seed JS-335',
    nameHi: 'सोयाबीन बीज JS-335',
    category: 'seeds',
    description:
      'The long-standing benchmark variety of the Malwa plateau, around 95-100 days. Sow with Rhizobium inoculant.',
    descriptionHi:
      'मालवा क्षेत्र की प्रमुख किस्म, लगभग 95-100 दिन। राइजोबियम टीके के साथ बोएँ।',
    price: '₹105',
    mrp: '₹120',
    onSale: true,
    unit: '/kg',
    rating: 4.3,
    reviews: 845,
    inStock: true,
    image: imgSeedSoybean,
  },
  {
    id: 223,
    name: 'Sunflower Hybrid Seed',
    nameHi: 'सूरजमुखी संकर बीज',
    category: 'seeds',
    description:
      'Photoperiod-insensitive, so it can be sown in any season. Needs boron at the bud stage for proper seed fill.',
    descriptionHi:
      'किसी भी मौसम में बोई जा सकती है। कली अवस्था पर बोरॉन देने से दाना ठीक भरता है।',
    price: '₹580',
    unit: '/2kg pack',
    rating: 4.2,
    reviews: 217,
    inStock: true,
    image: imgSeedSunflower,
  },
  {
    id: 224,
    name: 'Sesame Seed (Til)',
    nameHi: 'तिल बीज',
    category: 'seeds',
    description:
      'Short-duration oilseed for light soils and marginal rainfall. Matures in 80-90 days.',
    descriptionHi:
      'हल्की मिट्टी और कम वर्षा के लिए कम अवधि की तिलहन। 80-90 दिन में पक जाती है।',
    price: '₹190',
    unit: '/kg',
    rating: 4.1,
    reviews: 156,
    inStock: true,
    image: imgSeedSesame,
  },

  /* ---------------------------------------------------------------- */
  /* Seed — vegetables                                                 */
  /* ---------------------------------------------------------------- */
  {
    id: 230,
    name: 'Tomato Hybrid Seed (Arka Rakshak)',
    nameHi: 'टमाटर संकर बीज (अर्का रक्षक)',
    category: 'seeds',
    description:
      'IIHR triple-disease-resistant hybrid — leaf curl, bacterial wilt and early blight. Heavy yielder for open field.',
    descriptionHi:
      'IIHR की तीन रोग प्रतिरोधी संकर किस्म — पत्ती मरोड़, जीवाणु उकठा और अगेती झुलसा। खुले खेत के लिए भरपूर उपज।',
    price: '₹420',
    mrp: '₹480',
    onSale: true,
    unit: '/10g pack',
    rating: 4.7,
    reviews: 1092,
    inStock: true,
    image: imgTomatoes,
  },
  {
    id: 231,
    name: 'Okra Seed (Arka Anamika)',
    nameHi: 'भिंडी बीज (अर्का अनामिका)',
    category: 'seeds',
    description:
      'Spineless tender pods with yellow-vein-mosaic tolerance. Picks continuously over a long window.',
    descriptionHi:
      'बिना काँटे वाली कोमल फलियाँ, पीली शिरा मोज़ेक सहनशील। लंबे समय तक लगातार तुड़ाई।',
    price: '₹260',
    unit: '/250g pack',
    rating: 4.5,
    reviews: 734,
    inStock: true,
    image: imgOkra,
  },
  {
    id: 232,
    name: 'Chilli Seed (Byadgi)',
    nameHi: 'मिर्च बीज (ब्याडगी)',
    category: 'seeds',
    description:
      'GI-tagged Karnataka chilli prized for deep red colour and low pungency. Widely used for oleoresin extraction.',
    descriptionHi:
      'कर्नाटक की GI-टैग मिर्च, गहरे लाल रंग और कम तीखेपन के लिए प्रसिद्ध। ओलियोरेज़िन निष्कर्षण में प्रयुक्त।',
    price: '₹480',
    unit: '/100g pack',
    rating: 4.6,
    reviews: 521,
    inStock: true,
    image: imgPeppers,
  },
  {
    id: 233,
    name: 'Onion Seed (Bhima Super)',
    nameHi: 'प्याज बीज (भीमा सुपर)',
    category: 'seeds',
    description:
      'ICAR-DOGR red onion for kharif and late kharif. Stores better than most rainy-season varieties.',
    descriptionHi:
      'ICAR-DOGR की लाल प्याज, खरीफ और पछेती खरीफ के लिए। अन्य वर्षाकालीन किस्मों से बेहतर भंडारण।',
    price: '₹950',
    unit: '/kg',
    rating: 4.4,
    reviews: 612,
    inStock: true,
    image: imgOnions,
  },
  {
    id: 234,
    name: 'Brinjal Hybrid Seed',
    nameHi: 'बैंगन संकर बीज',
    category: 'seeds',
    description:
      'Long purple hybrid with a continuous bearing habit. Tolerant of bacterial wilt in humid conditions.',
    descriptionHi:
      'लंबी बैंगनी संकर किस्म, लगातार फल देती है। नम मौसम में जीवाणु उकठा सहनशील।',
    price: '₹310',
    unit: '/50g pack',
    rating: 4.3,
    reviews: 388,
    inStock: true,
    image: imgEggplant,
  },
  {
    id: 235,
    name: 'Cauliflower Seed (Mid-Season)',
    nameHi: 'फूलगोभी बीज (मध्य मौसम)',
    category: 'seeds',
    description:
      'Compact white curds for the main winter window. Needs boron and molybdenum for solid, non-hollow stems.',
    descriptionHi:
      'मुख्य सर्दी के मौसम के लिए सघन सफेद फूल। ठोस तने के लिए बोरॉन और मॉलिब्डेनम आवश्यक।',
    price: '₹340',
    unit: '/50g pack',
    rating: 4.2,
    reviews: 276,
    inStock: true,
    image: imgCauliflower,
  },
  {
    id: 236,
    name: 'Cucumber Hybrid Seed',
    nameHi: 'खीरा संकर बीज',
    category: 'seeds',
    description:
      'Gynoecious hybrid bearing mostly female flowers, so fruit set is heavy. Suits both open field and polyhouse.',
    descriptionHi:
      'गाइनोसियस संकर — अधिकतर मादा फूल, इसलिए फल अधिक लगते हैं। खुले खेत और पॉलीहाउस दोनों के लिए।',
    price: '₹390',
    unit: '/25g pack',
    rating: 4.4,
    reviews: 341,
    inStock: true,
    image: imgCucumber,
  },
  {
    id: 237,
    name: 'Bottle Gourd Seed (Lauki)',
    nameHi: 'लौकी बीज',
    category: 'seeds',
    description:
      'Vigorous summer and kharif climber, long green fruit. Trellising raises yield and keeps fruit clean.',
    descriptionHi:
      'गर्मी और खरीफ की तेज़ बढ़ने वाली बेल, लंबे हरे फल। मचान बनाने से उपज बढ़ती है।',
    price: '₹180',
    unit: '/100g pack',
    rating: 4.3,
    reviews: 298,
    inStock: true,
    image: imgSeedBottlegourd,
  },
  {
    id: 238,
    name: 'Carrot Seed (Nantes Type)',
    nameHi: 'गाजर बीज (नैनटेस)',
    category: 'seeds',
    description:
      'Cylindrical blunt-tipped roots, sweet and uniform. Needs deep loose soil free of fresh manure clods.',
    descriptionHi:
      'बेलनाकार, कुंद सिरे वाली मीठी और एकसमान जड़ें। गहरी भुरभुरी मिट्टी चाहिए।',
    price: '₹420',
    unit: '/250g pack',
    rating: 4.2,
    reviews: 187,
    inStock: true,
    image: imgCarrots,
  },
  {
    id: 239,
    name: 'Spinach Seed (Palak)',
    nameHi: 'पालक बीज',
    category: 'seeds',
    description:
      'Multi-cut leafy green ready in 25-30 days, then cut every 15 days. Reliable quick cash crop.',
    descriptionHi:
      'बहु-कटाई वाली पत्तेदार सब्ज़ी, 25-30 दिन में तैयार, फिर हर 15 दिन में कटाई। त्वरित नकदी फसल।',
    price: '₹140',
    unit: '/500g pack',
    rating: 4.4,
    reviews: 456,
    inStock: true,
    image: imgSpinach,
  },
  {
    id: 240,
    name: 'Fenugreek Seed (Methi)',
    nameHi: 'मेथी बीज',
    category: 'seeds',
    description:
      'Leafy green and spice in one crop, and a legume that fixes nitrogen. Very low input requirement.',
    descriptionHi:
      'पत्तेदार सब्ज़ी और मसाला दोनों, साथ ही नाइट्रोजन स्थिर करने वाली दलहन। बहुत कम लागत।',
    price: '₹130',
    unit: '/500g pack',
    rating: 4.3,
    reviews: 312,
    inStock: true,
    image: imgOrganicVegetableSeeds,
  },
  {
    id: 241,
    name: 'Coriander Seed (Dhania)',
    nameHi: 'धनिया बीज',
    category: 'seeds',
    description:
      'Grown for both leaf and seed. Splitting the seed before sowing improves germination noticeably.',
    descriptionHi:
      'पत्ती और बीज दोनों के लिए। बुवाई से पहले बीज को दो भागों में करने से अंकुरण बेहतर होता है।',
    price: '₹120',
    unit: '/500g pack',
    rating: 4.2,
    reviews: 267,
    inStock: true,
    image: imgOrganicVegetableSeeds,
  },

  /* ---------------------------------------------------------------- */
  /* Seed — fibre, fodder and green manure                             */
  /* ---------------------------------------------------------------- */
  {
    id: 250,
    name: 'Dhaincha Seed (Green Manure)',
    nameHi: 'ढैंचा बीज (हरी खाद)',
    category: 'seeds',
    description:
      'Sown and ploughed back at 45-50 days, adding 80-100 kg nitrogen per hectare. The cheapest way to rebuild tired soil.',
    descriptionHi:
      '45-50 दिन में जोतकर मिलाने पर 80-100 किग्रा नाइट्रोजन/हेक्टेयर देता है। थकी मिट्टी सुधारने का सबसे सस्ता तरीका।',
    price: '₹85',
    unit: '/kg',
    rating: 4.5,
    reviews: 524,
    inStock: true,
    image: imgGreenManure,
  },
  {
    id: 251,
    name: 'Sunhemp Seed (Sanai)',
    nameHi: 'सनई बीज',
    category: 'seeds',
    description:
      'Fast green-manure legume that smothers weeds while it grows. Incorporate at flowering for maximum nitrogen.',
    descriptionHi:
      'तेज़ बढ़ने वाली हरी खाद दलहन, उगते हुए खरपतवार दबाती है। फूल आने पर मिट्टी में मिलाएँ।',
    price: '₹92',
    unit: '/kg',
    rating: 4.3,
    reviews: 218,
    inStock: true,
    image: imgGreenManure,
  },
  {
    id: 252,
    name: 'Berseem Seed (Egyptian Clover)',
    nameHi: 'बरसीम बीज',
    category: 'seeds',
    description:
      'Winter fodder legume giving five to six cuts through the season. High protein green feed for dairy cattle.',
    descriptionHi:
      'सर्दियों की चारा दलहन, मौसम भर में पाँच-छह कटाई। दुधारू पशुओं के लिए उच्च प्रोटीन हरा चारा।',
    price: '₹210',
    unit: '/kg',
    rating: 4.6,
    reviews: 687,
    inStock: true,
    image: imgSeedBerseem,
  },
  {
    id: 253,
    name: 'Lucerne Seed (Alfalfa)',
    nameHi: 'रिजका बीज (अल्फाल्फा)',
    category: 'seeds',
    description:
      'Perennial fodder standing three to four years, cut every 25-30 days. Deep taproot makes it drought-tolerant.',
    descriptionHi:
      'बहुवर्षीय चारा, तीन-चार वर्ष तक चलता है, हर 25-30 दिन में कटाई। गहरी जड़ से सूखा सहनशील।',
    price: '₹480',
    unit: '/kg',
    rating: 4.4,
    reviews: 293,
    inStock: true,
    image: imgSeedLucerne,
  },
  {
    id: 254,
    name: 'Cotton Hybrid Seed (BG-II)',
    nameHi: 'कपास संकर बीज (BG-II)',
    category: 'seeds',
    description:
      'Bollworm-resistant hybrid cotton. Statutory refuge seed is included in the packet and must be sown alongside.',
    descriptionHi:
      'सुंडी प्रतिरोधी संकर कपास। पैकेट में अनिवार्य रेफ्यूज बीज शामिल है, जिसे साथ बोना ज़रूरी है।',
    price: '₹864',
    unit: '/475g packet',
    rating: 4.4,
    reviews: 1518,
    inStock: true,
    image: imgSeedCotton,
  },
];
