import React, { useState } from 'react';
import { MedtbankSidebar } from './MedtbankSidebar';
import { Palette, Copy, Check, Sparkles, SlidersHorizontal } from 'lucide-react';

const DESIGN_TOKENS = [
  { name: 'Dark Sidebar Canvas', hex: '#100E13', desc: 'Obsidian charcoal matte background' },
  { name: 'Dark Active Container', hex: '#201D25', desc: 'Active primary item background' },
  { name: 'Dark Active Sub-item', hex: '#292631', desc: 'Active submenu item background' },
  { name: 'Dark Muted Text', hex: '#8E8A98', desc: 'Inactive navigation items' },
  { name: 'Brand Sunset Gradient', hex: '#FF4465 → #9934E2 → #5C4DF2', desc: 'Active indicator & theme pill' },
  { name: 'Action Blue Badge', hex: '#2563EB', desc: 'Notification counter (3 unread)' },
  { name: 'Light Sidebar Canvas', hex: '#FFFFFF', desc: 'Crisp white with soft shadow' },
  { name: 'Light Active Container', hex: '#F4F5F8', desc: 'Active primary item background' },
  { name: 'Light Active Sub-item', hex: '#EAECEF', desc: 'Active submenu item background' },
  { name: 'Light Muted Text', hex: '#6C7280', desc: 'Inactive navigation items' },
];

