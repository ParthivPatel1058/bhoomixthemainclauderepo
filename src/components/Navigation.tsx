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
import SpotlightSearch from '@/components/ui/spotlight-search';
import { useAuth } from '@/contexts/AuthContext';
import { useWeather } from '@/hooks/useWeather';
import { useAddresses, formatAddress } from '@/hooks/useAddresses';
import { WeatherIcon } from './WeatherWidget';
import WeatherPopover from './WeatherPopover';
import GradientText from '@/components/ui/gradient-text';
import GlareHover from '@/components/ui/glare-hover';
import LanguageSwitcher from './LanguageSwitcher';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import logo from '@/assets/bhoomix-logo.jpeg';
import SettingsSidebar from './SettingsSidebar';

import {
  WobloOverviewIcon,
  WobloMarketIcon,
  WobloAdvisoryIcon,
  WobloPackageIcon,
} from '@/components/ui/WobloIcon';

/* Round control buttons on the bar. One set of tones, not two: the bar is ink
   in both themes now, so the light-mode half these used to carry would paint
   dark ink on a dark ground.

   The last two fragments also used to join without a space between them,
   which silently produced `hover:text-whiteactive:scale-95` — one class that
   does not exist in place of two that do, so neither the hover colour nor the
   press feedback was ever applied. */
