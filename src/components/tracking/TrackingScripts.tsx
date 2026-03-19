import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useTrackingSettings, getTrackingSetting } from '@/hooks/useTrackingSettings';
import { getCookieConsent } from '@/components/CookieConsent';

declare global {
  interface Window {
    fbq: (...args: any[]) => void;
    _fbq: any;
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
}

export const TrackingScripts = () => {
  const location = useLocation();
  const { data: settings } = useTrackingSettings();
  const initializedRef = useRef<{ meta: boolean; ga: boolean; ghl: boolean }>({ meta: false, ga: false, ghl: false });
  const [cookieConsent, setCookieConsent] = useState<CookiePreferences | null>(getCookieConsent);

  const metaPixel = getTrackingSetting(settings, 'meta_pixel_id');
  const googleAnalytics = getTrackingSetting(settings, 'ga_measurement_id');
  const ghlChatWidget = getTrackingSetting(settings, 'ghl_chat_widget_id');

  // Listen for cookie consent updates
  useEffect(() => {
    const handleConsentUpdate = (e: CustomEvent<CookiePreferences>) => {
      setCookieConsent(e.detail);
    };

    window.addEventListener('cookie-consent-updated', handleConsentUpdate as EventListener);
    return () => {
      window.removeEventListener('cookie-consent-updated', handleConsentUpdate as EventListener);
    };
  }, []);

  // Initialize Meta Pixel (only if marketing consent given)
  useEffect(() => {
    if (!metaPixel?.is_enabled || !metaPixel.setting_value || initializedRef.current.meta) {
      return;
    }

    // Check for marketing consent
    if (!cookieConsent?.marketing) {
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
  }, [metaPixel?.is_enabled, metaPixel?.setting_value, cookieConsent?.marketing]);

  // Initialize Google Analytics (only if analytics consent given, skip admin routes)
  useEffect(() => {
    if (location.pathname.startsWith('/admin')) {
      return;
    }

    if (!googleAnalytics?.is_enabled || !googleAnalytics.setting_value || initializedRef.current.ga) {
      return;
    }

    // Check for analytics consent
    if (!cookieConsent?.analytics) {
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
  }, [location.pathname, googleAnalytics?.is_enabled, googleAnalytics?.setting_value, cookieConsent?.analytics]);

  // Initialize/Remove GHL Chat Widget based on settings (hide on admin pages)
  useEffect(() => {
    const isAdminPage = location.pathname.startsWith('/admin');
    const isLandingPage = location.pathname.startsWith('/go/') || 
                          location.pathname.startsWith('/landing/') ||
                          location.pathname.startsWith('/estimate/smart-group') ||
                          location.pathname.startsWith('/smart-group');
    const shouldLoad = ghlChatWidget?.is_enabled && 
                       ghlChatWidget.setting_value && 
                       cookieConsent?.marketing &&
                       !isAdminPage &&
                       !isLandingPage;

    if (shouldLoad && !initializedRef.current.ghl) {
      // Load the widget
      const widgetId = ghlChatWidget.setting_value;
      const script = document.createElement('script');
      script.src = 'https://widgets.leadconnectorhq.com/loader.js';
      script.setAttribute('data-resources-url', 'https://widgets.leadconnectorhq.com/chat-widget/loader.js');
      script.setAttribute('data-widget-id', widgetId);
      script.id = 'ghl-chat-widget-script';
      document.body.appendChild(script);
      initializedRef.current.ghl = true;
    } else if (!shouldLoad && initializedRef.current.ghl) {
      // Remove the widget
      const script = document.getElementById('ghl-chat-widget-script');
      if (script) {
        script.remove();
      }
      
      // Remove GHL-created elements (chat widget container)
      const ghlElements = document.querySelectorAll('[class*="lc_"], [id*="lc-"]');
      ghlElements.forEach(el => el.remove());
      
      // Also try common GHL widget selectors
      const chatWidget = document.querySelector('iframe[src*="leadconnectorhq"]');
      if (chatWidget) {
        chatWidget.parentElement?.remove();
      }
      
      initializedRef.current.ghl = false;
    }
  }, [location.pathname, ghlChatWidget?.is_enabled, ghlChatWidget?.setting_value, cookieConsent?.marketing]);

  // Track page views on route change (skip admin routes)
  useEffect(() => {
    if (location.pathname.startsWith('/admin')) {
      return;
    }

    if (metaPixel?.is_enabled && metaPixel.setting_value && initializedRef.current.meta && cookieConsent?.marketing) {
      window.fbq?.('track', 'PageView');
    }

    if (googleAnalytics?.is_enabled && googleAnalytics.setting_value && initializedRef.current.ga && cookieConsent?.analytics) {
      window.gtag?.('event', 'page_view', {
        page_path: location.pathname,
        page_location: window.location.href,
      });
    }
  }, [location.pathname, metaPixel, googleAnalytics, cookieConsent]);

  return null;
};
