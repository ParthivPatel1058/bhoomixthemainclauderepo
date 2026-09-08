import {
  BadgeIndianRupee,
  Bot,
  Carrot,
  Landmark,
  Leaf,
  LifeBuoy,
  MapPin,
  Settings,
  Store,
} from 'lucide-react';

/**
 * The sidebar's own icon set.
 *
 * Seven of these are hand-drawn rather than pulled from lucide, because the
 * navigation is the one place in the app where an icon has to be recognised at
 * 18px with no label beside it — in the collapsed rail that glyph is the only
 * thing identifying the destination. The custom shapes carry more agricultural
 * meaning than a generic outline set does: a storefront with an awning for the
 * market, a sprout breaking soil for the guides, a claim sheet behind a shield
 * for insurance.
 *
 * The rest stay on lucide, where a generic glyph is genuinely the clearest
 * answer — a rupee badge reads as prices, a pin reads as an address.
 */

interface IconProps {
  className?: string;
}

/** Clipboard with a checklist — the farm at a glance. */
export const OverviewIcon = ({ className = 'w-5 h-5' }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M5 2C3.34315 2 2 3.34315 2 5V19C2 20.6569 3.34315 22 5 22H19C20.6569 22 22 20.6569 22 19V5C22 3.34315 20.6569 2 19 2H15C15 3.65685 13.6569 5 12 5C10.3431 5 9 3.65685 9 2H5ZM6.5 9.5C7.32843 9.5 8 8.82843 8 8C8 7.17157 7.32843 6.5 6.5 6.5C5.67157 6.5 5 7.17157 5 8C5 8.82843 5.67157 9.5 6.5 9.5ZM10 8C10 7.44772 10.4477 7 11 7H18C18.5523 7 19 7.44772 19 8C19 8.55228 18.5523 9 18 9H11C10.4477 9 10 8.55228 10 8ZM6.5 13.5C7.32843 13.5 8 12.8284 8 12C8 11.1716 7.32843 10.5 6.5 10.5C5.67157 10.5 5 11.1716 5 12C5 12.8284 5.67157 13.5 6.5 13.5ZM10 12C10 11.4477 10.4477 11 11 11H18C18.5523 11 19 11.4477 19 12C19 12.5523 18.5523 13 18 13H11C10.4477 13 10 12.5523 10 12ZM5.2 16.2C5.59052 15.8095 6.22369 15.8095 6.61421 16.2L7.3 16.8858L9.38579 14.8C9.77631 14.4095 10.4095 14.4095 10.8 14.8C11.1905 15.1905 11.1905 15.8237 10.8 16.2142L8.00711 19.0071C7.61658 19.3976 6.98342 19.3976 6.59289 19.0071L5.2 17.6142C4.80948 17.2237 4.80948 16.5905 5.2 16.2ZM12 16C12 15.4477 12.4477 15 13 15H18C18.5523 15 19 15.4477 19 16C19 16.5523 18.5523 17 18 17H13C12.4477 17 12 16.5523 12 16Z"
      fill="currentColor"
    />
  </svg>
);

