import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { cleanCanonicalUrl } from '@/lib/seo/socialMeta';

interface PageSEO {
  meta_title: string | null;
  meta_description: string | null;
  og_title: string | null;
  og_description: string | null;
  og_image: string | null;
  canonical_url: string | null;
  robots: string | null;
}

interface UsePageSEOOptions {
  /** Skip injecting the global HVACBusiness JSON-LD schema (e.g. on equipment pages that have their own schema) */
  skipGlobalSchema?: boolean;
}

export const usePageSEO = (customPath?: string, options?: UsePageSEOOptions) => {
  const location = useLocation();
  const path = customPath || location.pathname;
  const [seo, setSeo] = useState<PageSEO | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Always set a self-referencing canonical in the canonical URL form used
    // site-wide and by the SSG prerender: https, non-www, clean path, TRAILING
    // SLASH (e.g. https://truficient.com/hvac-garland-tx/). Keeping this in sync
    // with the prerendered <link rel="canonical"> avoids the raw HTML and the
    // hydrated DOM disagreeing on the canonical.
    const normalizedCanonical = cleanCanonicalUrl(path);
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', normalizedCanonical);

    const fetchSEO = async () => {
      try {
        const { data, error } = await supabase
          .from('page_seo' as any)
          .select('meta_title, meta_description, og_title, og_description, og_image, canonical_url, robots')
          .eq('page_path', path)
          .maybeSingle();

        if (!error && data) {
          setSeo(data as unknown as PageSEO);
          
          if ((data as any).meta_title) {
            document.title = (data as any).meta_title;
          }

          let descMeta = document.querySelector('meta[name="description"]');
          if (!descMeta) {
            descMeta = document.createElement('meta');
            descMeta.setAttribute('name', 'description');
            document.head.appendChild(descMeta);
          }
          if ((data as any).meta_description) {
            descMeta.setAttribute('content', (data as any).meta_description);
          }

          let robotsMeta = document.querySelector('meta[name="robots"]');
          if (!robotsMeta) {
            robotsMeta = document.createElement('meta');
            robotsMeta.setAttribute('name', 'robots');
            document.head.appendChild(robotsMeta);
          }
          robotsMeta.setAttribute('content', (data as any).robots || 'index, follow');

          const ogTags = {
            'og:title': (data as any).og_title || (data as any).meta_title,
            'og:description': (data as any).og_description || (data as any).meta_description,
            'og:image': (data as any).og_image,
            'og:url': (data as any).canonical_url || normalizedCanonical,
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

          // Mirror og:* into twitter:* so cards on X/Slack/LinkedIn show
          // per-page values instead of the homepage defaults from index.html.
          const twitterTags: Record<string, string | null | undefined> = {
            'twitter:title': ogTags['og:title'],
            'twitter:description': ogTags['og:description'],
            'twitter:image': ogTags['og:image'],
            'twitter:url': ogTags['og:url'],
          };
          Object.entries(twitterTags).forEach(([name, content]) => {
            if (content) {
              let twMeta = document.querySelector(`meta[name="${name}"]`);
              if (!twMeta) {
                twMeta = document.createElement('meta');
                twMeta.setAttribute('name', name);
                document.head.appendChild(twMeta);
              }
              twMeta.setAttribute('content', content);
            }
          });

          // Override canonical with DB value if provided — normalised to the
          // clean trailing-slash form for same-origin URLs so an authored
          // ".html" / no-slash value can't reintroduce a duplicate canonical.
          if ((data as any).canonical_url) {
            canonical!.setAttribute('href', cleanCanonicalUrl((data as any).canonical_url));
          }

          // Inject HVACBusiness JSON-LD schema for core pages (skip on equipment pages)
          const schemaId = 'page-seo-jsonld';
          let existingSchema = document.getElementById(schemaId);
          
          if (options?.skipGlobalSchema && existingSchema) {
            existingSchema.remove();
            existingSchema = null;
          }
          
          if (!existingSchema && !options?.skipGlobalSchema) {
            const hvacSchema = {
              "@context": "https://schema.org",
              "@type": "HVACBusiness",
              "name": "Truficient Energy Solutions",
              "url": "https://truficient.com",
              "logo": "https://truficient.com/logo.png",
              "telephone": "214-238-4349",
              "email": "info@truficient.com",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "Dallas",
                "addressLocality": "Dallas",
                "addressRegion": "TX",
                "postalCode": "75201",
                "addressCountry": "US"
              },
              "geo": {
                "@type": "GeoCoordinates",
                "latitude": 32.7767,
                "longitude": -96.7970
              },
              "areaServed": {
                "@type": "City",
                "name": "Dallas",
                "sameAs": "https://en.wikipedia.org/wiki/Dallas"
              },
              "sameAs": [
                "https://www.facebook.com/truficient",
                "https://www.google.com/maps/place/Truficient+Energy+Solutions"
              ],
              "openingHoursSpecification": [
                {
                  "@type": "OpeningHoursSpecification",
                  "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
                  "opens": "08:00",
                  "closes": "18:00"
                }
              ],
              "priceRange": "$$"
            };
            const script = document.createElement('script');
            script.id = schemaId;
            script.type = 'application/ld+json';
            script.textContent = JSON.stringify(hvacSchema);
            document.head.appendChild(script);
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
