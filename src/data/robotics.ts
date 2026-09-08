/**
 * Agricultural robotics catalogue.
 *
 * Every row here is transcribed from a manufacturer's own site, and every row
 * carries the URL it was read from and the date it was read. Nothing is
 * inferred, averaged, converted from another currency, or filled in from a
 * press article that paraphrased a spec sheet. That rule is the whole point of
 * the module: a farmer looking at a ₹10 lakh machine is making a decision that
 * a plausible-sounding invented number would wreck.
 *
 * The practical consequence is that the catalogue is short and uneven. The
 * FarmRobo R1v2 has fourteen published attributes; the FarmRobo R5 has almost
 * none, because FarmRobo has not published a product page for it. Both ship.
 * `dataGaps` exists so the second case renders as an honest gap rather than
 * quietly looking like a thin card, and `verification` renders on every
 * product so the farmer can go and check.
 *
 * Verified 7 September 2026. Re-verify before trusting anything here: prices
 * and availability move, and a stale figure presented confidently is the same
 * failure as an invented one.
 */

import farmroboR1v2 from '@/assets/robotics/farmrobo-r1v2.webp';
import farmroboR1v2Weeding from '@/assets/robotics/farmrobo-r1v2-weeding.webp';
import farmroboR1v2Spraying from '@/assets/robotics/farmrobo-r1v2-spraying.webp';
import farmroboR1v2Overview from '@/assets/robotics/farmrobo-r1v2-overview.webp';
import farmroboR5 from '@/assets/robotics/farmrobo-r5.webp';
import farmroboR5Orchard from '@/assets/robotics/farmrobo-r5-orchard.webp';
import farmroboR5Solar from '@/assets/robotics/farmrobo-r5-solar.webp';
import iotechAgribotMx from '@/assets/robotics/iotech-agribot-mx.webp';
import iotechAgribotA6 from '@/assets/robotics/iotech-agribot-a6.webp';
import marutAg365 from '@/assets/robotics/marut-ag365.webp';
import marutSeedcopter from '@/assets/robotics/marut-seedcopter.webp';

import toolRotaryTiller from '@/assets/robotics/tools/rotary-tiller.webp';
import toolBrushCutter from '@/assets/robotics/tools/brush-cutter.webp';
import toolStubbleMower from '@/assets/robotics/tools/stubble-mower.webp';
import toolGorru from '@/assets/robotics/tools/gorru.webp';
import toolGuntaka from '@/assets/robotics/tools/guntaka.webp';
import toolBoomSprayer from '@/assets/robotics/tools/boom-sprayer.webp';
import toolSweepSprayer from '@/assets/robotics/tools/sweep-sprayer.webp';
import toolTrailer from '@/assets/robotics/tools/trailer.webp';

/** A bilingual string. Other languages resolve through `tx()` at render time. */
export interface Bi {
  en: string;
  hi: string;
}

/**
 * What kind of machine it is. Deliberately separate from what it *does*: a
 * multipurpose ground robot and a spraying drone can both spray, and a farmer
 * searching for "spraying" should find both without either being miscategorised.
 */
export type Platform = 'ground-robot' | 'drone' | 'tractor';

/** The job. A machine can honestly claim several. */
export type UseCase =
  | 'weeding'
  | 'spraying'
  | 'tilling'
  | 'seeding'
  | 'harvesting'
  | 'monitoring'
  | 'transport'
  | 'vegetation-management';

/**
 * How much of the driving the machine does.
 *
 * Stored as a list because real machines offer several modes — the Marut AG 365
 * flies manual, semi-autonomous or fully autonomous depending on what the
 * operator selects — and collapsing that to one label is how "GPS-equipped"
 * quietly becomes "fully autonomous" in marketing copy.
 */
export type Operation =
  | 'remote-controlled'
  | 'semi-autonomous'
  | 'autonomous'
  | 'ai-assisted'
  | 'operator-driven';

export type Power = 'electric' | 'diesel' | 'hybrid' | 'unspecified';

/**
 * How the price is known — not just what it is.
 *
 * `quote` and `unpublished` are the honest majority in this market and are
 * rendered as prominently as a real figure, because "the manufacturer does not
 * publish this" is itself useful for a farmer budgeting a purchase.
 */
export type PriceKind = 'listed' | 'range' | 'starting' | 'quote' | 'unpublished';

export interface Price {
  kind: PriceKind;
  display: Bi;
  /** Why the figure is what it is, and what it does or does not cover. */
  note?: Bi;
}

/** The action the manufacturer actually offers. Never invent a checkout. */
export type CtaKind =
  | 'pre-book'
  | 'enquire'
  | 'quote'
  | 'contact'
  | 'dealer'
  | 'view-product';

export interface Cta {
  kind: CtaKind;
  label: Bi;
  /** Always an external manufacturer URL. bhoomix does not sell these. */
  href: string;
}

export interface Spec {
  label: Bi;
  value: string;
  /** Show on the compact card, not only the detail page. Cap at four. */
  headline?: boolean;
}

export interface Verification {
  sourceType: 'manufacturer';
  sourceName: string;
  sourceUrl: string;
  /** ISO date the page was actually read. */
  verifiedAt: string;
}

export interface Attachment {
  name: Bi;
  description: Bi;
  image: string;
}

export interface Manufacturer {
  id: string;
  name: string;
  legalName?: string;
  location?: Bi;
  website: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  /** Verified social/official channels only. */
  youtube?: string;
}

export interface AgriRobot {
  id: string;
  name: string;
  model?: string;
  manufacturerId: string;

  platform: Platform;
  useCases: UseCase[];
  operation: Operation[];
  /** Nuance the badges cannot carry — e.g. what the vendor's own label claims. */
  operationNote?: Bi;
  power: Power;

  /** One line, factual. */
  summary: Bi;
  /** Plain language, no jargon. What it does and why that matters in a field. */
  farmerSummary: Bi;

  image?: string;
  gallery?: string[];
  /** Credit line for the photograph. */
  imageCredit?: Bi;

  specs: Spec[];
  /** Manufacturer's own performance claims, always labelled as theirs. */
  claims?: Bi[];

  suitableFor?: Bi[];
  crops?: Bi[];
  /** Things to check before spending money. Ours, not the manufacturer's. */
  considerations?: Bi[];

  attachments?: Attachment[];

  price: Price;
  availability?: Bi;

  cta: Cta;
  /** Secondary route to the manufacturer — a spec page, a video channel. */
  secondaryCta?: Cta;

  /** What the manufacturer has not published. Rendered, not hidden. */
  dataGaps?: Bi[];

  verification: Verification;
}

/* ------------------------------------------------------------------ */
/* Manufacturers                                                       */
/* ------------------------------------------------------------------ */

