import React from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const container = document.getElementById("root")!;
const app = (
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// When the page was prerendered (full-body SSG snapshot from
// scripts/prerender.mjs), #root already contains server-rendered markup —
// hydrate it in place so the static HTML stays visible and interactive.
// Otherwise (clean SPA shell: homepage, admin/app routes), mount fresh.
//
// If hydration mismatches at runtime, React logs a warning and re-renders the
// subtree from scratch — the static HTML crawlers/LCP already benefited from
// remains correct. We do not block on perfect hydration (see migration brief).
if (container.hasChildNodes()) {
  hydrateRoot(container, app);
} else {
  createRoot(container).render(app);
}
