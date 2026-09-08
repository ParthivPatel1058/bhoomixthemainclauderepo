/**
 * What the sidebar navigates to.
 *
 * Every entry points at a route that exists in `App.tsx`. The design this was
 * ported from shipped with invented telemetry against each row — "NDVI 0.84",
 * "3 Urgent alerts", "Claim #BH-892 Reviewing", "42.5 Acres active" — which
 * looked convincing and was entirely fictional. None of it survived: a farmer
 * who reads "3 Urgent alerts" in their own navigation and finds nothing behind
 * it has been lied to by the app's furniture.
 *
 * What is kept is `tagline`, because that is a true statement about where the
 * link goes and it earns its place in the collapsed rail's flyout, where the
 * label alone is thin. Badges are kept too, but only where a real count backs
 * them — today that is Orders, fed by `useOrderCount`.
 */

export interface SubNavEntry {
  id: string;
  path: string;
  icon: string;
  label: { en: string; hi: string };
  desc: { en: string; hi: string };
}

export interface NavEntry {
  id: string;
  /** Route to navigate to. Group rows use `null` and open a submenu instead. */
  path: string | null;
  icon: string;
  label: { en: string; hi: string };
  /** One line for the collapsed-rail flyout. Descriptive, never a statistic. */
  tagline: { en: string; hi: string };
  /** Short kicker on the flyout card. */
  category: { en: string; hi: string };
  /** Label for the flyout's action button. */
  action: { en: string; hi: string };
  /** Only 'orders' today — the one badge with a real number behind it. */
  badgeKey?: 'orders';
  children?: SubNavEntry[];
}

