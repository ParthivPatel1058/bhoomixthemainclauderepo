import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  ShoppingBag,
  HelpCircle,
  Store,
  Package,
  Settings as SettingsIcon,
  Menu,
  LogOut,
  Search,
  Bell,
  MapPin,
  ChevronDown,
  Command,
} from 'lucide-react';
import { toast } from 'sonner';
import { trackSearch } from '@/lib/analytics';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useWeather } from '@/hooks/useWeather';
import { useAddresses, formatAddress } from '@/hooks/useAddresses';
import { WeatherIcon } from './WeatherWidget';
import GradientText from '@/components/ui/gradient-text';
import GlareHover from '@/components/ui/glare-hover';
import StarBorder from '@/components/ui/star-border';
import LanguageSwitcher from './LanguageSwitcher';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import logo from '@/assets/bhoomix-logo.jpeg';
import SettingsSidebar from './SettingsSidebar';

import {
  WobloOverviewIcon,
  WobloMarketIcon,
  WobloAdvisoryIcon,
  WobloMartIcon,
  WobloPackageIcon,
} from '@/components/ui/WobloIcon';

const CTRL_BTN =
  'flex items-center justify-center rounded-full border transition-all duration-300 ' +
  'border-black/[0.08] bg-black/[0.03] text-neutral-700 hover:bg-black/[0.07] hover:text-neutral-950 ' +
  'dark:border-white/[0.12] dark:bg-white/[0.06] dark:text-white/80 dark:hover:bg-white/[0.15] dark:hover:text-white ' +
  'active:scale-95 shadow-sm';

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t, tx } = useLanguage();
  const { signOut, user } = useAuth();
  const { weather } = useWeather();
  const { defaultAddress } = useAddresses();

  const deliverTo = defaultAddress
    ? [defaultAddress.house, defaultAddress.area].filter(Boolean).join(', ') ||
      formatAddress(defaultAddress)
    : null;

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);

  const initials = (user?.email ?? 'PA').slice(0, 2).toUpperCase();

  // Cmd/Ctrl-K keyboard shortcut to focus search
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    trackSearch(query.trim());
    navigate(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  const navItems = [
    { path: '/', icon: WobloOverviewIcon, label: t('home') || 'Home' },
    { path: '/agri-market', icon: WobloMarketIcon, label: t('agriMarket') || 'Agri Market' },
    { path: '/kisan-help', icon: WobloAdvisoryIcon, label: t('kisanHelp') || 'Crop Advisory' },
    { path: '/kisan-mart', icon: WobloMartIcon, label: t('kisanMart') || 'AgriNova Mart' },
    { path: '/orders', icon: WobloPackageIcon, label: t('myOrders') || 'Orders' },
  ];

  return (
    <nav className="sticky top-3 z-50 mx-3 lg:mx-5 xl:mx-6 transition-all duration-300">
      <div
        className="relative flex h-[68px] items-center justify-between gap-3 overflow-hidden rounded-full border px-3 sm:px-4 backdrop-blur-2xl
                   border-black/[0.07] bg-white/80 shadow-[0_4px_24px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04),inset_0_1px_1px_rgba(255,255,255,0.9)]
                   dark:border-white/[0.14] dark:bg-black/60 dark:shadow-[0_8px_32px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.12)]"
      >
        {/* Specular top highlight line for physical depth */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-8 -top-px h-[1.5px] bg-gradient-to-r from-transparent via-primary/40 to-transparent dark:via-primary/50"
        />

        {/* LEFT SECTION: Brand, Weather Pill, and Delivery Address */}
        <div className="flex flex-shrink-0 items-center gap-2 sm:gap-3">
          {/* Brand Logo & Name */}
          <Link
            to="/"
            className="group flex flex-shrink-0 items-center gap-2.5 transition-transform duration-300 hover:scale-[1.02]"
          >
            <div className="relative overflow-hidden rounded-full ring-2 ring-black/5 dark:ring-white/10 transition-all group-hover:ring-primary/40">
              <img
                src={logo}
                alt="BhoomiX"
                className="h-9 w-9 rounded-full object-cover"
              />
            </div>
            <span className="font-display text-base font-bold tracking-tight sm:inline">
              <GradientText animationSpeed={8}>BhoomiX</GradientText>
            </span>
          </Link>

          {/* Weather Capsule */}
          <div
            className="hidden items-center gap-2 rounded-full border py-1.5 pl-3 pr-3.5 transition-colors sm:flex
                       border-black/[0.07] bg-black/[0.035] hover:bg-black/[0.05]
                       dark:border-white/[0.12] dark:bg-white/[0.06] dark:hover:bg-white/[0.09]"
          >
            <span className="flex items-center gap-1.5 text-xs font-medium text-neutral-700 dark:text-white/90">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              {weather.city}
            </span>
            <span className="h-3.5 w-px bg-black/10 dark:bg-white/15" />
            <span className="flex items-center gap-1.5 text-xs font-semibold text-neutral-900 dark:text-white">
              <WeatherIcon icon={weather.conditionIcon} className="h-3.5 w-3.5 text-primary" />
              <span>{weather.temperature}°</span>
              <span className="hidden text-[11px] font-normal text-neutral-500 dark:text-white/60 md:inline">
                {weather.condition}
              </span>
            </span>
          </div>

          {/* Delivery Address Capsule (Left side) */}
          <Link
            to="/addresses"
            title={deliverTo ?? undefined}
            className="hidden items-center gap-2 rounded-full border py-1.5 pl-3 pr-3.5 transition-all md:flex
                       border-black/[0.07] bg-black/[0.035] hover:bg-black/[0.06] hover:border-primary/30
                       dark:border-white/[0.12] dark:bg-white/[0.06] dark:hover:bg-white/[0.1] dark:hover:border-primary/40
                       min-w-0 max-w-[210px] lg:max-w-[240px]"
          >
            <MapPin className="h-4 w-4 flex-shrink-0 text-primary" />
            <div className="min-w-0 flex-1">
              <span className="block text-[10px] font-medium uppercase tracking-wider text-neutral-500 dark:text-white/60 leading-tight">
                {defaultAddress
                  ? tx('Deliver to', 'यहाँ डिलीवरी')
                  : tx('Set location', 'स्थान चुनें')}
              </span>
              <span className="block truncate text-xs font-bold text-neutral-900 dark:text-white leading-tight">
                {deliverTo ?? tx('Add address', 'पता जोड़ें')}
              </span>
            </div>
            <ChevronDown className="h-3.5 w-3.5 flex-shrink-0 text-neutral-400 dark:text-white/45" />
          </Link>
        </div>

        {/* CENTER SECTION: Smooth, Focused Search Bar */}
        <div className="flex flex-1 items-center justify-center px-1 sm:px-3">
          <form
            onSubmit={handleSearch}
            className="group relative w-full max-w-xs transition-all duration-300 focus-within:max-w-md lg:max-w-md lg:focus-within:max-w-lg"
          >
            <Search
              strokeWidth={2}
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400 transition-colors group-focus-within:text-primary dark:text-white/45"
            />
            <input
              ref={searchRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={tx('Search crops, products, advisory…', 'फसल, उत्पाद, सलाह खोजें…')}
              className="h-10 w-full rounded-full border pl-10 pr-14 text-xs font-medium outline-none transition-all duration-300
                         border-black/[0.07] bg-black/[0.035] text-neutral-900 placeholder:text-neutral-400
                         focus:border-primary/50 focus:bg-white focus:shadow-[0_0_0_3px_hsl(var(--primary)/0.12)]
                         dark:border-white/[0.12] dark:bg-white/[0.06] dark:text-white dark:placeholder:text-white/45
                         dark:focus:border-primary/60 dark:focus:bg-black/60 dark:focus:shadow-[0_0_0_3px_hsl(var(--primary)/0.25)]"
            />
            <kbd
              className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 items-center gap-0.5 rounded-full border px-1.5 py-0.5 text-[9px] font-semibold sm:flex
                         border-black/10 bg-black/5 text-neutral-400 dark:border-white/15 dark:bg-white/10 dark:text-white/40"
            >
              <Command className="h-2.5 w-2.5" />K
            </kbd>
          </form>
        </div>

        {/* RIGHT SECTION: Controls, Language, Settings, Profile */}
        <div className="flex flex-shrink-0 items-center gap-1.5 sm:gap-2">
          {/* Notifications */}
          <GlareHover className="hidden sm:inline-flex rounded-full">
            <button
              onClick={() =>
                toast(tx('No new notifications', 'कोई नई सूचना नहीं'), {
                  description: tx("You're all caught up 🌾", 'आप अप-टू-डेट हैं 🌾'),
                })
              }
              aria-label="Notifications"
              className={`${CTRL_BTN} relative h-9 w-9 sm:h-10 sm:w-10`}
            >
              <Bell strokeWidth={2} className="h-4 w-4" />
              <span className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full bg-primary ring-2 ring-white dark:ring-black" />
            </button>
          </GlareHover>

          {/* Language Switcher */}
          <div className="hidden md:block">
            <LanguageSwitcher />
          </div>

          {/* Settings Button */}
          <GlareHover className="rounded-full">
            <button
              onClick={() => setSettingsOpen(true)}
              aria-label="Settings"
              className={`${CTRL_BTN} h-9 w-9 sm:h-10 sm:w-10`}
            >
              <SettingsIcon strokeWidth={2} className="h-4 w-4 transition-transform duration-500 hover:rotate-90" />
            </button>
          </GlareHover>

          {/* Logout Button */}
          <GlareHover className="hidden rounded-full lg:inline-flex">
            <button
              onClick={signOut}
              aria-label="Sign out"
              className={`${CTRL_BTN} h-9 w-9 sm:h-10 sm:w-10`}
            >
              <LogOut strokeWidth={2} className="h-4 w-4" />
            </button>
          </GlareHover>

          {/* User Profile Avatar with Glow / StarBorder */}
          <StarBorder
            as="button"
            onClick={() => navigate('/settings')}
            title={user?.email ?? undefined}
            speed="4s"
            className="transition-transform duration-300 hover:scale-105"
          >
            <span className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-gradient-to-tr from-emerald-600 to-teal-400 text-white text-xs font-bold shadow-md">
              {initials}
            </span>
          </StarBorder>

          {/* Mobile Sheet Menu Trigger */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <button
                aria-label="Menu"
                className={`${CTRL_BTN} h-9 w-9 sm:h-10 sm:w-10 md:hidden`}
              >
                <Menu strokeWidth={2} className="h-4 w-4" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[85vw] max-w-sm border-l border-border bg-background/95 backdrop-blur-2xl">
              <SheetHeader className="mb-6">
                <SheetTitle className="font-display text-xl font-bold">
                  <GradientText>{t('menu') || 'Menu'}</GradientText>
                </SheetTitle>
              </SheetHeader>
              <div className="space-y-3">
                <div className="mb-4 border-b border-border pb-4">
                  <LanguageSwitcher />
                </div>

                {/* Mobile Delivery Address */}
                <Link
                  to="/addresses"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 rounded-2xl p-3 border border-border/50 bg-muted/40 transition-colors"
                >
                  <MapPin className="h-4 w-4 text-primary" />
                  <div className="min-w-0 flex-1">
                    <span className="block text-[10px] font-semibold text-muted-foreground uppercase">
                      {defaultAddress ? tx('Deliver to', 'यहाँ डिलीवरी') : tx('Set location', 'स्थान चुनें')}
                    </span>
                    <span className="block truncate text-xs font-bold text-foreground">
                      {deliverTo ?? tx('Add address', 'पता जोड़ें')}
                    </span>
                  </div>
                </Link>

                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 rounded-2xl p-3.5 transition-all duration-300 ${
                        active
                          ? 'bg-primary/10 font-bold text-primary shadow-sm'
                          : 'text-muted-foreground hover:bg-foreground/[0.06] hover:text-foreground'
                      }`}
                    >
                      <Icon strokeWidth={2} className="h-5 w-5" />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  );
                })}

                <Button
                  variant="outline"
                  onClick={signOut}
                  className="mt-6 w-full justify-start gap-3 p-3.5 rounded-2xl border-border"
                >
                  <LogOut strokeWidth={2} className="h-5 w-5 text-destructive" />
                  <span className="font-semibold">{tx('Sign Out', 'साइन आउट')}</span>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <SettingsSidebar open={settingsOpen} onOpenChange={setSettingsOpen} />
    </nav>
  );
};

export default Navigation;
