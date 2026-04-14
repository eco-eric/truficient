import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
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

const CLUSTER_ORDER = ['Oak Cliff', 'East Dallas', 'North Dallas', 'Downtown Dallas', 'South Dallas', 'Uptown/Oak Lawn', 'West Dallas', 'Design District', 'Lakewood', 'Lake Highlands', 'Dallas UHI Research', 'Outer Ring'];

const ServiceAreasHub = () => {
  usePageSEO('/service-areas');
  const [locations, setLocations] = useState<LocationPage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLocations = async () => {
      const { data, error } = await supabase
        .from('seo_location_pages' as any)
        .select('id, neighborhood, city, url_slug, primary_service, cluster, published')
        .eq('published', true)
        .eq('add_to_service_areas_hub', true)
        .order('neighborhood', { ascending: true });
      if (!error) setLocations((data as unknown as LocationPage[]) || []);
      setLoading(false);
    };
    fetchLocations();
  }, []);

  const grouped = CLUSTER_ORDER.reduce((acc, cluster) => {
    const pages = locations.filter(l => l.cluster === cluster);
    if (pages.length > 0) acc[cluster] = pages;
    return acc;
  }, {} as Record<string, LocationPage[]>);

  const clusterSlug = (name: string) => name.toLowerCase().replace(/\s+/g, '-');

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
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : Object.keys(grouped).length === 0 ? (
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
