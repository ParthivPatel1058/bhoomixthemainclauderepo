/**
 * The editorial half of the robotics section — everything that is explanation
 * rather than catalogue.
 *
 * It lives beside `robotics.ts` rather than inside the page for the same
 * reason the schemes copy does: a page component that holds three hundred
 * lines of prose stops being reviewable, and this text needs to be edited by
 * whoever is checking the agronomy, not by whoever is moving a card.
 *
 * Two rules run through all of it. Nothing promises an outcome — machines
 * "can help", "may reduce", "are designed to" — because a farmer who buys on
 * the strength of a promise we made has been misled by us and not by the
 * manufacturer. And nothing states a subsidy rate as a national fact, because
 * rates depend on state, scheme, equipment, category and year.
 */

import type { Bi } from '@/data/robotics';

/* ------------------------------------------------------------------ */
/* What robotic farming is                                             */
/* ------------------------------------------------------------------ */

export const INTRO_LEAD: Bi = {
  en: 'Robotic farming means using machines, sensors, GPS, cameras and software to take on the repetitive, heavy or time-critical parts of a farming job.',
  hi: 'रोबोटिक खेती का मतलब है — मशीन, सेंसर, जीपीएस, कैमरा और सॉफ़्टवेयर से खेती के दोहराव वाले, भारी या समय पर होने वाले काम कराना।',
};

export const INTRO_BODY: Bi[] = [
  {
    en: 'These machines run from simple remote-controlled units all the way to drones and equipment that can follow a planned route on their own. Most of what is actually sold in India today sits nearer the simple end than the marketing suggests.',
    hi: 'ये मशीनें साधारण रिमोट से चलने वाली इकाइयों से लेकर उन ड्रोन और उपकरणों तक हैं जो तय रास्ता खुद चल सकते हैं। भारत में आज जो असल में बिकता है, वह विज्ञापनों की तुलना में साधारण सिरे के ज़्यादा पास है।',
  },
  {
    en: 'None of it is here to replace the farmer. The decisions stay with the person who knows the field — when to sow, what to spray, whether the crop can wait another day. The machine does the walking.',
    hi: 'इनमें से कोई भी किसान की जगह लेने के लिए नहीं है। फ़ैसले उसी के पास रहते हैं जो खेत को जानता है — कब बोना है, क्या छिड़कना है, फसल एक दिन और रुक सकती है या नहीं। मशीन सिर्फ़ चलने का काम करती है।',
  },
];

/** The jobs this technology is genuinely used for in India today. */
export const INTRO_JOBS: Bi[] = [
  { en: 'Weeding', hi: 'निराई' },
  { en: 'Spraying', hi: 'छिड़काव' },
  { en: 'Tilling', hi: 'जुताई' },
  { en: 'Seeding', hi: 'बुवाई' },
  { en: 'Crop monitoring', hi: 'फसल निगरानी' },
  { en: 'Field mapping', hi: 'खेत की मैपिंग' },
  { en: 'Vegetation management', hi: 'वनस्पति प्रबंधन' },
  { en: 'Hauling', hi: 'ढुलाई' },
];

/* ------------------------------------------------------------------ */
/* Who does what                                                       */
/* ------------------------------------------------------------------ */

export interface RoleStep {
  actor: Bi;
  does: Bi;
}

/** The one idea worth taking away: the farmer stays at the top of the chain. */
export const ROLE_CHAIN: RoleStep[] = [
  {
    actor: { en: 'The farmer', hi: 'किसान' },
    does: { en: 'Decides what needs doing, and when', hi: 'तय करता है क्या करना है और कब' },
  },
  {
    actor: { en: 'Sensors and cameras', hi: 'सेंसर और कैमरे' },
    does: { en: 'Collect what is happening in the field', hi: 'खेत की स्थिति की जानकारी जुटाते हैं' },
  },
  {
    actor: { en: 'Software', hi: 'सॉफ़्टवेयर' },
    does: { en: 'Turns that into something readable', hi: 'उसे पढ़ने लायक जानकारी में बदलता है' },
  },
  {
    actor: { en: 'The machine', hi: 'मशीन' },
    does: { en: 'Does the repetitive work', hi: 'दोहराव वाला काम करती है' },
  },
  {
    actor: { en: 'bhoomix', hi: 'भूमिX' },
    does: { en: 'Helps you find the right one', hi: 'सही मशीन खोजने में मदद करता है' },
  },
];

/* ------------------------------------------------------------------ */
/* Why it matters                                                      */
/* ------------------------------------------------------------------ */

export interface Pressure {
  problem: Bi;
  response: Bi;
}

/**
 * Paired rather than listed, so every problem is answered by what technology
 * can *do about it* — and the answer is always hedged, because none of these
 * are solved.
 */
