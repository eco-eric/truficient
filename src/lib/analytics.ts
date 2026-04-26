// Google Analytics 4 helpers.
//
// CRITICAL: every exported function checks the current path (or the
// supplied path) and returns immediately when it starts with `/admin`.
// This is the admin exclusion — implemented at the code level rather
// than via IP filtering so internal usage never inflates GA4 metrics.

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

const MEASUREMENT_ID = import.meta.env.VITE_GA4_MEASUREMENT_ID as string | undefined;
let loaded = false;

function isAdminPath(path?: string): boolean {
  const p = path ?? (typeof window !== 'undefined' ? window.location.pathname : '');
  return typeof p === 'string' && p.startsWith('/admin');
}

export function loadGA4(): void {
  if (typeof window === 'undefined') return;
  if (isAdminPath()) return;
  if (!MEASUREMENT_ID) return;
  if (loaded) return;

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  // gtag must use `arguments`, not rest params, per Google's spec.
  window.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer!.push(arguments);
  };
  window.gtag('js', new Date());
  window.gtag('config', MEASUREMENT_ID, { send_page_view: false });
  loaded = true;
}

export function trackPageView(path: string): void {
  if (typeof window === 'undefined') return;
  if (isAdminPath(path)) return;
  if (!MEASUREMENT_ID) return;
  if (!loaded) loadGA4();
  window.gtag?.('config', MEASUREMENT_ID, {
    page_path: path,
    page_location: window.location.href,
  });
}

export function trackEvent(name: string, params: Record<string, any> = {}): void {
  if (typeof window === 'undefined') return;
  if (isAdminPath()) return;
  if (!MEASUREMENT_ID) return;
  if (!loaded) return;
  window.gtag?.('event', name, params);
}