export const ShowcaseView: React.FC = () => {
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [showTokensModal, setShowTokensModal] = useState<boolean>(false);
  const [interactiveMode, setInteractiveMode] = useState<boolean>(true);

  const handleCopy = (token: string, hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  return (
    <div className="relative min-h-screen bg-[#ECEEF2] text-[#121015] py-10 px-4 md:px-8 overflow-x-auto selection:bg-rose-500 selection:text-white">
      {/* Top Banner with Information & Action Controls */}
      <header className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/70 backdrop-blur-md px-6 py-4 rounded-2xl border border-neutral-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h1 className="text-lg md:text-xl font-bold tracking-tight text-neutral-900">
              Medtbank Sidebar Design System
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-600 border border-neutral-200">
              Full Copy Reference
            </span>
          </div>
          <p className="text-xs md:text-sm text-neutral-500 mt-1">
            Pixel-perfect reproduction of all 5 design variants: Dark/Light modes, full expandable accordions, collapsed rails with glowing tooltips.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            id="toggle-interactive-showcase"
            onClick={() => setInteractiveMode(!interactiveMode)}
            className={`flex items-center gap-2 text-xs font-semibold px-3.5 py-2 rounded-xl transition-all ${
              interactiveMode
                ? 'bg-neutral-900 text-white shadow-sm hover:bg-neutral-800'
                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            {interactiveMode ? 'Live Interactive' : 'Static Mockup'}
          </button>

          <button
            id="open-design-tokens-btn"
            onClick={() => setShowTokensModal(true)}
            className="flex items-center gap-2 text-xs font-semibold px-3.5 py-2 rounded-xl bg-white border border-neutral-200 text-neutral-800 hover:bg-neutral-50 transition-colors shadow-sm"
          >
            <Palette className="w-3.5 h-3.5 text-rose-500" />
            Inspect Color Scheme
          </button>
        </div>
      </header>

      {/* 5-Column Side-by-Side Reference Showcase Layout */}
      <main className="max-w-[1580px] mx-auto pb-12 overflow-x-auto">
        <div className="min-w-[1360px] flex items-start justify-center gap-6 lg:gap-8 xl:gap-10 pt-4 pb-8">
          {/* Variant 1: Dark Mode - Expanded Sidebar with Closed Submenu */}
          <div className="flex flex-col items-center">
            <div className="mb-3 text-center">
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                01. Dark Expanded
              </span>
              <p className="text-[11px] text-neutral-400">Submenu Closed</p>
            </div>
            <div className="transform transition-transform hover:-translate-y-1">
              <MedtbankSidebar
                theme="dark"
                state="expanded"
                activeItem="activity"
                forceSubmenuOpen={false}
                isInteractive={interactiveMode}
              />
            </div>
          </div>

          {/* Variant 2: Dark Mode - Expanded Sidebar with OPEN Submenu */}
          <div className="flex flex-col items-center">
            <div className="mb-3 text-center">
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                02. Dark Expanded
              </span>
              <p className="text-[11px] text-neutral-400">Activity Submenu Open</p>
            </div>
            <div className="transform transition-transform hover:-translate-y-1">
              <MedtbankSidebar
                theme="dark"
                state="expanded"
                activeItem="activity"
                activeSubItem="balance"
                forceSubmenuOpen={true}
                isInteractive={interactiveMode}
              />
            </div>
          </div>

          {/* Variant 3: Dark Mode - Collapsed Mini Rail with Tooltip */}
          <div className="flex flex-col items-center">
            <div className="mb-3 text-center">
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                03. Dark Collapsed
              </span>
              <p className="text-[11px] text-neutral-400">Rail + Flying Tooltip</p>
            </div>
            <div className="transform transition-transform hover:-translate-y-1">
              <MedtbankSidebar
                theme="dark"
                state="collapsed"
                activeItem="activity"
                showTooltipOnRail={true}
                isInteractive={interactiveMode}
              />
            </div>
          </div>

          {/* Variant 4: Light Mode - Expanded Sidebar with OPEN Submenu */}
          <div className="flex flex-col items-center">
            <div className="mb-3 text-center">
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                04. Light Expanded
              </span>
              <p className="text-[11px] text-neutral-400">Activity Submenu Open</p>
            </div>
            <div className="transform transition-transform hover:-translate-y-1">
              <MedtbankSidebar
                theme="light"
                state="expanded"
                activeItem="activity"
                activeSubItem="balance"
                forceSubmenuOpen={true}
                isInteractive={interactiveMode}
              />
            </div>
          </div>

          {/* Variant 5: Light Mode - Collapsed Mini Rail with Tooltip */}
          <div className="flex flex-col items-center">
            <div className="mb-3 text-center">
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                05. Light Collapsed
              </span>
              <p className="text-[11px] text-neutral-400">Rail + Flying Tooltip</p>
            </div>
            <div className="transform transition-transform hover:-translate-y-1">
              <MedtbankSidebar
                theme="light"
                state="collapsed"
                activeItem="activity"
                showTooltipOnRail={true}
                isInteractive={interactiveMode}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Color Tokens & Design Scheme Modal */}
      {showTokensModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-neutral-100">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <h3 className="font-bold text-neutral-900 text-base">
                  Extracted Design Palette & Tokens
                </h3>
              </div>
              <button
                id="close-tokens-modal"
                onClick={() => setShowTokensModal(false)}
                className="text-neutral-400 hover:text-neutral-700 text-sm font-semibold p-1.5 rounded-lg hover:bg-neutral-100"
              >
                ✕
              </button>
            </div>

            <div className="py-4 space-y-2.5 max-h-[60vh] overflow-y-auto pr-1">
              {DESIGN_TOKENS.map((token) => (
                <div
                  key={token.name}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-neutral-100 hover:bg-neutral-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-7 h-7 rounded-lg shrink-0 border border-neutral-200 shadow-inner"
                      style={{
                        background: token.hex.includes('→')
                          ? 'linear-gradient(135deg, #FF4465, #9934E2, #5C4DF2)'
                          : token.hex,
                      }}
                    />
                    <div>
                      <p className="text-xs font-bold text-neutral-900 leading-tight">
                        {token.name}
                      </p>
                      <p className="text-[11px] text-neutral-500">{token.desc}</p>
                    </div>
                  </div>

                  <button
                    id={`copy-token-${token.name.toLowerCase().replace(/\s+/g, '-')}`}
                    onClick={() => handleCopy(token.name, token.hex)}
                    className="flex items-center gap-1 text-[11px] font-mono font-medium px-2.5 py-1 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-800 transition-colors"
                  >
                    {copiedToken === token.name ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 text-neutral-400" />
                        {token.hex.includes('→') ? 'Gradient' : token.hex}
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-neutral-100 flex justify-end">
              <button
                id="dismiss-tokens-btn"
                onClick={() => setShowTokensModal(false)}
                className="px-4 py-2 bg-neutral-900 text-white text-xs font-semibold rounded-xl hover:bg-neutral-800 transition-colors"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
