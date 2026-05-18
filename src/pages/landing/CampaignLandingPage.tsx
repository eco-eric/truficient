import { useEffect } from 'react';
import { LandingPageForm } from '@/components/forms/LandingPageForm';
import LandingPageShell from './components/LandingPageShell';
import { useCampaignSource } from './components/useCampaignSource';

export default function CampaignLandingPage() {
  const { platform, campaignName } = useCampaignSource();

  useEffect(() => {
    // Facebook Pixel
    if (platform === 'facebook' && (window as any).fbq) {
      (window as any).fbq('track', 'ViewContent', {
        content_name: `Campaign Landing - ${campaignName}`,
        campaign_source: 'facebook',
      });
    }

    // Google Ads / GA4
    if ((window as any).gtag) {
      (window as any).gtag('event', 'page_view', {
        page_title: `Campaign Landing - ${campaignName}`,
        page_location: window.location.href,
        campaign_source: platform,
        campaign_medium: 'paid',
        campaign_name: campaignName,
      });
    }
  }, [platform, campaignName]);

  return (
    <LandingPageShell>
      <section className="relative py-20 md:py-28 bg-gradient-to-br from-[hsl(var(--primary))] via-[hsl(var(--primary))] to-[hsl(var(--primary)/0.85)] text-primary-foreground overflow-hidden">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-block px-3 py-1 rounded-full bg-white/15 backdrop-blur text-sm font-medium mb-6">
                {platform === 'google' ? 'Google Ads' : 'Facebook'} Campaign
              </div>

              <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
                {campaignName}
              </h1>

              <p className="text-lg md:text-xl text-primary-foreground/90 mb-6">
                Get a transparent HVAC estimate from a Mitsubishi Diamond Contractor serving DFW homeowners. No callbacks required.
              </p>
            </div>

            <div id="get-info" className="bg-white text-foreground rounded-xl shadow-2xl p-6 md:p-8">
              <h2 className="text-2xl font-semibold mb-2">Get Your Free Estimate</h2>
              <p className="text-sm text-muted-foreground mb-6">Tell us about your project — we'll be in touch shortly.</p>
              <LandingPageForm slug="campaign-default" />
            </div>
          </div>
        </div>
      </section>
    </LandingPageShell>
  );
}