export const NAV: NavEntry[] = [
  {
    id: 'overview',
    path: '/',
    icon: 'overview',
    label: { en: 'Overview', hi: 'अवलोकन' },
    tagline: { en: 'Your farm dashboard and daily summary', hi: 'आपका खेत डैशबोर्ड और दैनिक सारांश' },
    category: { en: 'Home', hi: 'होम' },
    action: { en: 'Open dashboard', hi: 'डैशबोर्ड खोलें' },
  },
  {
    id: 'crop-intelligence',
    path: '/crop-disease',
    icon: 'crop-intelligence',
    label: { en: 'Crop Intelligence', hi: 'फसल इंटेलिजेंस' },
    tagline: {
      en: 'Photograph a leaf and get a disease reading',
      hi: 'पत्ती की तस्वीर लें और रोग की पहचान पाएँ',
    },
    category: { en: 'Diagnosis', hi: 'निदान' },
    action: { en: 'Scan a crop', hi: 'फसल स्कैन करें' },
  },
  {
    id: 'crop-advisory',
    path: '/kisan-help',
    icon: 'crop-advisory',
    label: { en: 'Crop Advisory', hi: 'फसल सलाह' },
    tagline: { en: 'Ask a farming question and get an answer', hi: 'खेती का सवाल पूछें और जवाब पाएँ' },
    category: { en: 'Advisory', hi: 'सलाह' },
    action: { en: 'Ask a question', hi: 'सवाल पूछें' },
  },
  {
    id: 'agri-market',
    path: '/agri-market',
    icon: 'agri-market',
    label: { en: 'Agri Market', hi: 'कृषि बाज़ार' },
    tagline: { en: 'Seeds, fertiliser and tools to order', hi: 'बीज, खाद और औज़ार — ऑर्डर करें' },
    category: { en: 'Shop', hi: 'दुकान' },
    action: { en: 'Browse the market', hi: 'बाज़ार देखें' },
  },
  {
    id: 'farming-guides',
    path: null,
    icon: 'farming-guides',
    label: { en: 'Farming Guides', hi: 'खेती गाइड' },
    tagline: { en: 'How-to guides for three ways of farming', hi: 'खेती के तीन तरीकों की गाइड' },
    category: { en: 'Guides', hi: 'गाइड' },
    action: { en: 'Open guides', hi: 'गाइड खोलें' },
    children: [
      {
        id: 'organic',
        path: '/organic-farming',
        icon: 'organic',
        label: { en: 'Organic', hi: 'जैविक' },
        desc: { en: 'Chemical-free soil and pest management', hi: 'बिना रसायन मिट्टी और कीट प्रबंधन' },
      },
      {
        id: 'vegetable',
        path: '/vegetable-farming',
        icon: 'vegetable',
        label: { en: 'Vegetable', hi: 'सब्ज़ी' },
        desc: { en: 'Seasonal vegetable growing', hi: 'मौसमी सब्ज़ी की खेती' },
      },
      {
        id: 'robotic',
        path: '/robotic-farming',
        icon: 'robotic',
        label: { en: 'Robotic', hi: 'रोबोटिक' },
        desc: { en: 'Farm robots and agricultural drones', hi: 'खेती के रोबोट और कृषि ड्रोन' },
      },
    ],
  },
  {
    id: 'mandi-prices',
    path: '/mandi-prices',
    icon: 'mandi-prices',
    label: { en: 'Mandi Prices', hi: 'मंडी भाव' },
    tagline: { en: 'Wholesale rates from markets near you', hi: 'आपके पास की मंडियों के थोक भाव' },
    category: { en: 'Market', hi: 'बाज़ार' },
    action: { en: 'Check rates', hi: 'भाव देखें' },
  },
  {
    id: 'damage-claim',
    path: '/damage-report',
    icon: 'damage-claim',
    label: { en: 'Damage Claim', hi: 'नुकसान दावा' },
    tagline: { en: 'Report crop loss and file for insurance', hi: 'फसल नुकसान दर्ज करें और बीमा दावा करें' },
    category: { en: 'Insurance', hi: 'बीमा' },
    action: { en: 'Report damage', hi: 'नुकसान दर्ज करें' },
  },
  {
    id: 'schemes',
    path: '/gov-schemes',
    icon: 'schemes',
    label: { en: 'Schemes', hi: 'योजनाएं' },
    tagline: { en: 'Central and state schemes you can apply to', hi: 'केंद्र और राज्य की योजनाएँ' },
    category: { en: 'Government', hi: 'सरकार' },
    action: { en: 'Find a scheme', hi: 'योजना खोजें' },
  },
  {
    id: 'orders',
    path: '/orders',
    icon: 'orders',
    label: { en: 'Orders', hi: 'ऑर्डर' },
    tagline: { en: 'What you have bought and where it is', hi: 'आपने क्या खरीदा और वह कहाँ है' },
    category: { en: 'Deliveries', hi: 'डिलीवरी' },
    action: { en: 'Track orders', hi: 'ऑर्डर ट्रैक करें' },
    badgeKey: 'orders',
  },
  {
    id: 'addresses',
    path: '/addresses',
    icon: 'addresses',
    label: { en: 'Addresses', hi: 'पते' },
    tagline: { en: 'Where your orders are delivered', hi: 'आपके ऑर्डर कहाँ आते हैं' },
    category: { en: 'Account', hi: 'खाता' },
    action: { en: 'Manage addresses', hi: 'पते प्रबंधित करें' },
  },
  {
    id: 'shops',
    path: '/shop-locator',
    icon: 'shops',
    label: { en: 'Nearby Shops', hi: 'नज़दीकी दुकानें' },
    tagline: { en: 'Input dealers and stores around you', hi: 'आपके आसपास के डीलर और दुकानें' },
    category: { en: 'Nearby', hi: 'आसपास' },
    action: { en: 'Find shops', hi: 'दुकानें खोजें' },
  },
  {
    id: 'support',
    path: '/support',
    icon: 'support',
    label: { en: 'Support', hi: 'सहायता' },
    tagline: { en: 'Get help with the app or an order', hi: 'ऐप या ऑर्डर में मदद पाएँ' },
    category: { en: 'Help', hi: 'मदद' },
    action: { en: 'Get help', hi: 'मदद लें' },
  },
];

/**
 * Which row (and sub-row) the current URL corresponds to.
 *
 * The `/preview` prefix is stripped first. That route is the dev-only design
 * harness, which mounts the real pages at `/preview/<page>`; without this the
 * sidebar's active state and its auto-opening guides group are the two things
 * on the panel that can never be looked at in the very harness built for
 * looking at layout. The prefix cannot appear in production — Vite drops the
 * whole `import.meta.env.DEV` route block from the build.
 */
export function findActive(rawPathname: string): { id: string; subId: string | null } {
  const pathname = rawPathname.startsWith('/preview/')
    ? rawPathname.slice('/preview'.length)
    : rawPathname;

  for (const entry of NAV) {
    if (entry.children) {
      const child = entry.children.find((c) => c.path === pathname);
      if (child) return { id: entry.id, subId: child.id };
    }
    if (entry.path === pathname) return { id: entry.id, subId: null };
  }
  // The harness names the home screen "home" rather than mounting it at root.
  if (pathname === '/home') return { id: 'overview', subId: null };
  return { id: '', subId: null };
}
