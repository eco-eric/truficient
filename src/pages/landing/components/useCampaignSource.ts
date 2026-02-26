import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';

export interface CampaignSource {
  slug: string;
  platform: 'facebook' | 'google' | 'unknown';
  campaignName: string;
}

/**
 * Auto-detect campaign source from the URL path.
 * Convention: slug ending in "-g" = Google Ads, otherwise Facebook.
 */
export function useCampaignSource(): CampaignSource {
  const { pathname } = useLocation();

  return useMemo(() => {
    const slug = pathname.split('/').pop() || '';
    const isGoogle = slug.endsWith('-g');
    const platform: CampaignSource['platform'] = isGoogle ? 'google' : 'facebook';
    // Strip the trailing -g to get the base campaign name
    const campaignName = isGoogle ? slug.slice(0, -2) : slug;

    return { slug, platform, campaignName };
  }, [pathname]);
}
