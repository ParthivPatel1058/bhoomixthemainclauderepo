import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, LogOut, Settings as SettingsIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { NavIcon, LeafMark } from './icons';
import { GooeyInput } from './GooeyInput';
import { DayNightSwitch } from './DayNightSwitch';
import type { NavEntry } from './nav';

/**
 * One complete face of the sidebar, in one theme.
 *
 * It is a separate component from the sidebar itself because the peel needs
 * two of them at once: the incoming theme underneath, and the outgoing theme
 * clipped along the curve on top. Everything the peel does is achieved by
 * rendering this twice with different `theme` values, which is why it takes
 * all its state as props and owns none.
 *
 * `isOverlay` marks the copy that is only ever looked at. That copy renders
 * plain elements instead of links, drops every id and handler, is removed from
 * the accessibility tree and is untabbable — otherwise a theme change would
 * briefly double every link in the navigation and put a second search field
 * with the same id into the document.
 */

export interface SidebarSkinProps {
  theme: 'dark' | 'light';
  isCollapsed: boolean;
  navItems: NavEntry[];
  activeId: string;
  activeSubId: string | null;
  openGroupId: string | null;
  searchQuery: string;
  orderCount: number;
  userLabel: string;
  userInitials: string;
  userRole: string;
  profileOpen: boolean;

  /**
   * The account popover. Rendered inside the footer rather than positioned
   * against the panel with a hard-coded offset, so it sits above the footer
   * whatever that footer's height turns out to be.
   */
  profileCard?: ReactNode;

  /** Omitted on the overlay copy, which is inert by construction. */
  onSearchChange?: (value: string) => void;
  onItemClick?: (entry: NavEntry) => void;
  onProfileToggle?: () => void;
  onThemeChange?: (theme: 'dark' | 'light') => void;
  onRailHover?: (id: string | null) => void;
  isOverlay?: boolean;
}

