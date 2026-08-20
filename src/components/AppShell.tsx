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

  // The cinematic crop photo is fixed to the viewport for the whole app, which
  // is right for the landing hero and wrong everywhere else: body copy on the
  // inner pages was landing on whatever happened to be behind it, so the same
  // paragraph read clearly over the dark treeline and vanished over the sky.
  //
  // The hero keeps the photograph. Every other screen gets a solid ground, and
  // the glass panels go back to being frosted panels on a surface rather than
  // the only thing holding the text off a landscape.
  const isHero = pathname === '/' || pathname === '/preview/home';

  return (
    <div className="min-h-screen">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      <div
        className={cn(
          'transition-[padding] duration-300',
          collapsed ? 'lg:pl-[100px]' : 'lg:pl-[288px]',
          !isHero && 'min-h-screen bg-background',
        )}
      >
        <Outlet />
      </div>
    </div>
  );
}
