import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import ReactMarkdown from 'react-markdown';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { usePageSEO } from '@/hooks/usePageSEO';
import { Loader2, MapPin, ArrowRight } from 'lucide-react';

interface LocationPage {
  id: string;
  neighborhood: string;
  city: string;
  url_slug: string;
  primary_service: string | null;
  cluster: string | null;
  published: boolean;
}

interface HubContent {
  content: string | null;
  meta_title: string | null;
  meta_description: string | null;
  schema_enabled: boolean;
  schema_json: Record<string, unknown> | null;
  url_slug: string;
}

const CLUSTER_ORDER = ['Oak Cliff', 'East Dallas', 'North Dallas', 'Downtown Dallas', 'South Dallas', 'Uptown/Oak Lawn', 'West Dallas', 'Design District', 'Lakewood', 'Lake Highlands', 'Brand - Mitsubishi', 'Dallas UHI Research', 'Outer Ring'];

const PHONE_TEL = 'tel:2142384349';

const markdownComponents = {
  a: ({ href, children, ...props }: any) => {
    if (href === '#contact') {
      return <Link to="/hvac-estimate" className="text-primary hover:underline font-medium" {...props}>{children}</Link>;
    }
    if (href?.startsWith('tel:')) {
      return <a href={PHONE_TEL} className="text-primary hover:underline font-medium" {...props}>{children}</a>;
    }
    if (href?.startsWith('#')) {
      return <a href={href} className="text-primary hover:underline" {...props}>{children}</a>;
    }
    if (href?.startsWith('/')) {
      return <Link to={href} className="text-primary hover:underline" {...props}>{children}</Link>;
    }
    return <a href={href} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer" {...props}>{children}</a>;
  },
  h1: ({ children, ...props }: any) => <h1 id={slugFromChildren(children)} {...props}>{children}</h1>,
  h2: ({ children, ...props }: any) => <h2 id={slugFromChildren(children)} {...props}>{children}</h2>,
  h3: ({ children, ...props }: any) => <h3 id={slugFromChildren(children)} {...props}>{children}</h3>,
};

const slugFromChildren = (children: any): string => {
  const text = (Array.isArray(children) ? children : [children])
    .map((c) => (typeof c === 'string' ? c : c?.props?.children ?? ''))
    .join(' ');
  return text.toString().toLowerCase().trim()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
};

// Strip raw <a name="..."></a> anchor tags that ReactMarkdown would otherwise render as text
const sanitizeHubMarkdown = (md: string): string =>
  md.replace(/<a\s+name=["'][^"']*["']\s*>\s*<\/a>/gi, '');