export const PRESSURES: Pressure[] = [
  {
    problem: { en: 'Labour is scarce at exactly the wrong moment', hi: 'मज़दूर ठीक उसी वक़्त नहीं मिलते जब सबसे ज़रूरी हों' },
    response: {
      en: 'A remote-operated machine can be run by one person, so an operation does not wait for a crew to be free.',
      hi: 'रिमोट से चलने वाली मशीन एक ही व्यक्ति चला सकता है, इसलिए काम टोली के खाली होने का इंतज़ार नहीं करता।',
    },
  },
  {
    problem: { en: 'Labour costs rise every season', hi: 'हर मौसम में मज़दूरी बढ़ती है' },
    response: {
      en: 'Machine cost is largely fixed once bought. Whether that works out depends entirely on how many acres you run it over.',
      hi: 'एक बार खरीदने के बाद मशीन का खर्च ज़्यादातर तय रहता है। फ़ायदा होगा या नहीं, यह पूरी तरह इस पर है कि आप कितने एकड़ पर चलाते हैं।',
    },
  },
  {
    problem: { en: 'Spraying puts a person inside the chemical', hi: 'छिड़काव में आदमी खुद रसायन के बीच खड़ा होता है' },
    response: {
      en: 'Ground robots and drones both keep the operator out of the spray. This is the clearest benefit on this page.',
      hi: 'ज़मीनी रोबोट और ड्रोन दोनों ऑपरेटर को छिड़काव से बाहर रखते हैं। इस पन्ने पर यही सबसे साफ़ फ़ायदा है।',
    },
  },
  {
    problem: { en: 'Application is uneven by hand', hi: 'हाथ से छिड़काव एक-सा नहीं होता' },
    response: {
      en: 'Metered nozzles and a set speed can improve consistency, which may cut how much chemical is used.',
      hi: 'नापे हुए नोज़ल और तय गति एकरूपता सुधार सकते हैं, जिससे रसायन की खपत घट सकती है।',
    },
  },
  {
    problem: { en: 'A big field is hard to look over', hi: 'बड़े खेत पर नज़र रखना मुश्किल है' },
    response: {
      en: 'A monitoring flight can show patchy growth or an infestation starting in one corner before it is visible on foot.',
      hi: 'निगरानी उड़ान असमान बढ़वार या किसी कोने में शुरू होता प्रकोप, पैदल दिखने से पहले दिखा सकती है।',
    },
  },
  {
    problem: { en: 'Some ground is punishing to work', hi: 'कुछ ज़मीन पर काम करना बेहद थकाऊ है' },
    response: {
      en: 'Compact robots are designed for narrow rows, orchard floors and slopes where a tractor cannot turn.',
      hi: 'छोटे रोबोट संकरी कतारों, बाग़ की ज़मीन और ढलानों के लिए बने हैं जहाँ ट्रैक्टर मुड़ नहीं सकता।',
    },
  },
];

/* ------------------------------------------------------------------ */
/* How it works                                                        */
/* ------------------------------------------------------------------ */

export interface Stage {
  index: string;
  title: Bi;
  body: Bi;
}

export const STAGES: Stage[] = [
  {
    index: '01',
    title: { en: 'Sense', hi: 'देखना' },
    body: {
      en: 'Cameras, GPS and sensors read the row, the crop and the ground around the machine.',
      hi: 'कैमरे, जीपीएस और सेंसर मशीन के चारों ओर की कतार, फसल और ज़मीन को पढ़ते हैं।',
    },
  },
  {
    index: '02',
    title: { en: 'Understand', hi: 'समझना' },
    body: {
      en: 'Software turns those readings into something meaningful — where the row is, where the weed is, where the edge of the plot is.',
      hi: 'सॉफ़्टवेयर उन आँकड़ों को अर्थ देता है — कतार कहाँ है, खरपतवार कहाँ है, खेत का किनारा कहाँ है।',
    },
  },
  {
    index: '03',
    title: { en: 'Decide', hi: 'तय करना' },
    body: {
      en: 'The system works out the next action: steer, turn, open a nozzle, drop a blade, stop.',
      hi: 'सिस्टम अगला कदम तय करता है: मुड़ना, घूमना, नोज़ल खोलना, ब्लेड गिराना, रुकना।',
    },
  },
  {
    index: '04',
    title: { en: 'Act', hi: 'करना' },
    body: {
      en: 'The machine performs the operation at a set speed and a set rate, the same way every pass.',
      hi: 'मशीन तय गति और तय दर पर काम करती है, हर चक्कर में एक जैसा।',
    },
  },
  {
    index: '05',
    title: { en: 'Supervise', hi: 'निगरानी' },
    body: {
      en: 'You watch, and you stop it. Every machine in this catalogue is designed to be supervised, not left alone.',
      hi: 'आप देखते हैं, और आप रोकते हैं। इस सूची की हर मशीन निगरानी में चलने के लिए बनी है, अकेले छोड़ने के लिए नहीं।',
    },
  },
];

