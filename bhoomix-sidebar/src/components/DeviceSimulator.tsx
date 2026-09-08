import React, { useState } from 'react';
import { Smartphone, Tablet, Monitor, RotateCcw } from 'lucide-react';
import { MedtbankSidebar } from './MedtbankSidebar';
import { MobileNavigation } from './MobileDrawer';
import { DashboardView } from './DashboardView';
import { ThemeMode, SidebarState } from '../types';

export const DeviceSimulator: React.FC = () => {
  const [device, setDevice] = useState<'mobile' | 'tablet' | 'desktop'>('mobile');
  const [theme, setTheme] = useState<ThemeMode>('dark');
  const [activeItem, setActiveItem] = useState<string>('activity');
  const [activeSubItem, setActiveSubItem] = useState<string>('balance');
  const [sidebarState, setSidebarState] = useState<SidebarState>('expanded');
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState<boolean>(false);

  const isDark = theme === 'dark';

  return (
    <div className="min-h-screen bg-[#ECEEF2] text-[#121015] py-8 px-4 flex flex-col items-center selection:bg-rose-500 selection:text-white">
      {/* Device Toolbar Controls */}
      <div className="mb-6 flex flex-wrap items-center justify-center gap-3 bg-white/80 backdrop-blur-md px-5 py-3 rounded-2xl border border-neutral-200 shadow-sm">
        <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
          Viewport Simulator:
        </span>

        <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-xl">
          <button
            id="sim-btn-mobile"
            onClick={() => setDevice('mobile')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              device === 'mobile'
                ? 'bg-white text-neutral-900 shadow-sm'
                : 'text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" /> Mobile (390px)
          </button>

          <button
            id="sim-btn-tablet"
            onClick={() => {
              setDevice('tablet');
              setSidebarState('collapsed');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              device === 'tablet'
                ? 'bg-white text-neutral-900 shadow-sm'
                : 'text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <Tablet className="w-3.5 h-3.5" /> Tablet Rail (768px)
          </button>

          <button
            id="sim-btn-desktop"
            onClick={() => {
              setDevice('desktop');
              setSidebarState('expanded');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              device === 'desktop'
                ? 'bg-white text-neutral-900 shadow-sm'
                : 'text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" /> Desktop (1200px)
          </button>
        </div>

        {/* Quick Theme Toggle */}
        <button
          id="sim-theme-toggle"
          onClick={() => setTheme(isDark ? 'light' : 'dark')}
          className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 transition-colors"
        >
          Theme: <span className="capitalize font-bold">{theme}</span>
        </button>

        {device === 'mobile' && (
          <button
            id="sim-open-drawer"
            onClick={() => setMobileDrawerOpen(true)}
            className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-purple-600 text-white hover:bg-purple-700 transition-colors shadow-sm"
          >
            Open Mobile Drawer
          </button>
        )}
      </div>

      {/* Device Enclosure Frame */}
      <div
        className={`transition-all duration-300 relative overflow-hidden rounded-[40px] border-8 shadow-2xl ${
          device === 'mobile'
            ? 'w-[390px] h-[844px] border-neutral-800 bg-black'
            : device === 'tablet'
            ? 'w-[800px] h-[780px] border-neutral-800 bg-black'
            : 'w-full max-w-[1240px] min-h-[840px] border-neutral-700 bg-black'
        }`}
      >
        {/* Mobile Phone Dynamic Island / Camera Notch */}
        {device === 'mobile' && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-5 bg-neutral-950 rounded-full z-50 flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-neutral-900/80 mr-4" />
            <div className="w-2 h-2 rounded-full bg-blue-900/60" />
          </div>
        )}

        {/* Inner Screen Content */}
        <div
          className={`w-full h-full flex overflow-y-auto ${
            isDark ? 'bg-[#0E0C11] text-white' : 'bg-[#F6F7FA] text-neutral-900'
          }`}
        >
          {device === 'mobile' ? (
            /* Mobile View */
            <div className="w-full flex flex-col min-h-full pb-20 relative">
              <MobileNavigation
                theme={theme}
                activeItem={activeItem}
                activeSubItem={activeSubItem}
                isDrawerOpen={mobileDrawerOpen}
                onToggleDrawer={() => setMobileDrawerOpen(!mobileDrawerOpen)}
                onCloseDrawer={() => setMobileDrawerOpen(false)}
                onThemeChange={setTheme}
                onItemSelect={setActiveItem}
                onSubItemSelect={setActiveSubItem}
              />
              <DashboardView
                theme={theme}
                activeItem={activeItem}
                activeSubItem={activeSubItem}
              />
            </div>
          ) : (
            /* Tablet & Desktop View: Embedded Sidebar + Main Area */
            <div className="w-full flex min-h-full p-4 gap-4">
              <div className="shrink-0 flex items-start">
                <MedtbankSidebar
                  theme={theme}
                  state={sidebarState}
                  activeItem={activeItem}
                  activeSubItem={activeSubItem}
                  onStateChange={setSidebarState}
                  onThemeChange={setTheme}
                  onItemSelect={setActiveItem}
                  onSubItemSelect={setActiveSubItem}
                  className="sticky top-4"
                />
              </div>

              <div className="flex-1 overflow-y-auto">
                <DashboardView
                  theme={theme}
                  activeItem={activeItem}
                  activeSubItem={activeSubItem}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