export const MANUFACTURERS: Record<string, Manufacturer> = {
  farmrobo: {
    id: 'farmrobo',
    name: 'FarmRobo',
    legalName: 'FarmRobo Technologies Private Limited',
    location: { en: 'Patancheruvu, Hyderabad — 502319', hi: 'पटानचेरुवु, हैदराबाद — 502319' },
    website: 'https://www.farmrobo.in/',
    email: 'sales@farmrobo.in',
    phone: '+91 91541 53925',
    whatsapp: 'https://wa.me/917386678833',
    youtube: 'https://www.youtube.com/@FarmRobo_official',
  },
  iotechworld: {
    id: 'iotechworld',
    name: 'IoTechWorld Avigation',
    legalName: 'IoTechWorld Avigation Pvt. Ltd.',
    location: {
      en: 'Plot 31 & 34, Sector 35, Gurugram — 122004, Haryana',
      hi: 'प्लॉट 31 और 34, सेक्टर 35, गुरुग्राम — 122004, हरियाणा',
    },
    website: 'https://iotechworld.com/',
    email: 'sales@iotechworld.com',
    phone: '0124-4824950',
  },
  marut: {
    id: 'marut',
    name: 'Marut Drones',
    website: 'https://marutdrones.com/',
  },
};

/* ------------------------------------------------------------------ */
/* Label tables                                                        */
/* ------------------------------------------------------------------ */

export const PLATFORM_LABELS: Record<Platform, Bi> = {
  'ground-robot': { en: 'Ground robot', hi: 'ज़मीनी रोबोट' },
  drone: { en: 'Drone', hi: 'ड्रोन' },
  tractor: { en: 'Tractor', hi: 'ट्रैक्टर' },
};

export const USE_CASE_LABELS: Record<UseCase, Bi> = {
  weeding: { en: 'Weeding', hi: 'निराई' },
  spraying: { en: 'Spraying', hi: 'छिड़काव' },
  tilling: { en: 'Tilling', hi: 'जुताई' },
  seeding: { en: 'Seeding', hi: 'बुवाई' },
  harvesting: { en: 'Harvesting', hi: 'कटाई' },
  monitoring: { en: 'Crop monitoring', hi: 'फसल निगरानी' },
  transport: { en: 'Transport', hi: 'ढुलाई' },
  'vegetation-management': { en: 'Vegetation management', hi: 'वनस्पति प्रबंधन' },
};

/**
 * Every badge carries a one-line definition, because the difference between
 * these four words is the single most misrepresented thing in agri-robotics
 * marketing and a farmer paying for "autonomous" should know what they get.
 */
export const OPERATION_LABELS: Record<Operation, Bi & { detail: Bi }> = {
  'remote-controlled': {
    en: 'Remote-controlled',
    hi: 'रिमोट से चलने वाला',
    detail: {
      en: 'A person drives it from outside the machine, the whole time.',
      hi: 'व्यक्ति पूरे समय मशीन के बाहर से इसे चलाता है।',
    },
  },
  'semi-autonomous': {
    en: 'Semi-autonomous',
    hi: 'अर्ध-स्वचालित',
    detail: {
      en: 'It can run parts of a job on its own, but a person stays in charge.',
      hi: 'यह काम का कुछ हिस्सा खुद कर सकता है, पर नियंत्रण व्यक्ति के पास रहता है।',
    },
  },
  autonomous: {
    en: 'Autonomous',
    hi: 'स्वचालित',
    detail: {
      en: 'It can complete a defined route or mission without continuous control.',
      hi: 'यह तय रास्ता या मिशन बिना लगातार नियंत्रण के पूरा कर सकता है।',
    },
  },
  'ai-assisted': {
    en: 'AI-assisted',
    hi: 'एआई-सहायता प्राप्त',
    detail: {
      en: 'Cameras and software help it see rows, targets or obstacles.',
      hi: 'कैमरा और सॉफ़्टवेयर इसे कतारें, लक्ष्य या रुकावटें देखने में मदद करते हैं।',
    },
  },
  'operator-driven': {
    en: 'Operator-driven',
    hi: 'चालक द्वारा संचालित',
    detail: {
      en: 'A person sits on it and drives it, like a conventional tractor.',
      hi: 'व्यक्ति उस पर बैठकर चलाता है, सामान्य ट्रैक्टर की तरह।',
    },
  },
};

export const POWER_LABELS: Record<Power, Bi> = {
  electric: { en: 'Electric', hi: 'बैटरी चालित' },
  diesel: { en: 'Diesel', hi: 'डीज़ल' },
  hybrid: { en: 'Hybrid', hi: 'हाइब्रिड' },
  unspecified: { en: 'Not specified', hi: 'निर्दिष्ट नहीं' },
};

export const PRICE_KIND_LABELS: Record<PriceKind, Bi> = {
  listed: { en: 'Listed price', hi: 'घोषित कीमत' },
  range: { en: 'Published range', hi: 'घोषित सीमा' },
  starting: { en: 'Starting from', hi: 'शुरुआती कीमत' },
  quote: { en: 'Price on request', hi: 'कीमत पूछने पर' },
  unpublished: { en: 'Not published', hi: 'प्रकाशित नहीं' },
};

export const CTA_LABELS: Record<CtaKind, Bi> = {
  'pre-book': { en: 'Pre-book', hi: 'प्री-बुक' },
  enquire: { en: 'Enquire', hi: 'पूछताछ' },
  quote: { en: 'Get a quote', hi: 'कोटेशन लें' },
  contact: { en: 'Contact maker', hi: 'निर्माता से संपर्क' },
  dealer: { en: 'Find a dealer', hi: 'डीलर खोजें' },
  'view-product': { en: 'View product', hi: 'उत्पाद देखें' },
};

/* ------------------------------------------------------------------ */
/* Catalogue                                                           */
/* ------------------------------------------------------------------ */

const FARMROBO_VERIFICATION: Verification = {
  sourceType: 'manufacturer',
  sourceName: 'farmrobo.in',
  sourceUrl: 'https://www.farmrobo.in/',
  verifiedAt: '2026-09-07',
};

