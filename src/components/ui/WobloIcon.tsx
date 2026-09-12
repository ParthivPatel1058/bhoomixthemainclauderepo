import React from "react";
import { cn } from "@/lib/utils";

interface WobloIconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  size?: number | string;
}

/** 1. Overview / Dashboard (Woblo Jarvis NewChat / Dashboard) */
export const WobloOverviewIcon: React.FC<WobloIconProps> = ({ className, size = 18, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cn("shrink-0", className)}
    {...props}
  >
    <rect x="3" y="3" width="7" height="7" rx="2" />
    <rect x="14" y="3" width="7" height="7" rx="2" />
    <rect x="3" y="14" width="7" height="7" rx="2" />
    <rect x="14" y="14" width="7" height="7" rx="2" />
  </svg>
);

/** 2. Crop Intelligence / AI Scanner (Woblo Jarvis Microscope / AI Scan) */
export const WobloCropAiIcon: React.FC<WobloIconProps> = ({ className, size = 18, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cn("shrink-0", className)}
    {...props}
  >
    <path d="M6 18h8" />
    <path d="M3 22h18" />
    <path d="M14 22a7 7 0 1 0 0-14h-1" />
    <path d="M9 14h2" />
    <path d="M9 12a2 2 0 0 1-2-2V6h6v4a2 2 0 0 1-2 2Z" />
    <path d="M12 6V3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3" />
  </svg>
);

/** 3. Crop Advisory (Woblo Sarvam Voice / AI Chat) */
export const WobloAdvisoryIcon: React.FC<WobloIconProps> = ({ className, size = 18, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cn("shrink-0", className)}
    {...props}
  >
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    <path d="M8 9h8" />
    <path d="M8 13h5" />
  </svg>
);