export function SidebarSkin({
  theme,
  isCollapsed,
  navItems,
  activeId,
  activeSubId,
  openGroupId,
  searchQuery,
  orderCount,
  userLabel,
  userInitials,
  userRole,
  profileOpen,
  profileCard,
  onSearchChange,
  onItemClick,
  onProfileToggle,
  onThemeChange,
  onRailHover,
  isOverlay = false,
}: SidebarSkinProps) {
  const { tx } = useLanguage();
  const isDark = theme === 'dark';

  const shell = isDark
    ? 'bg-[#100E13] border border-white/[0.06] shadow-2xl shadow-black/80'
    : 'bg-white border border-black/[0.05] shadow-2xl shadow-neutral-300/40';
  const textColor = isDark ? 'text-white' : 'text-[#121015]';
  const mutedText = isDark ? 'text-[#8E8A98]' : 'text-[#6C7280]';
  const divider = isDark ? 'border-white/[0.08]' : 'border-neutral-200/80';
  const hoverRow = isDark
    ? 'hover:text-white hover:bg-white/[0.04]'
    : 'hover:text-[#121015] hover:bg-neutral-100/70';

  /**
   * A nav row is a router link on the live copy and a plain span on the
   * overlay. Wrapping the choice here keeps the row markup written once.
   */
  const Row = ({
    to,
    onClick,
    className,
    children,
    id,
    onMouseEnter,
    onMouseLeave,
  }: {
    to: string | null;
    onClick?: () => void;
    className: string;
    children: ReactNode;
    id?: string;
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
  }) => {
    if (isOverlay) {
      return (
        <span className={className} aria-hidden>
          {children}
        </span>
      );
    }
    if (to) {
      return (
        <Link
          to={to}
          id={id}
          onClick={onClick}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          className={className}
        >
          {children}
        </Link>
      );
    }
    return (
      <button
        type="button"
        id={id}
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        className={cn(className, 'w-full text-left')}
      >
        {children}
      </button>
    );
  };

  return (
    <div
      aria-hidden={isOverlay}
      className={cn(
        'relative flex h-full w-full flex-col overflow-hidden rounded-[34px] select-none',
        'transition-colors duration-[1400ms] ease-[cubic-bezier(0.76,0,0.24,1)]',
        shell,
        isOverlay && 'pointer-events-none',
      )}
    >
      {/* ---- Header: mark and search ---- */}
      <div className="shrink-0 px-3 pb-4 pt-6">
        <Row
          to={isOverlay ? null : '/'}
          className="flex items-center overflow-hidden rounded-[16px] px-2.5 py-1 outline-none focus-visible:ring-2 focus-visible:ring-[#8AC637]"
        >
          <span
            className={cn(
              'flex h-8 w-8 shrink-0 items-center justify-center rounded-[12px] transition-transform duration-500',
              isDark ? 'bg-white/5' : 'bg-neutral-100',
              isCollapsed ? 'rotate-0' : '-rotate-12',
            )}
          >
            <LeafMark className="h-4 w-4 text-[#8AC637]" />
          </span>
          <span
            className="flex min-w-0 items-center overflow-hidden pl-3 transition-opacity duration-150"
            style={{ opacity: isCollapsed ? 0 : 1 }}
          >
            <span className={cn('whitespace-nowrap text-[17px] font-bold tracking-tight', textColor)}>
              Bhoomi<span className="text-[#8AC637]">X</span>
            </span>
          </span>
        </Row>

        {!isCollapsed && (
          <div className="mt-3.5 flex items-center justify-center overflow-visible py-1">
            <GooeyInput
              id={isOverlay ? undefined : 'sidebar-search-input'}
              placeholder={tx('Search menu…', 'मेन्यू खोजें…')}
              value={searchQuery}
              onValueChange={isOverlay ? undefined : onSearchChange}
              disabled={isOverlay}
              dark={isDark}
              className="w-full"
            />
          </div>
        )}
      </div>

      <div className={cn('mx-4 shrink-0 border-t transition-colors duration-[1400ms]', divider)} />

      {/* ---- Navigation ----
          Scrolls rather than forcing a minimum height. The design package
          pinned the panel at 840px, which on a 13" laptop pushed the theme
          switch and sign-out below the fold with no way to reach them. */}
      <nav
        data-lenis-prevent
        className={cn(
          'min-h-0 flex-1 space-y-1.5 overflow-y-auto overscroll-contain px-3 py-4',
          '[scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent',
          '[&::-webkit-scrollbar-thumb]:rounded-full',
          isDark
            ? '[&::-webkit-scrollbar-thumb]:bg-white/20'
            : '[&::-webkit-scrollbar-thumb]:bg-black/15',
        )}
      >
        {navItems.length === 0 && (
          <p className={cn('py-8 text-center text-xs', isDark ? 'text-neutral-500' : 'text-neutral-400')}>
            {tx(`No menu item matches “${searchQuery}”`, `“${searchQuery}” से कोई मेन्यू मेल नहीं खाता`)}
          </p>
        )}

        {navItems.map((item) => {
          const isActive = activeId === item.id;
          const showSub = Boolean(item.children) && openGroupId === item.id && !isCollapsed;
          const badge = item.badgeKey === 'orders' && orderCount > 0 ? orderCount : null;

          return (
            <div key={item.id} className="relative">
              <Row
                to={item.path}
                id={isOverlay ? undefined : `nav-item-${item.id}`}
                onClick={isOverlay ? undefined : () => onItemClick?.(item)}
                onMouseEnter={isOverlay ? undefined : () => onRailHover?.(item.id)}
                onMouseLeave={isOverlay ? undefined : () => onRailHover?.(null)}
                className={cn(
                  'group relative flex h-11 items-center overflow-hidden rounded-[16px] px-2.5',
                  'transition-colors duration-150 outline-none',
                  'focus-visible:ring-2 focus-visible:ring-[#8AC637] focus-visible:ring-offset-2',
                  isDark ? 'focus-visible:ring-offset-[#100E13]' : 'focus-visible:ring-offset-white',
                  isActive ? textColor : cn(mutedText, hoverRow),
                )}
              >
                {isActive && (
                  <span
                    aria-hidden
                    className={cn(
                      'absolute inset-0 rounded-[16px] shadow-sm',
                      isDark
                        ? 'border border-white/10 bg-gradient-to-r from-white/10 via-white/[0.08] to-white/5'
                        : 'border border-neutral-200/80 bg-neutral-100/90',
                    )}
                  />
                )}

                <span className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center">
                  <span
                    className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-[12px] transition-all duration-200',
                      isActive
                        ? isDark
                          ? 'bg-white text-[#121015] shadow-sm'
                          : 'bg-[#121015] text-white shadow-sm'
                        : 'bg-transparent text-current',
                    )}
                  >
                    <NavIcon
                      name={item.icon}
                      className={cn(
                        'h-[18px] w-[18px] transition-colors',
                        isActive
                          ? isDark
                            ? 'text-[#121015]'
                            : 'text-white'
                          : isDark
                            ? 'text-[#8E8A98] group-hover:text-white'
                            : 'text-[#6C7280] group-hover:text-[#121015]',
                      )}
                    />
                  </span>

                  {/* In the rail the badge rides on the icon. */}
                  {isCollapsed && badge && (
                    <span
                      className={cn(
                        'absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1',
                        'bg-[#8AC637] text-[9.5px] font-bold text-[#121015] shadow-sm ring-1',
                        isDark ? 'ring-[#100E13]' : 'ring-white',
                      )}
                    >
                      {badge}
                    </span>
                  )}
                </span>

                <span
                  className="relative z-10 flex min-w-0 flex-1 items-center justify-between overflow-hidden pl-3 transition-opacity duration-150"
                  style={{
                    opacity: isCollapsed ? 0 : 1,
                    pointerEvents: isCollapsed ? 'none' : 'auto',
                  }}
                >
                  <span
                    className={cn(
                      'truncate whitespace-nowrap text-[14px] tracking-tight',
                      isActive
                        ? isDark
                          ? 'font-medium text-white'
                          : 'font-semibold text-[#121015]'
                        : 'font-medium',
                    )}
                  >
                    {tx(item.label.en, item.label.hi)}
                  </span>

                  <span className="flex shrink-0 items-center gap-1.5 pl-2">
                    {badge && (
                      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#8AC637] px-1.5 text-[10.5px] font-bold text-[#121015] shadow-sm">
                        {badge}
                      </span>
                    )}
                    {item.children ? (
                      <ChevronRight
                        className={cn(
                          'h-3.5 w-3.5 transition-transform duration-200',
                          showSub && 'rotate-90 text-[#8AC637]',
                        )}
                      />
                    ) : (
                      isActive && <ChevronRight className="h-3.5 w-3.5" />
                    )}
                  </span>
                </span>
              </Row>

              {/* Submenu. Never rendered on the overlay copy — a second set of
                  links to the same routes is exactly what `isOverlay` exists
                  to prevent. */}
              {!isOverlay && showSub && item.children && (
                <div className="space-y-1 py-1 pl-7 pr-1">
                  {item.children.map((sub) => {
                    const subActive = activeSubId === sub.id;
                    return (
                      <Link
                        key={sub.id}
                        to={sub.path}
                        title={tx(sub.desc.en, sub.desc.hi)}
                        className={cn(
                          'group relative flex h-9 w-full items-center gap-2.5 rounded-[12px] px-3 text-[13px]',
                          'transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#8AC637]',
                          subActive
                            ? isDark
                              ? 'border border-[#8AC637]/30 bg-[#8AC637]/15 font-semibold text-[#8AC637]'
                              : 'border border-[#8AC637]/40 bg-[#8AC637]/15 font-bold text-neutral-950'
                            : cn(mutedText, hoverRow),
                        )}
                      >
                        <span
                          aria-hidden
                          className={cn(
                            'h-1.5 w-1.5 shrink-0 rounded-full transition-colors',
                            subActive
                              ? 'bg-[#8AC637] ring-2 ring-[#8AC637]/40'
                              : isDark
                                ? 'bg-neutral-600 group-hover:bg-neutral-400'
                                : 'bg-neutral-300 group-hover:bg-neutral-500',
                          )}
                        />
                        <span className="truncate">{tx(sub.label.en, sub.label.hi)}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className={cn('mx-4 shrink-0 border-t transition-colors duration-300', divider)} />

      {/* ---- Footer: settings, account, theme ---- */}
      <div className="relative shrink-0 space-y-2 p-3">
        {!isOverlay && profileCard}
        <Row
          to={isOverlay ? null : '/settings'}
          className={cn(
            'group flex h-10 items-center overflow-hidden rounded-[16px] px-2.5 transition-colors outline-none',
            'focus-visible:ring-2 focus-visible:ring-[#8AC637]',
            mutedText,
            hoverRow,
          )}
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center">
            <SettingsIcon className="h-[18px] w-[18px]" />
          </span>
          <span
            className="min-w-0 flex-1 overflow-hidden pl-3 transition-opacity duration-150"
            style={{ opacity: isCollapsed ? 0 : 1, pointerEvents: isCollapsed ? 'none' : 'auto' }}
          >
            <span className="truncate whitespace-nowrap text-[13.5px] font-medium tracking-tight">
              {tx('Settings', 'सेटिंग्स')}
            </span>
          </span>
        </Row>

        {/* Account. Initials, not a stock photograph — the design package
            shipped an Unsplash portrait of a stranger as the signed-in user. */}
        <button
          type="button"
          id={isOverlay ? undefined : 'sidebar-profile-trigger'}
          onClick={isOverlay ? undefined : onProfileToggle}
          tabIndex={isOverlay ? -1 : 0}
          aria-expanded={isOverlay ? undefined : profileOpen}
          aria-label={tx('Account menu', 'खाता मेन्यू')}
          className={cn(
            'flex h-11 w-full items-center overflow-hidden rounded-[16px] px-2.5 text-left transition-colors outline-none',
            'focus-visible:ring-2 focus-visible:ring-[#8AC637]',
            isDark
              ? profileOpen
                ? 'bg-white/10 text-white'
                : 'hover:bg-white/[0.04]'
              : profileOpen
                ? 'bg-neutral-100'
                : 'hover:bg-neutral-100/60',
          )}
        >
          <span className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#8AC637] text-[11px] font-bold text-[#121015] ring-1 ring-[#8AC637]/60">
            {userInitials}
            <span
              aria-hidden
              className={cn(
                'absolute bottom-0 right-0 h-2 w-2 rounded-full bg-[#8AC637] ring-1',
                isDark ? 'ring-[#100E13]' : 'ring-white',
              )}
            />
          </span>

          <span
            className="flex min-w-0 flex-1 items-center justify-between overflow-hidden pl-3 transition-opacity duration-150"
            style={{ opacity: isCollapsed ? 0 : 1, pointerEvents: isCollapsed ? 'none' : 'auto' }}
          >
            <span className="flex min-w-0 flex-col">
              <span className={cn('truncate text-[13.5px] font-semibold tracking-tight', textColor)}>
                {userLabel}
              </span>
              <span className="truncate text-[10px] font-medium text-[#8AC637]">{userRole}</span>
            </span>
            <span className={cn('shrink-0 rounded-lg p-1.5', mutedText)}>
              <LogOut className="h-4 w-4" />
            </span>
          </span>
        </button>

        {/* Theme. Expanded gets the labelled panel, the rail gets the switch
            alone at a smaller scale. */}
        {!isCollapsed ? (
          <div
            className={cn(
              'relative flex items-center justify-between rounded-[16px] px-3.5 py-2',
              'transition-colors duration-[1400ms] ease-[cubic-bezier(0.76,0,0.24,1)]',
              isDark
                ? 'border border-white/[0.08] bg-[#18161D]/95'
                : 'border border-neutral-200/80 bg-[#F1F3F7] shadow-sm',
            )}
          >
            <span className="flex min-w-0 flex-col pr-1">
              <span
                className={cn(
                  'text-[12px] font-semibold tracking-tight transition-colors duration-[1400ms]',
                  isDark ? 'text-white' : 'text-[#121015]',
                )}
              >
                {isDark ? tx('Night mode', 'रात मोड') : tx('Day mode', 'दिन मोड')}
              </span>
              <span
                className={cn(
                  'text-[10px] transition-colors duration-[1400ms]',
                  isDark ? 'text-[#8E8A98]' : 'text-neutral-500',
                )}
              >
                {isDark ? tx('Dark theme', 'गहरा थीम') : tx('Light theme', 'हल्का थीम')}
              </span>
            </span>

            <span className="flex shrink-0 items-center justify-center">
              {/* No AM/PM captions here. They cost 88px of a 272px panel and
                  say the same thing the label beside them already says, which
                  left "Night mode / Dark theme" wrapping onto three lines. */}
              <DayNightSwitch
                id={isOverlay ? undefined : 'sidebar-theme-switch'}
                checked={isDark}
                scale={0.62}
                showLabels={false}
                onChange={isOverlay ? undefined : (on) => onThemeChange?.(on ? 'dark' : 'light')}
                title={tx('Toggle day and night theme', 'दिन और रात थीम बदलें')}
              />
            </span>
          </div>
        ) : (
          <div
            className={cn(
              'mx-auto flex items-center justify-center overflow-hidden rounded-[16px] px-0.5 py-2.5',
              'transition-colors duration-[1400ms] ease-[cubic-bezier(0.76,0,0.24,1)]',
              isDark ? 'border border-white/5 bg-[#18161D]' : 'border border-neutral-200 bg-[#F1F3F7]',
            )}
          >
            <DayNightSwitch
              id={isOverlay ? undefined : 'sidebar-rail-theme-switch'}
              checked={isDark}
              scale={0.48}
              showLabels={false}
              onChange={isOverlay ? undefined : (on) => onThemeChange?.(on ? 'dark' : 'light')}
              title={tx('Toggle day and night theme', 'दिन और रात थीम बदलें')}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default SidebarSkin;