export const ROBOTS: AgriRobot[] = [
  {
    id: 'farmrobo-r1v2',
    name: 'FarmRobo R1v2',
    model: 'R1v2',
    manufacturerId: 'farmrobo',
    platform: 'ground-robot',
    useCases: ['weeding', 'spraying', 'tilling', 'transport'],
    operation: ['remote-controlled', 'semi-autonomous', 'ai-assisted'],
    operationNote: {
      en: 'FarmRobo markets the R1v2 as an "autonomous multipurpose agricultural robot" while also describing it as remote-controlled with camera row guidance and RTK support. It is not sold as a machine that works unsupervised — confirm the autonomy level with FarmRobo for your field before buying.',
      hi: 'फार्मरोबो R1v2 को "स्वचालित बहुउद्देश्यीय कृषि रोबोट" कहकर बेचता है, साथ ही इसे कैमरा रो-गाइडेंस और RTK सपोर्ट वाला रिमोट-नियंत्रित रोबोट भी बताता है। यह बिना निगरानी चलने वाली मशीन के रूप में नहीं बेचा जाता — खरीदने से पहले अपने खेत के लिए स्वचालन का स्तर फार्मरोबो से पुष्टि करें।',
    },
    power: 'electric',
    summary: {
      en: 'A fully electric multipurpose field robot that changes tools for weeding, spraying, tilling and hauling.',
      hi: 'पूरी तरह बैटरी से चलने वाला बहुउद्देश्यीय खेत रोबोट, जो औज़ार बदलकर निराई, छिड़काव, जुताई और ढुलाई करता है।',
    },
    farmerSummary: {
      en: 'One machine instead of a crew. You stand at the edge of the field with a remote and the robot does the row work — pulling weeds, spraying, breaking soil. It runs on battery, so there is no diesel to buy, and you are never walking behind a pesticide spray.',
      hi: 'मज़दूरों की टोली की जगह एक मशीन। आप खेत के किनारे रिमोट लेकर खड़े रहते हैं और रोबोट कतारों का काम करता है — खरपतवार निकालना, छिड़काव, मिट्टी तोड़ना। यह बैटरी से चलता है, इसलिए डीज़ल नहीं खरीदना पड़ता, और आपको कीटनाशक के पीछे-पीछे चलना नहीं पड़ता।',
    },
    image: farmroboR1v2,
    gallery: [farmroboR1v2, farmroboR1v2Weeding, farmroboR1v2Spraying, farmroboR1v2Overview],
    imageCredit: { en: 'Photographs: FarmRobo', hi: 'तस्वीरें: फार्मरोबो' },
    specs: [
      { label: { en: 'Power', hi: 'ऊर्जा' }, value: 'Fully electric — no fuel', headline: true },
      {
        label: { en: 'Control', hi: 'नियंत्रण' },
        value: 'Remote-controlled, women-operable',
        headline: true,
      },
      {
        label: { en: 'Navigation', hi: 'नेविगेशन' },
        value: 'Camera row guidance · RTK support',
        headline: true,
      },
      {
        label: { en: 'Attachments', hi: 'अटैचमेंट' },
        value: '8 interchangeable tools',
        headline: true,
      },
      {
        label: { en: 'Safety', hi: 'सुरक्षा' },
        value: 'Industrial-grade robot control — stable motion, safety failsafes',
      },
      {
        label: { en: 'Fleet monitoring', hi: 'फ्लीट निगरानी' },
        value: 'Live status, alerts and performance dashboard',
      },
      {
        label: { en: 'Precision', hi: 'सटीकता' },
        value: 'Learning-driven — accuracy improves with field data',
      },
    ],
    claims: [
      {
        en: 'Sprays one acre in 15–20 minutes, and saves 30–40% on chemical use.',
        hi: 'एक एकड़ में 15–20 मिनट में छिड़काव, और रसायन की खपत में 30–40% बचत।',
      },
      {
        en: 'Weeds one acre in 1–1.5 hours, against roughly 10 people for 1–2 days by hand.',
        hi: 'एक एकड़ की निराई 1–1.5 घंटे में, जबकि हाथ से लगभग 10 लोगों को 1–2 दिन लगते हैं।',
      },
      {
        en: '7,000+ operating hours across 50+ farms in Indian field conditions.',
        hi: 'भारतीय खेतों में 50+ किसानों के साथ 7,000+ घंटे का संचालन।',
      },
    ],
    suitableFor: [
      { en: 'Row crops with narrow spacing', hi: 'कम दूरी वाली कतार फसलें' },
      { en: 'Vegetable farms', hi: 'सब्ज़ी के खेत' },
      { en: 'Orchards and plantations', hi: 'बाग़ और वृक्षारोपण' },
      { en: 'Uneven terrain', hi: 'ऊबड़-खाबड़ ज़मीन' },
    ],
    considerations: [
      {
        en: 'Row spacing decides everything. Measure your rows and confirm with FarmRobo before you commit.',
        hi: 'कतारों की दूरी सबसे अहम है। अपनी कतारें नापें और पैसा देने से पहले फार्मरोबो से पुष्टि करें।',
      },
      {
        en: 'Attachments are sold separately. Price the tools you actually need, not just the robot.',
        hi: 'अटैचमेंट अलग से बिकते हैं। सिर्फ़ रोबोट नहीं, ज़रूरी औज़ारों की कीमत भी जोड़ें।',
      },
      {
        en: 'Battery capacity, runtime, weight and charging time are not published. Ask for them in writing.',
        hi: 'बैटरी क्षमता, चलने का समय, वज़न और चार्जिंग समय प्रकाशित नहीं हैं। इन्हें लिखित में माँगें।',
      },
      {
        en: 'Service reach matters more than specs. Ask where the nearest service engineer is.',
        hi: 'स्पेसिफिकेशन से ज़्यादा ज़रूरी है सर्विस की पहुँच। पूछें कि सबसे नज़दीकी सर्विस इंजीनियर कहाँ है।',
      },
    ],
    attachments: [
      {
        name: { en: 'Rotary tiller', hi: 'रोटरी टिलर' },
        description: {
          en: '3–4 inch deep tillage that also cuts weed roots, aerating soil and preparing rows.',
          hi: '3–4 इंच गहरी जुताई जो खरपतवार की जड़ें भी काटती है, मिट्टी में हवा भरती है और कतारें तैयार करती है।',
        },
        image: toolRotaryTiller,
      },
      {
        name: { en: 'Brush cutter', hi: 'ब्रश कटर' },
        description: {
          en: 'Cuts weeds and overgrown grass between rows without disturbing the crop.',
          hi: 'फसल को छेड़े बिना कतारों के बीच की खरपतवार और लंबी घास काटता है।',
        },
        image: toolBrushCutter,
      },
      {
        name: { en: 'Stubble mower', hi: 'स्टबल मोवर' },
        description: {
          en: 'Cuts and chops residue, then levels with a roller to aid decomposition.',
          hi: 'अवशेष काटकर बारीक करता है, फिर रोलर से समतल करता है ताकि वह जल्दी सड़े।',
        },
        image: toolStubbleMower,
      },
      {
        name: { en: 'Gorru (duckfoot)', hi: 'गोरु (डकफुट)' },
        description: {
          en: 'Breaks soil clumps and uproots weeds for efficient de-weeding.',
          hi: 'मिट्टी के ढेले तोड़ता है और खरपतवार उखाड़ता है।',
        },
        image: toolGorru,
      },
      {
        name: { en: 'Guntaka (cultivator blade)', hi: 'गुंटका (कल्टीवेटर ब्लेड)' },
        description: {
          en: 'Uproots weeds for efficient de-weeding.',
          hi: 'खरपतवार उखाड़कर निराई करता है।',
        },
        image: toolGuntaka,
      },
      {
        name: { en: 'Boom sprayer (HTP)', hi: 'बूम स्प्रेयर (HTP)' },
        description: {
          en: 'Precision spraying in row crops and orchards; adjustable nozzles reach 10–15 ft.',
          hi: 'कतार फसलों और बाग़ों में सटीक छिड़काव; समायोज्य नोज़ल 10–15 फुट तक पहुँचते हैं।',
        },
        image: toolBoomSprayer,
      },
      {
        name: { en: 'HTP sweep sprayer', hi: 'HTP स्वीप स्प्रेयर' },
        description: {
          en: 'Covers up to 30 feet at a 180° sweep, 80–150 micron droplets, with a 100 L or 250 L tank.',
          hi: '180° घुमाव पर 30 फुट तक कवरेज, 80–150 माइक्रोन बूँदें, 100 लीटर या 250 लीटर टैंक के साथ।',
        },
        image: toolSweepSprayer,
      },
      {
        name: { en: 'Trailer', hi: 'ट्रेलर' },
        description: { en: 'Transports up to 800 kg.', hi: '800 किलो तक ढुलाई।' },
        image: toolTrailer,
      },
    ],
    price: {
      kind: 'range',
      display: { en: '₹8.5 lakh – ₹15 lakh', hi: '₹8.5 लाख – ₹15 लाख' },
      note: {
        en: "This is the price range FarmRobo publishes in its own website's product data, covering its robot line rather than one configuration. Attachments are extra. Treat it as a budgeting band and get a written quote.",
        hi: 'यह वही सीमा है जो फार्मरोबो अपनी वेबसाइट के उत्पाद डेटा में प्रकाशित करता है — यह पूरी रोबोट श्रृंखला के लिए है, किसी एक कॉन्फ़िगरेशन के लिए नहीं। अटैचमेंट अलग हैं। इसे बजट की सीमा मानें और लिखित कोटेशन लें।',
      },
    },
    availability: { en: 'Pre-booking open with the manufacturer', hi: 'निर्माता के पास प्री-बुकिंग खुली है' },
    cta: {
      kind: 'pre-book',
      label: { en: 'Pre-book on farmrobo.in', hi: 'farmrobo.in पर प्री-बुक करें' },
      href: 'https://www.farmrobo.in/',
    },
    secondaryCta: {
      kind: 'contact',
      label: { en: 'WhatsApp FarmRobo', hi: 'फार्मरोबो को व्हाट्सऐप करें' },
      href: 'https://wa.me/917386678833',
    },
    dataGaps: [
      {
        en: 'Battery capacity, runtime per charge, charging time, weight, ground clearance and turning radius are not published.',
        hi: 'बैटरी क्षमता, एक चार्ज में चलने का समय, चार्जिंग समय, वज़न, ग्राउंड क्लीयरेंस और टर्निंग रेडियस प्रकाशित नहीं हैं।',
      },
      {
        en: 'FarmRobo has no separate R1v2 product page — everything above comes from its homepage.',
        hi: 'फार्मरोबो का अलग R1v2 उत्पाद पेज नहीं है — ऊपर की सारी जानकारी उसके होमपेज से है।',
      },
    ],
    verification: FARMROBO_VERIFICATION,
  },

  {
    id: 'farmrobo-r5',
    name: 'FarmRobo R5',
    model: 'R5',
    manufacturerId: 'farmrobo',
    platform: 'ground-robot',
    useCases: ['weeding', 'vegetation-management'],
    operation: ['remote-controlled'],
    operationNote: {
      en: 'FarmRobo describes its robots generally as remote-controlled and battery-powered. It has published nothing specific about how the R5 is controlled.',
      hi: 'फार्मरोबो अपने रोबोट को आमतौर पर रिमोट-नियंत्रित और बैटरी चालित बताता है। R5 के नियंत्रण के बारे में उसने अलग से कुछ प्रकाशित नहीं किया है।',
    },
    power: 'electric',
    summary: {
      en: 'A weed and vegetation management robot aimed at solar farms, orchards and plantations.',
      hi: 'सौर फार्म, बाग़ और वृक्षारोपण के लिए बना खरपतवार और वनस्पति प्रबंधन रोबोट।',
    },
    farmerSummary: {
      en: 'Built for the places a tractor cannot go — between solar panel rows, under orchard trees, along plantation edges. FarmRobo lists it as available, but has not yet put a specification sheet online, so anything beyond what its own demo footage shows has to come from them directly.',
      hi: 'उन जगहों के लिए बना है जहाँ ट्रैक्टर नहीं जा सकता — सोलर पैनल की कतारों के बीच, बाग़ के पेड़ों के नीचे, वृक्षारोपण के किनारे। फार्मरोबो इसे उपलब्ध बताता है, पर स्पेसिफिकेशन शीट ऑनलाइन नहीं डाली है, इसलिए इसके अपने डेमो वीडियो से आगे की जानकारी सीधे उन्हीं से लेनी होगी।',
    },
    image: farmroboR5,
    gallery: [farmroboR5, farmroboR5Orchard, farmroboR5Solar],
    imageCredit: {
      en: 'Stills from FarmRobo’s own R5 demonstration video, farmrobo.in',
      hi: 'फार्मरोबो के अपने R5 प्रदर्शन वीडियो से लिए गए दृश्य, farmrobo.in',
    },
    specs: [
      {
        label: { en: 'Incline handled', hi: 'ढलान क्षमता' },
        value: 'Up to 45°, per demo footage',
        headline: true,
      },
      {
        label: { en: 'Clearance under panels', hi: 'पैनल के नीचे जगह' },
        value: '1.5 ft, per demo footage',
        headline: true,
      },
    ],
    claims: [
      {
        en: 'Shown in FarmRobo’s own promotional video climbing a roughly 45° grassy slope under palm trees, captioned "Can handle upto 45° inclination."',
        hi: 'फार्मरोबो के अपने प्रचार वीडियो में इसे ताड़ के पेड़ों के नीचे लगभग 45° की घास वाली ढलान चढ़ते दिखाया गया है, कैप्शन: "Can handle upto 45° inclination"।',
      },
      {
        en: 'The same video shows it working beneath a solar array at a captioned clearance of "1.5 ft height" — the low profile the solar-farm use case depends on.',
        hi: 'वही वीडियो इसे सोलर पैनल के नीचे "1.5 ft height" कैप्शन के साथ काम करते दिखाता है — यही कम ऊँचाई सौर फार्म में उपयोग को संभव बनाती है।',
      },
    ],
    suitableFor: [
      { en: 'Solar farms', hi: 'सौर फार्म' },
      { en: 'Orchards', hi: 'बाग़' },
      { en: 'Plantations', hi: 'वृक्षारोपण' },
    ],
    considerations: [
      {
        en: 'There is no published spec sheet. Ask FarmRobo for battery capacity, runtime, cutting width, speed and weight in writing before paying anything.',
        hi: 'कोई प्रकाशित स्पेसिफिकेशन शीट नहीं है। पैसा देने से पहले फार्मरोबो से बैटरी क्षमता, चलने का समय, कटाई चौड़ाई, गति और वज़न लिखित में माँगें।',
      },
      {
        en: 'Ask to see it working in a field like yours before you commit.',
        hi: 'पैसा लगाने से पहले अपने जैसे खेत में इसे चलता हुआ देखने के लिए कहें।',
      },
    ],
    price: {
      kind: 'unpublished',
      display: { en: 'Not published', hi: 'प्रकाशित नहीं' },
      note: {
        en: 'FarmRobo publishes a ₹8.5–15 lakh band across its robot line but does not break out an R5 price. Ask for a quote.',
        hi: 'फार्मरोबो अपनी रोबोट श्रृंखला के लिए ₹8.5–15 लाख की सीमा बताता है, पर R5 की अलग कीमत नहीं देता। कोटेशन माँगें।',
      },
    },
    cta: {
      kind: 'contact',
      label: { en: 'Ask FarmRobo about the R5', hi: 'R5 के बारे में फार्मरोबो से पूछें' },
      href: 'https://wa.me/917386678833',
    },
    secondaryCta: {
      kind: 'view-product',
      label: { en: 'FarmRobo on YouTube', hi: 'यूट्यूब पर फार्मरोबो' },
      href: 'https://www.youtube.com/@FarmRobo_official',
    },
    dataGaps: [
      {
        en: 'FarmRobo has not published a dedicated product page, a specification sheet or a price for the R5 — only the demonstration video on its homepage. The two figures above (45° incline, 1.5 ft clearance) are on-screen captions in that video, not a data sheet, and everything else about the machine (battery, runtime, weight, cutting width, speed) has to be requested from FarmRobo directly.',
        hi: 'फार्मरोबो ने R5 के लिए अलग उत्पाद पेज, स्पेसिफिकेशन शीट या कीमत प्रकाशित नहीं की है — सिर्फ़ होमपेज पर एक प्रदर्शन वीडियो है। ऊपर के दो आँकड़े (45° ढलान, 1.5 फुट जगह) उसी वीडियो के ऑन-स्क्रीन कैप्शन हैं, कोई डेटा शीट नहीं — बाकी सब कुछ (बैटरी, चलने का समय, वज़न, कटाई चौड़ाई, गति) सीधे फार्मरोबो से माँगना होगा।',
      },
    ],
    verification: FARMROBO_VERIFICATION,
  },

  {
    id: 'iotech-agribot-mx',
    name: 'Agribot MX',
    model: 'Agribot MX',
    manufacturerId: 'iotechworld',
    platform: 'drone',
    useCases: ['spraying', 'seeding', 'monitoring'],
    operation: ['remote-controlled', 'semi-autonomous', 'autonomous'],
    operationNote: {
      en: 'Flies in manual, semi-autonomous or fully autonomous waypoint modes — the pilot chooses. A licensed pilot is required either way.',
      hi: 'मैनुअल, अर्ध-स्वचालित या पूर्ण स्वचालित वेपॉइंट मोड में उड़ता है — चुनाव पायलट का है। हर हाल में लाइसेंस वाला पायलट ज़रूरी है।',
    },
    power: 'electric',
    summary: {
      en: 'DGCA type-certified multipurpose agriculture drone for spraying, granular broadcasting and crop health monitoring.',
      hi: 'DGCA टाइप-प्रमाणित बहुउद्देश्यीय कृषि ड्रोन — छिड़काव, दाना बिखेरने और फसल स्वास्थ्य निगरानी के लिए।',
    },
    farmerSummary: {
      en: 'Sprays from the air, so it reaches the middle of a wet or tall standing crop where nobody can walk. It also broadcasts granules, and IoTechWorld says a day covers 25–30 acres. This one is government type-certified, which matters for subsidy paperwork.',
      hi: 'हवा से छिड़काव करता है, इसलिए गीली या ऊँची खड़ी फसल के बीच तक पहुँचता है जहाँ कोई चल नहीं सकता। यह दाना भी बिखेरता है, और IoTechWorld के अनुसार एक दिन में 25–30 एकड़ कवर होता है। यह सरकारी टाइप-प्रमाणित है, जो सब्सिडी के कागज़ों के लिए ज़रूरी है।',
    },
    image: iotechAgribotMx,
    imageCredit: { en: 'Photograph: IoTechWorld Avigation', hi: 'तस्वीर: IoTechWorld Avigation' },
    specs: [
      {
        label: { en: 'Payload', hi: 'पेलोड' },
        value: '10–40 L liquid · 10–30 kg granular',
        headline: true,
      },
      { label: { en: 'Spray width', hi: 'छिड़काव चौड़ाई' }, value: '4–10 m', headline: true },
      {
        label: { en: 'Flight time', hi: 'उड़ान समय' },
        value: '15–30 min per battery',
        headline: true,
      },
      {
        label: { en: 'Certification', hi: 'प्रमाणन' },
        value: 'DGCA type certified',
        headline: true,
      },
      { label: { en: 'Spray rate', hi: 'छिड़काव दर' }, value: '3–10 L/min, adjustable' },
      { label: { en: 'Nozzles', hi: 'नोज़ल' }, value: '4–8, flat fan / hollow cone / centrifugal disc' },
      { label: { en: 'Droplet size', hi: 'बूँद का आकार' }, value: '60–200 µm, adjustable for drift' },
      { label: { en: 'Take-off weight', hi: 'टेक-ऑफ़ वज़न' }, value: '10–50 kg including payload' },
      { label: { en: 'Navigation accuracy', hi: 'नेविगेशन सटीकता' }, value: '±2–5 cm with RTK/PPK GNSS' },
      { label: { en: 'Obstacle avoidance', hi: 'रुकावट से बचाव' }, value: 'Radar / LiDAR / ultrasonic, plus terrain following' },
      { label: { en: 'Wind resistance', hi: 'हवा सहनशीलता' }, value: 'Up to 8 m/s' },
      { label: { en: 'Ingress protection', hi: 'सुरक्षा रेटिंग' }, value: 'IP54–IP67 (optional)' },
      { label: { en: 'Frame', hi: 'ढाँचा' }, value: 'Carbon fibre / aluminium alloy, folds for transport' },
      { label: { en: 'Control link', hi: 'नियंत्रण लिंक' }, value: '2.4 / 5.8 GHz up to 1.5 km VLOS, optional LTE' },
    ],
    claims: [
      {
        en: 'One acre sprayed in about 7 minutes; 25–30 acres in a day.',
        hi: 'लगभग 7 मिनट में एक एकड़ छिड़काव; एक दिन में 25–30 एकड़।',
      },
      {
        en: 'Uses only 8–10 litres of water per acre.',
        hi: 'प्रति एकड़ सिर्फ़ 8–10 लीटर पानी।',
      },
    ],
    suitableFor: [
      { en: 'Field crops', hi: 'खेत की फसलें' },
      { en: 'Custom hiring centres and service providers', hi: 'कस्टम हायरिंग सेंटर और सेवा प्रदाता' },
      { en: 'Tall or waterlogged standing crop', hi: 'ऊँची या जलभराव वाली खड़ी फसल' },
    ],
    considerations: [
      {
        en: 'You need a Remote Pilot Certificate and a registered drone. Flying without either is illegal.',
        hi: 'रिमोट पायलट सर्टिफिकेट और पंजीकृत ड्रोन दोनों चाहिए। इनके बिना उड़ाना गैरकानूनी है।',
      },
      {
        en: 'The spec figures above are ranges across the Agribot family, not one model. Ask which configuration your quote covers.',
        hi: 'ऊपर के आँकड़े पूरे Agribot परिवार की सीमाएँ हैं, किसी एक मॉडल की नहीं। पूछें कि आपका कोटेशन कौन-सा कॉन्फ़िगरेशन है।',
      },
      {
        en: 'Only use pesticides cleared for drone application. The dose is not the same as a knapsack sprayer.',
        hi: 'सिर्फ़ वही कीटनाशक इस्तेमाल करें जो ड्रोन के लिए मंज़ूर हैं। मात्रा नैपसैक पंप जैसी नहीं होती।',
      },
    ],
    price: {
      kind: 'quote',
      display: { en: 'Price on request', hi: 'कीमत पूछने पर' },
      note: {
        en: 'IoTechWorld does not publish a price. It does state that 90% unsecured bank finance at 6% is available under the Agriculture Infrastructure Fund.',
        hi: 'IoTechWorld कीमत प्रकाशित नहीं करता। वह बताता है कि कृषि इन्फ्रास्ट्रक्चर फंड के तहत 6% ब्याज पर 90% बिना गारंटी बैंक ऋण उपलब्ध है।',
      },
    },
    availability: { en: 'Sales and service network across India', hi: 'पूरे भारत में बिक्री और सर्विस नेटवर्क' },
    cta: {
      kind: 'enquire',
      label: { en: 'Enquire on iotechworld.com', hi: 'iotechworld.com पर पूछताछ करें' },
      href: 'https://iotechworld.com/agribot-mx-drone',
    },
    secondaryCta: {
      kind: 'view-product',
      label: { en: 'Subsidy steps', hi: 'सब्सिडी के चरण' },
      href: 'https://iotechworld.com/Subsidy-Steps',
    },
    verification: {
      sourceType: 'manufacturer',
      sourceName: 'iotechworld.com',
      sourceUrl: 'https://iotechworld.com/agribot-mx-drone',
      verifiedAt: '2026-09-07',
    },
  },

  {
    id: 'iotech-agribot-a6',
    name: 'Agribot A6',
    model: 'Agribot A6',
    manufacturerId: 'iotechworld',
    platform: 'drone',
    useCases: ['spraying', 'seeding', 'monitoring'],
    operation: ['remote-controlled', 'semi-autonomous', 'autonomous'],
    power: 'electric',
    summary: {
      en: 'The compact DGCA type-certified Agribot — carried on a bike rack or as a backpack.',
      hi: 'छोटा DGCA टाइप-प्रमाणित Agribot — बाइक के कैरियर पर या पीठ पर ले जाया जा सकता है।',
    },
    farmerSummary: {
      en: 'The same certified spraying drone in a size one person can move between villages on a motorcycle. That portability is the point: a service operator can cover scattered plots without a vehicle.',
      hi: 'वही प्रमाणित छिड़काव ड्रोन, इतने आकार में कि एक व्यक्ति मोटरसाइकिल से गाँव-गाँव ले जा सके। यही इसकी खूबी है: सेवा देने वाला बिना गाड़ी के बिखरे खेत कवर कर सकता है।',
    },
    image: iotechAgribotA6,
    imageCredit: { en: 'Photograph: IoTechWorld Avigation', hi: 'तस्वीर: IoTechWorld Avigation' },
    specs: [
      { label: { en: 'Certification', hi: 'प्रमाणन' }, value: 'DGCA type certified', headline: true },
      {
        label: { en: 'Transport', hi: 'ढुलाई' },
        value: 'Bike rack or backpack',
        headline: true,
      },
      { label: { en: 'Payloads', hi: 'पेलोड' }, value: 'Spraying · broadcasting · crop health', headline: true },
      { label: { en: 'Safety', hi: 'सुरक्षा' }, value: 'Radar collision avoidance, terrain following, smart battery failsafe', headline: true },
      { label: { en: 'Fleet management', hi: 'फ्लीट प्रबंधन' }, value: 'Utilisation and output dashboard' },
      { label: { en: 'Licensing support', hi: 'लाइसेंस सहायता' }, value: 'UIN, insurance and pilot certificate assistance' },
    ],
    claims: [
      {
        en: 'One acre sprayed in about 7 minutes; 25–30 acres in a day, on 8–10 litres of water per acre.',
        hi: 'लगभग 7 मिनट में एक एकड़; एक दिन में 25–30 एकड़, प्रति एकड़ 8–10 लीटर पानी पर।',
      },
    ],
    suitableFor: [
      { en: 'Small and scattered plots', hi: 'छोटे और बिखरे खेत' },
      { en: 'Village-level service operators', hi: 'गाँव स्तर के सेवा प्रदाता' },
    ],
    considerations: [
      {
        en: 'IoTechWorld does not publish A6-specific tank size, weight or flight time. Ask for the model data sheet.',
        hi: 'IoTechWorld A6 का टैंक आकार, वज़न या उड़ान समय अलग से प्रकाशित नहीं करता। मॉडल की डेटा शीट माँगें।',
      },
      {
        en: 'A Remote Pilot Certificate and a registered drone are still required.',
        hi: 'रिमोट पायलट सर्टिफिकेट और पंजीकृत ड्रोन फिर भी ज़रूरी हैं।',
      },
    ],
    price: {
      kind: 'quote',
      display: { en: 'Price on request', hi: 'कीमत पूछने पर' },
    },
    cta: {
      kind: 'enquire',
      label: { en: 'Enquire on iotechworld.com', hi: 'iotechworld.com पर पूछताछ करें' },
      href: 'https://iotechworld.com/agribot-a6-drone',
    },
    dataGaps: [
      {
        en: 'Tank capacity, take-off weight, flight time and spray width are not published for the A6 specifically.',
        hi: 'A6 के लिए टैंक क्षमता, टेक-ऑफ़ वज़न, उड़ान समय और छिड़काव चौड़ाई अलग से प्रकाशित नहीं हैं।',
      },
    ],
    verification: {
      sourceType: 'manufacturer',
      sourceName: 'iotechworld.com',
      sourceUrl: 'https://iotechworld.com/agribot-a6-drone',
      verifiedAt: '2026-09-07',
    },
  },

  {
    id: 'marut-ag-365',
    name: 'Marut AG 365',
    model: 'AG 365',
    manufacturerId: 'marut',
    platform: 'drone',
    useCases: ['spraying', 'seeding', 'monitoring'],
    operation: ['remote-controlled', 'semi-autonomous', 'autonomous'],
    operationNote: {
      en: 'The Marut Agri app switches between manual, semi-autonomous and fully autonomous flight. A licensed pilot is required in all three.',
      hi: 'मारुत एग्री ऐप मैनुअल, अर्ध-स्वचालित और पूर्ण स्वचालित उड़ान के बीच बदलता है। तीनों में लाइसेंस वाला पायलट ज़रूरी है।',
    },
    power: 'electric',
    summary: {
      en: 'DGCA-certified 11 litre spraying drone that also spreads fertiliser granules and seeds.',
      hi: 'DGCA-प्रमाणित 11 लीटर छिड़काव ड्रोन, जो उर्वरक दाना और बीज भी बिखेरता है।',
    },
    farmerSummary: {
      en: 'A well-documented spraying drone with real published numbers: 11 litres a fill, about 3 acres per battery, roughly 22 acres in a day. Marut worked with agriculture universities to write the operating procedures, which is unusual and worth something.',
      hi: 'अच्छी तरह दर्ज किया गया छिड़काव ड्रोन, असली प्रकाशित आँकड़ों के साथ: एक भरने में 11 लीटर, एक बैटरी में लगभग 3 एकड़, दिन भर में करीब 22 एकड़। मारुत ने संचालन प्रक्रिया लिखने के लिए कृषि विश्वविद्यालयों के साथ काम किया, जो कम ही होता है और अहम है।',
    },
    image: marutAg365,
    imageCredit: { en: 'Photograph: Marut Drones', hi: 'तस्वीर: मारुत ड्रोन्स' },
    specs: [
      { label: { en: 'Max payload', hi: 'अधिकतम पेलोड' }, value: '11 litres', headline: true },
      { label: { en: 'Flight time', hi: 'उड़ान समय' }, value: '22 minutes', headline: true },
      { label: { en: 'Spray width', hi: 'छिड़काव चौड़ाई' }, value: '6 m', headline: true },
      { label: { en: 'Certification', hi: 'प्रमाणन' }, value: 'DGCA certified', headline: true },
      { label: { en: 'Coverage', hi: 'कवरेज' }, value: '3 acres per battery · 22+ acres in a day' },
      { label: { en: 'Battery', hi: 'बैटरी' }, value: '22,000 mAh Li-Po' },
      { label: { en: 'Operational range', hi: 'संचालन दूरी' }, value: '2 km' },
      { label: { en: 'Operating speed', hi: 'संचालन गति' }, value: '6 m/s' },
      { label: { en: 'Application volume', hi: 'छिड़काव मात्रा' }, value: '45 L/ha' },
      { label: { en: 'Nozzles', hi: 'नोज़ल' }, value: 'Precision centrifugal, ultra-low volume (ULV)' },
      { label: { en: 'Flight modes', hi: 'उड़ान मोड' }, value: 'Manual · semi-autonomous · fully autonomous' },
    ],
    suitableFor: [
      { en: 'Small and medium farms', hi: 'छोटे और मझोले खेत' },
      { en: 'Custom hiring centres', hi: 'कस्टम हायरिंग सेंटर' },
    ],
    crops: [
      { en: 'Paddy', hi: 'धान' },
      { en: 'Maize', hi: 'मक्का' },
      { en: 'Cotton', hi: 'कपास' },
      { en: 'Groundnut', hi: 'मूंगफली' },
      { en: 'Sugarcane', hi: 'गन्ना' },
      { en: 'Wheat', hi: 'गेहूँ' },
      { en: 'Soybean', hi: 'सोयाबीन' },
      { en: 'Sesame', hi: 'तिल' },
    ],
    considerations: [
      {
        en: 'The 6 m spray width and 45 L/ha volume are quoted for paddy, maize, cotton and groundnut. Other crops may differ.',
        hi: '6 मीटर छिड़काव चौड़ाई और 45 लीटर/हेक्टेयर मात्रा धान, मक्का, कपास और मूंगफली के लिए दी गई है। दूसरी फसलों में अंतर हो सकता है।',
      },
      {
        en: 'Marut says its drones are eligible under central and state drone subsidy schemes, subject to guidelines. Confirm your own eligibility before assuming it.',
        hi: 'मारुत के अनुसार उसके ड्रोन केंद्र और राज्य की सब्सिडी योजनाओं के लिए पात्र हैं, दिशानिर्देशों के अधीन। मान लेने से पहले अपनी पात्रता की पुष्टि करें।',
      },
    ],
    price: {
      kind: 'quote',
      display: { en: 'Price on request', hi: 'कीमत पूछने पर' },
      note: {
        en: 'Marut does not publish a price. Its "Buy Now" button opens a sales contact form, not a checkout.',
        hi: 'मारुत कीमत प्रकाशित नहीं करता। उसका "Buy Now" बटन चेकआउट नहीं, बिक्री संपर्क फ़ॉर्म खोलता है।',
      },
    },
    cta: {
      kind: 'enquire',
      label: { en: 'Contact Marut sales', hi: 'मारुत बिक्री से संपर्क करें' },
      href: 'https://marutdrones.com/contact-us/',
    },
    secondaryCta: {
      kind: 'view-product',
      label: { en: 'AG 365 spec page', hi: 'AG 365 स्पेसिफिकेशन पेज' },
      href: 'https://marutdrones.com/kisan-drones/ag-365/',
    },
    verification: {
      sourceType: 'manufacturer',
      sourceName: 'marutdrones.com',
      sourceUrl: 'https://marutdrones.com/kisan-drones/ag-365/',
      verifiedAt: '2026-09-07',
    },
  },


  {
    id: 'marut-seedcopter',
    name: 'Marut Seedcopter',
    manufacturerId: 'marut',
    platform: 'drone',
    useCases: ['seeding'],
    operation: ['semi-autonomous', 'autonomous'],
    power: 'electric',
    summary: {
      en: 'An aerial seeding drone that drops seed balls across terrain nobody can plant by hand.',
      hi: 'हवाई बुवाई ड्रोन, जो ऐसी ज़मीन पर बीज-गोले गिराता है जहाँ हाथ से बुवाई नहीं हो सकती।',
    },
    farmerSummary: {
      en: 'This is a reforestation and restoration tool, not a crop-sowing machine. It carries 1,500–2,000 seed balls and scatters them over hillsides, degraded land and forest blocks — the kind of ground where sending people is slow, expensive or unsafe.',
      hi: 'यह वनीकरण और भूमि सुधार का औज़ार है, फसल बोने की मशीन नहीं। यह 1,500–2,000 बीज-गोले लेकर पहाड़ी ढलानों, बंजर ज़मीन और जंगल के हिस्सों पर बिखेरता है — जहाँ लोगों को भेजना धीमा, महँगा या असुरक्षित है।',
    },
    image: marutSeedcopter,
    imageCredit: { en: 'Photograph: Marut Drones', hi: 'तस्वीर: मारुत ड्रोन्स' },
    specs: [
      { label: { en: 'Seed ball capacity', hi: 'बीज-गोला क्षमता' }, value: '1,500–2,000', headline: true },
      { label: { en: 'Payload', hi: 'पेलोड' }, value: 'Up to 10 kg', headline: true },
      { label: { en: 'Flight time', hi: 'उड़ान समय' }, value: '25 minutes', headline: true },
      { label: { en: 'Range', hi: 'दूरी' }, value: '10 km', headline: true },
      { label: { en: 'Max take-off weight', hi: 'अधिकतम टेक-ऑफ़ वज़न' }, value: 'Up to 30 kg' },
      { label: { en: 'Navigation', hi: 'नेविगेशन' }, value: 'High-precision GPS' },
      { label: { en: 'Software', hi: 'सॉफ़्टवेयर' }, value: 'AltusPlant GCS and command platform' },
    ],
    claims: [
      {
        en: '360 hectares covered in single-day operations at Veernapally Forest; 60,000 seed balls dispersed in 8 hours.',
        hi: 'वीरनपल्ली वन में एक दिन के संचालन में 360 हेक्टेयर; 8 घंटे में 60,000 बीज-गोले।',
      },
    ],
    suitableFor: [
      { en: 'Afforestation and reforestation', hi: 'वनीकरण और पुनर्वनीकरण' },
      { en: 'Degraded land restoration', hi: 'बंजर भूमि सुधार' },
      { en: 'Terrain that cannot be walked', hi: 'ऐसी ज़मीन जहाँ चलना मुश्किल है' },
    ],
    considerations: [
      {
        en: 'This is not a crop seeder. It will not replace a seed drill on a levelled field.',
        hi: 'यह फसल बोने वाली मशीन नहीं है। समतल खेत में यह सीड ड्रिल की जगह नहीं लेगा।',
      },
    ],
    price: {
      kind: 'quote',
      display: { en: 'Price on request', hi: 'कीमत पूछने पर' },
      note: {
        en: 'Sold through demos and project partnerships rather than a listed price.',
        hi: 'तय कीमत के बजाय डेमो और परियोजना साझेदारी के ज़रिए बेचा जाता है।',
      },
    },
    cta: {
      kind: 'enquire',
      label: { en: 'Request a demo from Marut', hi: 'मारुत से डेमो माँगें' },
      href: 'https://marutdrones.com/products/seedcopter/',
    },
    verification: {
      sourceType: 'manufacturer',
      sourceName: 'marutdrones.com',
      sourceUrl: 'https://marutdrones.com/products/seedcopter/',
      verifiedAt: '2026-09-07',
    },
  },

];

