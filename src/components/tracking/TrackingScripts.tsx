import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useTrackingSettings, getTrackingSetting } from '@/hooks/useTrackingSettings';

declare global {
  interface Window {
    fbq: (...args: any[]) => void;
    _fbq: any;
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

export const TrackingScripts = () => {
  const location = useLocation();
  const { data: settings } = useTrackingSettings();
  const initializedRef = useRef<{ meta: boolean; ga: boolean }>({ meta: false, ga: false });

  const metaPixel = getTrackingSetting(settings, 'meta_pixel_id');
  const googleAnalytics = getTrackingSetting(settings, 'ga_measurement_id');

  // Initialize Meta Pixel
  useEffect(() => {
    if (!metaPixel?.is_enabled || !metaPixel.setting_value || initializedRef.current.meta) {
      return;
    }

    const pixelId = metaPixel.setting_value;

    // Meta Pixel base code
    (function(f: Window, b: Document, e: string, v: string) {
      if (f.fbq) return;
      const n: any = f.fbq = function() {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n;
      n.push = n;
      n.loaded = true;
      n.version = '2.0';
      n.queue = [];
      const t = b.createElement(e) as HTMLScriptElement;
      t.async = true;
      t.src = v;
      const s = b.getElementsByTagName(e)[0];
      s?.parentNode?.insertBefore(t, s);
    })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

    window.fbq('init', pixelId);
    window.fbq('track', 'PageView');
    initializedRef.current.meta = true;
  }, [metaPixel?.is_enabled, metaPixel?.setting_value]);

  // Initialize Google Analytics
  useEffect(() => {
    if (!googleAnalytics?.is_enabled || !googleAnalytics.setting_value || initializedRef.current.ga) {
      return;
    }

    const measurementId = googleAnalytics.setting_value;

    // Load gtag.js script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    document.head.appendChild(script);

    // Initialize gtag
    window.dataLayer = window.dataLayer || [];
    window.gtag = function() {
      window.dataLayer.push(arguments);
    };
    window.gtag('js', new Date());
    window.gtag('config', measurementId);
    initializedRef.current.ga = true;
  }, [googleAnalytics?.is_enabled, googleAnalytics?.setting_value]);

  // Track page views on route change
  useEffect(() => {
    if (metaPixel?.is_enabled && metaPixel.setting_value && initializedRef.current.meta) {
      window.fbq?.('track', 'PageView');
    }

    if (googleAnalytics?.is_enabled && googleAnalytics.setting_value && initializedRef.current.ga) {
      window.gtag?.('event', 'page_view', {
        page_path: location.pathname,
        page_location: window.location.href,
      });
    }
  }, [location.pathname, metaPixel, googleAnalytics]);

  return null;
};
