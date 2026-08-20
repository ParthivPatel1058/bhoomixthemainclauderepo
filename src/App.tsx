import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import SceneParallax from "@/components/SceneParallax";
import DesignPreview, { DesignPreviewIndex } from "@/pages/DesignPreview";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import AppShell from "@/components/AppShell";
import ClickSpark from "@/components/ui/click-spark";
import RouteAnalytics from "@/components/RouteAnalytics";
import { ThemeSwitchDefs } from "@/components/ui/theme-switch";
import { useUIPrefs } from "@/hooks/useUIPrefs";
import ProtectedRoute from "@/components/ProtectedRoute";
import PublicOnlyRoute from "@/components/PublicOnlyRoute";
import ErrorBoundary from "./components/ErrorBoundary";
import RouteFallback from "@/components/RouteFallback";

// Eager: these are the first paint on every visit, so deferring them would
// only add a round trip.
import RoleHome from "./pages/RoleHome";
import Index from "./pages/Index";
import Welcome from "./pages/auth/Welcome";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import NotFound from "./pages/NotFound";

// Lazy: everything a farmer reaches by navigating. Shipping all of it up
// front made one 1.1 MB chunk, which on a 3G connection in a field is the
// difference between the app opening and the farmer giving up.
const AgriMarket = React.lazy(() => import("./pages/AgriMarket"));
const KisanHelp = React.lazy(() => import("./pages/KisanHelp"));
const KisanMart = React.lazy(() => import("./pages/KisanMart"));
const SearchResults = React.lazy(() => import("./pages/SearchResults"));
const MandiPrices = React.lazy(() => import("./pages/MandiPrices"));
const DamageReport = React.lazy(() => import("./pages/DamageReport"));
const GovSchemes = React.lazy(() => import("./pages/GovSchemes"));
const RoboticFarming = React.lazy(() => import("./pages/RoboticFarming"));
const ShopLocator = React.lazy(() => import("./pages/ShopLocator"));
const Orders = React.lazy(() => import("./pages/Orders"));
const Addresses = React.lazy(() => import("./pages/Addresses"));
const PartnerOrders = React.lazy(() => import("./pages/PartnerOrders"));
const PartnerRegistration = React.lazy(() => import("./pages/PartnerRegistration"));
const Support = React.lazy(() => import("./pages/Support"));
const OrganicFarming = React.lazy(() => import("./pages/OrganicFarming"));
const VegetableFarming = React.lazy(() => import("./pages/VegetableFarming"));
const Settings = React.lazy(() => import("./pages/Settings"));
const CropDisease = React.lazy(() => import("./pages/CropDisease"));

const queryClient = new QueryClient();

const App = () => {
  // Mirror saved preferences onto <html> before the tree renders.
  useUIPrefs();
  return (
  <ErrorBoundary>
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <LanguageProvider>
        <TooltipProvider>
          <ClickSpark />
          {/* Drives the backdrop drift. Renders nothing; it only
              writes two custom properties on the root. */}
          <SceneParallax />
          <ThemeSwitchDefs />
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <RouteAnalytics />
            <AuthProvider>
              <CartProvider>
              <React.Suspense fallback={<RouteFallback />}>
              <Routes>
                {/* Auth Routes (no shell) */}
                <Route path="/auth/welcome" element={<PublicOnlyRoute><Welcome /></PublicOnlyRoute>} />
                <Route path="/auth/signup" element={<PublicOnlyRoute><Signup /></PublicOnlyRoute>} />
                <Route path="/auth/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
                <Route path="/auth/forgot-password" element={<PublicOnlyRoute><ForgotPassword /></PublicOnlyRoute>} />
                {/* Deliberately NOT PublicOnlyRoute: the emailed link creates a
                    recovery session, so this page is reached while signed in.
                    Guarding it would bounce the user away before they could set
                    a password — and the link only works once. */}
                <Route path="/auth/reset-password" element={<ResetPassword />} />

                {/* Dev-only design preview: the real pages in the real
                    shell, outside the auth guard, so layout work can be
                    looked at instead of inferred. `import.meta.env.DEV` is a
                    literal at build time, so Vite drops the whole branch —
                    and the lazy imports it holds — from production. */}
                {import.meta.env.DEV && (
                  <Route element={<AppShell />}>
                    <Route path="/preview" element={<DesignPreviewIndex />} />
                    <Route path="/preview/:page" element={<DesignPreview />} />
                  </Route>
                )}

                {/* Protected Routes — all rendered inside AppShell so the
                    desktop Sidebar persists across navigation. */}
                <Route
                  element={
                    <ProtectedRoute>
                      <AppShell />
                    </ProtectedRoute>
                  }
                >
                  {/* Home differs by account type; RoleHome picks the screen. */}
                  <Route path="/" element={<RoleHome />} />
                  <Route path="/agri-market" element={<AgriMarket />} />
                  <Route path="/kisan-help" element={<KisanHelp />} />
                  <Route path="/kisan-mart" element={<KisanMart />} />
                  <Route path="/search" element={<SearchResults />} />
                  <Route path="/mandi-prices" element={<MandiPrices />} />
                  <Route path="/damage-report" element={<DamageReport />} />
                  <Route path="/gov-schemes" element={<GovSchemes />} />
                  <Route path="/robotic-farming" element={<RoboticFarming />} />
                  <Route path="/shop-locator" element={<ShopLocator />} />
                  <Route path="/orders" element={<Orders />} />
                  <Route path="/addresses" element={<Addresses />} />
                  <Route path="/partner-orders" element={<PartnerOrders />} />
                  <Route path="/partner-registration" element={<PartnerRegistration />} />
                  <Route path="/support" element={<Support />} />
                  <Route path="/organic-farming" element={<OrganicFarming />} />
                  <Route path="/vegetable-farming" element={<VegetableFarming />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/crop-disease" element={<CropDisease />} />
                </Route>

                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
              </React.Suspense>
              </CartProvider>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </LanguageProvider>
    </ThemeProvider>
  </QueryClientProvider>
  </ErrorBoundary>
  );
};

export default App;
