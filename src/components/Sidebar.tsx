import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronsRight,
  ChevronsLeft,
  ChevronRight,
  ChevronUp,
  Settings as SettingsIcon,
  LogOut,
  Sun,
  Moon,
  MapPin,
  Carrot,
} from "lucide-react";
import {
  WobloOverviewIcon,
  WobloCropAiIcon,
  WobloAdvisoryIcon,
  WobloMarketIcon,
  WobloMartIcon,
  WobloSproutIcon,
  WobloLeafIcon,
  WobloBotIcon,
  WobloCardIcon,
  WobloShieldIcon,
  WobloSchemesIcon,
  WobloPackageIcon,
  WobloTruckIcon,
  WobloSyncIcon,
  WobloShopLocatorIcon,
  WobloSupportIcon,
} from "@/components/ui/WobloIcon";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useOrderCount } from "@/hooks/useOrderCount";
import ThemeSwitch from "@/components/ui/theme-switch";
import { cn } from "@/lib/utils";
import logo from "@/assets/bhoomix-logo.jpeg";

interface Item {
  path: string;
  icon: React.ComponentType<{ className?: string; size?: number | string }>;
  label: { en: string; hi: string };
  /** Nested children turn this row into an expandable group. */
  children?: Item[];
  badgeKey?: "orders";
}