/* ------------------------------------------------------------------ */
/* Filtering, search and recommendation                                */
/* ------------------------------------------------------------------ */

/**
 * The category chips a farmer sees, merging the two real axes — what the
 * machine *is* and what it *does*. A spraying drone and a spraying ground
 * robot both answer "spraying", which is what someone with a pest problem
 * actually types.
 */
export type CategoryKey = `platform:${Platform}` | `use:${UseCase}`;

export const CATEGORY_ORDER: CategoryKey[] = [
  'platform:ground-robot',
  'platform:drone',
  'platform:tractor',
  'use:weeding',
  'use:spraying',
  'use:tilling',
  'use:seeding',
  'use:monitoring',
  'use:vegetation-management',
  'use:harvesting',
];

export function categoryLabel(key: CategoryKey): Bi {
  const [kind, value] = key.split(':');
  return kind === 'platform'
    ? PLATFORM_LABELS[value as Platform]
    : USE_CASE_LABELS[value as UseCase];
}

export function matchesCategory(robot: AgriRobot, key: CategoryKey): boolean {
  const [kind, value] = key.split(':');
  return kind === 'platform'
    ? robot.platform === value
    : robot.useCases.includes(value as UseCase);
}

export function countInCategory(key: CategoryKey): number {
  return ROBOTS.filter((r) => matchesCategory(r, key)).length;
}

