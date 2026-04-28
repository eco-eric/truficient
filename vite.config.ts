import { defineConfig, loadEnv } from "vite";
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
function seoPrerenderPlugin(mode: string) {
  return {
    name: "truficient-seo-prerender",
    apply: "build" as const,
    async closeBundle() {
      // Vite loads .env files into `import.meta.env` for the client bundle,
      // but does NOT populate `process.env` for build-time scripts. On
      // Lovable's deploy infra, `process.env.VITE_SUPABASE_URL` is therefore
      // empty even though `.env` contains it — which silently caused the
      // prerender script to skip every DB-backed route (blog, equipment,
      // and ~440 location pages), shipping only the 26 static routes to
      // production.
      //
      // Fix: explicitly load .env into process.env here, then bridge the
      // VITE_-prefixed names into the non-prefixed names the prerender
      // script reads.
      const env = loadEnv(mode, process.cwd(), "");
      for (const [key, value] of Object.entries(env)) {
        if (process.env[key] === undefined && value !== undefined) {
          process.env[key] = value;
        }
      }

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
