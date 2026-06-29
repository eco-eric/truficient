import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { usePageSEO } from '@/hooks/usePageSEO';
import { Loader2, MapPin, ArrowLeft, ArrowRight } from 'lucide-react';

interface LocationPage {
  id: string;
  neighborhood: string;
  city: string;
  url_slug: string;
  primary_service: string | null;
  h1_title: string | null;
}

const CLUSTER_MAP: Record<string, string> = {
  'oak-cliff': 'Oak Cliff',
  'east-dallas': 'East Dallas',
  'north-dallas': 'North Dallas',
  'downtown-dallas': 'Downtown Dallas',
  'south-dallas': 'South Dallas',
  'uptown-oak-lawn': 'Uptown/Oak Lawn',
  'west-dallas': 'West Dallas',
  'design-district': 'Design District',
  'outer-ring': 'Outer Ring',
  'lakewood': 'Lakewood',
  'lake-highlands': 'Lake Highlands',
  'dallas-uhi-research': 'Dallas UHI Research',
  'brand---mitsubishi': 'Brand - Mitsubishi',
};

const ClusterSubHub = () => {
  const { clusterSlug: rawClusterSlug } = useParams<{ clusterSlug: string }>();
  const clusterSlug = rawClusterSlug?.replace(/\.html$/, '');
  usePageSEO(`/service-areas/${clusterSlug}`);
  const [clusterName, setClusterName] = useState<string>(CLUSTER_MAP[clusterSlug || ''] || clusterSlug || '');
  const [locations, setLocations] = useState<LocationPage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!clusterSlug) { setLoading(false); return; }
    const slugify = (s: string) => s.toLowerCase().replace(/\s+/g, '-');
    const run = async () => {
      // Resolve the real cluster value whose slugified form matches the URL.
      // CLUSTER_MAP is a fast path; otherwise look it up from the data so EVERY
      // populated cluster gets a working hub (not just the ~13 hardcoded ones).
      let resolved = CLUSTER_MAP[clusterSlug];
      if (!resolved) {
        const { data: cl } = await supabase
          .from('seo_location_pages' as any)
          .select('cluster')
          .eq('published', true);
        const all = [...new Set(((cl as any[]) || []).map((r) => r.cluster).filter(Boolean))] as string[];
        resolved = all.find((c) => slugify(c) === clusterSlug) || clusterSlug;
      }
      setClusterName(resolved);
      const { data, error } = await supabase
        .from('seo_location_pages' as any)
        .select('id, neighborhood, city, url_slug, primary_service, h1_title')
        .eq('cluster', resolved)
        .eq('published', true)
        .order('neighborhood', { ascending: true });
      if (!error) setLocations((data as unknown as LocationPage[]) || []);
      setLoading(false);
    };
    run();
  }, [clusterSlug]);

  return (
    <div className="min-h-screen flex flex-col" data-ssg-ready={!loading ? 'true' : undefined}>
      <Header />
      <main className="flex-grow">
        <section className="bg-primary text-primary-foreground py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl font-bold mb-4">HVAC Services in {clusterName}</h1>
            <p className="text-lg opacity-90 max-w-2xl mx-auto">
              Expert heating, cooling, and energy solutions for the {clusterName} area of Dallas, TX.
            </p>
          </div>
        </section>

        <section className="py-12">
          <div className="container mx-auto px-4">
            <Link to="/service-areas" className="inline-flex items-center gap-1 text-sm text-primary hover:underline mb-6">
              <ArrowLeft className="h-3 w-3" /> Back to All Service Areas
            </Link>

            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : locations.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No location pages found for {clusterName} yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {locations.map(page => (
                  <Link
                    key={page.id}
                    to={page.url_slug}
                    className="block p-5 rounded-lg border bg-card hover:border-primary hover:shadow-md transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-semibold">{page.h1_title || page.neighborhood}</div>
                        <div className="text-sm text-muted-foreground">{page.primary_service || 'HVAC Services'}</div>
                        <div className="text-xs text-primary mt-2 flex items-center gap-1">
                          Learn more <ArrowRight className="h-3 w-3" />
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default ClusterSubHub;