/* ------------------------------------------------------------------ */
/* Before you buy                                                      */
/* ------------------------------------------------------------------ */

export interface Check {
  title: Bi;
  body: Bi;
}

export const BUYING_CHECKS: Check[] = [
  {
    title: { en: 'Row spacing', hi: 'कतारों की दूरी' },
    body: {
      en: 'Measure your rows before anything else. A robot that does not fit between them is worth nothing, whatever else it does.',
      hi: 'सबसे पहले अपनी कतारें नापें। जो रोबोट उनके बीच नहीं समाता, वह बाकी चाहे जो करे, किसी काम का नहीं।',
    },
  },
  {
    title: { en: 'Acreage', hi: 'रकबा' },
    body: {
      en: 'Work out how many acres, how many times a season. That number, not the specification sheet, decides whether the machine makes sense.',
      hi: 'हिसाब लगाएँ — कितने एकड़, मौसम में कितनी बार। स्पेसिफिकेशन नहीं, यही आँकड़ा तय करता है कि मशीन सही है या नहीं।',
    },
  },
  {
    title: { en: 'Terrain', hi: 'ज़मीन' },
    body: {
      en: 'Slope, bunds, mud after irrigation, loose sand. Ask to see the machine working on ground like yours, not on a demonstration plot.',
      hi: 'ढलान, मेड़, सिंचाई के बाद की कीचड़, ढीली रेत। मशीन को प्रदर्शन वाले प्लॉट पर नहीं, अपने जैसी ज़मीन पर चलता देखने को कहें।',
    },
  },
  {
    title: { en: 'The actual job', hi: 'असली काम' },
    body: {
      en: 'A machine designed for orchard mowing will not weed a vegetable bed well. Match the tool to the operation you do most.',
      hi: 'बाग़ की घास काटने वाली मशीन सब्ज़ी की क्यारी की निराई ठीक से नहीं करेगी। जो काम सबसे ज़्यादा करते हैं, औज़ार उसी से मिलाएँ।',
    },
  },
  {
    title: { en: 'Service distance', hi: 'सर्विस की दूरी' },
    body: {
      en: 'Ask where the nearest service engineer sits and what the turnaround is. A machine down in peak season costs more than it saved.',
      hi: 'पूछें कि सबसे नज़दीकी सर्विस इंजीनियर कहाँ है और कितने दिन में आता है। सीज़न में खड़ी मशीन बचत से ज़्यादा नुकसान करती है।',
    },
  },
  {
    title: { en: 'Spare parts', hi: 'स्पेयर पार्ट्स' },
    body: {
      en: 'Blades, nozzles, belts, batteries. Ask what is stocked in India and what has to be imported.',
      hi: 'ब्लेड, नोज़ल, बेल्ट, बैटरी। पूछें कि भारत में क्या स्टॉक रहता है और क्या बाहर से मँगाना पड़ता है।',
    },
  },
  {
    title: { en: 'Training', hi: 'ट्रेनिंग' },
    body: {
      en: 'Find out who gets trained, for how long, and what happens when that person leaves.',
      hi: 'पता करें किसे ट्रेनिंग मिलेगी, कितने दिन की, और वह व्यक्ति चला जाए तो क्या होगा।',
    },
  },
  {
    title: { en: 'Running cost', hi: 'चलाने का खर्च' },
    body: {
      en: 'Electricity or fuel, battery replacement, blade wear, the operator. Add these before comparing against a labour bill.',
      hi: 'बिजली या ईंधन, बैटरी बदलना, ब्लेड की घिसाई, ऑपरेटर। मज़दूरी से तुलना करने से पहले ये सब जोड़ें।',
    },
  },
  {
    title: { en: 'Written specifications', hi: 'लिखित स्पेसिफिकेशन' },
    body: {
      en: 'If a number is not on the manufacturer’s website, ask for it in writing before you pay. Several machines on this page have gaps.',
      hi: 'अगर कोई आँकड़ा निर्माता की वेबसाइट पर नहीं है, तो पैसा देने से पहले उसे लिखित में माँगें। इस पन्ने की कई मशीनों में यह जानकारी अधूरी है।',
    },
  },
];

/* ------------------------------------------------------------------ */
/* Buy, hire, or pay for the service                                   */
/* ------------------------------------------------------------------ */

export interface Route {
  title: Bi;
  lede: Bi;
  points: Bi[];
  suits: Bi;
}

