import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { ViteImageOptimizer } from "vite-plugin-image-optimizer";
import { pathToFileURL } from "node:url";

/**
 * Run the SEO prerender step as part of `vite build` itself, so it executes
 * regardless of whether the deploy pipeline calls `npm run build` or
 * `vite build` directly. (Lovable hosting invokes `vite build` directly,
 * which previously skipped the npm-script chain.)
 */
function seoPrerenderPlugin() {
  return {
    name: "truficient-seo-prerender",
    apply: "build" as const,
    async closeBundle() {
      // Bridge Lovable's VITE_-prefixed build env vars into the non-prefixed
      // names the prerender script reads. Without this, the script's Supabase
      // client never initializes in production builds and only static routes
      // get prerendered (the four DB-backed sources return zero rows).
      // Service role key is NOT required — published SEO rows are readable
      // with the anon key, and the script runs server-side so the key never
      // ships to the client bundle.
      if (!process.env.SUPABASE_URL && process.env.VITE_SUPABASE_URL) {
        process.env.SUPABASE_URL = process.env.VITE_SUPABASE_URL;
      }
      if (
        !process.env.SUPABASE_ANON_KEY &&
        !process.env.SUPABASE_SERVICE_ROLE_KEY &&
        process.env.VITE_SUPABASE_PUBLISHABLE_KEY
      ) {
        process.env.SUPABASE_ANON_KEY =
          process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      }

      const scriptUrl = pathToFileURL(
        path.resolve(__dirname, "scripts/prerender.mjs"),
      ).href;
      // Cache-bust so repeated builds in the same Node process re-import.
      try {
        await import(`${scriptUrl}?t=${Date.now()}`);
      } catch (err) {
        // Re-throw to fail the build — a silent prerender failure is what
        // got us into this mess in the first place.
        console.error("[vite] SEO prerender failed:", err);
        throw err;
      }
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    ViteImageOptimizer({
      jpg: { quality: 70 },
      jpeg: { quality: 70 },
      png: { quality: 75 },
    }),
    seoPrerenderPlugin(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom"],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React runtime
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          // Data layer
          "vendor-query": ["@tanstack/react-query"],
          // Supabase client
          "vendor-supabase": ["@supabase/supabase-js"],
          // UI framework
          "vendor-radix": [
            "@radix-ui/react-dialog",
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-popover",
            "@radix-ui/react-tabs",
            "@radix-ui/react-toast",
            "@radix-ui/react-tooltip",
            "@radix-ui/react-select",
            "@radix-ui/react-accordion",
            "@radix-ui/react-checkbox",
            "@radix-ui/react-label",
            "@radix-ui/react-toggle",
            "@radix-ui/react-toggle-group",
            "@radix-ui/react-slot",
          ],
          // Animation
          "vendor-motion": ["framer-motion"],
          // Charts (only needed on admin)
          "vendor-recharts": ["recharts"],
          // Rich text editor (admin only)
          "vendor-tiptap": [
            "@tiptap/react",
            "@tiptap/starter-kit",
            "@tiptap/extension-image",
            "@tiptap/extension-link",
            "@tiptap/extension-placeholder",
            "@tiptap/extension-underline",
          ],
        },
      },
    },
  },
}));
