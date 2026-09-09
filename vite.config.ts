import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
  ],
  /* `vaul` reaches the graph only through the robotics filter sheet, which is
     lazy-loaded, so Vite discovers it mid-session rather than at server start.
     That triggers a re-optimisation while the page is already mounted, and the
     reload it forces can leave the drawer holding a stale React copy — which
     surfaces as "Invalid hook call ... more than one copy of React". Naming it
     here gets it pre-bundled with everything else and the discovery never
     happens. Dev-only; the production build bundles it either way. */
  optimizeDeps: {
    include: ["vaul"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        /* Everything used to land in one 1.1 MB entry chunk, so the browser
           had to parse the router, the animation engines and the Supabase
           client before it could paint anything. Splitting the vendors lets
           them download in parallel and stay cached across deploys — app code
           changes far more often than these do. */
        manualChunks(id) {
          if (!id.includes("node_modules")) return undefined;
          if (/react|react-dom|react-router-dom/.test(id) && /node_modules\/(react|react-dom|react-router-dom)\//.test(id)) {
            return "vendor-react";
          }
          if (id.includes("framer-motion") || id.includes("gsap")) return "vendor-motion";
          if (id.includes("@supabase/supabase-js")) return "vendor-supabase";
          /* The shadcn/ui component library sits on ~27 @radix-ui primitives
             plus lucide-react, all imported eagerly by the app shell (sidebar,
             toasts, tooltips) so they used to land in the main entry chunk.
             They change far less often than app code, so their own chunk
             stays cached across deploys instead of re-downloading every time. */
          if (id.includes("@radix-ui") || id.includes("lucide-react")) return "vendor-ui";
          return undefined;
        },
      },
    },
  },
});
