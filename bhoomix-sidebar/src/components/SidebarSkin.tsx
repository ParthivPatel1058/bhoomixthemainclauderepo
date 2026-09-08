import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GooeyInput } from '@/components/ui/gooey-input';
import { DayNightSwitch } from './DayNightSwitch';
import { MedtbankLogo } from './MedtbankLogo';
import {
  NavIcon,
  ChevronRight,
  LogOut,
  Settings,
  Activity,
  ArrowRight,
  Sliders,
  CheckCircle2,
} from './NavIcons';
import { ThemeMode, NavItem } from '../types';

export interface SidebarSkinProps {
  theme: ThemeMode;
  isCollapsed: boolean;
  searchQuery: string;
  setSearchQuery?: (query: string) => void;
  filteredNavItems: NavItem[];
  activeItem: string;
  activeSubItem: string;
  isSubmenuOpen: boolean;
  hoveredRailItem?: string | null;
  setHoveredRailItem?: (id: string | null) => void;
  profilePopupOpen?: boolean;
  setProfilePopupOpen?: (open: boolean) => void;
  selectedPlot?: 'Plot A' | 'Plot B';
  setSelectedPlot?: (plot: 'Plot A' | 'Plot B') => void;
  handleItemClick?: (id: string, hasSubmenu?: boolean) => void;
  handleSubItemClick?: (subId: string) => void;
  handleThemeSwitch?: (newTheme: ThemeMode) => void;
  clickedRippleId?: string | null;
  isOverlay?: boolean;
  showTooltipOnRail?: boolean;
  railHoverTimeoutRef?: React.MutableRefObject<NodeJS.Timeout | null>;
}