export const OWNERSHIP_ROUTES: Route[] = [
  {
    title: { en: 'Buying', hi: 'खरीदना' },
    lede: {
      en: 'You own the machine and everything that happens to it.',
      hi: 'मशीन आपकी, और उसके साथ जो कुछ हो वह भी आपका।',
    },
    points: [
      { en: 'Large payment up front, or finance', hi: 'बड़ी रकम पहले, या फ़ाइनेंस' },
      { en: 'Available whenever you need it', hi: 'जब ज़रूरत हो, तब उपलब्ध' },
      { en: 'You carry maintenance and repair', hi: 'रखरखाव और मरम्मत आपकी ज़िम्मेदारी' },
      { en: 'Idle time is your loss', hi: 'खाली खड़ी रहे तो नुकसान आपका' },
    ],
    suits: {
      en: 'Makes more sense the more acres and the more passes you run it over.',
      hi: 'जितने ज़्यादा एकड़ और जितने ज़्यादा चक्कर, उतना ही सही बैठता है।',
    },
  },
  {
    title: { en: 'Hiring by the acre', hi: 'प्रति एकड़ किराया' },
    lede: {
      en: 'Someone else owns it and comes to your field with an operator.',
      hi: 'मशीन किसी और की, वह ऑपरेटर के साथ आपके खेत आता है।',
    },
    points: [
      { en: 'Nothing paid up front', hi: 'पहले कुछ नहीं देना' },
      { en: 'Pay per acre, per operation', hi: 'प्रति एकड़, प्रति काम भुगतान' },
      { en: 'Maintenance is not your problem', hi: 'रखरखाव आपकी चिंता नहीं' },
      { en: 'You wait your turn in peak season', hi: 'सीज़न में अपनी बारी का इंतज़ार' },
    ],
    suits: {
      en: 'How most drone spraying in India actually reaches a farm, through a custom hiring centre.',
      hi: 'भारत में ड्रोन छिड़काव ज़्यादातर इसी रास्ते खेत तक पहुँचता है — कस्टम हायरिंग सेंटर के ज़रिए।',
    },
  },
  {
    title: { en: 'Robotics as a service', hi: 'रोबोटिक्स एक सेवा के रूप में' },
    lede: {
      en: 'You buy the finished operation, not the machine or the hour.',
      hi: 'आप मशीन या घंटा नहीं, पूरा काम खरीदते हैं।',
    },
    points: [
      { en: 'Priced by area treated or job done', hi: 'कवर किए गए क्षेत्र या पूरे काम के हिसाब से' },
      { en: 'The provider brings the operator and the skill', hi: 'ऑपरेटर और कौशल सेवा देने वाला लाता है' },
      { en: 'No equipment sitting idle off-season', hi: 'बिना सीज़न के मशीन खाली नहीं पड़ी रहती' },
      { en: 'Availability depends on providers near you', hi: 'उपलब्धता आपके आसपास के प्रदाताओं पर निर्भर' },
    ],
    suits: {
      en: 'Still thin on the ground in most districts. Worth asking your Krishi Vigyan Kendra whether anyone operates near you.',
      hi: 'ज़्यादातर ज़िलों में अभी कम है। अपने कृषि विज्ञान केंद्र से पूछें कि आसपास कोई काम करता है या नहीं।',
    },
  },
];

/* ------------------------------------------------------------------ */
/* Safety                                                              */
/* ------------------------------------------------------------------ */

export const SAFETY_RULES: Bi[] = [
  {
    en: 'Read the manufacturer’s manual and follow it. It is written for that specific machine, and this page is not.',
    hi: 'निर्माता की पुस्तिका पढ़ें और उसका पालन करें। वह उसी मशीन के लिए लिखी गई है, यह पन्ना नहीं।',
  },
  {
    en: 'Keep people and animals clear of a moving machine. A blade or a rotor does not stop because someone stepped in.',
    hi: 'चलती मशीन से लोगों और जानवरों को दूर रखें। कोई सामने आ जाए तो ब्लेड या रोटर अपने आप नहीं रुकता।',
  },
  {
    en: 'Inspect before every run — blades, mounts, nozzles, battery, propellers.',
    hi: 'हर बार चलाने से पहले जाँचें — ब्लेड, माउंट, नोज़ल, बैटरी, प्रोपेलर।',
  },
  {
    en: 'Only use pesticides cleared for the method you are using. Drone doses are not knapsack doses; the label says which is which.',
    hi: 'सिर्फ़ वही कीटनाशक इस्तेमाल करें जो उस तरीके के लिए मंज़ूर हैं। ड्रोन की मात्रा नैपसैक जैसी नहीं होती; लेबल पर लिखा रहता है।',
  },
  {
    en: 'Wear the protective equipment the chemical label asks for, even when the machine keeps you at a distance.',
    hi: 'रसायन के लेबल पर लिखे सुरक्षा उपकरण पहनें, भले ही मशीन आपको दूर रखती हो।',
  },
  {
    en: 'Use trained operators. Ask the manufacturer what training they provide and insist on it.',
    hi: 'प्रशिक्षित ऑपरेटर ही रखें। निर्माता से पूछें कि वे क्या ट्रेनिंग देते हैं और उस पर ज़ोर दें।',
  },
];

