import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, ChevronsRight, LogOut, UserRound } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useAccount } from '@/hooks/useAccount';
import { useOrderCount } from '@/hooks/useOrderCount';
import { cn } from '@/lib/utils';
import { SidebarSkin } from '@/components/sidebar/SidebarSkin';
import { PeelEdge } from '@/components/sidebar/PeelEdge';
import { NavIcon } from '@/components/sidebar/icons';
import { NAV, findActive, type NavEntry } from '@/components/sidebar/nav';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

/**
 * The application sidebar.
 *
 * Its one unusual idea is the theme change. Instead of cross-fading colours,
 * the outgoing skin is drawn a second time on top of the incoming one and
 * clipped along a moving cubic Bézier, so the old theme peels off the panel
 * like a sheet lifting — up when going to day, down when going to night. The
 * curve is rebuilt every frame from 28 interpolated points, `PeelEdge` draws
 * the crease and its shadow, and the whole thing runs on one rAF loop rather
 * than a CSS transition because the clip-path is recomputed, not tweened.
 *
 * Everything the panel shows is real. The design this came from carried
 * invented figures against each row and a stock portrait of a stranger as the
 * signed-in user; those are gone, replaced by the router's own notion of where
 * you are, the order count from Supabase, and the actual account.
 *
 * Radii are written as arbitrary pixel values on purpose. This project remaps
 * Tailwind's `rounded-xl/2xl/3xl` onto a four-step token scale, so the named
 * utilities would collapse the design's three distinct corner sizes into one.
 */
