import { useEffect, useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import {
  getCookieConsent,
  savePreferences,
  type CookiePreferences as Prefs,
} from '@/components/CookieConsent';

const defaultPrefs: Prefs = { essential: true, analytics: true, marketing: true };

const CookiePreferences = () => {
  const [prefs, setPrefs] = useState<Prefs>(defaultPrefs);

  useEffect(() => {
    const current = getCookieConsent();
    if (current) setPrefs(current);
    document.title = 'Cookie Preferences | Truficient HVAC';
  }, []);

  const toggle = (key: keyof Prefs) => {
    if (key === 'essential') return;
    setPrefs((p) => ({ ...p, [key]: !p[key] }));
  };

  const handleSave = () => {
    savePreferences({ ...prefs, essential: true });
    toast({ title: 'Preferences saved', description: 'Your cookie preferences have been updated.' });
  };

  const handleAcceptAll = () => {
    const all: Prefs = { essential: true, analytics: true, marketing: true };
    setPrefs(all);
    savePreferences(all);
    toast({ title: 'All cookies accepted' });
  };

  const handleRejectAll = () => {
    const essentialOnly: Prefs = { essential: true, analytics: false, marketing: false };
    setPrefs(essentialOnly);
    savePreferences(essentialOnly);
    toast({ title: 'Non-essential cookies disabled' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-12 max-w-3xl">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">Cookie Preferences</h1>
          <p className="text-muted-foreground mb-8">
            Manage how Truficient uses cookies on this device. Essential cookies are always on so the
            site works correctly.
          </p>

          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3">
              <div>
                <h2 className="text-sm font-semibold text-foreground">Essential Cookies</h2>
                <p className="text-xs text-muted-foreground">Required for basic site functionality.</p>
              </div>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">Always Active</span>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3">
              <div>
                <h2 className="text-sm font-semibold text-foreground">Analytics Cookies</h2>
                <p className="text-xs text-muted-foreground">Help us understand how visitors use the site.</p>
              </div>
              <Switch checked={prefs.analytics} onCheckedChange={() => toggle('analytics')} />
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3">
              <div>
                <h2 className="text-sm font-semibold text-foreground">Marketing Cookies</h2>
                <p className="text-xs text-muted-foreground">Used to show you relevant ads.</p>
              </div>
              <Switch checked={prefs.marketing} onCheckedChange={() => toggle('marketing')} />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-6">
            <Button onClick={handleSave} className="font-semibold">Save Preferences</Button>
            <Button variant="secondary" onClick={handleAcceptAll} className="font-semibold">Accept All</Button>
            <Button variant="outline" onClick={handleRejectAll} className="font-semibold">Reject All</Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CookiePreferences;