/** 4. Agri Market (Woblo Apple Shopping Bag) */
export const WobloMarketIcon: React.FC<WobloIconProps> = ({ className, size = 18, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 14 18"
    fill="currentColor"
    className={cn("shrink-0", className)}
    {...props}
  >
    <path d="M11.3535 3.5283h-1.0205a3.4229 3.4229 0 0 0 -3.333-2.9648 3.4229 3.4229 0 0 0 -3.333 2.9648h-1.02a2.1184 2.1184 0 0 0 -2.117 2.1162v7.7155a2.1186 2.1186 0 0 0 2.1162 2.1167h8.707a2.1186 2.1186 0 0 0 2.1167-2.1167v-7.7155a2.1184 2.1184 0 0 0 -2.1164-2.1162zm-4.3535-1.9448a2.3888 2.3888 0 0 1 2.3276 1.9448h-4.6552a2.3888 2.3888 0 0 1 2.3276-1.9448zm4.3535 11.7765a1.1018 1.1018 0 0 1 -1.1018 1.1018h-8.707a1.1018 1.1018 0 0 1 -1.1018-1.1018v-7.7155a1.1016 1.1016 0 0 1 1.1018-1.1018h1.0205v1.2065a.5085.5085 0 0 0 1.017 0v-1.2065h4.6552v1.2065a.5085.5085 0 0 0 1.017 0v-1.2065h1.0205a1.1016 1.1016 0 0 1 1.1018 1.1018z" />
  </svg>
);

/** 5. AgriNova Mart (Woblo Apple Store / Mart Glyph) */
export const WobloMartIcon: React.FC<WobloIconProps> = ({ className, size = 18, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cn("shrink-0", className)}
    {...props}
  >
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

/** 6. Farming Guides (Woblo Sprout / Plant) */
export const WobloSproutIcon: React.FC<WobloIconProps> = ({ className, size = 18, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cn("shrink-0", className)}
    {...props}
  >
    <path d="M7 20h10" />
    <path d="M10 20c5.5-2.5.8-6.4 3-13" />
    <path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z" />
    <path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z" />
  </svg>
);

/** 7. Organic Farming (Woblo Apple Leaf Glyph) */
export const WobloLeafIcon: React.FC<WobloIconProps> = ({ className, size = 18, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cn("shrink-0", className)}
    {...props}
  >
    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
    <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
  </svg>
);

/** 8. Robotic Farming (Woblo Jarvis KimiCode / Robotic AI) */
export const WobloBotIcon: React.FC<WobloIconProps> = ({ className, size = 18, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cn("shrink-0", className)}
    {...props}
  >
    <path d="M12 8V4H8" />
    <rect width="16" height="12" x="4" y="8" rx="2" />
    <path d="M2 14h2" />
    <path d="M20 14h2" />
    <path d="M15 13v2" />
    <path d="M9 13v2" />
  </svg>
);

/** 9. Mandi Prices (Woblo Apple Credit Card / Wallet Glyph - Image 4) */
export const WobloCardIcon: React.FC<WobloIconProps> = ({ className, size = 18, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 46 56"
    fill="currentColor"
    className={cn("shrink-0", className)}
    {...props}
  >
    <path d="M41.0009,12H5A5,5,0,0,0,.0009,17L0,39a5,5,0,0,0,4.9991,5H41.0009A5,5,0,0,0,46,39V17A5,5,0,0,0,41.0009,12ZM5,14H41.0009A3.0032,3.0032,0,0,1,44,17l.0005,2H2l.0005-2A3.0032,3.0032,0,0,1,5,14ZM41.0009,42H4.9991a3.0032,3.0032,0,0,1-3-3V22.9577H44V39A3.0032,3.0032,0,0,1,41.0009,42ZM15,31.5737v3.8526A1.5541,1.5541,0,0,1,13.4663,37H8.5338A1.5542,1.5542,0,0,1,7,35.4263V31.5737A1.5542,1.5542,0,0,1,8.5338,30h4.9325A1.5541,1.5541,0,0,1,15,31.5737Z" />
  </svg>
);

/** 10. Damage Claim (Woblo Sarvam Shield / Security) */
export const WobloShieldIcon: React.FC<WobloIconProps> = ({ className, size = 18, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cn("shrink-0", className)}
    {...props}
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

/** 11. Government Schemes (Woblo Sarvam Sovereign Star / Landmark) */
export const WobloSchemesIcon: React.FC<WobloIconProps> = ({ className, size = 18, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cn("shrink-0", className)}
    {...props}
  >
    <path d="M3 21h18" />
    <path d="M6 18V9" />
    <path d="M10 18V9" />
    <path d="M14 18V9" />
    <path d="M18 18V9" />
    <path d="M12 3l9 4H3l9-4z" />
  </svg>
);

/** 12. Orders / Packages (Woblo Box / Package) */
export const WobloPackageIcon: React.FC<WobloIconProps> = ({ className, size = 18, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cn("shrink-0", className)}
    {...props}
  >
    <path d="m16.5 9.4-9-5.19M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.29 7 12 12 20.71 7" />
    <line x1="12" y1="22" x2="12" y2="12" />
  </svg>
);

/** 13. Delivery Truck (Woblo Apple Delivery Cargo - svg-73) */
export const WobloTruckIcon: React.FC<WobloIconProps> = ({ className, size = 18, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 49 56"
    fill="currentColor"
    className={cn("shrink-0", className)}
    {...props}
  >
    <path d="m47.8447 27.501-6.6758-7.1289c-.9111-.9619-1.9541-1.3721-3.4854-1.3721h-4.6836v-4c0-2.7614-2.2385-5-5-5h-21c-2.7614 0-5 2.2386-5 5v19.043c0 2.7614 2.2386 5 5 5h.209a6.0028 6.0028 0 0 0 11.582 0h11.418a6.0028 6.0028 0 0 0 11.582 0h1.209c1.6568 0 3-1.3432 3-3v-5.6973c0-1.1299-.3955-2.0732-1.1504-2.8447zm-14.8447-6.501h4.6836c.9287 0 1.4883.2168 2.0527.8125l5.8008 6.1875h-12.5371zm-24 16.043a3.5 3.5 0 1 1 3.5-3.5 3.5041 3.5041 0 0 1 -3.5 3.5zm23 0a3.5 3.5 0 1 1 3.5-3.5 3.5041 3.5041 0 0 1 -3.5 3.5z" />
  </svg>
);

/** 14. Partner Sync / Trade-in Services (Woblo Apple Device Sync - Image 5 / svg-70) */
export const WobloSyncIcon: React.FC<WobloIconProps> = ({ className, size = 18, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 40 56"
    fill="currentColor"
    className={cn("shrink-0", className)}
    {...props}
  >
    <path d="m38 29.0205v9.9795c0 3.8594-3.1403 7-6.9996 7h-22c-3.8594 0-7-3.1406-7-7v-4.75h-1.2514c-.7087 0-.8958-.4824-.502-1.0337l2.2051-3.1304c.315-.4529.7875-.443 1.1025 0l2.2051 3.1403c.3839.5414.1969 1.0238-.5021 1.0238h-1.2576v4.75c0 2.7568 2.2435 5 5.0004 5h22c2.7568 0 5-2.2432 5-5v-9.9795c0-.5527.4473-1 1-1s.9996.4473.9996 1zm1.251-7.2705h-1.251v-4.75c0-3.8594-3.1403-7-6.9996-7h-22c-3.8594 0-7 3.1406-7 7v9.9795c0 .5527.4473 1 1 1s.9996-.4473.9996-1v-9.9795c0-2.7568 2.2435-5 5.0004-5h22c2.7568 0 5 2.2432 5 5v4.75h-1.258c-.6989 0-.886.4823-.502 1.0237l2.2051 3.1404c.315.4429.7875.4529 1.1025 0l2.2051-3.1305c.3937-.5513.2067-1.0336-.5021-1.0336z" />
  </svg>
);

/** 15. Nearby Shop Locator (Woblo Apple Store Locator) */
/** 16. Support / LifeBuoy (Woblo Help / Support) */
export const WobloSupportIcon: React.FC<WobloIconProps> = ({ className, size = 18, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cn("shrink-0", className)}
    {...props}
  >
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="4" />
    <line x1="4.93" y1="4.93" x2="9.17" y2="9.17" />
    <line x1="14.83" y1="14.83" x2="19.07" y2="19.07" />
    <line x1="14.83" y1="9.17" x2="19.07" y2="4.93" />
    <line x1="4.93" y1="19.07" x2="9.17" y2="14.83" />
  </svg>
);
