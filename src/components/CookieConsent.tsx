import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { X } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
}

const STORAGE_KEY = 'truficient-cookie-consent';

export const getCookieConsent = (): CookiePreferences | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

const CookieConsent = () => {
  const location = useLocation();
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true,
    analytics: false,
    marketing: false,
  });

  const isAdmin = location.pathname.startsWith('/admin');

  useEffect(() => {
    if (isAdmin) return;
    const cookieConsent = getCookieConsent();

    if (!cookieConsent) {
      const timer = setTimeout(() => setShowBanner(true), 1500);
      return () => clearTimeout(timer);
    } else {
      setPreferences(cookieConsent);
    }
  }, [isAdmin]);

  const savePreferences = (prefs: CookiePreferences) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    window.dispatchEvent(new CustomEvent('cookie-consent-updated', { detail: prefs }));
  };

  const handleAcceptAll = () => {
    const allAccepted: CookiePreferences = { essential: true, analytics: true, marketing: true };
    setPreferences(allAccepted);
    savePreferences(allAccepted);
    setShowBanner(false);
  };

  const handleAcceptSelected = () => {
    savePreferences(preferences);
    setShowBanner(false);
  };

  const handleRejectAll = () => {
    const essentialOnly: CookiePreferences = { essential: true, analytics: false, marketing: false };
    setPreferences(essentialOnly);
    savePreferences(essentialOnly);
    setShowBanner(false);
  };

  const handleTogglePreference = (key: keyof CookiePreferences) => {
    if (key === 'essential') return;
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
  };

  if (isAdmin) return null;

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          className="fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-border shadow-lg"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          {showDetails && (
            <div className="max-w-6xl mx-auto px-4 pt-3 max-h-[60vh] overflow-y-auto">
              <div className="space-y-2 pb-3 border-b border-border">
                <div className="flex items-center justify-between rounded border border-border px-3 py-2">
                  <div>
                    <h4 className="text-sm font-semibold text-foreground">Essential Cookies</h4>
                    <p className="text-xs text-muted-foreground">Required for basic site functionality.</p>
                  </div>
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">Always Active</span>
                </div>
                <div className="flex items-center justify-between rounded border border-border px-3 py-2">
                  <div>
                    <h4 className="text-sm font-semibold text-foreground">Analytics Cookies</h4>
                    <p className="text-xs text-muted-foreground">Help us understand how visitors use the site.</p>
                  </div>
                  <Switch
                    checked={preferences.analytics}
                    onCheckedChange={() => handleTogglePreference('analytics')}
                  />
                </div>
                <div className="flex items-center justify-between rounded border border-border px-3 py-2">
                  <div>
                    <h4 className="text-sm font-semibold text-foreground">Marketing Cookies</h4>
                    <p className="text-xs text-muted-foreground">Used to show you relevant ads.</p>
                  </div>
                  <Switch
                    checked={preferences.marketing}
                    onCheckedChange={() => handleTogglePreference('marketing')}
                  />
                </div>
              </div>
            </div>
          )}

          <div className="max-w-6xl mx-auto px-4 py-3">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <p className="text-sm text-card-foreground/80 pr-2">
                We use cookies to improve your experience and analyze traffic.{' '}
                <Link to="/privacy-policy" className="text-primary hover:underline font-medium">
                  Privacy Policy
                </Link>
              </p>

              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  size="sm"
                  onClick={handleAcceptAll}
                  className="bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold"
                >
                  Accept All
                </Button>
                <Button size="sm" variant="outline" onClick={handleRejectAll} className="font-semibold">
                  Reject All
                </Button>
                {showDetails ? (
                  <Button size="sm" variant="ghost" onClick={handleAcceptSelected} className="font-semibold">
                    Save Preferences
                  </Button>
                ) : (
                  <Button size="sm" variant="ghost" onClick={() => setShowDetails(true)} className="font-semibold">
                    Customize
                  </Button>
                )}
                <button
                  onClick={handleRejectAll}
                  className="text-muted-foreground hover:text-foreground transition-colors p-1"
                  aria-label="Close cookie banner"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CookieConsent;
