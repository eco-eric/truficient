import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    const cookieConsent = getCookieConsent();
    
    if (!cookieConsent) {
      const timer = setTimeout(() => setShowBanner(true), 1000);
      return () => clearTimeout(timer);
    } else {
      setPreferences(cookieConsent);
    }
  }, []);

  const savePreferences = (prefs: CookiePreferences) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    // Dispatch event so TrackingScripts can react
    window.dispatchEvent(new CustomEvent('cookie-consent-updated', { detail: prefs }));
  };

  const handleAcceptAll = () => {
    const allAccepted: CookiePreferences = {
      essential: true,
      analytics: true,
      marketing: true,
    };
    
    setPreferences(allAccepted);
    savePreferences(allAccepted);
    setShowBanner(false);
  };

  const handleAcceptSelected = () => {
    savePreferences(preferences);
    setShowBanner(false);
  };

  const handleRejectAll = () => {
    const essentialOnly: CookiePreferences = {
      essential: true,
      analytics: false,
      marketing: false,
    };
    
    setPreferences(essentialOnly);
    savePreferences(essentialOnly);
    setShowBanner(false);
  };

  const handleTogglePreference = (key: keyof CookiePreferences) => {
    if (key === 'essential') return;
    
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <AnimatePresence>
      {showBanner && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4 pointer-events-none">
          {/* Backdrop */}
          <motion.div 
            className="absolute inset-0 bg-black/50 pointer-events-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          
          {/* Cookie Banner */}
          <motion.div 
            className="relative w-full max-w-4xl bg-card rounded-lg shadow-2xl pointer-events-auto"
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            {/* Header */}
            <div className="bg-primary text-primary-foreground px-6 py-4 rounded-t-lg">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">Cookie Preferences</h3>
                <button
                  onClick={() => setShowBanner(false)}
                  className="text-primary-foreground hover:text-primary-foreground/80 transition-colors"
                  aria-label="Close cookie banner"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="px-6 py-6">
              <p className="text-muted-foreground mb-4">
                We use cookies to enhance your browsing experience, analyze site traffic, and provide personalized content. 
                By clicking "Accept All," you consent to our use of cookies. You can customize your preferences or learn more 
                in our{' '}
                <Link to="/privacy-policy" className="text-secondary hover:underline font-semibold">
                  Privacy Policy
                </Link>.
              </p>

              {/* Cookie Details Toggle */}
              {!showDetails ? (
                <button
                  onClick={() => setShowDetails(true)}
                  className="text-primary hover:text-secondary font-semibold transition-colors mb-4"
                >
                  Customize Preferences →
                </button>
              ) : (
                <div className="space-y-4 mb-6">
                  {/* Essential Cookies */}
                  <div className="border border-border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-foreground">Essential Cookies</h4>
                      <span className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded">
                        Always Active
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Required for basic site functionality, security, and navigation. These cannot be disabled.
                    </p>
                  </div>

                  {/* Analytics Cookies */}
                  <div className="border border-border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-foreground">Analytics Cookies</h4>
                      <Switch
                        checked={preferences.analytics}
                        onCheckedChange={() => handleTogglePreference('analytics')}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Help us understand how visitors interact with our website to improve user experience (e.g., Google Analytics).
                    </p>
                  </div>

                  {/* Marketing Cookies */}
                  <div className="border border-border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-foreground">Marketing Cookies</h4>
                      <Switch
                        checked={preferences.marketing}
                        onCheckedChange={() => handleTogglePreference('marketing')}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Allow us to show you relevant advertisements and measure campaign effectiveness.
                    </p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                {showDetails ? (
                  <>
                    <Button
                      onClick={handleAcceptSelected}
                      className="flex-1 bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold"
                    >
                      Save Preferences
                    </Button>
                    <Button
                      onClick={handleRejectAll}
                      variant="outline"
                      className="flex-1 font-bold"
                    >
                      Reject All
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      onClick={handleAcceptAll}
                      className="flex-1 bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold"
                    >
                      Accept All
                    </Button>
                    <Button
                      onClick={handleRejectAll}
                      variant="outline"
                      className="flex-1 font-bold"
                    >
                      Reject All
                    </Button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CookieConsent;