export const DRONE_RULES: Bi[] = [
  {
    en: 'The pilot needs a Remote Pilot Certificate. A drone school course runs about a week — the operator you hire should be able to show you theirs.',
    hi: 'पायलट के पास रिमोट पायलट सर्टिफिकेट होना चाहिए। ड्रोन स्कूल का कोर्स लगभग एक हफ़्ते का होता है — जिस ऑपरेटर को बुलाएँ, उससे सर्टिफिकेट दिखाने को कहें।',
  },
  {
    en: 'Every drone must carry a UIN, the registration number issued through the DigitalSky portal. No number, no legal flight.',
    hi: 'हर ड्रोन पर UIN होना चाहिए — डिजिटलस्काई पोर्टल से मिला पंजीकरण नंबर। नंबर नहीं तो उड़ान वैध नहीं।',
  },
  {
    en: 'Check the airspace zone before flying. Green is open, yellow needs permission, red is barred — near airports and defence land in particular.',
    hi: 'उड़ान से पहले एयरस्पेस ज़ोन देखें। हरा खुला, पीले में अनुमति ज़रूरी, लाल में मनाही — खासकर हवाई अड्डों और रक्षा भूमि के पास।',
  },
  {
    en: 'Do not spray in wind above roughly 15 km/h. The chemical drifts onto the next field and you pay for it twice.',
    hi: 'लगभग 15 किमी/घंटा से तेज़ हवा में छिड़काव न करें। दवा बगल के खेत में उड़ जाती है और नुकसान दोहरा होता है।',
  },
];

export const DRONE_RULES_NOTE: Bi = {
  en: 'Drone operation in India is governed by the Drone Rules and the conditions attached to your certificate. This is a summary for orientation, not legal advice — check DigitalSky and the current rules before you fly or hire.',
  hi: 'भारत में ड्रोन संचालन ड्रोन नियमों और आपके सर्टिफिकेट की शर्तों से चलता है। यह सिर्फ़ जानकारी के लिए संक्षेप है, कानूनी सलाह नहीं — उड़ाने या किराए पर लेने से पहले डिजिटलस्काई और मौजूदा नियम देखें।',
};

/* ------------------------------------------------------------------ */
/* Government support                                                  */
/* ------------------------------------------------------------------ */

export const SUBSIDY_LEAD: Bi = {
  en: 'Farm machinery and agricultural drones are covered by central and state support schemes. Rates are not uniform: what you get depends on your state, the scheme, the equipment, your farmer category and the year.',
  hi: 'कृषि मशीनरी और ड्रोन केंद्र और राज्य की सहायता योजनाओं में आते हैं। दरें एक जैसी नहीं होतीं: आपको कितना मिलेगा यह आपके राज्य, योजना, उपकरण, किसान श्रेणी और वर्ष पर निर्भर करता है।',
};

export const SUBSIDY_POINTS: Bi[] = [
  {
    en: 'Support is routed mostly through the Sub-Mission on Agricultural Mechanization and the state agriculture department, applied for on the farm machinery portal.',
    hi: 'सहायता ज़्यादातर कृषि यंत्रीकरण उप-मिशन और राज्य कृषि विभाग के ज़रिए मिलती है, आवेदन कृषि मशीनरी पोर्टल पर होता है।',
  },
  {
    en: 'Individual farmers, small and marginal farmers, women farmers, SC/ST farmers and farmer producer organisations are usually assessed at different rates.',
    hi: 'व्यक्तिगत किसान, छोटे और सीमांत किसान, महिला किसान, अनुसूचित जाति/जनजाति किसान और किसान उत्पादक संगठन आमतौर पर अलग-अलग दरों पर आते हैं।',
  },
  {
    en: 'Custom hiring centres are the route most villages actually get a drone through, and are funded separately from individual purchase.',
    hi: 'ज़्यादातर गाँवों तक ड्रोन कस्टम हायरिंग सेंटर के रास्ते ही पहुँचता है, जिसकी फंडिंग व्यक्तिगत खरीद से अलग होती है।',
  },
  {
    en: 'Manufacturers will tell you what they think you qualify for. Confirm it with your district agriculture officer or Krishi Vigyan Kendra before you count on it.',
    hi: 'निर्माता बताएँगे कि उनके हिसाब से आप किसके पात्र हैं। उस पर भरोसा करने से पहले अपने ज़िला कृषि अधिकारी या कृषि विज्ञान केंद्र से पुष्टि करें।',
  },
];

export interface OfficialLink {
  label: Bi;
  note: Bi;
  href: string;
}