export interface RobotFilters {
  query: string;
  category: CategoryKey | 'all';
  operation: Operation | 'all';
  power: Power | 'all';
}

export const EMPTY_FILTERS: RobotFilters = {
  query: '',
  category: 'all',
  operation: 'all',
  power: 'all',
};

/**
 * Search over everything a farmer might type: model, maker, category, crop,
 * use case — in either script. The haystack is built once per robot rather
 * than per keystroke because the alternative showed up as input lag on a
 * mid-range Android.
 */
const HAYSTACKS = new Map<string, string>(
  ROBOTS.map((r) => {
    const maker = MANUFACTURERS[r.manufacturerId];
    const parts = [
      r.name,
      r.model ?? '',
      maker?.name ?? '',
      maker?.legalName ?? '',
      r.summary.en,
      r.summary.hi,
      r.farmerSummary.en,
      r.farmerSummary.hi,
      PLATFORM_LABELS[r.platform].en,
      PLATFORM_LABELS[r.platform].hi,
      ...r.useCases.flatMap((u) => [USE_CASE_LABELS[u].en, USE_CASE_LABELS[u].hi]),
      ...r.operation.flatMap((o) => [OPERATION_LABELS[o].en, OPERATION_LABELS[o].hi]),
      POWER_LABELS[r.power].en,
      POWER_LABELS[r.power].hi,
      ...(r.crops ?? []).flatMap((c) => [c.en, c.hi]),
      ...(r.suitableFor ?? []).flatMap((s) => [s.en, s.hi]),
      ...r.specs.map((s) => s.value),
    ];
    return [r.id, parts.join(' ').toLowerCase()];
  }),
);

