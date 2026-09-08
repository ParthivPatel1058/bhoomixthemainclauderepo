import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronsRight, Activity, ArrowRight, LogOut, CheckCircle2, Sliders } from 'lucide-react';
import { NavIcon } from './NavIcons';
import { SidebarSkin } from './SidebarSkin';
import { PeelingEdgeOverlay } from './PeelingEdgeOverlay';
import { ThemeMode, SidebarState, NavItem } from '../types';

export interface MedtbankSidebarProps {
  theme?: ThemeMode;
  state?: SidebarState;
  activeItem?: string;
  activeSubItem?: string;
  forceSubmenuOpen?: boolean;
  showTooltipOnRail?: boolean;
  onThemeChange?: (theme: ThemeMode) => void;
  onStateChange?: (state: SidebarState) => void;
  onItemSelect?: (itemId: string) => void;
  onSubItemSelect?: (subItemId: string) => void;
  className?: string;
  isInteractive?: boolean;
  peelProgress?: number; // Optional manual peel scrub: 0.0 to 1.0
  isPeelFrozen?: boolean; // Optional freeze at 0.5 (exact 52% / 28% screenshot angle)
  onTriggerPeel?: () => void;
  peelTrigger?: { id: number; direction: 'to-light' | 'to-dark' } | null;
  onPeelProgress?: (progress: number, direction: 'to-light' | 'to-dark', isPeeling: boolean) => void;
}

const NAV_ITEMS: NavItem[] = [
  {
    id: 'overview',
    label: 'Overview',
    icon: 'overview',
    hasChevron: true,
    tagline: 'Farm operations & health dashboard',
    stat: '42.5 Acres active',
    category: 'Core',
    quickAction: 'Open Dashboard',
  },
  {
    id: 'crop-intelligence',
    label: 'Crop Intelligence',
    icon: 'crop-intelligence',
    tagline: 'Satellite multispectral & NDVI analysis',
    stat: 'NDVI 0.84 • Peak Biomass',
    category: 'Analytics',
    badge: 'Live',
    badgeType: 'success',
    quickAction: 'View NDVI Heatmap',
  },
  {
    id: 'crop-advisory',
    label: 'Crop Advisory',
    icon: 'crop-advisory',
    tagline: 'AI agronomist recommendations & spray alerts',
    stat: '3 Urgent alerts',
    category: 'Advisory',
    badge: 3,
    badgeType: 'warning',
    quickAction: 'Check Alerts',
  },
  {
    id: 'agri-market',
    label: 'Agri Market',
    icon: 'agri-market',
    tagline: 'Verified agricultural inputs & seed marketplace',
    stat: '28 Sellers nearby',
    category: 'Commerce',
    quickAction: 'Browse Store',
  },
  {
    id: 'farming-guides',
    label: 'Farming Guides',
    icon: 'farming-guides',
    hasSubmenu: true,
    tagline: 'Step-by-step agronomy cultivation protocols',
    stat: '3 Modules ready',
    category: 'Guides',
    subItems: [
      { id: 'organic', label: 'Organic', icon: 'organic', desc: 'Zero chemical pest & soil enrichment' },
      { id: 'vegetable', label: 'Vegetable', icon: 'vegetable', desc: 'High-yield seasonal horticulture' },
      { id: 'robotic', label: 'Robotic', icon: 'robotic', desc: 'Drone surveying & autonomous weeding' },
    ],
    quickAction: 'Explore Guides',
  },
  {
    id: 'mandi-prices',
    label: 'Mandi Prices',
    icon: 'mandi-prices',
    tagline: 'Live commodity wholesale rates from APMC',
    stat: 'Wheat: ₹2,420/q (+4.2%)',
    category: 'Market',
    quickAction: 'Check APMC Rates',
  },
  {
    id: 'damage-claim',
    label: 'Damage Claim',
    icon: 'damage-claim',
    tagline: 'PMFBY crop loss surveyor assessment',
    stat: 'Claim #BH-892 Reviewing',
    category: 'Insurance',
    quickAction: 'Track Claim',
  },
  {
    id: 'schemes',
    label: 'Schemes',
    icon: 'schemes',
    tagline: 'Central & State agricultural subsidies',
    stat: 'PM-Kisan 17th Active',
    category: 'Government',
    badge: 'New',
    badgeType: 'accent',
    quickAction: 'Apply Online',
  },
  {
    id: 'orders',
    label: 'Orders',
    icon: 'orders',
    tagline: 'Fertilizer, seed & machinery delivery log',
    stat: '2 Dispatched',
    category: 'Logistics',
    badge: 2,
    badgeType: 'default',
    quickAction: 'Track Delivery',
  },
];

