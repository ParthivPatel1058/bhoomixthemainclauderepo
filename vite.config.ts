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
        manualChunks: {
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          "vendor-motion": ["framer-motion", "gsap"],
          "vendor-supabase": ["@supabase/supabase-js"],
        },
      },
    },
  },
});