export function filterRobots(filters: RobotFilters): AgriRobot[] {
  const q = filters.query.trim().toLowerCase();
  return ROBOTS.filter((r) => {
    if (filters.category !== 'all' && !matchesCategory(r, filters.category)) return false;
    if (filters.operation !== 'all' && !r.operation.includes(filters.operation)) return false;
    if (filters.power !== 'all' && r.power !== filters.power) return false;
    if (!q) return true;
    return (HAYSTACKS.get(r.id) ?? '').includes(q);
  });
}

export function getRobot(id: string): AgriRobot | undefined {
  return ROBOTS.find((r) => r.id === id);
}

export function robotsByManufacturer(manufacturerId: string, exceptId?: string): AgriRobot[] {
  return ROBOTS.filter((r) => r.manufacturerId === manufacturerId && r.id !== exceptId);
}

/* ---- Guided finder ---- */

export type FarmType = 'field-crops' | 'vegetables' | 'orchard' | 'solar-farm' | 'other';
export type FarmSize = 'small' | 'medium' | 'large';

export const FARM_TYPE_LABELS: Record<FarmType, Bi> = {
  'field-crops': { en: 'Field crops', hi: 'खेत की फसलें' },
  vegetables: { en: 'Vegetables', hi: 'सब्ज़ियाँ' },
  orchard: { en: 'Orchard or plantation', hi: 'बाग़ या वृक्षारोपण' },
  'solar-farm': { en: 'Solar farm', hi: 'सौर फार्म' },
  other: { en: 'Something else', hi: 'कुछ और' },
};