export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { tx } = useLanguage();
  const { theme, setTheme } = useTheme();
  const { user, signOut } = useAuth();
  const { accountType, fullName } = useAccount();
  const orderCount = useOrderCount();

  const [query, setQuery] = useState('');
  const [openGroupId, setOpenGroupId] = useState<string | null>(null);
  const [hoveredRailId, setHoveredRailId] = useState<string | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);

  const isDark = theme === 'dark';
  const { id: activeId, subId: activeSubId } = useMemo(
    () => findActive(location.pathname),
    [location.pathname],
  );

  /* ---------------- Peel animation ---------------- */

  const [isPeeling, setIsPeeling] = useState(false);
  const [peelProgress, setPeelProgress] = useState(0);
  const [peelDirection, setPeelDirection] = useState<'to-light' | 'to-dark'>('to-light');
  const rafRef = useRef<number | null>(null);
  const prevThemeRef = useRef(theme);

  const runPeel = useCallback((direction: 'to-light' | 'to-dark') => {
    setPeelDirection(direction);
    setIsPeeling(true);
    setPeelProgress(0);

    const start = performance.now();
    const DURATION = 1400;

    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    const step = (now: number) => {
      const t = Math.min((now - start) / DURATION, 1);
      // Perlin's quintic smoothstep: zero velocity *and* zero acceleration at
      // both ends, which is what stops the sheet from visibly jerking as it
      // starts to lift.
      setPeelProgress(t * t * t * (t * (t * 6 - 15) + 10));
      if (t < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        setIsPeeling(false);
        setPeelProgress(1);
      }
    };
    rafRef.current = requestAnimationFrame(step);
  }, []);

  useEffect(() => {
    if (prevThemeRef.current === theme) return;
    prevThemeRef.current = theme;

    // Anyone who has asked for reduced motion gets the colour change with no
    // sheet at all; a 1400ms full-panel wipe is exactly what that setting is
    // asking us not to do.
    const reduced =
      typeof window !== 'undefined' &&
      (window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
        document.documentElement.classList.contains('prefs-no-motion'));
    if (reduced) return;

    runPeel(theme === 'light' ? 'to-light' : 'to-dark');
  }, [theme, runPeel]);

  useEffect(() => () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); }, []);

  /* ---------------- Interaction ---------------- */

  // A search that survives collapsing would filter the rail invisibly.
  useEffect(() => { if (collapsed) setQuery(''); }, [collapsed]);

  // Keep the guides group open whenever one of its pages is showing.
  useEffect(() => {
    if (activeSubId) setOpenGroupId('farming-guides');
  }, [activeSubId]);

  // '/' focuses search, expanding the rail first if it is closed.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== '/') return;
      const el = e.target as HTMLElement | null;
      if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el?.isContentEditable) {
        return;
      }
      e.preventDefault();
      if (collapsed) onToggle();
      setTimeout(() => document.getElementById('sidebar-search-input')?.focus(), 180);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [collapsed, onToggle]);

  // Dismiss the account card on an outside click or Escape.
  useEffect(() => {
    if (!profileOpen) return;
    const onDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('#sidebar-profile-card') || target.closest('#sidebar-profile-trigger')) return;
      setProfileOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => e.key === 'Escape' && setProfileOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onEsc);
    };
  }, [profileOpen]);

  const navItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return NAV;
    return NAV.filter((item) =>
      [
        item.label.en,
        item.label.hi,
        item.tagline.en,
        item.tagline.hi,
        ...(item.children?.flatMap((c) => [c.label.en, c.label.hi]) ?? []),
      ]
        .join(' ')
        .toLowerCase()
        .includes(q),
    );
  }, [query]);

  const handleItemClick = (entry: NavEntry) => {
    setHoveredRailId(null);
    if (!entry.children) return;
    // A group row has nowhere to navigate. In the rail there is no room to
    // show children, so it opens the panel instead of toggling nothing.
    if (collapsed) {
      onToggle();
      setOpenGroupId(entry.id);
      return;
    }
    setOpenGroupId((current) => (current === entry.id ? null : entry.id));
  };

  /* ---------------- Identity ---------------- */

  const emailName = (user?.email ?? '').split('@')[0];
  const userLabel = fullName || emailName || tx('Signed in', 'साइन इन');
  // Unicode-aware, so a Devanagari name yields Devanagari initials rather
  // than being stripped to nothing by an A–Z character class.
  const userInitials =
    ((fullName || emailName || '').match(/\p{L}+/gu) ?? [])
      .slice(0, 2)
      .map((word) => word[0])
      .join('')
      .toUpperCase() || 'BX';

  const ROLE_LABELS: Record<string, { en: string; hi: string }> = {
    farmer: { en: 'Farmer account', hi: 'किसान खाता' },
    buyer: { en: 'Buyer account', hi: 'खरीदार खाता' },
    partner: { en: 'Partner account', hi: 'पार्टनर खाता' },
    manager: { en: 'Manager account', hi: 'मैनेजर खाता' },
    admin: { en: 'Admin account', hi: 'एडमिन खाता' },
  };
  const roleLabel = ROLE_LABELS[accountType] ?? ROLE_LABELS.farmer;
  const userRole = tx(roleLabel.en, roleLabel.hi);

  /* ---------------- Peel geometry ---------------- */

  // Four control heights, in percent of panel height, describing where the
  // boundary sits at the left edge, two interior control points, and the right
  // edge. `billow` bows the middle so the sheet reads as flexing rather than
  // sliding; `sWarp` adds the second-order ripple that keeps it from looking
  // like a rigid ruler.
  let yLeft: number, cp1Y: number, cp2Y: number, yRight: number;
  if (peelDirection === 'to-light') {
    const baseLeft = 118 - 138 * peelProgress;
    const baseRight = 106 - 138 * peelProgress;
    const billow = -12 * Math.sin(peelProgress * Math.PI);
    const sWarp = 3.5 * Math.sin(peelProgress * Math.PI * 2);
    yLeft = baseLeft;
    yRight = baseRight;
    cp1Y = baseLeft + (baseRight - baseLeft) * 0.35 + billow + sWarp;
    cp2Y = baseLeft + (baseRight - baseLeft) * 0.7 + billow - sWarp;
  } else {
    const baseLeft = -20 + 138 * peelProgress;
    const baseRight = -32 + 138 * peelProgress;
    const billow = 12 * Math.sin(peelProgress * Math.PI);
    const sWarp = 3.5 * Math.sin(peelProgress * Math.PI * 2);
    yLeft = baseLeft;
    yRight = baseRight;
    cp1Y = baseLeft + (baseRight - baseLeft) * 0.35 + billow + sWarp;
    cp2Y = baseLeft + (baseRight - baseLeft) * 0.7 + billow - sWarp;
  }

  const clipPath = useMemo(() => {
    const pts = ['0% 0%', '100% 0%'];
    const STEPS = 28;
    for (let i = 0; i <= STEPS; i++) {
      const t = 1 - i / STEPS;
      const inv = 1 - t;
      const y =
        inv * inv * inv * yLeft +
        3 * inv * inv * t * cp1Y +
        3 * inv * t * t * cp2Y +
        t * t * t * yRight;
      pts.push(`${Math.round(t * 1000) / 10}% ${Math.round(y * 100) / 100}%`);
    }
    return `polygon(${pts.join(', ')})`;
  }, [yLeft, cp1Y, cp2Y, yRight]);

  // Fade the leading edge in and out so neither end of the peel starts or
  // finishes on a hard rectangle.
  const overlayOpacity =
    peelDirection === 'to-light'
      ? peelProgress > 0.85
        ? Math.max(0, (1 - peelProgress) / 0.15)
        : 1
      : peelProgress < 0.15
        ? Math.min(1, peelProgress / 0.15)
        : 1;

  // While peeling, the base layer always shows the incoming theme and the
  // overlay always shows the outgoing one.
  const baseTheme = isPeeling ? theme : theme;
  const overlayTheme: 'dark' | 'light' = theme === 'dark' ? 'light' : 'dark';

  const skinProps = {
    isCollapsed: collapsed,
    navItems,
    activeId,
    activeSubId,
    openGroupId,
    searchQuery: query,
    orderCount,
    userLabel,
    userInitials,
    userRole,
    profileOpen,
  };

  const hovered = hoveredRailId ? NAV.find((n) => n.id === hoveredRailId) : undefined;

  /* The account popover. Positioned by the footer that owns it — an earlier
     revision pinned it `bottom-[86px]` from the panel, which landed it exactly
     on top of the Settings row the moment the footer's height changed. */
  const profileCard = (
    <AnimatePresence>
{profileOpen && (
          <motion.div
          id="sidebar-profile-card"
          initial={{ opacity: 0, y: 16, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.96 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className={cn(
            'absolute bottom-full z-50 mb-2 w-64 rounded-[18px] border p-4 shadow-2xl backdrop-blur-md',
            // Expanded: directly above the footer. Collapsed: out to the
            // right, because 256px of card will not fit in a 76px rail.
            collapsed ? 'left-[calc(100%+14px)] bottom-2' : 'left-0',
            isDark
            ? 'border-white/15 bg-[#18161D]/[0.98] text-white shadow-black/80'
            : 'border-neutral-200 bg-white/[0.98] text-[#121015] shadow-xl',
          )}
          >
          <div className={cn('mb-3 flex items-center gap-3 border-b pb-3', isDark ? 'border-white/10' : 'border-neutral-200')}>
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#8AC637] text-sm font-bold text-[#121015] ring-2 ring-[#8AC637]/40">
            {userInitials}
            </span>
            <span className="min-w-0">
            <span className="block truncate text-sm font-bold">{userLabel}</span>
            <span className="block text-[11px] font-medium text-[#8AC637]">{userRole}</span>
            </span>
          </div>

          {user?.email && (
            <p className={cn('mb-3 truncate text-xs', isDark ? 'text-neutral-400' : 'text-neutral-600')}>
            {user.email}
            </p>
          )}

          <div className={cn('flex items-center justify-between border-t pt-3 text-xs', isDark ? 'border-white/10' : 'border-neutral-200')}>
            <button
            type="button"
            onClick={() => {
              setProfileOpen(false);
              navigate('/settings');
            }}
            className="flex items-center gap-1.5 font-semibold text-[#8AC637] hover:underline"
            >
            <UserRound className="h-3.5 w-3.5" />
            {tx('Account settings', 'खाता सेटिंग्स')}
            </button>
            <button
            type="button"
            onClick={() => {
              setProfileOpen(false);
              void signOut();
            }}
            className="flex items-center gap-1.5 font-medium text-rose-400 transition-colors hover:text-rose-300"
            >
            <LogOut className="h-3.5 w-3.5" />
            {tx('Sign out', 'साइन आउट')}
            </button>
          </div>
          </motion.div>
        )}
          </AnimatePresence>
  );

  return (
    <aside
      /* Width is a CSS transition rather than a framer `animate`, for two
         reasons. Animating `width` in JS forces a synchronous layout on every
         frame of the spring, which is the one property you least want on the
         main thread. And the app's `.prefs-no-motion` rule already disables
         CSS transitions globally, so the reduced-motion preference is honoured
         here for free instead of needing a second code path.

         The easing overshoots slightly past 1 so the panel still lands with a
         bit of spring rather than easing flatly into place. */
      style={{
        width: collapsed ? 76 : 272,
        transition: 'width 420ms cubic-bezier(0.34, 1.4, 0.36, 1)',
        willChange: 'width',
      }}
      className="fixed bottom-3 left-3 top-3 z-40 hidden select-none flex-col rounded-[34px] lg:flex"
    >
      {/* Collapse handle, straddling the right edge. */}
      <motion.button
        type="button"
        onClick={onToggle}
        whileHover={{ scale: 1.15 }}
        whileTap={{ scale: 0.92 }}
        aria-label={collapsed ? tx('Expand sidebar', 'साइडबार खोलें') : tx('Collapse sidebar', 'साइडबार बंद करें')}
        className={cn(
          'absolute -right-3.5 top-8 z-50 flex h-7 w-7 items-center justify-center rounded-full',
          'bg-white text-[#110F13] shadow-lg transition-colors hover:bg-neutral-100',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8AC637]',
          isDark ? 'shadow-black/60 ring-2 ring-[#100E13]' : 'border border-neutral-200 ring-2 ring-white',
        )}
      >
        <motion.span
          animate={{ rotate: collapsed ? 0 : 180 }}
          transition={{ type: 'spring', stiffness: 320, damping: 22 }}
          className="flex items-center justify-center"
        >
          <ChevronsRight className="h-3.5 w-3.5" />
        </motion.span>
      </motion.button>

      {/* Base layer: the live, interactive sidebar in the current theme. */}
      <SidebarSkin
        {...skinProps}
        theme={baseTheme}
        profileCard={profileCard}
        onSearchChange={setQuery}
        onItemClick={handleItemClick}
        onProfileToggle={() => setProfileOpen((o) => !o)}
        onThemeChange={setTheme}
        onRailHover={(id) => setHoveredRailId(collapsed ? id : null)}
      />

      {/* Peel layer: the outgoing theme, clipped along the moving curve. */}
      {isPeeling && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-30 overflow-hidden rounded-[34px]"
          style={{
            clipPath,
            WebkitClipPath: clipPath,
            opacity: overlayOpacity,
            willChange: 'clip-path, opacity',
          }}
        >
          <SidebarSkin {...skinProps} theme={overlayTheme} isOverlay />
        </div>
      )}

      {isPeeling && (
        <PeelEdge
          yLeft={yLeft}
          cp1Y={cp1Y}
          cp2Y={cp2Y}
          yRight={yRight}
          isDarkOnTop={overlayTheme === 'dark'}
        />
      )}

      {/* Rail flyout. The collapsed sidebar shows icons only, so hovering one
          has to say where it goes — the label alone is too thin for that. */}
      <AnimatePresence>
        {collapsed && hovered && (
          <motion.div
            key={hovered.id}
            initial={{ opacity: 0, x: -14, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -8, scale: 0.92 }}
            transition={{ type: 'spring', damping: 26, stiffness: 450, mass: 0.7 }}
            onMouseEnter={() => setHoveredRailId(hovered.id)}
            onMouseLeave={() => setHoveredRailId(null)}
            className="absolute left-[calc(100%+14px)] top-1/2 z-50 -translate-y-1/2"
            style={{
              filter: isDark
                ? 'drop-shadow(0 14px 28px rgba(0,0,0,0.75)) drop-shadow(0 0 16px rgba(138,198,55,0.22))'
                : 'drop-shadow(0 12px 24px rgba(0,0,0,0.12))',
            }}
          >
            <span
              aria-hidden
              className={cn(
                'absolute -left-2 top-1/2 h-0 w-0 -translate-y-1/2 border-y-[7px] border-r-[8px] border-y-transparent',
                isDark ? 'border-r-[#18161D]' : 'border-r-white',
              )}
            />
            <div
              className={cn(
                'w-64 rounded-[18px] border p-3.5 backdrop-blur-md',
                isDark
                  ? 'border-white/10 bg-[#18161D]/[0.98] text-white shadow-2xl'
                  : 'border-neutral-200 bg-white/[0.98] text-[#121015] shadow-xl',
              )}
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="rounded-full bg-gradient-to-r from-[#8AC637] via-[#B8E65B] to-[#6EB322] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#121015]">
                  {tx(hovered.category.en, hovered.category.hi)}
                </span>
                {activeId === hovered.id && (
                  <span className="flex items-center gap-1 text-[10px] font-semibold text-[#8AC637]">
                    <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-[#8AC637]" />
                    {tx('Current', 'अभी यहीं')}
                  </span>
                )}
              </div>

              <div className="mb-1.5 flex items-center gap-2.5">
                <span
                  className={cn(
                    'rounded-[12px] border p-1.5 text-[#8AC637]',
                    isDark ? 'border-white/10 bg-white/5' : 'border-neutral-200 bg-neutral-50',
                  )}
                >
                  <NavIcon name={hovered.icon} className="h-4 w-4" />
                </span>
                <span className="text-sm font-bold tracking-tight">
                  {tx(hovered.label.en, hovered.label.hi)}
                </span>
              </div>

              <p className={cn('mb-2.5 text-[11.5px] leading-relaxed', isDark ? 'text-neutral-400' : 'text-neutral-600')}>
                {tx(hovered.tagline.en, hovered.tagline.hi)}
              </p>

              {hovered.children ? (
                <div className="space-y-1">
                  {hovered.children.map((sub) => (
                    <Link
                      key={sub.id}
                      to={sub.path}
                      onClick={() => setHoveredRailId(null)}
                      className={cn(
                        'flex items-center gap-2 rounded-[12px] px-2.5 py-1.5 text-xs font-semibold transition-colors',
                        isDark ? 'hover:bg-white/10' : 'hover:bg-neutral-100',
                      )}
                    >
                      <NavIcon name={sub.icon} className="h-3.5 w-3.5 text-[#8AC637]" />
                      {tx(sub.label.en, sub.label.hi)}
                    </Link>
                  ))}
                </div>
              ) : (
                <Link
                  to={hovered.path ?? '/'}
                  onClick={() => setHoveredRailId(null)}
                  className={cn(
                    'flex w-full items-center justify-center gap-1.5 rounded-[12px] px-3 py-1.5 text-xs font-bold transition-colors',
                    activeId === hovered.id
                      ? 'bg-[#8AC637] text-[#121015] hover:bg-[#97D442]'
                      : isDark
                        ? 'bg-white/10 text-white hover:bg-white/15'
                        : 'bg-neutral-900 text-white hover:bg-neutral-800',
                  )}
                >
                  <span>{tx(hovered.action.en, hovered.action.hi)}</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </aside>
  );
}