const NAV: Item[] = [
  { path: "/", icon: WobloOverviewIcon, label: { en: "Overview", hi: "अवलोकन" } },
  { path: "/crop-disease", icon: WobloCropAiIcon, label: { en: "Crop Intelligence", hi: "फसल इंटेलिजेंस" } },
  { path: "/kisan-help", icon: WobloAdvisoryIcon, label: { en: "Crop Advisory", hi: "फसल सलाह" } },
  { path: "/agri-market", icon: WobloMarketIcon, label: { en: "Agri Market", hi: "कृषि बाज़ार" } },
  { path: "/kisan-mart", icon: WobloMartIcon, label: { en: "AgriNova Mart", hi: "एग्रीनोवा मार्ट" } },
  {
    path: "#farming",
    icon: WobloSproutIcon,
    label: { en: "Farming Guides", hi: "खेती गाइड" },
    children: [
      { path: "/organic-farming", icon: WobloLeafIcon, label: { en: "Organic", hi: "जैविक" } },
      { path: "/vegetable-farming", icon: Carrot, label: { en: "Vegetable", hi: "सब्ज़ी" } },
      { path: "/robotic-farming", icon: WobloBotIcon, label: { en: "Robotic", hi: "रोबोटिक" } },
    ],
  },
  { path: "/mandi-prices", icon: WobloCardIcon, label: { en: "Mandi Prices", hi: "मंडी भाव" } },
  { path: "/damage-report", icon: WobloShieldIcon, label: { en: "Damage Claim", hi: "नुकसान दावा" } },
  { path: "/gov-schemes", icon: WobloSchemesIcon, label: { en: "Schemes", hi: "योजनाएं" } },
  { path: "/orders", icon: WobloPackageIcon, label: { en: "Orders", hi: "ऑर्डर" }, badgeKey: "orders" },
  { path: "/addresses", icon: MapPin, label: { en: "Addresses", hi: "पते" } },
  {
    path: "#delivery",
    icon: WobloTruckIcon,
    label: { en: "Delivery", hi: "डिलीवरी" },
    children: [
      { path: "/partner-registration", icon: WobloTruckIcon, label: { en: "Become a Partner", hi: "पार्टनर बनें" } },
      { path: "/partner-orders", icon: WobloSyncIcon, label: { en: "Partner Orders", hi: "पार्टनर ऑर्डर" } },
    ],
  },
  { path: "/shop-locator", icon: WobloShopLocatorIcon, label: { en: "Nearby Shops", hi: "नज़दीकी दुकानें" } },
  { path: "/support", icon: WobloSupportIcon, label: { en: "Support", hi: "सहायता" } },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

/**
 * Application sidebar with premium Woblo icons.
 */
export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { language, tx } = useLanguage();
  const { user, signOut } = useAuth();
  const orderCount = useOrderCount();

  const [openGroup, setOpenGroup] = useState<string | null>("#farming");

  const name = (user?.email ?? "").split("@")[0] || "Farmer";
  const initials = name.slice(0, 2).toUpperCase();

  const isActive = (p: string) => location.pathname === p;
  const groupActive = (item: Item) =>
    !!item.children?.some((c) => isActive(c.path));

  const badgeFor = (item: Item) =>
    item.badgeKey === "orders" && orderCount > 0 ? orderCount : null;

  /* ---------- a single row ---------- */
  const Row = ({ item, nested = false }: { item: Item; nested?: boolean }) => {
    const Icon = item.icon;
    const hasChildren = !!item.children?.length;
    const open = openGroup === item.path;
    const active = hasChildren ? groupActive(item) : isActive(item.path);
    const badge = badgeFor(item);

    const body = (
      <>
        {/* Accent bar on the active row */}
        {active && (
          <motion.span
            layoutId="sidebar-accent"
            className="bhoomix-sidebar-accent absolute left-0 top-1/2 h-7 w-[3px] -translate-y-1/2"
            transition={{ type: "spring", stiffness: 400, damping: 32 }}
          />
        )}

        <span className="relative flex-shrink-0">
          <Icon className="h-[18px] w-[18px]" />
          {/* In the rail the badge rides on the icon */}
          {collapsed && badge && (
            <span className="bhoomix-sidebar-badge absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center px-1 text-[9px] font-bold text-white">
              {badge}
            </span>
          )}
        </span>

        {!collapsed && (
          <>
            <span className="flex-1 truncate text-sm font-medium">
              {tx(item.label.en, item.label.hi)}
            </span>
            {badge && (
              <span className="bhoomix-sidebar-badge flex h-5 min-w-5 items-center justify-center px-1.5 text-[10px] font-bold text-white">
                {badge}
              </span>
            )}
            {hasChildren ? (
              <ChevronUp
                strokeWidth={2}
                className={cn(
                  "h-4 w-4 opacity-60 transition-transform duration-300",
                  !open && "rotate-180",
                )}
              />
            ) : (
              active && <ChevronRight strokeWidth={2} className="h-4 w-4 opacity-60" />
            )}
          </>
        )}
      </>
    );

    const rowClass = cn(
      "bhoomix-sidebar-row group/row relative flex items-center transition-[transform,box-shadow,border-color,background-color,color,opacity,filter] duration-200",
      collapsed ? "h-11 w-11 justify-center" : "h-11 gap-3 px-3",
      nested && !collapsed && "h-10 pl-3",
      active
        ? "bhoomix-sidebar-row-active"
        : "bhoomix-sidebar-row-idle",
    );

    const flyout = collapsed && (
      <span className="bhoomix-sidebar-flyout pointer-events-none absolute left-[calc(100%+14px)] top-1/2 z-50 -translate-y-1/2 whitespace-nowrap px-3 py-2 text-xs font-semibold opacity-0 transition-[transform,box-shadow,border-color,background-color,color,opacity,filter] duration-200 group-hover/row:opacity-100">
        {tx(item.label.en, item.label.hi)}
      </span>
    );

    if (hasChildren) {
      return (
        <button
          type="button"
          onClick={() => (collapsed ? onToggle() : setOpenGroup(open ? null : item.path))}
          className={cn(rowClass, "w-full")}
        >
          {body}
          {flyout}
        </button>
      );
    }

    return (
      <Link to={item.path} className={rowClass}>
        {body}
        {flyout}
      </Link>
    );
  };

  return (
    <aside
      className={cn(
        "bhoomix-sidebar fixed left-3 top-3 bottom-3 z-40 hidden lg:flex flex-col border transition-[width] duration-300",
        collapsed ? "w-[76px]" : "w-[264px]",
      )}
    >
      {/* Collapse handle, straddling the right edge */}
      <button
        onClick={onToggle}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        className="bhoomix-sidebar-toggle absolute -right-3.5 top-[72px] z-50 flex h-8 w-8 items-center justify-center border transition-[transform,box-shadow,border-color,background-color,color,opacity,filter]"
      >
        {collapsed ? (
          <ChevronsRight strokeWidth={2.5} className="h-3.5 w-3.5" />
        ) : (
          <ChevronsLeft strokeWidth={2.5} className="h-3.5 w-3.5" />
        )}
      </button>

      {/* Brand */}
      <div className={cn("flex items-center pt-5 pb-4", collapsed ? "justify-center" : "px-4 gap-2.5")}>
        <img src={logo} alt="" className="h-8 w-8 flex-shrink-0 rounded-xl object-cover ring-1 ring-black/10 dark:ring-white/15" />
        {!collapsed && (
          <span className="font-display truncate text-[17px] font-bold tracking-[-0.04em] text-foreground dark:text-white">
            Bhoomi<span className="text-muted-foreground dark:text-white/50">X</span>
          </span>
        )}
      </div>

      <div className={cn("bhoomix-sidebar-divider", collapsed ? "mx-4" : "mx-4")} />

      {/* Navigation */}
      <nav
        className={cn(
          "min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-4 space-y-1",
          "[scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5",
          "[&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-black/15",
          "dark:[&::-webkit-scrollbar-thumb]:bg-white/20",
          "[&::-webkit-scrollbar-track]:bg-transparent",
        )}
      >
        {NAV.map((item) => (
          <div key={item.path}>
            <Row item={item} />

            {/* Nested tree */}
            <AnimatePresence initial={false}>
              {!collapsed && item.children && openGroup === item.path && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="relative mt-1 ml-4 pl-3 space-y-1">
                    <span className="bhoomix-sidebar-rule absolute left-0 top-1 bottom-1 w-px" />
                    {item.children.map((child) => {
                      const childActive = isActive(child.path);
                      const ChildIcon = child.icon;
                      return (
                        <Link
                          key={child.path}
                          to={child.path}
                          className={cn(
                            "bhoomix-sidebar-row flex h-9 items-center gap-2.5 px-3 text-sm transition-[transform,box-shadow,border-color,background-color,color,opacity,filter] duration-200",
                            childActive
                              ? "bhoomix-sidebar-row-active font-medium"
                              : "bhoomix-sidebar-row-idle",
                          )}
                        >
                          <ChildIcon className="h-4 w-4" />
                          <span className="truncate">{tx(child.label.en, child.label.hi)}</span>
                        </Link>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </nav>

      <div className="bhoomix-sidebar-divider mx-4" />

      {/* User / Preferences footer */}
      <div className={cn("p-3", collapsed ? "flex flex-col items-center gap-2" : "space-y-2")}>
        <div className={cn("flex items-center", collapsed ? "justify-center" : "gap-3 px-2 py-1.5")}>
          <button
            onClick={() => navigate("/settings")}
            title="Settings"
            className="bhoomix-sidebar-avatar flex h-9 w-9 flex-shrink-0 items-center justify-center text-[11px] font-bold"
          >
            {initials}
          </button>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold leading-tight text-foreground dark:text-white">
                {user?.email || "Signed In"}
              </p>
              <p className="text-[11px] text-muted-foreground dark:text-white/50">
                {tx("Farmer Account", "किसान खाता")}
              </p>
            </div>
          )}
        </div>

        {/* Theme and signout actions */}
        {!collapsed ? (
          <div className="flex items-center justify-between pt-1 px-1">
            <ThemeSwitch size={12} />
            <button
              onClick={signOut}
              title={tx("Sign Out", "साइन आउट")}
              aria-label="Sign out"
              className="bhoomix-sidebar-row bhoomix-sidebar-row-idle flex h-9 w-9 items-center justify-center transition-[transform,box-shadow,border-color,background-color,color,opacity,filter]"
            >
              <LogOut strokeWidth={1.75} className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={signOut}
            title={tx("Sign Out", "साइन आउट")}
            aria-label="Sign out"
            className="bhoomix-sidebar-row bhoomix-sidebar-row-idle flex h-11 w-11 items-center justify-center transition-[transform,box-shadow,border-color,background-color,color,opacity,filter]"
          >
            <LogOut strokeWidth={1.75} className="h-[18px] w-[18px]" />
          </button>
        )}
      </div>
    </aside>
  );
}