export const OFFICIAL_LINKS: OfficialLink[] = [
  {
    label: { en: 'Farm Machinery portal', hi: 'कृषि मशीनरी पोर्टल' },
    note: {
      en: 'Where machinery subsidy applications are registered and tracked.',
      hi: 'जहाँ मशीनरी सब्सिडी के आवेदन दर्ज और ट्रैक होते हैं।',
    },
    href: 'https://agrimachinery.nic.in/',
  },
  {
    label: { en: 'Ministry of Agriculture', hi: 'कृषि मंत्रालय' },
    note: {
      en: 'Scheme guidelines and the current year’s notifications.',
      hi: 'योजना दिशानिर्देश और इस वर्ष की अधिसूचनाएँ।',
    },
    href: 'https://agriwelfare.gov.in/',
  },
  {
    label: { en: 'DigitalSky', hi: 'डिजिटलस्काई' },
    note: {
      en: 'Drone registration, UIN and airspace zone maps.',
      hi: 'ड्रोन पंजीकरण, UIN और एयरस्पेस ज़ोन मानचित्र।',
    },
    href: 'https://digitalsky.aai.aero/',
  },
  {
    label: { en: 'Plant Protection (PPQS)', hi: 'पादप संरक्षण (PPQS)' },
    note: {
      en: 'Which pesticides are approved, and for which method of application.',
      hi: 'कौन-से कीटनाशक मंज़ूर हैं, और किस तरीके से छिड़काव के लिए।',
    },
    href: 'https://ppqs.gov.in/',
  },
];

/* ------------------------------------------------------------------ */
/* State machinery                                                     */
/* ------------------------------------------------------------------ */

export interface StateMachine {
  name: Bi;
  job: Bi;
  /** Indicative market band, not a quotation. */
  band: string;
}

export interface StateMachinery {
  state: Bi;
  machines: StateMachine[];
}

/**
 * The equipment a farmer is most likely to be offered under a mechanisation
 * scheme, by state.
 *
 * This section used to carry a dealer name, a phone number and a subsidy
 * percentage against every machine. None of it could be verified against a
 * source, and a wrong phone number attached to a ₹3 lakh purchase is worse
 * than no phone number, so it is gone. What remains is what a farmer can use
 * without being misled: the machine, the job it does, and a price band to
 * budget against — with the official application route in one place below,
 * rather than a fabricated dealer against each row.
 */