/** A phone photographing a plant — the crop-scanning camera flow. */
export const CropIntelligenceIcon = ({ className = 'w-5 h-5' }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <path
      d="M1.5 5.5V2.5H4.5M19.5 2.5H22.5V5.5M1.5 17V19.5H4"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M10.5 10V6C10.5 3.8 8.5 2 6 2C6 4.5 7.8 6.5 10 6.5"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M10.5 5C12 3 14.5 2.2 16.5 2.5C17 4.8 15 7 12 7"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <rect x="2" y="9.5" width="15" height="10" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
    <circle cx="8.5" cy="14.5" r="3" stroke="currentColor" strokeWidth="1.4" />
    <path
      d="M7 15.5C7.5 14 8.5 13.5 9 13.5C9.5 13.5 10.5 14 11 15.5"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
    />
    <path
      d="M13.5 18L15.5 13.8C16 12.8 17.2 12.5 18.2 13C19.2 13.5 19.5 14.7 19 15.7L17.8 17.8M17.8 17.8L19.5 19.5C20.8 20.8 20.5 22.8 18.5 22.8H14.5L13 20.5"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/** Two chat bubbles — asking the advisor a question. */
export const CropAdvisoryIcon = ({ className = 'w-5 h-5' }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <path
      d="M7 3.5H17C19.5 3.5 21.5 5.5 21.5 8V11.5C21.5 14 19.5 16 17 16H18V17C18 17.6 17.4 17.8 16.8 17.4L14 15.5"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M2.5 8C2.5 5.5 4.5 3.5 7 3.5H15C17.5 3.5 19.5 5.5 19.5 8V12.5C19.5 15 17.5 17 15 17H8L4.2 20.8C3.8 21.2 3 20.9 3 20.2V17C2.5 17 2.5 15.5 2.5 12.5V8Z"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/** A storefront with a scalloped awning — the input market. */
export const AgriMarketIcon = ({ className = 'w-5 h-5' }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <rect x="4.5" y="2.5" width="15" height="2.5" rx="1.25" fill="currentColor" />
    <path
      d="M3 6.5C3 6.5 4 6 5.5 6H18.5C20 6 21 6.5 21 6.5L20 12.5C20 13.8 18.8 14.5 17.5 14.5C16.2 14.5 15.2 13.6 15 12.5C14.8 13.6 13.8 14.5 12.5 14.5C11.2 14.5 10.2 13.6 10 12.5C9.8 13.6 8.8 14.5 7.5 14.5C6.2 14.5 5 13.8 5 12.5L4 6.5"
      fill="currentColor"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M4.5 13H5V20C5 21.1 5.9 22 7 22H17C18.1 22 19 21.1 19 20V13H19.5C19.8 13 20 12.8 20 12.5V12H4V12.5C4 12.8 4.2 13 4.5 13ZM14.5 22V17C14.5 15.9 13.6 15 12.5 15H11.5C10.4 15 9.5 15.9 9.5 17V22H14.5Z"
      fill="currentColor"
    />
  </svg>
);

/** A sprout breaking soil — the cultivation guides. */
export const FarmingGuidesIcon = ({ className = 'w-5 h-5' }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <path
      d="M2.5 21.5C3 19.5 4.8 18.5 7.5 18.5C9 18.5 10 19 11 19.5C11.8 18.8 13 18.5 14.8 18.5C17.2 18.5 18.8 19.2 19.8 20C20.8 19.2 22 19.8 22.5 21.5H2.5Z"
      fill="currentColor"
    />
    <path d="M12.5 19V11" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    <path d="M12 14.5C9.2 14.5 6.2 11.8 5.8 7.8C9.5 7.8 11.5 10.2 12 14.5Z" fill="currentColor" />
    <path d="M12.5 12C14.2 7.2 18.5 5.5 21.5 6C21.5 10.2 18.2 13.5 12.5 12Z" fill="currentColor" />
  </svg>
);

/** A claim sheet behind a shield — crop loss and insurance. */
export const DamageClaimIcon = ({ className = 'w-5 h-5' }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <path
      d="M7 2H18C19.4 2 20.5 3.1 20.5 4.5V19.5C20.5 20.9 19.4 22 18 22H11"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    <path
      d="M9 9.5H17.5M9 12.2H17.5M11.5 15H17.5M11.5 17.8H17.5M11 6.5H17.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M2 13.5C2 13 4.5 12 6.5 12C8.5 12 11 13 11 13.5V17.5C11 19.8 7.5 21.8 6.5 22C5.5 21.8 2 19.8 2 17.5V13.5Z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    <path d="M6.5 15V19M4.5 17H8.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

/** A loaded cart — deliveries on their way. */
export const OrdersIcon = ({ className = 'w-5 h-5' }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <path
      d="M4 6.5L5.5 3C5.8 2.3 6.8 2.3 7.1 3L8.5 7"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
    />
    <path d="M12 2H14V3.5L15 5V7H11V5L12 3.5V2Z" fill="currentColor" />
    <path
      d="M17 4.5C16.5 3.5 18 2.5 19 3C19.5 3.5 19 4.5 18.5 5C19.5 5.5 20.5 6.5 20 8H16.5C16 6.5 16.5 5.5 17 4.5Z"
      fill="currentColor"
    />
    <path
      d="M2 6H4.5L7.2 15H17.8L20 8H6"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M8 11.5H18.5M10.5 8V15M14.5 8V15" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    <path d="M6 18.5C6 18.5 7 18 9 18H16.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <circle cx="7.5" cy="20.5" r="1.5" fill="currentColor" />
    <circle cx="16.5" cy="20.5" r="1.5" fill="currentColor" />
  </svg>
);

/** Resolves a nav item's `icon` key to a glyph. */
export function NavIcon({ name, className = 'w-5 h-5' }: { name: string; className?: string }) {
  switch (name) {
    case 'overview':
      return <OverviewIcon className={className} />;
    case 'crop-intelligence':
      return <CropIntelligenceIcon className={className} />;
    case 'crop-advisory':
      return <CropAdvisoryIcon className={className} />;
    case 'agri-market':
      return <AgriMarketIcon className={className} />;
    case 'farming-guides':
      return <FarmingGuidesIcon className={className} />;
    case 'damage-claim':
      return <DamageClaimIcon className={className} />;
    case 'orders':
      return <OrdersIcon className={className} />;
    case 'organic':
      return <Leaf className={className} strokeWidth={1.8} />;
    case 'vegetable':
      return <Carrot className={className} strokeWidth={1.8} />;
    case 'robotic':
      return <Bot className={className} strokeWidth={1.8} />;
    case 'mandi-prices':
      return <BadgeIndianRupee className={className} strokeWidth={1.8} />;
    case 'schemes':
      return <Landmark className={className} strokeWidth={1.8} />;
    case 'addresses':
      return <MapPin className={className} strokeWidth={1.8} />;
    case 'shops':
      return <Store className={className} strokeWidth={1.8} />;
    case 'support':
      return <LifeBuoy className={className} strokeWidth={1.8} />;
    case 'settings':
      return <Settings className={className} strokeWidth={1.8} />;
    default:
      return <OverviewIcon className={className} />;
  }
}

/** The BhoomiX leaf mark used in the sidebar header. */
export const LeafMark = ({ className = 'w-5 h-5' }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
    <path
      d="M20.4 3.6C16.8 3.3 12.2 4.9 9.3 7.8C6.3 10.8 4.7 15.3 5 19C8.7 19.3 13.2 17.7 16.2 14.7C19.2 11.7 20.7 7.3 20.4 3.6Z"
      opacity="0.95"
    />
    <path
      d="M5 19C9.5 15.5 14 11 19 5"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      opacity="0.2"
    />
  </svg>
);
