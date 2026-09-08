import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import { useUIPrefs } from "@/hooks/useUIPrefs";
import { cn } from "@/lib/utils";

/**
 * Application shell: renders the persistent desktop Sidebar and a content
 * area that respects its width on large screens. Below `lg` the sidebar is
 * hidden (see Sidebar.tsx) and each page's top Navigation bar provides the
 * mobile menu.
 *
 * The initial collapsed state comes from the user's saved preference; the
 * in-session toggle is kept locally so flipping it does not rewrite the
 * preference the user chose in Settings.
 */
export default function AppShell() {
  const { prefs } = useUIPrefs();
  const [collapsed, setCollapsed] = useState<boolean>(prefs.sidebarCollapsed);
  const { pathname } = useLocation();

  // The photograph is fixed to the viewport on every screen, hero or not.
  //
  // It used to be hero-only, because body copy on the inner pages landed on
  // whatever happened to be behind it — the same paragraph read clearly over
  // the dark treeline and vanished over the sky. A solid ground fixed that by
  // hiding the picture, which is not the trade we want.
  //
  // So the inner pages keep the photograph and take a scrim over it instead: a
  // near-opaque wash in the palette's own ink that the landscape reads through
  // as texture. Contrast stops depending on which part of the image a
  // paragraph happens to sit over, and the glass panels have something to be
  // glass *against*. The hero gets no scrim — it is the one screen the photo
  // is meant to carry on its own.
  const isHero = pathname === '/' || pathname === '/preview/home';

  return (
    <div className="min-h-screen">
      {!isHero && (
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 -z-10 bg-[hsl(162_28%_7%_/_0.88)] dark:bg-[hsl(210_45%_5%_/_0.90)]"
        />
      )}
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      <div
        className={cn(
          'transition-[padding] duration-300',
          // 12px gutter + panel width + 12px breathing room.
          collapsed ? 'lg:pl-[100px]' : 'lg:pl-[296px]',
          !isHero && 'min-h-screen',
        )}
      >
        <Outlet />
      </div>
    </div>
  );
}
