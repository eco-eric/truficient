/**
 * SSG hydration bridge.
 *
 * The build-time prerender (scripts/prerender.mjs) snapshots the fully-rendered
 * DOM of each public content page. Those pages fetch their data client-side, so
 * without help React's first hydration render would start in a `loading` state,
 * MISMATCH the prerendered HTML, and discard it — re-timing LCP to the client
 * fetch (see migration-artifacts/lcp-findings.md).
 *
 * Fix: each content page renders its fetched data into a single
 * `<script type="application/json" id="__SSG_PAGE_DATA__">` (captured by the
 * snapshot) and seeds its initial state from it on hydration, so the first
 * client render === the prerendered HTML. No mismatch, no re-fetch, no flash.
 *
 * The payload is only used while we are still on the initially-loaded
 * (prerendered) URL — client-side navigations to other pages get `null` and
 * fetch normally. Keying on the initial pathname (rather than a one-shot flag)
 * keeps this stable under React StrictMode's double-mount in dev.
 */
import { useRef } from 'react';

const SCRIPT_ID = '__SSG_PAGE_DATA__';

let _read = false;
let _payload: unknown = null;
let _initialPath = '';

function ensureRead() {
  if (_read) return;
  _read = true;
  if (typeof document === 'undefined' || typeof window === 'undefined') return;
  _initialPath = window.location.pathname;
  const el = document.getElementById(SCRIPT_ID);
  if (el && el.textContent) {
    try {
      _payload = JSON.parse(el.textContent);
    } catch {
      _payload = null;
    }
  }
}

/**
 * Capture the embedded payload from the pristine server DOM. MUST be called in
 * main.tsx BEFORE hydrateRoot() — once React starts hydrating it reconciles the
 * `<script id="__SSG_PAGE_DATA__">` and a later read can miss it (race), which
 * would defeat the seed and re-trigger the client fetch + content flash.
 */
export function captureSsgData() {
  ensureRead();
}

const normPath = (p: string) => p.replace(/\/+$/, '') || '/';

/**
 * Returns the embedded SSG payload IF `currentPath` is the page we hydrated
 * (the prerendered entry URL), else `null`. Read it once into state.
 */
export function getSsgData<T = unknown>(currentPath: string): T | null {
  ensureRead();
  if (_payload == null) return null;
  return normPath(currentPath) === normPath(_initialPath) ? (_payload as T) : null;
}

/** Convenience: read SSG data once for the current path into a stable ref. */
export function useSsgData<T = unknown>(currentPath: string): T | null {
  const ref = useRef<T | null | undefined>(undefined);
  if (ref.current === undefined) ref.current = getSsgData<T>(currentPath);
  return ref.current;
}

/**
 * Renders the SSG payload into the DOM so the prerender snapshot captures it.
 * Inert JSON; `suppressHydrationWarning` because re-serialised key order may
 * differ trivially (never affects layout).
 */
export function SsgPageData({ data }: { data: unknown }) {
  if (data == null) return null;
  const json = JSON.stringify(data).replace(/</g, '\\u003c');
  return (
    <script
      id={SCRIPT_ID}
      type="application/json"
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
