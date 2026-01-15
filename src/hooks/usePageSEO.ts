import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface PageSEO {
  meta_title: string | null;
  meta_description: string | null;
  og_title: string | null;
  og_description: string | null;
  og_image: string | null;
  canonical_url: string | null;
  robots: string | null;
}

export const usePageSEO = (customPath?: string) => {
  const location = useLocation();
  const path = customPath || location.pathname;
  const [seo, setSeo] = useState<PageSEO | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSEO = async () => {
      try {
        const { data, error } = await supabase
          .from('page_seo' as any)
          .select('meta_title, meta_description, og_title, og_description, og_image, canonical_url, robots')
          .eq('page_path', path)
          .maybeSingle();

        if (!error && data) {
          setSeo(data as unknown as PageSEO);
          
          // Apply SEO tags to document
          if ((data as any).meta_title) {
            document.title = (data as any).meta_title;
          }

          // Update meta description
          let descMeta = document.querySelector('meta[name="description"]');
          if (!descMeta) {
            descMeta = document.createElement('meta');
            descMeta.setAttribute('name', 'description');
            document.head.appendChild(descMeta);
          }
          if ((data as any).meta_description) {
            descMeta.setAttribute('content', (data as any).meta_description);
          }

          // Update robots
          let robotsMeta = document.querySelector('meta[name="robots"]');
          if (!robotsMeta) {
            robotsMeta = document.createElement('meta');
            robotsMeta.setAttribute('name', 'robots');
            document.head.appendChild(robotsMeta);
          }
          robotsMeta.setAttribute('content', (data as any).robots || 'index, follow');

          // Update Open Graph tags
          const ogTags = {
            'og:title': (data as any).og_title || (data as any).meta_title,
            'og:description': (data as any).og_description || (data as any).meta_description,
            'og:image': (data as any).og_image,
            'og:url': (data as any).canonical_url || window.location.href,
          };

          Object.entries(ogTags).forEach(([property, content]) => {
            if (content) {
              let ogMeta = document.querySelector(`meta[property="${property}"]`);
              if (!ogMeta) {
                ogMeta = document.createElement('meta');
                ogMeta.setAttribute('property', property);
                document.head.appendChild(ogMeta);
              }
              ogMeta.setAttribute('content', content);
            }
          });

          // Update canonical
          let canonical = document.querySelector('link[rel="canonical"]');
          if ((data as any).canonical_url) {
            if (!canonical) {
              canonical = document.createElement('link');
              canonical.setAttribute('rel', 'canonical');
              document.head.appendChild(canonical);
            }
            canonical.setAttribute('href', (data as any).canonical_url);
          }
        }
      } catch (error) {
        console.error('Error fetching SEO settings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSEO();
  }, [path]);

  return { seo, loading };
};
