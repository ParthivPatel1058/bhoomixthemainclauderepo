import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LeafIcon, MedtbankLogo } from './MedtbankLogo';
import {
  NavIcon,
  ChevronRight,
  ChevronUp,
  Sun,
  Moon,
  LogOut,
  X,
  Menu,
} from './NavIcons';
import { ThemeMode } from '../types';

interface MobileNavigationProps {
  theme: ThemeMode;
  activeItem: string;
  activeSubItem: string;
  isDrawerOpen: boolean;
  onToggleDrawer: () => void;
  onCloseDrawer: () => void;
  onThemeChange: (theme: ThemeMode) => void;
  onItemSelect: (itemId: string) => void;
  onSubItemSelect: (subItemId: string) => void;
}

const NAV_ITEMS = [
  { id: 'overview', label: 'Overview', icon: 'overview' },
  { id: 'stats', label: 'Stats', icon: 'stats' },
  { id: 'cards', label: 'Cards', icon: 'cards' },
  {
    id: 'activity',
    label: 'Activity',
    icon: 'activity',
    hasSubmenu: true,
    subItems: [
      { id: 'balance', label: 'Balance' },
      { id: 'spending', label: 'Spending' },
      { id: 'refunds', label: 'Refunds' },
    ],
  },
  { id: 'payment', label: 'Payment', icon: 'payment' },
  { id: 'transaction', label: 'Transaction', icon: 'transaction', badge: 3 },
  { id: 'more', label: '•••', icon: 'more' },
];

