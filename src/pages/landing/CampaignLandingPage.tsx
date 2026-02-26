import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useButtonTracking } from '@/hooks/useButtonTracking';
import LandingPageShell from './components/LandingPageShell';
import { useCampaignSource } from './components/useCampaignSource';

export default function CampaignLandingPage() {
  const { trackButtonClick } = useButtonTracking();
  const navigate = useNavigate();
  const { slug, platform, campaignName } = useCampaignSource();

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

  const handleCTAClick = () => {
    trackButtonClick({
      buttonName: 'Campaign CTA',
      buttonLocation: `Landing Page - ${slug}`,
      destinationUrl: '/scanner',
    });
    navigate('/scanner');
  };

  return (
    <LandingPageShell>
      {/* Placeholder hero — replace with campaign-specific content */}
      <section className="py-24 md:py-32">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <div className="inline-block px-3 py-1 rounded-full bg-secondary/10 text-secondary text-sm font-medium mb-6">
            {platform === 'google' ? 'Google Ads' : 'Facebook'} Campaign
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
            Campaign: <span className="text-secondary">{campaignName}</span>
          </h1>

          <p className="text-lg text-muted-foreground mb-10">
            This is a placeholder landing page. Update the content for this campaign in{' '}
            <code className="text-sm bg-muted px-1.5 py-0.5 rounded">src/pages/landing/CampaignLandingPage.tsx</code>
          </p>

          <Button
            size="lg"
            onClick={handleCTAClick}
            className="text-lg px-10 py-7 group bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold shadow-xl"
          >
            Get Started
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </section>
    </LandingPageShell>
  );
}