export const STATE_MACHINERY: StateMachinery[] = [
  {
    state: { en: 'Punjab', hi: 'पंजाब' },
    machines: [
      {
        name: { en: 'Happy Seeder', hi: 'हैप्पी सीडर' },
        job: { en: 'Sows wheat straight into paddy stubble', hi: 'धान के ठूँठ में सीधे गेहूँ बोता है' },
        band: '₹1.2 – 1.5 lakh',
      },
      {
        name: { en: 'Laser land leveller', hi: 'लेज़र लैंड लेवलर' },
        job: { en: 'Levels a field so irrigation water spreads evenly', hi: 'खेत समतल करता है ताकि सिंचाई का पानी बराबर फैले' },
        band: '₹2.5 – 3 lakh',
      },
      {
        name: { en: 'Self-propelled combine harvester', hi: 'स्व-चालित कंबाइन हार्वेस्टर' },
        job: { en: 'Cuts and threshes wheat and paddy in one pass', hi: 'एक ही चक्कर में गेहूँ और धान काटता और गाहता है' },
        band: '₹25 – 40 lakh',
      },
    ],
  },
  {
    state: { en: 'Haryana', hi: 'हरियाणा' },
    machines: [
      {
        name: { en: 'Pneumatic planter', hi: 'न्यूमैटिक प्लांटर' },
        job: { en: 'Places maize and cotton seed at an even spacing', hi: 'मक्का और कपास के बीज बराबर दूरी पर रखता है' },
        band: '₹80,000 – 1.2 lakh',
      },
      {
        name: { en: 'Rotavator', hi: 'रोटावेटर' },
        job: { en: 'Prepares soil and works in crop residue', hi: 'मिट्टी तैयार करता है और फसल अवशेष मिलाता है' },
        band: '₹60,000 – 1 lakh',
      },
      {
        name: { en: 'Multi-crop thresher', hi: 'बहुफसली थ्रेशर' },
        job: { en: 'Threshes wheat, paddy and pulses', hi: 'गेहूँ, धान और दालें गाहता है' },
        band: '₹1.5 – 2 lakh',
      },
    ],
  },
  {
    state: { en: 'Uttar Pradesh', hi: 'उत्तर प्रदेश' },
    machines: [
      {
        name: { en: 'Sugarcane planter', hi: 'गन्ना प्लांटर' },
        job: { en: 'Cuts setts and plants cane in one operation', hi: 'एक ही काम में गन्ने के टुकड़े काटकर बोता है' },
        band: '₹3.5 – 5 lakh',
      },
      {
        name: { en: 'Reaper binder', hi: 'रीपर बाइंडर' },
        job: { en: 'Cuts and ties wheat or paddy into bundles', hi: 'गेहूँ या धान काटकर बंडल बाँधता है' },
        band: '₹1.8 – 2.5 lakh',
      },
      {
        name: { en: 'Power tiller', hi: 'पावर टिलर' },
        job: { en: 'Walk-behind tillage for small holdings', hi: 'छोटे खेतों के लिए पीछे चलकर जुताई' },
        band: '₹80,000 – 1.2 lakh',
      },
    ],
  },
  {
    state: { en: 'Maharashtra', hi: 'महाराष्ट्र' },
    machines: [
      {
        name: { en: 'Drip irrigation system', hi: 'ड्रिप सिंचाई प्रणाली' },
        job: { en: 'Delivers water to the root instead of the field', hi: 'पानी पूरे खेत की जगह जड़ तक पहुँचाता है' },
        band: '₹50,000 – 1.5 lakh',
      },
      {
        name: { en: 'Cotton picker', hi: 'कपास पिकर' },
        job: { en: 'Mechanised cotton harvesting', hi: 'मशीन से कपास की चुनाई' },
        band: '₹8 – 12 lakh',
      },
      {
        name: { en: 'Grape harvester', hi: 'अंगूर हार्वेस्टर' },
        job: { en: 'Mechanised picking in vineyards', hi: 'अंगूर के बाग़ों में मशीन से तुड़ाई' },
        band: '₹6 – 8 lakh',
      },
    ],
  },
  {
    state: { en: 'Karnataka', hi: 'कर्नाटक' },
    machines: [
      {
        name: { en: 'Arecanut climber', hi: 'सुपारी क्लाइंबर' },
        job: { en: 'Climbs the palm so a person does not have to', hi: 'पेड़ पर चढ़ता है ताकि आदमी को न चढ़ना पड़े' },
        band: '₹1.5 – 2 lakh',
      },
      {
        name: { en: 'Coffee pulper', hi: 'कॉफ़ी पल्पर' },
        job: { en: 'Removes pulp from harvested coffee cherry', hi: 'तोड़ी हुई कॉफ़ी से गूदा अलग करता है' },
        band: '₹2 – 3.5 lakh',
      },
      {
        name: { en: 'Paddy transplanter', hi: 'धान ट्रांसप्लांटर' },
        job: { en: 'Plants rice seedlings in rows', hi: 'धान की पौध कतारों में लगाता है' },
        band: '₹1.5 – 2.5 lakh',
      },
    ],
  },
  {
    state: { en: 'Tamil Nadu', hi: 'तमिलनाडु' },
    machines: [
      {
        name: { en: 'Coconut de-husker', hi: 'नारियल छिलाई मशीन' },
        job: { en: 'Strips husk from harvested coconut', hi: 'नारियल का छिलका उतारती है' },
        band: '₹80,000 – 1.2 lakh',
      },
      {
        name: { en: 'Banana fibre extractor', hi: 'केला रेशा निकालने की मशीन' },
        job: { en: 'Extracts fibre from banana stem', hi: 'केले के तने से रेशा निकालती है' },
        band: '₹3 – 4.5 lakh',
      },
      {
        name: { en: 'Drum seeder', hi: 'ड्रम सीडर' },
        job: { en: 'Direct-seeds sprouted paddy in wet fields', hi: 'गीले खेत में अंकुरित धान सीधे बोता है' },
        band: '₹4,000 – 8,000',
      },
    ],
  },
  {
    state: { en: 'Gujarat', hi: 'गुजरात' },
    machines: [
      {
        name: { en: 'Groundnut digger', hi: 'मूंगफली डिगर' },
        job: { en: 'Lifts groundnut from the soil', hi: 'मिट्टी से मूंगफली निकालता है' },
        band: '₹60,000 – 1 lakh',
      },
      {
        name: { en: 'Cotton stalk puller', hi: 'कपास डंठल पुलर' },
        job: { en: 'Pulls stalks after harvest for clearing', hi: 'कटाई के बाद डंठल उखाड़कर खेत साफ़ करता है' },
        band: '₹1.2 – 1.8 lakh',
      },
      {
        name: { en: 'Potato planter', hi: 'आलू प्लांटर' },
        job: { en: 'Plants seed potato at set spacing', hi: 'बीज आलू तय दूरी पर बोता है' },
        band: '₹1.5 – 2 lakh',
      },
    ],
  },
  {
    state: { en: 'Rajasthan', hi: 'राजस्थान' },
    machines: [
      {
        name: { en: 'Solar water pump', hi: 'सौर जल पंप' },
        job: { en: 'Runs irrigation off sunlight instead of diesel', hi: 'डीज़ल की जगह धूप से सिंचाई चलाता है' },
        band: '₹1.5 – 3 lakh',
      },
      {
        name: { en: 'Mustard harvester', hi: 'सरसों हार्वेस्टर' },
        job: { en: 'Mechanised mustard cutting', hi: 'मशीन से सरसों की कटाई' },
        band: '₹1.5 – 2 lakh',
      },
      {
        name: { en: 'Bajra thresher', hi: 'बाजरा थ्रेशर' },
        job: { en: 'Threshes pearl millet', hi: 'बाजरा गाहता है' },
        band: '₹60,000 – 1 lakh',
      },
    ],
  },
  {
    state: { en: 'Madhya Pradesh', hi: 'मध्य प्रदेश' },
    machines: [
      {
        name: { en: 'Straw baler', hi: 'भूसा बेलर' },
        job: { en: 'Bales straw for fodder or sale', hi: 'चारे या बिक्री के लिए भूसे की गाँठ बनाता है' },
        band: '₹2.5 – 4 lakh',
      },
      {
        name: { en: 'Soybean harvester', hi: 'सोयाबीन हार्वेस्टर' },
        job: { en: 'Mechanised soybean harvesting', hi: 'मशीन से सोयाबीन की कटाई' },
        band: '₹15 – 20 lakh',
      },
      {
        name: { en: 'Garlic planter', hi: 'लहसुन प्लांटर' },
        job: { en: 'Plants garlic cloves at set spacing', hi: 'लहसुन की कलियाँ तय दूरी पर बोता है' },
        band: '₹1 – 1.5 lakh',
      },
    ],
  },
  {
    state: { en: 'Telangana', hi: 'तेलंगाना' },
    machines: [
      {
        name: { en: 'Maize sheller', hi: 'मक्का शेलर' },
        job: { en: 'Separates grain from the cob', hi: 'भुट्टे से दाना अलग करता है' },
        band: '₹80,000 – 1.2 lakh',
      },
      {
        name: { en: 'Turmeric boiler', hi: 'हल्दी बॉयलर' },
        job: { en: 'Cures raw turmeric before drying', hi: 'सुखाने से पहले कच्ची हल्दी उबालता है' },
        band: '₹2 – 3 lakh',
      },
      {
        name: { en: 'Cotton seed delinter', hi: 'कपास बीज डीलिंटर' },
        job: { en: 'Removes lint from cotton seed', hi: 'कपास के बीज से रोआँ हटाता है' },
        band: '₹3.5 – 5 lakh',
      },
    ],
  },
  {
    state: { en: 'Andhra Pradesh', hi: 'आंध्र प्रदेश' },
    machines: [
      {
        name: { en: 'Chilli harvester', hi: 'मिर्च हार्वेस्टर' },
        job: { en: 'Mechanised chilli picking', hi: 'मशीन से मिर्च की तुड़ाई' },
        band: '₹5 – 7 lakh',
      },
      {
        name: { en: 'Turmeric polisher', hi: 'हल्दी पॉलिशर' },
        job: { en: 'Polishes cured turmeric for market', hi: 'बाज़ार के लिए हल्दी पॉलिश करता है' },
        band: '₹1.5 – 2.5 lakh',
      },
      {
        name: { en: 'Pond aerator', hi: 'तालाब एयरेटर' },
        job: { en: 'Adds oxygen to aquaculture ponds', hi: 'मछली पालन के तालाब में ऑक्सीजन बढ़ाता है' },
        band: '₹50,000 – 1 lakh',
      },
    ],
  },
  {
    state: { en: 'West Bengal', hi: 'पश्चिम बंगाल' },
    machines: [
      {
        name: { en: 'Mini combine harvester', hi: 'मिनी कंबाइन हार्वेस्टर' },
        job: { en: 'Harvesting sized for small holdings', hi: 'छोटे खेतों के लिए कटाई मशीन' },
        band: '₹8 – 12 lakh',
      },
      {
        name: { en: 'Zero-till drill', hi: 'ज़ीरो टिल ड्रिल' },
        job: { en: 'Sows without ploughing first', hi: 'बिना जुताई के बुवाई करता है' },
        band: '₹80,000 – 1.2 lakh',
      },
      {
        name: { en: 'Jute ribboner', hi: 'जूट रिबनर' },
        job: { en: 'Strips jute bark for retting', hi: 'सड़ाने के लिए जूट की छाल उतारता है' },
        band: '₹2.5 – 3.5 lakh',
      },
    ],
  },
];

export const STATE_MACHINERY_NOTE: Bi = {
  en: 'Price bands are indicative and meant for budgeting, not quotation. Availability, dealers and the subsidy you qualify for are handled by your state agriculture department — apply and check current rates on the farm machinery portal.',
  hi: 'कीमत की सीमाएँ अनुमानित हैं, बजट बनाने के लिए — कोटेशन नहीं। उपलब्धता, डीलर और आपको मिलने वाली सब्सिडी आपके राज्य कृषि विभाग के ज़िम्मे हैं — आवेदन और मौजूदा दरें कृषि मशीनरी पोर्टल पर देखें।',
};