export const MobileNavigation: React.FC<MobileNavigationProps> = ({
  theme,
  activeItem,
  activeSubItem,
  isDrawerOpen,
  onToggleDrawer,
  onCloseDrawer,
  onThemeChange,
  onItemSelect,
  onSubItemSelect,
}) => {
  const isDark = theme === 'dark';
  const [submenuOpen, setSubmenuOpen] = React.useState<boolean>(true);

  const handleItemClick = (id: string, hasSubmenu?: boolean) => {
    if (hasSubmenu) {
      if (activeItem === id) {
        setSubmenuOpen(!submenuOpen);
      } else {
        setSubmenuOpen(true);
      }
    } else {
      onCloseDrawer();
    }
    onItemSelect(id);
  };

  const handleSubItemClick = (subId: string) => {
    onSubItemSelect(subId);
    onCloseDrawer();
  };

  return (
    <>
      {/* Mobile Top App Bar (visible on small screens) */}
      <header
        className={`md:hidden sticky top-0 z-40 flex items-center justify-between px-4 py-3 border-b transition-colors ${
          isDark
            ? 'bg-[#100E13]/95 border-white/[0.08] text-white backdrop-blur-md'
            : 'bg-white/95 border-neutral-200 text-neutral-900 backdrop-blur-md'
        }`}
      >
        <div className="flex items-center gap-3">
          <button
            id="mobile-hamburger-btn"
            onClick={onToggleDrawer}
            className={`p-2 rounded-xl border transition-colors ${
              isDark
                ? 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                : 'bg-neutral-100 border-neutral-200 text-neutral-800 hover:bg-neutral-200'
            }`}
            aria-label="Open Navigation Drawer"
          >
            <Menu className="w-5 h-5" />
          </button>

          <MedtbankLogo theme={theme} onClick={() => onItemSelect('overview')} />
        </div>

        <div className="flex items-center gap-2">
          {/* Quick theme toggle */}
          <button
            id="mobile-quick-theme-toggle"
            onClick={() => onThemeChange(isDark ? 'light' : 'dark')}
            className={`p-2 rounded-xl transition-colors ${
              isDark ? 'text-amber-400 hover:bg-white/5' : 'text-neutral-600 hover:bg-neutral-100'
            }`}
            aria-label="Toggle Theme"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* User profile avatar thumbnail */}
          <div className="relative h-8 w-8 rounded-full overflow-hidden ring-1 ring-white/20">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80"
              alt="Jason Brown"
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </header>

      {/* Slide-out Drawer Overlay and Panel */}
      <AnimatePresence>
        {isDrawerOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            {/* Backdrop Blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onCloseDrawer}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              aria-hidden="true"
            />

            {/* Sidebar Drawer Sheet */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 280 }}
              className={`relative z-10 w-[290px] h-full max-h-screen overflow-y-auto flex flex-col p-4 shadow-2xl transition-colors ${
                isDark
                  ? 'bg-[#100E13] text-white border-r border-white/10'
                  : 'bg-white text-neutral-900 border-r border-neutral-200'
              }`}
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-4 pt-2 border-b border-white/10">
                <MedtbankLogo theme={theme} />
                <button
                  id="mobile-close-drawer-btn"
                  onClick={onCloseDrawer}
                  className={`p-2 rounded-xl transition-colors ${
                    isDark ? 'hover:bg-white/10 text-neutral-400' : 'hover:bg-neutral-100 text-neutral-600'
                  }`}
                  aria-label="Close navigation"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Items */}
              <nav className="flex-1 py-4 space-y-1.5">
                {NAV_ITEMS.map((item) => {
                  const isActive = activeItem === item.id;
                  const showSub = isActive && item.hasSubmenu && submenuOpen;

                  return (
                    <div key={item.id} className="relative">
                      <button
                        onClick={() => handleItemClick(item.id, item.hasSubmenu)}
                        className={`relative flex w-full items-center justify-between h-11 px-3.5 rounded-2xl transition-all ${
                          isActive
                            ? isDark
                              ? 'bg-[#201D25] text-white font-semibold'
                              : 'bg-[#F4F5F8] text-[#121015] font-semibold'
                            : isDark
                            ? 'text-[#8E8A98] hover:bg-white/5 hover:text-white'
                            : 'text-[#6C7280] hover:bg-neutral-100 hover:text-neutral-900'
                        }`}
                      >
                        {/* Left Active Gradient Accent Strip */}
                        {isActive && (
                          <div
                            className="absolute left-0 top-1.5 bottom-1.5 w-[3.5px] rounded-r-full bg-gradient-to-b from-[#FF4465] via-[#A832E5] to-[#5C4DF2]"
                            aria-hidden="true"
                          />
                        )}

                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-7 w-7 items-center justify-center rounded-[8px] transition-all ${
                              isActive
                                ? isDark
                                  ? 'bg-white text-[#121015] shadow-xs'
                                  : 'bg-[#121015] text-white shadow-xs'
                                : 'bg-transparent'
                            }`}
                          >
                            <NavIcon
                              name={item.icon}
                              className={`h-4 w-4 ${
                                isActive
                                  ? isDark
                                    ? 'text-[#121015]'
                                    : 'text-white'
                                  : isDark
                                  ? 'text-[#8E8A98]'
                                  : 'text-[#6C7280]'
                              }`}
                            />
                          </div>
                          <span className="text-[14px] font-medium">{item.label}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          {item.badge && (
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#2563EB] text-[11px] font-bold text-white shadow-sm">
                              {item.badge}
                            </span>
                          )}

                          {item.hasSubmenu && (
                            <span>
                              {submenuOpen && isActive ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </span>
                          )}
                        </div>
                      </button>

                      {/* Submenu Accordion */}
                      <AnimatePresence>
                        {showSub && item.subItems && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden pl-4 pr-1 pt-1.5 space-y-1"
                          >
                            {item.subItems.map((sub) => {
                              const isSubActive = activeSubItem === sub.id;
                              return (
                                <button
                                  key={sub.id}
                                  onClick={() => handleSubItemClick(sub.id)}
                                  className={`flex w-full items-center justify-between h-9 px-3.5 rounded-xl text-[13.5px] transition-colors ${
                                    isSubActive
                                      ? isDark
                                        ? 'bg-[#292631] text-white font-medium'
                                        : 'bg-[#EAECEF] text-[#121015] font-medium'
                                      : isDark
                                      ? 'text-[#8E8A98] hover:text-white'
                                      : 'text-[#6C7280] hover:text-neutral-900'
                                  }`}
                                >
                                  <span>{sub.label}</span>
                                  <ChevronRight className="h-3.5 w-3.5 opacity-50" />
                                </button>
                              );
                            })}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </nav>

              {/* Bottom Section */}
              <div className="pt-3 border-t border-white/10 space-y-3">
                {/* Settings */}
                <button
                  onClick={() => {
                    onItemSelect('settings');
                    onCloseDrawer();
                  }}
                  className={`relative flex w-full items-center gap-3 h-11 px-3.5 rounded-2xl text-[14px] ${
                    activeItem === 'settings'
                      ? isDark
                        ? 'bg-[#201D25] text-white'
                        : 'bg-[#F4F5F8] text-neutral-900'
                      : isDark
                      ? 'text-[#8E8A98]'
                      : 'text-[#6C7280]'
                  }`}
                >
                  {activeItem === 'settings' && (
                    <div
                      className="absolute left-0 top-1.5 bottom-1.5 w-[3.5px] rounded-r-full bg-gradient-to-b from-[#FF4465] via-[#A832E5] to-[#5C4DF2]"
                      aria-hidden="true"
                    />
                  )}
                  <div
                    className={`flex h-7 w-7 items-center justify-center rounded-[8px] transition-all ${
                      activeItem === 'settings'
                        ? isDark
                          ? 'bg-white text-[#121015] shadow-xs'
                          : 'bg-[#121015] text-white shadow-xs'
                        : 'bg-transparent'
                    }`}
                  >
                    <NavIcon
                      name="settings"
                      className={`h-4 w-4 ${
                        activeItem === 'settings'
                          ? isDark
                            ? 'text-[#121015]'
                            : 'text-white'
                          : isDark
                          ? 'text-[#8E8A98]'
                          : 'text-[#6C7280]'
                      }`}
                    />
                  </div>
                  <span className="font-medium">Settings</span>
                </button>

                {/* Profile Box */}
                <div
                  className={`flex items-center justify-between px-3 py-2 rounded-2xl ${
                    isDark ? 'bg-white/5' : 'bg-neutral-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full overflow-hidden ring-1 ring-white/10">
                      <img
                        src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80"
                        alt="Jason Brown"
                        referrerPolicy="no-referrer"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="text-xs font-bold leading-tight">Jason Brown</p>
                      <p className="text-[10px] text-neutral-400">jason@medtbank.com</p>
                    </div>
                  </div>
                  <LogOut className="w-4 h-4 opacity-70" />
                </div>

                {/* Theme Switcher */}
                <div
                  className={`flex items-center p-1 rounded-full ${
                    isDark ? 'bg-[#18161D]' : 'bg-[#F1F3F7]'
                  }`}
                >
                  <button
                    onClick={() => onThemeChange('light')}
                    className={`relative flex-1 flex items-center justify-center gap-2 py-2 text-xs rounded-full transition-all ${
                      !isDark ? 'text-white font-semibold' : 'text-[#8E8A98]'
                    }`}
                  >
                    {!isDark && (
                      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#F04469] via-[#9934E2] to-[#5C4DF2]" />
                    )}
                    <span className="relative z-10 flex items-center gap-1.5">
                      <Sun className="h-3.5 w-3.5" /> Light
                    </span>
                  </button>

                  <button
                    onClick={() => onThemeChange('dark')}
                    className={`relative flex-1 flex items-center justify-center gap-2 py-2 text-xs rounded-full transition-all ${
                      isDark ? 'text-white font-semibold' : 'text-[#6C7280]'
                    }`}
                  >
                    {isDark && (
                      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#F04469] via-[#9934E2] to-[#5C4DF2]" />
                    )}
                    <span className="relative z-10 flex items-center gap-1.5">
                      <Moon className="h-3.5 w-3.5" /> Dark
                    </span>
                  </button>
                </div>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* Mobile Bottom Dock Bar (quick access bar on mobile devices) */}
      <nav
        aria-label="Mobile Bottom Navigation"
        className={`md:hidden fixed bottom-3 left-4 right-4 z-30 flex items-center justify-around py-2.5 px-3 rounded-full border shadow-2xl backdrop-blur-xl transition-all ${
          isDark
            ? 'bg-[#100E13]/90 border-white/10 text-white'
            : 'bg-white/95 border-neutral-200 text-neutral-800 shadow-neutral-400/20'
        }`}
      >
        <button
          id="mobile-bottom-overview"
          onClick={() => onItemSelect('overview')}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-medium transition-colors ${
            activeItem === 'overview'
              ? isDark
                ? 'text-white font-bold'
                : 'text-neutral-900 font-bold'
              : 'text-neutral-400'
          }`}
        >
          <NavIcon name="overview" className="w-5 h-5" />
          <span>Overview</span>
        </button>

        <button
          id="mobile-bottom-activity"
          onClick={() => onItemSelect('activity')}
          className={`relative flex flex-col items-center gap-0.5 text-[10px] font-medium transition-colors ${
            activeItem === 'activity'
              ? 'text-rose-500 font-bold'
              : 'text-neutral-400'
          }`}
        >
          {activeItem === 'activity' && (
            <span className="absolute -top-1 w-1 h-1 rounded-full bg-rose-500" />
          )}
          <NavIcon name="activity" className="w-5 h-5" />
          <span>Activity</span>
        </button>

        <button
          id="mobile-bottom-cards"
          onClick={() => onItemSelect('cards')}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-medium transition-colors ${
            activeItem === 'cards'
              ? isDark
                ? 'text-white font-bold'
                : 'text-neutral-900 font-bold'
              : 'text-neutral-400'
          }`}
        >
          <NavIcon name="cards" className="w-5 h-5" />
          <span>Cards</span>
        </button>

        <button
          id="mobile-bottom-transaction"
          onClick={() => onItemSelect('transaction')}
          className={`relative flex flex-col items-center gap-0.5 text-[10px] font-medium transition-colors ${
            activeItem === 'transaction'
              ? isDark
                ? 'text-white font-bold'
                : 'text-neutral-900 font-bold'
              : 'text-neutral-400'
          }`}
        >
          <span className="absolute -top-1 right-2 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#2563EB] text-[9px] font-bold text-white">
            3
          </span>
          <NavIcon name="transaction" className="w-5 h-5" />
          <span>History</span>
        </button>

        <button
          id="mobile-bottom-menu"
          onClick={onToggleDrawer}
          className="flex flex-col items-center gap-0.5 text-[10px] font-medium text-neutral-400 hover:text-white"
        >
          <Menu className="w-5 h-5" />
          <span>More</span>
        </button>
      </nav>
    </>
  );
};