const CTRL_BTN =
  'flex items-center justify-center rounded-full border shadow-sm ' +
  'transition-[transform,box-shadow,border-color,background-color,color] duration-300 ' +
  'border-white/[0.12] bg-white/[0.06] text-white/75 ' +
  'hover:bg-white/[0.14] hover:text-white hover:border-white/20 ' +
  'active:scale-95';

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
  const [spotlight, setSpotlight] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  const initials = (user?.email ?? 'PA').slice(0, 2).toUpperCase();

  // Cmd/Ctrl-K opens the spotlight. The badge in the search field has
  // advertised this shortcut all along, but it only focused the inline input —
  // which is not what a ⌘K badge means to anyone who has used one.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSpotlight(true);
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
    { path: '/orders', icon: WobloPackageIcon, label: t('myOrders') || 'Orders' },
  ];

  return (
    <>
    <SpotlightSearch open={spotlight} onClose={() => setSpotlight(false)} />
    <nav className="sticky top-2 z-50 mx-3 lg:mx-5 xl:mx-6 transition-[transform,box-shadow,border-color,background-color,color,opacity,filter] duration-300">
      <div
        /* One treatment for both themes: a deep ink-green glass bar.
           The light theme used to paint this white, which put a white pill on
           a white page on every inner screen and left the bar with nothing to
           be. Committing to ink instead gives the chrome a colour of its own,
           holds the wordmark and the ochre against a constant ground rather
           than one that flips, and keeps the same bar legible over the hero
           photograph where a white one was washing out against the sky.

           The border is warm rather than neutral so the edge picks up the
           ochre rather than reading as a grey outline. */
        className="relative flex h-[52px] items-center justify-between gap-3 overflow-hidden rounded-full border px-2.5 sm:px-3.5 border-[hsl(38_40%_70%_/_0.16)] bg-[hsl(162_26%_9%_/_0.82)] backdrop-blur-xl backdrop-saturate-150 shadow-[0_1px_0_hsl(0_0%_100%_/_0.09)_inset,0_14px_38px_-14px_hsl(160_40%_3%_/_0.60)]"
      >
        {/* Specular top highlight line for physical depth */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-10 -top-px h-px bg-gradient-to-r from-transparent via-primary/45 to-transparent"
        />

        {/* LEFT SECTION: Brand, Weather Pill, and Delivery Address */}
        <div className="flex flex-shrink-0 items-center gap-2 sm:gap-3">
          {/* Brand Logo & Name */}
          <Link
            to="/"
            className="group flex flex-shrink-0 items-center gap-2.5 transition-transform duration-300 hover:scale-[1.02]"
          >
            <div className="relative overflow-hidden rounded-full ring-white/10 transition-[transform,box-shadow,border-color,background-color,color,opacity,filter] group-hover:ring-primary/40">
              <img
                src={logo}
                alt="bhoomix"
                className="h-8 w-8 rounded-full object-cover"
              />
            </div>
            <span className="font-display text-[15px] font-bold tracking-[-0.03em] text-white sm:inline">
              bhoomi<span className="text-[hsl(38_82%_64%)]">x</span>
            </span>
          </Link>

          {/* Weather capsule — opens the macOS-style panel */}
          <WeatherPopover>
          <button
            type="button"
            aria-label="Weather forecast"
            className="hidden items-center gap-2 rounded-full border py-1 pl-2.5 pr-3 text-xs transition-colors sm:flex border-white/[0.12] bg-white/[0.06] hover:bg-white/[0.09] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70"
          >
            <span className="flex items-center gap-1.5 font-medium text-white/90">
              {/* A lit dot, not a pulsing one. The ping this replaced ran on
                  every route for the life of the session; the glow reads as
                  "live" without keeping a compositor layer awake. */}
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_0_2.5px_hsl(152_60%_45%_/_0.22)]" />
              {weather.city}
            </span>
            <span className="h-3 w-px bg-white/15" />
            <span className="flex items-center gap-1.5 font-semibold text-white">
              <WeatherIcon icon={weather.conditionIcon} className="h-3.5 w-3.5 text-primary" />
              <span>{weather.temperature}°</span>
              <span className="hidden font-normal text-white/60 md:inline">
                {weather.condition}
              </span>
            </span>
          </button>
          </WeatherPopover>

          {/* Delivery Address Capsule (Left side) */}
          <Link
            to="/addresses"
            title={deliverTo ?? undefined}
            className="hidden items-center gap-2 rounded-full border py-1 pl-2.5 pr-3 transition-[transform,box-shadow,border-color,background-color,color,opacity,filter] md:flex border-white/[0.12] bg-white/[0.06] hover:bg-white/[0.1] hover:border-primary/40 min-w-0 max-w-[200px] lg:max-w-[230px]"
          >
            <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-primary" />
            <div className="min-w-0 flex-1">
              <span className="block text-[9px] font-medium uppercase tracking-wider text-white/60 leading-[1.2]">
                {defaultAddress
                  ? tx('Deliver to', 'यहाँ डिलीवरी')
                  : tx('Set location', 'स्थान चुनें')}
              </span>
              <span className="block truncate text-[11px] font-bold text-white leading-[1.25]">
                {deliverTo ?? tx('Add address', 'पता जोड़ें')}
              </span>
            </div>
            <ChevronDown className="h-3 w-3 flex-shrink-0 text-white/45" />
          </Link>
        </div>

        {/* CENTER SECTION: Smooth, Focused Search Bar */}
        <div className="flex flex-1 items-center justify-center px-1 sm:px-3">
          <form
            onSubmit={handleSearch}
            className="group relative w-full max-w-xs transition-[transform,box-shadow,border-color,background-color,color,opacity,filter] duration-300 focus-within:max-w-md lg:max-w-md lg:focus-within:max-w-lg"
          >
            <Search
              strokeWidth={2}
              className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 transition-colors group-focus-within:text-primary text-white/45"
            />
            <input
              ref={searchRef}
              value={query}
              readOnly
              onFocus={() => setSpotlight(true)}
              onClick={() => setSpotlight(true)}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={tx('Search crops, products, advisory…', 'फसल, उत्पाद, सलाह खोजें…')}
              className="h-8 w-full rounded-full border pl-9 pr-14 text-[13px] font-medium outline-none transition-[transform,box-shadow,border-color,background-color,color,opacity,filter] duration-300 border-white/[0.12] bg-white/[0.06] text-white placeholder:text-white/45 focus:border-primary/60 focus:bg-black/60 focus:shadow-[0_0_0_3px_hsl(var(--primary)/0.25)]"
            />
            <kbd
              className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 items-center gap-0.5 rounded-full border px-1.5 py-0.5 font-semibold sm:flex border-white/15 bg-white/10 text-white/40"
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
              className={`${CTRL_BTN} relative h-8 w-8 sm:h-9 sm:w-9`}
            >
              <Bell strokeWidth={2} className="h-4 w-4" />
              <span className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full bg-primary ring-black" />
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
              className={`${CTRL_BTN} h-8 w-8 sm:h-9 sm:w-9`}
            >
              <SettingsIcon strokeWidth={2} className="h-4 w-4 transition-transform duration-500 hover:rotate-90" />
            </button>
          </GlareHover>

          {/* Logout Button */}
          <GlareHover className="hidden rounded-full lg:inline-flex">
            <button
              onClick={signOut}
              aria-label="Sign out"
              className={`${CTRL_BTN} h-8 w-8 sm:h-9 sm:w-9`}
            >
              <LogOut strokeWidth={2} className="h-4 w-4" />
            </button>
          </GlareHover>

          {/* User profile.
              This used to be wrapped in StarBorder, which kept two orbiting
              radial gradients animating for the life of the session on every
              route. A warm hairline that lifts on hover carries the same
              "this is you" weight for none of the frame budget. */}
          <button
            onClick={() => navigate('/settings')}
            title={user?.email ?? undefined}
            aria-label="Profile and settings"
            className="group/av rounded-full outline-none ring-offset-0 transition-transform duration-300 hover:scale-105 focus-visible:ring-2 focus-visible:ring-primary/70"
          >
            <span className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-gradient-to-tr from-emerald-600 to-teal-400 text-[11px] font-bold text-white ring-1 ring-[hsl(38_60%_72%_/_0.35)] transition-[box-shadow] duration-300 group-hover/av:ring-[hsl(38_82%_64%_/_0.7)]">
              {initials}
            </span>
          </button>

          {/* Mobile Sheet Menu Trigger */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <button
                aria-label="Menu"
                className={`${CTRL_BTN} h-8 w-8 sm:h-9 sm:w-9 md:hidden`}
              >
                <Menu strokeWidth={2} className="h-4 w-4" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[85vw] max-w-sm border-l border-white/[0.12] bg-background/95 backdrop-blur-2xl">
              <SheetHeader className="mb-6">
                <SheetTitle className="font-display text-xl font-bold">
                  <GradientText>{t('menu') || 'Menu'}</GradientText>
                </SheetTitle>
              </SheetHeader>
              <div className="space-y-3">
                <div className="mb-4 border-b border-white/[0.12] pb-4">
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
                    <span className="block text-[10px] font-semibold text-white/65 uppercase">
                      {defaultAddress ? tx('Deliver to', 'यहाँ डिलीवरी') : tx('Set location', 'स्थान चुनें')}
                    </span>
                    <span className="block truncate text-xs font-bold text-white">
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
                      className={`flex items-center gap-3 rounded-2xl p-3.5 transition-[transform,box-shadow,border-color,background-color,color,opacity,filter] duration-300 ${
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
                  className="mt-6 w-full justify-start gap-3 p-3.5 rounded-2xl border-white/[0.12]"
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
    </>
  );
};

export default Navigation;