const ServiceAreasHub = () => {
  usePageSEO('/service-areas');
  const [hub, setHub] = useState<HubContent | null>(null);
  const [locations, setLocations] = useState<LocationPage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      // Try to load curated master-directory content from DB (slug variants)
      const slugVariants = ['/service-areas/', '/service-areas'];
      for (const s of slugVariants) {
        const { data } = await supabase
          .from('seo_location_pages' as any)
          .select('content, meta_title, meta_description, schema_enabled, schema_json, url_slug')
          .eq('url_slug', s)
          .eq('published', true)
          .maybeSingle();
        if (data) { setHub(data as unknown as HubContent); break; }
      }

      // Always fetch fallback list
      const { data: locs } = await supabase
        .from('seo_location_pages' as any)
        .select('id, neighborhood, city, url_slug, primary_service, cluster, published')
        .eq('published', true)
        .eq('add_to_service_areas_hub', true)
        .order('neighborhood', { ascending: true });
      setLocations((locs as unknown as LocationPage[]) || []);
      setLoading(false);
    };
    fetchAll();
  }, []);

  // Apply SEO meta from hub content + canonical + JSON-LD
  useEffect(() => {
    if (!hub) return;
    if (hub.meta_title) document.title = hub.meta_title;
    if (hub.meta_description) {
      let meta = document.querySelector('meta[name="description"]');
      if (!meta) { meta = document.createElement('meta'); meta.setAttribute('name', 'description'); document.head.appendChild(meta); }
      meta.setAttribute('content', hub.meta_description);
    }
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) { canonical = document.createElement('link'); canonical.setAttribute('rel', 'canonical'); document.head.appendChild(canonical); }
    canonical.setAttribute('href', 'https://truficient.com/service-areas/');

    // Remove global page_seo HVACBusiness schema; inject hub-specific one
    document.getElementById('page-seo-jsonld')?.remove();
    if (hub.schema_enabled && hub.schema_json) {
      let existing = document.getElementById('service-areas-hub-jsonld');
      if (existing) existing.remove();
      const script = document.createElement('script');
      script.id = 'service-areas-hub-jsonld';
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(hub.schema_json);
      document.head.appendChild(script);
    }
    return () => { document.getElementById('service-areas-hub-jsonld')?.remove(); };
  }, [hub]);

  const grouped = CLUSTER_ORDER.reduce((acc, cluster) => {
    const pages = locations.filter(l => l.cluster === cluster);
    if (pages.length > 0) acc[cluster] = pages;
    return acc;
  }, {} as Record<string, LocationPage[]>);

  const clusterSlug = (name: string) => name.toLowerCase().replace(/\s+/g, '-');

  const proseClasses = `prose prose-lg max-w-none
    prose-headings:text-foreground prose-p:text-muted-foreground
    prose-a:text-primary prose-strong:text-foreground
    prose-h1:text-3xl prose-h1:md:text-4xl prose-h1:font-bold prose-h1:mb-6
    prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
    prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
    prose-li:text-muted-foreground prose-ul:my-4
    prose-hr:border-border prose-hr:my-8`;

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  // Preferred: render the curated master directory from DB
  if (hub?.content) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow">
          <article className="container mx-auto px-4 py-10">
            <div className="max-w-4xl mx-auto">
              <div className={proseClasses}>
                <ReactMarkdown components={markdownComponents}>{hub.content}</ReactMarkdown>
              </div>
            </div>
          </article>
        </main>
        <Footer />
      </div>
    );
  }

  // Fallback: legacy auto-generated cluster grid
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <section className="bg-primary text-primary-foreground py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl font-bold mb-4">Service Areas</h1>
            <p className="text-lg opacity-90 max-w-2xl mx-auto">
              Truficient Energy Solutions proudly serves neighborhoods across the Dallas-Fort Worth metroplex with expert HVAC installation, repair, and energy solutions.
            </p>
          </div>
        </section>

        <section className="py-12">
          <div className="container mx-auto px-4">
            {Object.keys(grouped).length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>Location pages coming soon. Check back for neighborhood-specific HVAC services.</p>
              </div>
            ) : (
              <div className="space-y-10">
                {Object.entries(grouped).map(([cluster, pages]) => (
                  <div key={cluster} className="bg-card rounded-lg border p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-2xl font-bold flex items-center gap-2">
                        <MapPin className="h-6 w-6 text-primary" />
                        {cluster}
                      </h2>
                      <Link
                        to={`/service-areas/${clusterSlug(cluster)}`}
                        className="text-sm text-primary hover:underline flex items-center gap-1"
                      >
                        View all <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {pages.map(page => (
                        <Link
                          key={page.id}
                          to={page.url_slug}
                          className="block p-3 rounded-md border hover:border-primary hover:bg-accent transition-colors"
                        >
                          <div className="font-medium text-sm">{page.neighborhood}</div>
                          <div className="text-xs text-muted-foreground">{page.primary_service || 'HVAC Services'}</div>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-12 bg-card rounded-lg border p-6">
              <h2 className="text-2xl font-bold mb-4">Major Service Regions</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { name: 'Dallas Area', path: '/service-areas/dallas-area' },
                  { name: 'North Dallas Area', path: '/service-areas/north-dallas-area' },
                  { name: 'Frisco-McKinney Area', path: '/service-areas/frisco-mckinney-area' },
                  { name: 'Mid-Cities Area', path: '/service-areas/mid-cities-area' },
                  { name: 'South Dallas Area', path: '/service-areas/south-dallas-area' },
                ].map(area => (
                  <Link
                    key={area.path}
                    to={area.path}
                    className="block p-4 rounded-md border hover:border-primary hover:bg-accent transition-colors"
                  >
                    <div className="font-medium flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      {area.name}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default ServiceAreasHub;