export const FARM_SIZE_LABELS: Record<FarmSize, Bi & { detail: Bi }> = {
  small: {
    en: 'Small',
    hi: 'छोटा',
    detail: { en: 'Under 5 acres', hi: '5 एकड़ से कम' },
  },
  medium: {
    en: 'Medium',
    hi: 'मझोला',
    detail: { en: '5 – 25 acres', hi: '5 – 25 एकड़' },
  },
  large: {
    en: 'Large',
    hi: 'बड़ा',
    detail: { en: 'Over 25 acres', hi: '25 एकड़ से ज़्यादा' },
  },
};

export interface FinderAnswers {
  task: UseCase | null;
  farm: FarmType | null;
  size: FarmSize | null;
}

export interface FinderResult {
  robot: AgriRobot;
  /** Why this machine came up. Shown so the suggestion is never a black box. */
  reasons: Bi[];
}

/**
 * Ranks catalogue rows against three answers. Deliberately transparent and
 * deliberately dumb — it reads fields that are actually in the data and says
 * which ones matched. Nothing here is a recommendation engine, and the page
 * says so next to the results.
 */
export function findRobots(answers: FinderAnswers): FinderResult[] {
  const { task, farm, size } = answers;

  const scored = ROBOTS.map((robot) => {
    let score = 0;
    const reasons: Bi[] = [];

    if (task && robot.useCases.includes(task)) {
      score += 5;
      reasons.push({
        en: `Built for ${USE_CASE_LABELS[task].en.toLowerCase()}`,
        hi: `${USE_CASE_LABELS[task].hi} के लिए बना है`,
      });
    }

    if (farm) {
      const suited = (robot.suitableFor ?? []).map((s) => s.en.toLowerCase()).join(' ');
      const wanted: Record<FarmType, string[]> = {
        'field-crops': ['field crops', 'row crops'],
        vegetables: ['vegetable'],
        orchard: ['orchard', 'plantation'],
        'solar-farm': ['solar'],
        other: [],
      };
      if (wanted[farm].some((w) => suited.includes(w))) {
        score += 3;
        reasons.push({
          en: `Listed as suitable for ${FARM_TYPE_LABELS[farm].en.toLowerCase()}`,
          hi: `${FARM_TYPE_LABELS[farm].hi} के लिए उपयुक्त बताया गया है`,
        });
      }
    }

    if (size) {
      // Drones are hired by the acre far more often than they are bought, so
      // they stay relevant at every holding size. Ground robots and tractors
      // only start paying for themselves with area to work.
      if (robot.platform === 'drone') {
        score += 2;
        reasons.push({
          en: 'Can be hired by the acre instead of bought',
          hi: 'खरीदने के बजाय प्रति एकड़ किराए पर लिया जा सकता है',
        });
      } else if (size === 'small') {
        score -= 1;
      } else {
        score += 1;
      }
    }

    return { robot, reasons, score };
  });

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ robot, reasons }) => ({ robot, reasons }));
}

/** The date the whole catalogue was last read against its sources. */
export const CATALOGUE_VERIFIED_AT = '2026-09-07';