/**
 * Generates an organically curved polygon clip-path with 28 interpolated cubic Bezier points
 * matching the fluid macOS Genie effect warping dynamics.
 */
function getCubicCurvedClipPath(
  yLeft: number,
  cp1Y: number,
  cp2Y: number,
  yRight: number
): string {
  const points: string[] = ['0% 0%', '100% 0%'];

  const steps = 28;
  for (let i = 0; i <= steps; i++) {
    const t = 1 - i / steps; // from 1 (right, x=100%) down to 0 (left, x=0%)
    const x = Math.round(t * 1000) / 10;
    const inv = 1 - t;
    // Cubic Bezier interpolation:
    const y =
      inv * inv * inv * yLeft +
      3 * inv * inv * t * cp1Y +
      3 * inv * t * t * cp2Y +
      t * t * t * yRight;
    points.push(`${x}% ${Math.round(y * 100) / 100}%`);
  }

  return `polygon(${points.join(', ')})`;
}

/**
 * Perlin's quintic smoothstep easing for zero acceleration jerk at start and end.
 * Produces macOS Genie-like velvety butter smoothness.
 */
function genieSmoothStep(t: number): number {
  return t * t * t * (t * (t * 6 - 15) + 10);
}

export const MedtbankSidebar: React.FC<MedtbankSidebarProps> = ({
  theme: controlledTheme,
  state: controlledState,
  activeItem: controlledActiveItem,
  activeSubItem: controlledActiveSubItem,
  forceSubmenuOpen,
  showTooltipOnRail = true,
  onThemeChange,
  onStateChange,
  onItemSelect,
  onSubItemSelect,
  className = '',
  isInteractive = true,
  peelProgress: controlledPeelProgress,
  isPeelFrozen = false,
  peelTrigger,
  onPeelProgress,
}) => {
  // Local state for standalone or interactive behavior
  const [internalTheme, setInternalTheme] = useState<ThemeMode>('dark');
  const [internalState, setInternalState] = useState<SidebarState>('expanded');
  const [internalActiveItem, setInternalActiveItem] = useState<string>('overview');
  const [internalActiveSubItem, setInternalActiveSubItem] = useState<string>('organic');
  const [internalSubmenuOpen, setInternalSubmenuOpen] = useState<boolean>(true);
  const [hoveredRailItem, setHoveredRailItem] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Awesome Animation & Pop-up States
  const [profilePopupOpen, setProfilePopupOpen] = useState<boolean>(false);
  const [selectedPlot, setSelectedPlot] = useState<'Plot A' | 'Plot B'>('Plot A');
  const [clickedRippleId, setClickedRippleId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ title: string; desc?: string } | null>(null);

  // Peeling Skin Animation State
  const [isPeeling, setIsPeeling] = useState<boolean>(false);
  const [peelAnimProgress, setPeelAnimProgress] = useState<number>(0);
  const [peelFromTheme, setPeelFromTheme] = useState<ThemeMode>('dark');
  const [peelDirection, setPeelDirection] = useState<'to-light' | 'to-dark'>('to-light');

  const railHoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const profilePopupRef = useRef<HTMLDivElement | null>(null);
  const prevThemeRef = useRef<ThemeMode>(controlledTheme ?? internalTheme);
  const peelRafRef = useRef<number | null>(null);

  const theme = controlledTheme ?? internalTheme;
  const isCollapsed = (controlledState ?? internalState) === 'collapsed';
  const activeItem = controlledActiveItem ?? internalActiveItem;
  const activeSubItem = controlledActiveSubItem ?? internalActiveSubItem;
  const isSubmenuOpen =
    forceSubmenuOpen !== undefined ? forceSubmenuOpen : internalSubmenuOpen;

  const isDark = theme === 'dark';

  // Helper to fire snappy pop-up toast
  const showToast = (title: string, desc?: string) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToast({ title, desc });
    toastTimeoutRef.current = setTimeout(() => {
      setToast(null);
    }, 2400);
  };

  // Start smooth macOS Genie peel animation in either direction
  const startPeelAnimation = (direction: 'to-light' | 'to-dark') => {
    setPeelDirection(direction);
    setIsPeeling(true);
    setPeelAnimProgress(0);
    onPeelProgress?.(0, direction, true);

    const startTime = performance.now();
    const duration = 1400; // ms: normal relaxed macOS Genie tempo

    if (peelRafRef.current) cancelAnimationFrame(peelRafRef.current);

    const step = (now: number) => {
      const elapsed = now - startTime;
      const rawProgress = Math.min(elapsed / duration, 1);

      // macOS Genie-style quintic smoothstep: zero initial jerk, fluid momentum, cushions softly
      const eased = genieSmoothStep(rawProgress);
      setPeelAnimProgress(eased);
      onPeelProgress?.(eased, direction, true);

      if (rawProgress < 1) {
        peelRafRef.current = requestAnimationFrame(step);
      } else {
        setIsPeeling(false);
        setPeelAnimProgress(1);
        onPeelProgress?.(1, direction, false);
      }
    };

    peelRafRef.current = requestAnimationFrame(step);
  };

  // Close profile popup when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        profilePopupRef.current &&
        !profilePopupRef.current.contains(event.target as Node) &&
        !(event.target as HTMLElement).closest('#user-profile-trigger-btn')
      ) {
        setProfilePopupOpen(false);
      }
    }
    if (profilePopupOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [profilePopupOpen]);

  // Clear search when collapsed
  useEffect(() => {
    if (isCollapsed) {
      setSearchQuery('');
    }
  }, [isCollapsed]);

  // Focus search when pressing '/'
  useEffect(() => {
    const handleSlashKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.key === '/') {
        e.preventDefault();
        if (isCollapsed) {
          if (onStateChange) onStateChange('expanded');
          else setInternalState('expanded');
        }
        setTimeout(() => {
          document.getElementById('sidebar-search-input')?.focus();
        }, 150);
      }
    };
    window.addEventListener('keydown', handleSlashKey);
    return () => window.removeEventListener('keydown', handleSlashKey);
  }, [isCollapsed, onStateChange]);

  // Trigger Buttery-Smooth Directional Peeling Skin Animation on Theme Change
  useEffect(() => {
    if (prevThemeRef.current !== theme) {
      const oldTheme = prevThemeRef.current;
      prevThemeRef.current = theme;

      // Determine directional trajectory:
      // - To Light: Peels UP from the bottom (revealing light from down upwards)
      // - To Dark: Unpeels DOWN from upward (covering in dark from top downwards)
      const direction = theme === 'light' ? 'to-light' : 'to-dark';
      setPeelFromTheme(oldTheme);
      startPeelAnimation(direction);
    }
    return () => {
      if (peelRafRef.current) cancelAnimationFrame(peelRafRef.current);
    };
  }, [theme]);

  // Support explicit replay trigger (e.g. Genie Studio buttons)
  useEffect(() => {
    if (peelTrigger && peelTrigger.id > 0) {
      startPeelAnimation(peelTrigger.direction);
    }
    return () => {
      if (peelRafRef.current) cancelAnimationFrame(peelRafRef.current);
    };
  }, [peelTrigger]);

  // Sync manual scrub progress if scrubbing
  useEffect(() => {
    if (controlledPeelProgress !== undefined) {
      onPeelProgress?.(controlledPeelProgress, peelDirection, true);
    }
  }, [controlledPeelProgress, peelDirection, onPeelProgress]);

  // Filter navigation items by search query
  const filteredNavItems = searchQuery.trim()
    ? NAV_ITEMS.filter(
        (item) =>
          item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.tagline?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.subItems?.some((sub) =>
            sub.label.toLowerCase().includes(searchQuery.toLowerCase())
          )
      )
    : NAV_ITEMS;

  const handleToggleState = () => {
    if (!isInteractive) return;
    const nextState = isCollapsed ? 'expanded' : 'collapsed';
    if (onStateChange) {
      onStateChange(nextState);
    } else {
      setInternalState(nextState);
    }
    showToast(nextState === 'expanded' ? 'Sidebar Expanded' : 'Rail Mode Active');
  };

  const handleThemeSwitch = (newTheme: ThemeMode) => {
    if (!isInteractive) return;
    if (onThemeChange) {
      onThemeChange(newTheme);
    } else {
      setInternalTheme(newTheme);
    }
    showToast(
      newTheme === 'dark' ? 'Night Theme • Peeling skin active' : 'Day Theme • Peeling skin active'
    );
  };

  const handleItemClick = (id: string, hasSubmenu?: boolean) => {
    if (!isInteractive) return;
    setClickedRippleId(id);
    setTimeout(() => setClickedRippleId(null), 400);

    const navItem = NAV_ITEMS.find((n) => n.id === id);
    if (navItem && !hasSubmenu) {
      showToast(`${navItem.label}`, navItem.stat || navItem.tagline);
    }

    if (hasSubmenu) {
      if (activeItem === id) {
        setInternalSubmenuOpen(!isSubmenuOpen);
      } else {
        setInternalSubmenuOpen(true);
      }
    }

    if (onItemSelect) {
      onItemSelect(id);
    } else {
      setInternalActiveItem(id);
    }
  };

  const handleSubItemClick = (subId: string) => {
    if (!isInteractive) return;
    const guides = NAV_ITEMS.find((n) => n.id === 'farming-guides')?.subItems;
    const targetSub = guides?.find((s) => s.id === subId);
    if (targetSub) {
      showToast(`Guide: ${targetSub.label}`, targetSub.desc);
    }
    if (onSubItemSelect) {
      onSubItemSelect(subId);
    } else {
      setInternalActiveSubItem(subId);
    }
  };

  // Determine Direction & Peel Trajectory:
  // - 'to-light': Peeling UP from bottom (fades in light from down upwards)
  // - 'to-dark': Unpeeling DOWN from upward (covers with dark from top downwards)
  const activeDirection = isPeelFrozen ? 'to-light' : peelDirection;

  // Calculate Peeling Skin Geometry with physical curved wave
  const shouldShowPeel = isPeelFrozen || controlledPeelProgress !== undefined || isPeeling;
  const effectiveProgress = isPeelFrozen
    ? 0.5
    : controlledPeelProgress !== undefined
    ? controlledPeelProgress
    : peelAnimProgress;

  let yLeft = 52;
  let cp1Y = 46;
  let cp2Y = 34;
  let yRight = 28;

  if (isPeelFrozen) {
    // Exact 52% / 28% screenshot angle with tactile supple organic cubic Bezier wave
    yLeft = 52;
    cp1Y = 46;
    cp2Y = 34;
    yRight = 28;
  } else if (activeDirection === 'to-light') {
    // LIGHT MODE (Peel UP from Down):
    // Starts below bottom, lifts upward with macOS Genie liquid suction
    const baseLeft = 118 - 138 * effectiveProgress;
    const baseRight = 106 - 138 * effectiveProgress;
    // Genie billow: lifts up in the center like fluid suction
    const billow = -12 * Math.sin(effectiveProgress * Math.PI);
    // Smooth liquid S-curve ripple
    const sWarp = 3.5 * Math.sin(effectiveProgress * Math.PI * 2);

    yLeft = baseLeft;
    yRight = baseRight;
    cp1Y = baseLeft + (baseRight - baseLeft) * 0.35 + billow + sWarp;
    cp2Y = baseLeft + (baseRight - baseLeft) * 0.70 + billow - sWarp;
  } else {
    // DARK MODE (Unpeel DOWN from Upward):
    // Starts above top, rolls downward with macOS Genie liquid cascade
    const baseLeft = -20 + 138 * effectiveProgress;
    const baseRight = -32 + 138 * effectiveProgress;
    // Genie billow: curves downward like descending silk/liquid
    const billow = 12 * Math.sin(effectiveProgress * Math.PI);
    const sWarp = 3.5 * Math.sin(effectiveProgress * Math.PI * 2);

    yLeft = baseLeft;
    yRight = baseRight;
    cp1Y = baseLeft + (baseRight - baseLeft) * 0.35 + billow + sWarp;
    cp2Y = baseLeft + (baseRight - baseLeft) * 0.70 + billow - sWarp;
  }

  // Generate the curved polygon with 28 interpolated cubic Bezier points
  const curvedClipPath = getCubicCurvedClipPath(yLeft, cp1Y, cp2Y, yRight);

  // Soft fade opacity along the leading peel wave edge
  // Ensures buttery smooth entry and exit transitions with zero harsh cut
  let overlayOpacity = 1;
  if (!isPeelFrozen) {
    if (activeDirection === 'to-light') {
      overlayOpacity = effectiveProgress > 0.85 ? Math.max(0, (1 - effectiveProgress) / 0.15) : 1;
    } else {
      overlayOpacity = effectiveProgress < 0.15 ? Math.min(1, effectiveProgress / 0.15) : 1;
    }
  }

  // Base theme during transition:
  // When peeling or frozen, base theme is 'light', and overlay theme is 'dark'.
  // Once transition completes, base theme is the true theme ('light' or 'dark').
  const baseTheme = isPeelFrozen ? 'light' : (isPeeling ? 'light' : theme);

  return (
    <motion.aside
      id={`bhoomix-sidebar-${theme}`}
      animate={{
        width: isCollapsed ? 76 : 272,
      }}
      transition={{
        type: 'spring',
        stiffness: 420,
        damping: 32,
        mass: 0.7,
      }}
      className={`relative flex flex-col rounded-[34px] select-none ${className}`}
      style={{ minHeight: '840px', willChange: 'width' }}
    >
      {/* Floating Animated Pop-Up Toast Pill */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.88 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 450, damping: 26 }}
            className="absolute -top-3 left-1/2 -translate-x-1/2 z-50 pointer-events-none whitespace-nowrap"
          >
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#121015] border border-[#8AC637]/60 text-white text-[11.5px] font-semibold shadow-2xl shadow-black/70 backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#8AC637] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#8AC637]" />
              </span>
              <span className="text-[#8AC637] font-bold">{toast.title}</span>
              {toast.desc && (
                <span className="text-white/70 font-normal hidden sm:inline">
                  &bull; {toast.desc}
                </span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Expand/Collapse Circular Toggle Button on right border */}
      <motion.button
        id="toggle-sidebar-collapse-btn"
        onClick={handleToggleState}
        whileHover={{ scale: 1.15 }}
        whileTap={{ scale: 0.92 }}
        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        className={`absolute -right-3.5 top-8 z-50 flex h-7 w-7 items-center justify-center rounded-full transition-colors shadow-lg cursor-pointer ${
          isDark
            ? 'bg-white text-[#110F13] hover:bg-neutral-100 shadow-black/60 ring-2 ring-[#100E13]'
            : 'bg-white text-[#110F13] border border-neutral-200 shadow-neutral-400/40 ring-2 ring-white'
        }`}
      >
        <motion.div
          animate={{ rotate: isCollapsed ? 0 : 180 }}
          transition={{ type: 'spring', stiffness: 320, damping: 22 }}
          className="flex items-center justify-center"
        >
          <ChevronsRight className="h-3.5 w-3.5" />
        </motion.div>
      </motion.button>

      {/* BASE LAYER: The Target Theme (Interactive) */}
      <SidebarSkin
        theme={baseTheme}
        isCollapsed={isCollapsed}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filteredNavItems={filteredNavItems}
        activeItem={activeItem}
        activeSubItem={activeSubItem}
        isSubmenuOpen={isSubmenuOpen}
        hoveredRailItem={hoveredRailItem}
        setHoveredRailItem={setHoveredRailItem}
        profilePopupOpen={profilePopupOpen}
        setProfilePopupOpen={setProfilePopupOpen}
        selectedPlot={selectedPlot}
        setSelectedPlot={setSelectedPlot}
        handleItemClick={handleItemClick}
        handleSubItemClick={handleSubItemClick}
        handleThemeSwitch={handleThemeSwitch}
        clickedRippleId={clickedRippleId}
        isOverlay={false}
        showTooltipOnRail={showTooltipOnRail}
        railHoverTimeoutRef={railHoverTimeoutRef}
      />

      {/* PEELING OVERLAY LAYER: The Outgoing Skin clipped along the organic curved wave */}
      {shouldShowPeel && (
        <div
          className="absolute inset-0 rounded-[34px] overflow-hidden pointer-events-none z-30 transition-opacity duration-75"
          style={{
            clipPath: curvedClipPath,
            WebkitClipPath: curvedClipPath,
            opacity: overlayOpacity,
            willChange: 'clip-path, opacity',
          }}
          aria-hidden="true"
        >
          <SidebarSkin
            theme="dark"
            isCollapsed={isCollapsed}
            searchQuery={searchQuery}
            filteredNavItems={filteredNavItems}
            activeItem={activeItem}
            activeSubItem={activeSubItem}
            isSubmenuOpen={isSubmenuOpen}
            selectedPlot={selectedPlot}
            isOverlay={true}
          />
        </div>
      )}

      {/* PEELING CREASE, CURVED WAVE & SOFT FADE SHADOW: Tactile 3D curved fold */}
      {shouldShowPeel && (
        <PeelingEdgeOverlay
          yLeft={yLeft}
          cp1Y={cp1Y}
          cp2Y={cp2Y}
          yRight={yRight}
          direction={activeDirection}
          isDarkOnTop={true}
        />
      )}

      {/* Collapsed Rail Awesome Flyout Pop-Up Card with Direct Sub-Actions */}
      <AnimatePresence>
        {isCollapsed && showTooltipOnRail && hoveredRailItem && (
          (() => {
            const item = NAV_ITEMS.find((n) => n.id === hoveredRailItem);
            if (!item) return null;
            const isActive = activeItem === item.id;
            return (
              <motion.div
                key={`rail-flyout-${item.id}`}
                initial={{ opacity: 0, x: -14, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -8, scale: 0.92 }}
                transition={{ type: 'spring', damping: 26, stiffness: 450, mass: 0.7 }}
                onMouseEnter={() => {
                  if (railHoverTimeoutRef.current) clearTimeout(railHoverTimeoutRef.current);
                  setHoveredRailItem(item.id);
                }}
                onMouseLeave={() => {
                  railHoverTimeoutRef.current = setTimeout(() => {
                    setHoveredRailItem(null);
                  }, 180);
                }}
                className="absolute left-[calc(100%+14px)] top-1/2 -translate-y-1/2 z-50 pointer-events-auto"
                style={{
                  filter: isDark
                    ? 'drop-shadow(0 14px 28px rgba(0, 0, 0, 0.75)) drop-shadow(0 0 16px rgba(138, 198, 55, 0.22))'
                    : 'drop-shadow(0 12px 24px rgba(0, 0, 0, 0.12))',
                }}
              >
                {/* Triangular pointer arrow */}
                <div
                  className={`absolute -left-2 top-1/2 -translate-y-1/2 w-0 h-0 border-y-[7px] border-y-transparent border-r-[8px] ${
                    isDark ? 'border-r-[#18161D]' : 'border-r-white'
                  }`}
                />

                {/* Pop-up Card */}
                <div
                  className={`w-64 p-3.5 rounded-2xl border transition-all select-none backdrop-blur-md ${
                    isDark
                      ? 'bg-[#18161D]/98 border-white/10 text-white shadow-2xl'
                      : 'bg-white/98 border-neutral-200 text-[#121015] shadow-xl'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-gradient-to-r from-[#8AC637] via-[#B8E65B] to-[#6EB322] text-[#121015]">
                      {item.category || 'BhoomiX'}
                    </span>
                    {isActive && (
                      <span className="flex items-center gap-1 text-[10px] font-semibold text-[#8AC637]">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#8AC637] animate-pulse" />
                        Active
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2.5 mb-1.5">
                    <div className="p-1.5 rounded-xl bg-white/5 border border-white/10 text-[#8AC637]">
                      <NavIcon name={item.icon} className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-bold tracking-tight">{item.label}</span>
                  </div>

                  {item.tagline && (
                    <p
                      className={`text-[11.5px] leading-relaxed mb-2.5 ${
                        isDark ? 'text-neutral-400' : 'text-neutral-600'
                      }`}
                    >
                      {item.tagline}
                    </p>
                  )}

                  {item.stat && (
                    <div
                      className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl text-[11px] font-medium mb-2.5 ${
                        isDark
                          ? 'bg-white/[0.04] border border-white/5 text-[#8AC637]'
                          : 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <Activity className="w-3 h-3" />
                        <span>{item.stat}</span>
                      </span>
                      <span className="text-[10px] opacity-70">Live</span>
                    </div>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleItemClick(item.id, item.hasSubmenu);
                    }}
                    className={`w-full py-1.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#8AC637] hover:bg-[#97D442] text-[#121015] shadow-sm'
                        : isDark
                        ? 'bg-white/10 hover:bg-white/15 text-white'
                        : 'bg-neutral-900 hover:bg-neutral-800 text-white shadow-xs'
                    }`}
                  >
                    <span>{item.quickAction || 'Open Module'}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </motion.div>
            );
          })()
        )}
      </AnimatePresence>

      {/* Farmer Profile Pop-Up Card */}
      <AnimatePresence>
        {profilePopupOpen && (
          <motion.div
            ref={profilePopupRef}
            initial={{ opacity: 0, y: 16, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className={`absolute bottom-[78px] left-3 right-3 p-4 rounded-2xl border z-50 shadow-2xl backdrop-blur-md select-none ${
              isDark
                ? 'bg-[#18161D]/98 border-white/15 text-white shadow-black/80'
                : 'bg-white/98 border-neutral-200 text-[#121015] shadow-xl'
            }`}
          >
            <div className="flex items-center gap-3 pb-3 border-b border-white/10 mb-3">
              <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full ring-2 ring-[#8AC637]">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80"
                  alt="Jason Brown"
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold truncate">Jason Brown</span>
                  <span className="flex h-1.5 w-1.5 rounded-full bg-[#8AC637]" />
                </div>
                <span className="text-[11px] text-[#8AC637] font-medium block">
                  Lead Agronomist & Farmer
                </span>
                <span className="text-[10px] text-neutral-400">ID: BHOOMI-4892-MH</span>
              </div>
            </div>

            <div className="space-y-2 mb-3 text-xs">
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-neutral-400">Registered Farm:</span>
                <span className="font-semibold">Green Valley Farm</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-neutral-400">Total Holdings:</span>
                <span className="font-semibold">42.5 Acres (Wheat & Mustard)</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-neutral-400">Active Soil Sensor:</span>
                <span className="font-semibold text-emerald-400">Online • 98% Batt</span>
              </div>
            </div>

            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
              <button
                onClick={() => {
                  showToast('Farmer Profile', 'Opening full agronomy credentials');
                  setProfilePopupOpen(false);
                }}
                className="text-[#8AC637] hover:underline font-semibold cursor-pointer"
              >
                View Full Profile &rarr;
              </button>
              <button
                onClick={() => {
                  showToast('Signed Out', 'Returning to authentication screen');
                  setProfilePopupOpen(false);
                }}
                className="flex items-center gap-1.5 text-rose-400 hover:text-rose-300 font-medium transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.aside>
  );
};

export const BhoomiXSidebar = MedtbankSidebar;
export default MedtbankSidebar;
