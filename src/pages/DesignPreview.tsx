import { lazy, Suspense } from 'react';
import { Link, useParams } from 'react-router-dom';
import RouteFallback from '@/components/RouteFallback';

/**
 * Development-only design preview.
 *
 * Every screen except the auth pages sits behind `ProtectedRoute`, so there is
 * no way to look at a page's layout without a live session — which made design
 * work on twenty screens a matter of reading class names and hoping. Rendering
 * a change is the only way to know it landed: the last regression here was a
 * blank screen caused by a prop that type-checked fine and threw at runtime.
 *
 * This route mounts a page inside the real shell but outside the auth guard.
 * The whole module is behind `import.meta.env.DEV` at the call site in App.tsx,
 * so Vite drops it from the production bundle — it is a workshop mirror, not a
 * hole in the guard.
 *
 * Pages that read `user` render their signed-out or empty state here. That is
 * the point: empty states are the layouts that get looked at least and break
 * most often.
 */

const PAGES = {
  home: lazy(() => import('@/pages/Index')),
  'agri-market': lazy(() => import('@/pages/AgriMarket')),
  'kisan-mart': lazy(() => import('@/pages/KisanMart')),
  'kisan-help': lazy(() => import('@/pages/KisanHelp')),
  'crop-disease': lazy(() => import('@/pages/CropDisease')),
  'mandi-prices': lazy(() => import('@/pages/MandiPrices')),
  'gov-schemes': lazy(() => import('@/pages/GovSchemes')),
  'damage-report': lazy(() => import('@/pages/DamageReport')),
  'organic-farming': lazy(() => import('@/pages/OrganicFarming')),
  'vegetable-farming': lazy(() => import('@/pages/VegetableFarming')),
  'robotic-farming': lazy(() => import('@/pages/RoboticFarming')),
  'shop-locator': lazy(() => import('@/pages/ShopLocator')),
  orders: lazy(() => import('@/pages/Orders')),
  addresses: lazy(() => import('@/pages/Addresses')),
  settings: lazy(() => import('@/pages/Settings')),
  support: lazy(() => import('@/pages/Support')),
  'partner-orders': lazy(() => import('@/pages/PartnerOrders')),
  search: lazy(() => import('@/pages/SearchResults')),
} as const;

export type PreviewKey = keyof typeof PAGES;
export const PREVIEW_KEYS = Object.keys(PAGES) as PreviewKey[];

/** The index, listing everything that can be previewed. */
export function DesignPreviewIndex() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="page-title mb-2 text-foreground">Design preview</h1>
      <p className="mb-8 text-muted-foreground">
        Dev only. Each page rendered inside the app shell, outside the auth guard.
      </p>
      <ul className="grid gap-2 sm:grid-cols-2">
        {PREVIEW_KEYS.map((k) => (
          <li key={k}>
            <Link
              to={`/preview/${k}`}
              className="glass block rounded-lg px-4 py-3 text-sm font-medium text-foreground transition-[background-color,border-color] hover:border-secondary/40"
            >
              {k}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function DesignPreview() {
  const { page } = useParams<{ page: PreviewKey }>();
  const Page = page ? PAGES[page] : undefined;

  if (!Page) return <DesignPreviewIndex />;

  return (
    <Suspense fallback={<RouteFallback />}>
      <Page />
    </Suspense>
  );
}