export const SidebarSkin: React.FC<SidebarSkinProps> = ({
  theme,
  isCollapsed,
  searchQuery,
  setSearchQuery,
  filteredNavItems,
  activeItem,
  activeSubItem,
  isSubmenuOpen,
  hoveredRailItem,
  setHoveredRailItem,
  profilePopupOpen = false,
  setProfilePopupOpen,
  selectedPlot = 'Plot A',
  setSelectedPlot,
  handleItemClick,
  handleSubItemClick,
  handleThemeSwitch,
  clickedRippleId,
  isOverlay = false,
  showTooltipOnRail = true,
  railHoverTimeoutRef,
}) => {
  const isDark = theme === 'dark';

  const bgClass = isDark
    ? 'bg-[#100E13] border border-white/[0.06] shadow-2xl shadow-black/80'
    : 'bg-[#FFFFFF] border border-black/[0.05] shadow-2xl shadow-neutral-300/40';

  const textColor = isDark ? 'text-white' : 'text-[#121015]';
  const mutedText = isDark ? 'text-[#8E8A98]' : 'text-[#6C7280]';
  const dividerColor = isDark ? 'border-white/[0.08]' : 'border-neutral-200/80';

  return (
    <div
      className={`relative flex flex-col w-full h-full min-h-[840px] rounded-[34px] select-none transition-colors duration-[1400ms] ease-[cubic-bezier(0.76,0,0.24,1)] ${bgClass} ${
        isOverlay ? 'pointer-events-none' : ''
      }`}
      aria-hidden={isOverlay}
    >
      {/* Header with Logo & Search Input */}
      <div className="pt-6 pb-4 px-3">
        <div className="flex items-center px-2.5">
          <MedtbankLogo
            theme={theme}
            collapsed={isCollapsed}
            onClick={() => handleItemClick?.('overview')}
          />
        </div>

        {/* Gooey Liquid Search Bar (expanded mode) */}
        {!isCollapsed && (
          <div className="overflow-visible py-1 flex items-center justify-center mt-3.5">
            <GooeyInput
              id={isOverlay ? 'sidebar-search-input-overlay' : 'sidebar-search-input'}
              placeholder="Search modules..."
              value={searchQuery}
              onValueChange={isOverlay ? undefined : setSearchQuery}
              collapsedWidth={115}
              expandedWidth={195}
              expandedOffset={40}
              gooeyBlur={4}
              className="w-full"
            />
          </div>
        )}
      </div>

      {/* Top Divider */}
      <div className={`mx-4 border-t ${dividerColor} transition-colors duration-[1400ms] ease-[cubic-bezier(0.76,0,0.24,1)]`} />

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-4 space-y-1.5">
        {filteredNavItems.length === 0 && (
          <div className={`py-8 text-center text-xs ${isDark ? 'text-neutral-500' : 'text-neutral-400'}`}>
            No results for &ldquo;{searchQuery}&rdquo;
          </div>
        )}

        {filteredNavItems.map((item) => {
          const isActive = activeItem === item.id;
          const showSub = isActive && item.hasSubmenu && isSubmenuOpen && !isCollapsed;
          const isHoveredOnRail = hoveredRailItem === item.id;

          return (
            <div key={item.id} className="relative">
              {/* Main Nav Button */}
              <button
                id={isOverlay ? undefined : `nav-item-${item.id}`}
                onClick={isOverlay ? undefined : () => handleItemClick?.(item.id, item.hasSubmenu)}
                onMouseEnter={
                  isOverlay || !setHoveredRailItem
                    ? undefined
                    : () => {
                        if (railHoverTimeoutRef?.current) clearTimeout(railHoverTimeoutRef.current);
                        setHoveredRailItem(item.id);
                      }
                }
                onMouseLeave={
                  isOverlay || !setHoveredRailItem
                    ? undefined
                    : () => {
                        if (railHoverTimeoutRef) {
                          railHoverTimeoutRef.current = setTimeout(() => {
                            setHoveredRailItem(null);
                          }, 180);
                        }
                      }
                }
                tabIndex={isOverlay ? -1 : 0}
                className={`group relative flex w-full items-center h-11 px-2.5 rounded-2xl transition-colors duration-150 cursor-pointer overflow-hidden ${
                  isActive
                    ? textColor
                    : `${mutedText} ${
                        isDark
                          ? 'hover:text-white hover:bg-white/[0.04]'
                          : 'hover:text-[#121015] hover:bg-neutral-100/70'
                      }`
                }`}
              >
                {/* Active Item Background Pill */}
                {isActive && (
                  <div
                    className={`absolute inset-0 rounded-2xl shadow-xs transition-colors ${
                      isDark
                        ? 'bg-gradient-to-r from-white/10 via-white/8 to-white/5 border border-white/10'
                        : 'bg-neutral-100/90 border border-neutral-200/80 shadow-xs'
                    }`}
                  />
                )}

                {/* Left Section: Icon Container with Glow */}
                <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-xl transition-all duration-200 ${
                      isActive
                        ? isDark
                          ? 'bg-white text-[#121015] shadow-xs'
                          : 'bg-[#121015] text-white shadow-xs'
                        : 'bg-transparent text-current'
                    }`}
                  >
                    <NavIcon
                      name={item.icon}
                      className={`w-[18px] h-[18px] transition-colors ${
                        isActive
                          ? isDark
                            ? 'text-[#121015]'
                            : 'text-white'
                          : isDark
                          ? 'text-[#8E8A98] group-hover:text-white'
                          : 'text-[#6C7280] group-hover:text-[#121015]'
                      }`}
                    />
                  </div>

                  {/* Badge for Collapsed Rail Mode */}
                  {isCollapsed && item.badge && (
                    <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-[#8AC637] text-[9.5px] font-bold text-[#121015] shadow-sm ring-1 ring-[#100E13]">
                      {item.badge}
                    </span>
                  )}
                </div>

                {/* Right Section: Label, Badge, Chevron */}
                <div
                  className="relative z-10 flex-1 flex items-center justify-between min-w-0 pl-3 transition-opacity duration-150 overflow-hidden"
                  style={{
                    opacity: isCollapsed ? 0 : 1,
                    pointerEvents: isCollapsed ? 'none' : 'auto',
                  }}
                >
                  <span
                    className={`text-[14px] font-medium tracking-tight whitespace-nowrap truncate ${
                      isActive
                        ? isDark
                          ? 'text-white font-medium'
                          : 'text-[#121015] font-semibold'
                        : ''
                    }`}
                  >
                    {item.label}
                  </span>

                  <div className="flex items-center gap-1.5 shrink-0 pl-2">
                    {item.badge && (
                      <span
                        className={`flex h-5 min-w-5 px-1.5 items-center justify-center rounded-full text-[10.5px] font-bold shadow-xs ${
                          item.badgeType === 'warning'
                            ? 'bg-amber-500 text-neutral-950'
                            : item.badgeType === 'success'
                            ? 'bg-[#8AC637] text-neutral-950'
                            : item.badgeType === 'accent'
                            ? 'bg-[#8AC637] text-neutral-950'
                            : 'bg-[#2563EB] text-white'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}

                    {item.hasSubmenu ? (
                      <div
                        className={`transition-transform duration-200 ${
                          showSub ? 'rotate-90 text-[#8AC637]' : ''
                        }`}
                      >
                        <ChevronRight className="h-3.5 w-3.5" />
                      </div>
                    ) : item.hasChevron ? (
                      <ChevronRight
                        className={`h-3.5 w-3.5 transition-colors ${
                          isActive
                            ? isDark
                              ? 'text-white'
                              : 'text-[#121015]'
                            : isDark
                            ? 'text-[#504C5A] group-hover:text-[#8E8A98]'
                            : 'text-[#9CA3AF] group-hover:text-[#6C7280]'
                        }`}
                      />
                    ) : null}
                  </div>
                </div>
              </button>

              {/* Submenu Accordion for Farming Guides (only on interactive base layer) */}
              {!isOverlay && showSub && item.subItems && (
                <div className="overflow-hidden pl-7 pr-1 pt-1 pb-1 space-y-1">
                  {item.subItems.map((sub) => {
                    const isSubActive = activeSubItem === sub.id;
                    return (
                      <button
                        key={sub.id}
                        id={`sub-item-${sub.id}`}
                        onClick={() => handleSubItemClick?.(sub.id)}
                        className={`group relative flex w-full items-center justify-between h-9 px-3 rounded-xl text-[13px] transition-colors cursor-pointer ${
                          isSubActive
                            ? `${textColor} font-semibold ${
                                isDark
                                  ? 'bg-[#8AC637]/15 text-[#8AC637] border border-[#8AC637]/30'
                                  : 'bg-[#8AC637]/15 text-neutral-950 font-bold border border-[#8AC637]/40'
                              }`
                            : `${mutedText} ${
                                isDark
                                  ? 'hover:text-white hover:bg-white/[0.04]'
                                  : 'hover:text-[#121015] hover:bg-neutral-100'
                              }`
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span
                            className={`h-1.5 w-1.5 rounded-full transition-colors ${
                              isSubActive
                                ? 'bg-[#8AC637] ring-2 ring-[#8AC637]/40'
                                : isDark
                                ? 'bg-neutral-600 group-hover:bg-neutral-400'
                                : 'bg-neutral-300 group-hover:bg-neutral-500'
                            }`}
                          />
                          <span className="truncate">{sub.label}</span>
                        </div>
                        {sub.desc && (
                          <span className="text-[10px] text-neutral-400 opacity-60 hidden group-hover:inline">
                            Guide
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Bottom Divider */}
      <div className={`mx-4 border-t ${dividerColor} transition-colors duration-300`} />

      {/* Footer Area */}
      <div className="p-3 space-y-2 relative">
        {/* Settings & Sign Out */}
        <div className="space-y-0.5">
          <button
            id={isOverlay ? undefined : 'sidebar-settings-btn'}
            onClick={isOverlay ? undefined : () => handleItemClick?.('settings')}
            tabIndex={isOverlay ? -1 : 0}
            className={`group flex w-full items-center h-10 px-2.5 rounded-2xl transition-colors cursor-pointer overflow-hidden ${mutedText} ${
              isDark ? 'hover:text-white hover:bg-white/[0.04]' : 'hover:text-[#121015] hover:bg-neutral-100/70'
            }`}
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center">
              <Settings className="w-[18px] h-[18px]" />
            </div>
            <div
              className="flex-1 flex items-center justify-between min-w-0 pl-3 transition-opacity duration-150 overflow-hidden"
              style={{
                opacity: isCollapsed ? 0 : 1,
                pointerEvents: isCollapsed ? 'none' : 'auto',
              }}
            >
              <span className="text-[13.5px] font-medium tracking-tight whitespace-nowrap truncate">
                Settings
              </span>
            </div>
          </button>
        </div>

        {/* User Profile Box */}
        <div
          id={isOverlay ? undefined : 'user-profile-trigger-btn'}
          onClick={isOverlay || !setProfilePopupOpen ? undefined : () => setProfilePopupOpen(!profilePopupOpen)}
          className={`flex items-center h-11 px-2.5 rounded-2xl transition-colors cursor-pointer overflow-hidden ${
            isDark
              ? profilePopupOpen
                ? 'bg-white/10 text-white'
                : 'hover:bg-white/[0.04]'
              : profilePopupOpen
              ? 'bg-neutral-100'
              : 'hover:bg-neutral-100/60'
          }`}
        >
          <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full ring-1 ring-[#8AC637]/60 shadow-sm flex items-center justify-center">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80"
              alt="Jason Brown"
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
                const parent = (e.target as HTMLElement).parentElement;
                if (parent) {
                  parent.innerHTML =
                    '<div class="w-full h-full bg-neutral-700 flex items-center justify-center text-xs font-bold text-white">JB</div>';
                }
              }}
            />
            <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-[#8AC637] ring-1 ring-[#100E13]" />
          </div>

          <div
            className="flex-1 flex items-center justify-between min-w-0 pl-3 transition-opacity duration-150 overflow-hidden"
            style={{
              opacity: isCollapsed ? 0 : 1,
              pointerEvents: isCollapsed ? 'none' : 'auto',
            }}
          >
            <div className="flex flex-col min-w-0">
              <span
                className={`text-[13.5px] font-semibold tracking-tight ${textColor} whitespace-nowrap truncate`}
              >
                Jason Brown
              </span>
              <span className="text-[10px] text-[#8AC637] font-medium truncate">
                Green Valley Farm &bull; {selectedPlot}
              </span>
            </div>

            <div
              className={`p-1.5 rounded-lg transition-colors shrink-0 ${mutedText} ${
                isDark ? 'hover:text-white hover:bg-white/5' : 'hover:text-[#121015] hover:bg-neutral-100'
              }`}
            >
              <LogOut className="h-4 w-4" />
            </div>
          </div>
        </div>

        {/* Day / Night Theme Switcher Section */}
        {!isCollapsed ? (
          <div
            id={isOverlay ? undefined : 'sidebar-theme-switch-container'}
            className={`relative flex items-center justify-between px-3.5 py-2 rounded-2xl transition-colors duration-[1400ms] ease-[cubic-bezier(0.76,0,0.24,1)] ${
              isDark
                ? 'bg-[#18161D]/95 border border-white/[0.08]'
                : 'bg-[#F1F3F7] border border-neutral-200/80 shadow-xs'
            }`}
          >
            <div className="flex flex-col min-w-0 pr-1">
              <span
                className={`text-[12px] font-semibold tracking-tight transition-colors duration-[1400ms] ease-[cubic-bezier(0.76,0,0.24,1)] ${
                  isDark ? 'text-white' : 'text-[#121015]'
                }`}
              >
                {isDark ? 'Night Mode' : 'Day Mode'}
              </span>
              <span
                className={`text-[10px] transition-colors duration-[1400ms] ease-[cubic-bezier(0.76,0,0.24,1)] ${
                  isDark ? 'text-[#8E8A98]' : 'text-neutral-500'
                }`}
              >
                {isDark ? 'Dark theme' : 'Light theme'}
              </span>
            </div>

            <div className="flex items-center justify-center shrink-0">
              <DayNightSwitch
                id={isOverlay ? 'sidebar-theme-switch-overlay' : 'sidebar-theme-switch-dn'}
                checked={isDark}
                scale={0.68}
                showLabels={true}
                onChange={isOverlay ? undefined : (checked) => handleThemeSwitch?.(checked ? 'dark' : 'light')}
                title="Toggle Day / Night theme"
              />
            </div>
          </div>
        ) : (
          /* Collapsed Mini Rail Theme Switcher */
          <div
            id={isOverlay ? undefined : 'sidebar-rail-theme-switch-container'}
            className={`flex items-center justify-center py-2.5 px-0.5 rounded-2xl mx-auto transition-colors duration-[1400ms] ease-[cubic-bezier(0.76,0,0.24,1)] overflow-hidden ${
              isDark ? 'bg-[#18161D] border border-white/5' : 'bg-[#F1F3F7] border border-neutral-200'
            }`}
          >
            <DayNightSwitch
              id={isOverlay ? 'sidebar-rail-theme-switch-overlay' : 'sidebar-rail-theme-switch-dn'}
              checked={isDark}
              scale={0.48}
              showLabels={false}
              onChange={isOverlay ? undefined : (checked) => handleThemeSwitch?.(checked ? 'dark' : 'light')}
              title="Toggle Day / Night theme"
            />
          </div>
        )}
      </div>
    </div>
  );
};
