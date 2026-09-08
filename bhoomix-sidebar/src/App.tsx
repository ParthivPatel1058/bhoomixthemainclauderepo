/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BhoomiXSidebar } from './components/BhoomiXSidebar';
import { DayNightSwitch } from './components/DayNightSwitch';
import { ThemeMode, SidebarState } from './types';
import {
  Sun,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Sparkles,
  Info,
  X,
  Zap,
  Layers,
  Play,
  RotateCcw,
} from 'lucide-react';

export default function App() {
  const [theme, setTheme] = useState<ThemeMode>('dark');
  const [sidebarState, setSidebarState] = useState<SidebarState>('expanded');
  const [activeItem, setActiveItem] = useState<string>('overview');
  const [activeSubItem, setActiveSubItem] = useState<string>('organic');
  const [showSpecModal, setShowSpecModal] = useState<boolean>(false);

  // Peeling Skin Interactive Demo Controls
  const [isPeelFrozen, setIsPeelFrozen] = useState<boolean>(false);
  const [isManualScrubbing, setIsManualScrubbing] = useState<boolean>(false);
  const [manualProgress, setManualProgress] = useState<number>(0.5); // 0.5 = 52%/28% screenshot angle

  // Keyboard shortcut listener:
  // '[' or Ctrl+B to toggle sidebar, 'T' to toggle theme
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.key === '[' || (e.ctrlKey && e.key === 'b')) {
        e.preventDefault();
        setSidebarState((prev) => (prev === 'expanded' ? 'collapsed' : 'expanded'));
      }
      if (e.key === 't' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        setIsPeelFrozen(false);
        setIsManualScrubbing(false);
        setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const isDark = theme === 'dark';

  const triggerPeelAnimation = () => {
    setIsPeelFrozen(false);
    setIsManualScrubbing(false);
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const triggerPeelToLight = () => {
    setIsPeelFrozen(false);
    setIsManualScrubbing(false);
    if (theme === 'light') {
      setTheme('dark');
      setTimeout(() => setTheme('light'), 20);
    } else {
      setTheme('light');
    }
  };

  const triggerPeelToDark = () => {
    setIsPeelFrozen(false);
    setIsManualScrubbing(false);
    if (theme === 'dark') {
      setTheme('light');
      setTimeout(() => setTheme('dark'), 20);
    } else {
      setTheme('dark');
    }
  };

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-300 font-['Plus_Jakarta_Sans',sans-serif] ${
        isDark ? 'bg-[#0A090D] text-white' : 'bg-[#ECEEF2] text-[#121015]'
      }`}
    >
      {/* Subtle Top Utility Bar */}
      <header
        className={`sticky top-0 z-40 border-b px-4 py-2.5 flex items-center justify-between backdrop-blur-xl transition-colors duration-300 ${
          isDark
            ? 'bg-[#100E13]/85 border-white/[0.06] text-white'
            : 'bg-white/85 border-neutral-200/80 text-neutral-900 shadow-xs'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#8AC637] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#8AC637]" />
            </span>
            <span className="text-xs sm:text-sm font-bold tracking-tight">BhoomiX Sidebar</span>
          </div>

          <span
            className={`hidden sm:inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-0.5 rounded-full ${
              isDark ? 'bg-white/[0.06] text-neutral-300' : 'bg-neutral-100 text-neutral-600'
            }`}
          >
            <Zap className="w-3 h-3 text-[#8AC637]" />
            Agricultural Design System
          </span>
        </div>

        {/* Global Controls & Spec Modal Trigger */}
        <div className="flex items-center gap-2">
          {/* Quick Collapse Toggle */}
          <motion.button
            id="global-sidebar-toggle-btn"
            onClick={() =>
              setSidebarState((prev) => (prev === 'expanded' ? 'collapsed' : 'expanded'))
            }
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            title="Toggle sidebar expanded/collapsed (Shortcut: [ )"
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border transition-colors cursor-pointer ${
              isDark
                ? 'border-white/10 hover:bg-white/5 text-neutral-300'
                : 'border-neutral-200 hover:bg-neutral-100 text-neutral-700 shadow-xs'
            }`}
          >
            {sidebarState === 'expanded' ? (
              <>
                <PanelLeftClose className="w-3.5 h-3.5 text-[#8AC637]" />
                <span className="hidden sm:inline">Rail Mode</span>
              </>
            ) : (
              <>
                <PanelLeftOpen className="w-3.5 h-3.5 text-[#8AC637]" />
                <span className="hidden sm:inline">Expand Sidebar</span>
              </>
            )}
          </motion.button>

          {/* Quick Spec & Design Guide Modal */}
          <motion.button
            id="open-design-spec-btn"
            onClick={() => setShowSpecModal(true)}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            title="View design tokens and reference info"
            className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-xl border transition-colors cursor-pointer ${
              isDark
                ? 'border-white/10 text-neutral-300 hover:bg-white/5'
                : 'border-neutral-200 text-neutral-700 hover:bg-neutral-100 shadow-xs'
            }`}
          >
            <Info className="w-3.5 h-3.5 text-[#8AC637]" />
            <span className="hidden sm:inline">Design Spec</span>
          </motion.button>

          {/* Global Theme Toggle with DayNightSwitch */}
          <div className="flex items-center">
            <DayNightSwitch
              id="global-header-theme-switch"
              checked={isDark}
              scale={0.58}
              showLabels={false}
              onChange={(checked) => setTheme(checked ? 'dark' : 'light')}
              title="Toggle Light / Dark mode (Shortcut: T)"
            />
          </div>
        </div>
      </header>

      {/* Centered Main Stage: ONLY SIDEBAR, NO DASHBOARD */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 md:p-12 w-full relative overflow-hidden">
        {/* Subtle Ambient Background Glow matching the fresh green gradient */}
        <div
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[150px] pointer-events-none transition-opacity duration-700 ${
            isDark
              ? 'bg-gradient-to-tr from-[#8AC637]/15 via-[#B8E65B]/15 to-[#6EB322]/15 opacity-70'
              : 'bg-gradient-to-tr from-[#8AC637]/10 via-[#B8E65B]/10 to-[#6EB322]/10 opacity-40'
          }`}
        />

        {/* State Quick-Control Chips */}
        <div className="mb-6 flex flex-wrap items-center justify-center gap-2 z-10">
          <span
            className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
              isDark
                ? 'bg-white/5 border-white/10 text-neutral-400'
                : 'bg-white border-neutral-200 text-neutral-600 shadow-xs'
            }`}
          >
            Quick State:
          </span>

          <button
            id="state-chip-expanded-dark"
            onClick={() => {
              setSidebarState('expanded');
              setTheme('dark');
              setActiveItem('overview');
            }}
            className={`text-xs px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
              sidebarState === 'expanded' && isDark
                ? 'bg-white/15 border-white/30 text-white font-semibold shadow-xs'
                : isDark
                ? 'bg-white/5 border-white/10 text-neutral-400 hover:text-white'
                : 'bg-white border-neutral-200 text-neutral-600 hover:text-neutral-900 shadow-xs'
            }`}
          >
            Expanded Dark
          </button>

          <button
            id="state-chip-collapsed-dark"
            onClick={() => {
              setSidebarState('collapsed');
              setTheme('dark');
              setActiveItem('overview');
            }}
            className={`text-xs px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
              sidebarState === 'collapsed' && isDark
                ? 'bg-white/15 border-white/30 text-white font-semibold shadow-xs'
                : isDark
                ? 'bg-white/5 border-white/10 text-neutral-400 hover:text-white'
                : 'bg-white border-neutral-200 text-neutral-600 hover:text-neutral-900 shadow-xs'
            }`}
          >
            Collapsed Dark Rail
          </button>

          <button
            id="state-chip-expanded-light"
            onClick={() => {
              setSidebarState('expanded');
              setTheme('light');
              setActiveItem('overview');
            }}
            className={`text-xs px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
              sidebarState === 'expanded' && !isDark
                ? 'bg-neutral-900 border-neutral-900 text-white font-semibold shadow-xs'
                : isDark
                ? 'bg-white/5 border-white/10 text-neutral-400 hover:text-white'
                : 'bg-white border-neutral-200 text-neutral-600 hover:text-neutral-900 shadow-xs'
            }`}
          >
            Expanded Light
          </button>

          <button
            id="state-chip-collapsed-light"
            onClick={() => {
              setSidebarState('collapsed');
              setTheme('light');
              setActiveItem('overview');
            }}
            className={`text-xs px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
              sidebarState === 'collapsed' && !isDark
                ? 'bg-neutral-900 border-neutral-900 text-white font-semibold shadow-xs'
                : isDark
                ? 'bg-white/5 border-white/10 text-neutral-400 hover:text-white'
                : 'bg-white border-neutral-200 text-neutral-600 hover:text-neutral-900 shadow-xs'
            }`}
          >
            Collapsed Light Rail
          </button>
        </div>

        {/* Dedicated Peeling Skin Studio Bar */}
        <div
          id="peeling-skin-studio-bar"
          className={`mb-6 flex flex-col sm:flex-row items-center justify-center gap-3 px-4 py-2.5 rounded-2xl border backdrop-blur-md z-10 transition-all ${
            isDark
              ? 'bg-[#141219]/90 border-white/10 text-white shadow-xl shadow-black/40'
              : 'bg-white/95 border-neutral-200 text-neutral-800 shadow-md shadow-neutral-200/50'
          }`}
        >
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#8AC637]/20 text-[#8AC637]">
              <Layers className="w-3.5 h-3.5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold tracking-tight">macOS Genie Theme Transition:</span>
              <span className="text-[10px] text-neutral-400 dark:text-neutral-400">Buttery 1.4s • Viscous Quintic Ease</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Peel Up to Light Button (Starts from Down) */}
            <motion.button
              id="trigger-peel-light-btn"
              onClick={triggerPeelToLight}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#8AC637] hover:bg-[#97D442] text-[#110F13] shadow-sm cursor-pointer transition-all"
              title="macOS Genie peel up from bottom (starts fade from down to top, 1.4s normal time)"
            >
              <span className="text-sm font-bold">↑</span>
              <span>Genie Peel Up (Light)</span>
            </motion.button>

            {/* Unpeel Down to Dark Button (Starts from Upward) */}
            <motion.button
              id="trigger-peel-dark-btn"
              onClick={triggerPeelToDark}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                isDark
                  ? 'bg-white/10 hover:bg-white/15 text-white border-white/20'
                  : 'bg-neutral-900 hover:bg-neutral-800 text-white border-neutral-800'
              }`}
              title="macOS Genie unpeel down from upward (starts fading from top to bottom, 1.4s normal time)"
            >
              <span className="text-sm font-bold">↓</span>
              <span>Genie Unpeel Down (Dark)</span>
            </motion.button>

            {/* Freeze at Screenshot Split (52% / 28%) */}
            <motion.button
              id="freeze-peel-screenshot-btn"
              onClick={() => {
                setIsManualScrubbing(false);
                setIsPeelFrozen(!isPeelFrozen);
              }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                isPeelFrozen
                  ? 'bg-purple-600 text-white border-purple-500 shadow-sm ring-1 ring-purple-400'
                  : isDark
                  ? 'bg-white/5 border-white/10 text-neutral-300 hover:bg-white/10'
                  : 'bg-neutral-100 border-neutral-200 text-neutral-700 hover:bg-neutral-200'
              }`}
              title="Lock split at exact 52% / 28% angle with organic curved wave"
            >
              <Sparkles className="w-3 h-3 text-[#8AC637]" />
              <span>{isPeelFrozen ? 'Curved Split Frozen (52% / 28%)' : 'View Split (Like Photo)'}</span>
            </motion.button>

            {/* Manual Scrub Slider Toggle */}
            <button
              id="toggle-manual-scrub-btn"
              onClick={() => {
                setIsPeelFrozen(false);
                setIsManualScrubbing(!isManualScrubbing);
              }}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-medium border transition-colors cursor-pointer ${
                isManualScrubbing
                  ? 'bg-[#8AC637]/20 border-[#8AC637]/50 text-[#8AC637] font-semibold'
                  : isDark
                  ? 'bg-white/5 border-white/10 text-neutral-400 hover:text-white'
                  : 'bg-neutral-100 border-neutral-200 text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Scrub
            </button>

            {/* Reset / Live Mode */}
            {(isPeelFrozen || isManualScrubbing) && (
              <motion.button
                id="reset-peel-btn"
                onClick={() => {
                  setIsPeelFrozen(false);
                  setIsManualScrubbing(false);
                }}
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.94 }}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
                title="Reset to resting state"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </motion.button>
            )}
          </div>

          {/* Interactive Scrub Slider */}
          {isManualScrubbing && (
            <div className="flex items-center gap-2 pl-2 border-t sm:border-t-0 sm:border-l border-white/10 pt-2 sm:pt-0 w-full sm:w-auto">
              <span className="text-[11px] font-mono text-neutral-400">
                {Math.round(manualProgress * 100)}%
              </span>
              <input
                id="manual-peel-slider"
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={manualProgress}
                onChange={(e) => setManualProgress(parseFloat(e.target.value))}
                className="w-32 h-1.5 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-[#8AC637]"
              />
            </div>
          )}
        </div>

        {/* The Sidebar as the Pure Hero Centerpiece */}
        <div className="relative z-10 flex items-center justify-center max-w-full">
          <BhoomiXSidebar
            theme={theme}
            state={sidebarState}
            activeItem={activeItem}
            activeSubItem={activeSubItem}
            onStateChange={setSidebarState}
            onThemeChange={(newTheme) => {
              setIsPeelFrozen(false);
              setIsManualScrubbing(false);
              setTheme(newTheme);
            }}
            onItemSelect={setActiveItem}
            onSubItemSelect={setActiveSubItem}
            isPeelFrozen={isPeelFrozen}
            peelProgress={isManualScrubbing ? manualProgress : undefined}
            className="shadow-2xl ring-1 ring-white/10"
          />
        </div>

        {/* Selected Item Status Callout & Interactive Pop-Up Guidance */}
        <div className="mt-6 z-10 text-center max-w-lg space-y-1.5">
          <p className={`text-xs ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`}>
            Active Selection:{' '}
            <span className={`font-semibold ${isDark ? 'text-white' : 'text-neutral-900'}`}>
              {activeItem.replace('-', ' ').toUpperCase()}
            </span>
            {activeItem === 'farming-guides' && activeSubItem && (
              <span>
                {' '}&gt; <span className="text-[#8AC637] font-medium capitalize">{activeSubItem}</span>
              </span>
            )}
          </p>
          <p className={`text-[11px] ${isDark ? 'text-neutral-500' : 'text-neutral-400'}`}>
            <span className="text-[#8AC637] font-semibold">Interactive Pop-Ups:</span> Hover rail icons for rich flyouts &bull; Click profile at bottom for Farmer Plot card &bull; Press <kbd className="px-1.5 py-0.5 text-[10px] rounded bg-white/10 border border-white/15 font-mono">[</kbd> to toggle rail
          </p>
        </div>
      </main>

      {/* Design Reference & Color Tokens Modal */}
      <AnimatePresence>
        {showSpecModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSpecModal(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm cursor-pointer"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className={`relative z-10 w-full max-w-2xl rounded-3xl p-6 sm:p-7 shadow-2xl border ${
                isDark
                  ? 'bg-[#141219] border-white/10 text-white'
                  : 'bg-white border-neutral-200 text-neutral-900'
              }`}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-2xl bg-gradient-to-r from-[#8AC637] via-[#B8E65B] to-[#6EB322] text-[#121015]">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">BhoomiX Design System & Architecture</h3>
                    <p className={`text-xs ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
                      Agricultural navigation specification unified into a responsive interactive sidebar
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setShowSpecModal(false)}
                  className={`p-2 rounded-xl transition-colors cursor-pointer ${
                    isDark ? 'hover:bg-white/10 text-neutral-400' : 'hover:bg-neutral-100 text-neutral-600'
                  }`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="mt-5 space-y-5 max-h-[70vh] overflow-y-auto pr-1">
                {/* 5 Reference States Explanation */}
                <div
                  className={`p-4 rounded-2xl border ${
                    isDark ? 'bg-white/[0.03] border-white/[0.08]' : 'bg-neutral-50 border-neutral-200'
                  }`}
                >
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#8AC637] mb-2">
                    Agricultural Navigation & Fresh Green Gradient
                  </h4>
                  <p className="text-xs leading-relaxed opacity-90">
                    The sidebar integrates the complete agricultural navigation structure from the reference with the vibrant lime/spring green gradient:
                  </p>
                  <ul className="mt-2 space-y-1.5 text-xs opacity-85 list-disc list-inside">
                    <li><strong>Overview</strong>: Primary dashboard view with right chevron indicator</li>
                    <li><strong>Crop Intelligence & Advisory</strong>: Dedicated agronomy and intelligence tools</li>
                    <li><strong>Agri Market & Mandi Prices</strong>: Real-time agricultural commerce and mandi exchange</li>
                    <li><strong>Farming Guides Submenu</strong>: Organic, Vegetable, and Robotic farming practices</li>
                    <li><strong>Damage Claim, Schemes & Orders</strong>: Agricultural relief, government programs, and logistics</li>
                  </ul>
                  <p className="mt-3 text-xs text-[#8AC637] font-semibold">
                    All states and modes (Expanded, Collapsed Rail, Dark, Light) are fully interactive in this unified component.
                  </p>
                </div>

                {/* Quick Interactive Actions */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      setSidebarState((prev) => (prev === 'expanded' ? 'collapsed' : 'expanded'));
                      setShowSpecModal(false);
                    }}
                    className="p-3 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-semibold text-center transition-all cursor-pointer"
                  >
                    Switch to {sidebarState === 'expanded' ? 'Collapsed Rail' : 'Expanded Mode'}
                  </button>

                  <button
                    onClick={() => {
                      setTheme(isDark ? 'light' : 'dark');
                      setShowSpecModal(false);
                    }}
                    className="p-3 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-semibold text-center transition-all cursor-pointer"
                  >
                    Switch to {isDark ? 'Light Theme' : 'Dark Theme'}
                  </button>
                </div>

                {/* Color Scheme Tokens */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-3">
                    Design Tokens & Palette
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                    <div className="p-2.5 rounded-xl border border-white/10 flex flex-col gap-1">
                      <div className="h-6 rounded-lg bg-[#100E13] border border-white/20" />
                      <span className="font-bold text-[11px]">Dark Surface</span>
                      <span className="text-[10px] text-neutral-400 font-mono">#100E13</span>
                    </div>

                    <div className="p-2.5 rounded-xl border border-white/10 flex flex-col gap-1">
                      <div className="h-6 rounded-lg bg-[#201D25] border border-white/20" />
                      <span className="font-bold text-[11px]">Active Item</span>
                      <span className="text-[10px] text-neutral-400 font-mono">#201D25</span>
                    </div>

                    <div className="p-2.5 rounded-xl border border-white/10 flex flex-col gap-1">
                      <div className="h-6 rounded-lg bg-gradient-to-r from-[#8AC637] via-[#B8E65B] to-[#6EB322]" />
                      <span className="font-bold text-[11px]">Signature Gradient</span>
                      <span className="text-[10px] text-neutral-400 font-mono">Lime Apple Green</span>
                    </div>

                    <div className="p-2.5 rounded-xl border border-white/10 flex flex-col gap-1">
                      <div className="h-6 rounded-lg bg-[#FFFFFF] border border-neutral-300" />
                      <span className="font-bold text-[11px]">Light Surface</span>
                      <span className="text-[10px] text-neutral-400 font-mono">#FFFFFF</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

