import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Loader2, MapPin, Phone, ArrowLeft, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LocationData {
  id: string;
  neighborhood: string;
  city: string;
  state: string;
  zip_code: string | null;
  cluster: string | null;
  url_slug: string;
  h1_title: string | null;
  housing_stock: string | null;
  local_landmark: string | null;
  utility_note: string | null;
  primary_service: string | null;
  recommended_system: string | null;
  case_study_url: string | null;
  template: string | null;
  schema_enabled: boolean;
  schema_description: string | null;
  page_seo_id: string | null;
}

interface SeoData {
  meta_title: string | null;
  meta_description: string | null;
}

const LocationPage = () => {
  const { locationSlug } = useParams<{ locationSlug: string }>();
  const [location, setLocation] = useState<LocationData | null>(null);
  const [seo, setSeo] = useState<SeoData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!locationSlug) { setLoading(false); return; }
    const fetchData = async () => {
      // Try with and without leading/trailing slashes to match DB format
      const slugVariants = [
        `/${locationSlug}/`,
        `/${locationSlug}`,
        locationSlug,
        `${locationSlug}/`,
      ];
      let found = false;
      for (const s of slugVariants) {
        const { data, error } = await supabase
          .from('seo_location_pages' as any)
          .select('*')
          .eq('url_slug', s)
          .eq('published', true)
          .maybeSingle();
        if (!error && data) {
          setLocation(data as unknown as LocationData);
          found = true;
          // Fetch SEO data
          if ((data as any).page_seo_id) {
            const { data: seoData } = await supabase
              .from('page_seo' as any)
              .select('meta_title, meta_description')
              .eq('id', (data as any).page_seo_id)
              .single();
            if (seoData) setSeo(seoData as unknown as SeoData);
          }
          break;
        }
      }
      if (!found) setLocation(null);
      setLoading(false);
    };
    fetchData();
  }, [locationSlug]);

  // Apply SEO meta tags
  useEffect(() => {
    if (seo?.meta_title) document.title = seo.meta_title;
    if (seo?.meta_description) {
      let meta = document.querySelector('meta[name="description"]');
      if (!meta) { meta = document.createElement('meta'); meta.setAttribute('name', 'description'); document.head.appendChild(meta); }
      meta.setAttribute('content', seo.meta_description);
    }
  }, [seo]);

  // Inject JSON-LD schema
  useEffect(() => {
    if (location?.schema_enabled) {
      const schema = {
        "@context": "https://schema.org",
        "@type": "HVACBusiness",
        "name": "Truficient Energy Solutions",
        "url": `https://truficient.com${location.url_slug}`,
        "telephone": "972-598-9154",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": location.neighborhood,
          "addressRegion": location.state,
          "postalCode": location.zip_code || "",
          "addressCountry": "US"
        },
        "areaServed": {
          "@type": "City",
          "name": `${location.neighborhood}, ${location.city}, ${location.state}`
        },
        "description": location.schema_description || `Professional ${location.primary_service || 'HVAC'} services in ${location.neighborhood}, ${location.city}, ${location.state}`,
        "priceRange": "$$",
        "hasOfferCatalog": {
          "@type": "OfferCatalog",
          "name": "HVAC Services",
          "itemListElement": [{
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": location.primary_service || "HVAC Services"
            }
          }]
        }
      };
      const scriptId = 'location-jsonld';
      let existing = document.getElementById(scriptId);
      if (existing) existing.remove();
      const script = document.createElement('script');
      script.id = scriptId;
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(schema);
      document.head.appendChild(script);
      return () => { document.getElementById(scriptId)?.remove(); };
    }
  }, [location]);

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

  if (!location) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Page Not Found</h1>
            <p className="text-muted-foreground mb-4">This service area page doesn't exist.</p>
            <Button asChild><Link to="/service-areas">View All Service Areas</Link></Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const clusterSlug = location.cluster?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        {/* Hero */}
        <section className="bg-primary text-primary-foreground py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl font-bold mb-4">{location.h1_title || `${location.primary_service} in ${location.neighborhood}`}</h1>
            <p className="text-lg opacity-90 max-w-2xl mx-auto">
              Professional HVAC services for {location.neighborhood}, {location.city}, {location.state}
            </p>
            <div className="mt-6">
              <Button size="lg" variant="secondary" asChild>
                <a href="tel:972-598-9154" className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Call 972-598-9154
                </a>
              </Button>
            </div>
          </div>
        </section>

        {/* Breadcrumbs */}
        <div className="container mx-auto px-4 py-4">
          <nav className="text-sm text-muted-foreground flex items-center gap-1 flex-wrap">
            <Link to="/" className="hover:text-primary">Home</Link>
            <span>/</span>
            <Link to="/service-areas" className="hover:text-primary">Service Areas</Link>
            {location.cluster && (
              <>
                <span>/</span>
                <Link to={`/service-areas/${clusterSlug}`} className="hover:text-primary">{location.cluster}</Link>
              </>
            )}
            <span>/</span>
            <span className="text-foreground">{location.neighborhood}</span>
          </nav>
        </div>

        {/* Content */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main content */}
              <div className="lg:col-span-2 space-y-8">
                <div className="prose max-w-none">
                  <h2>{location.primary_service || 'HVAC Services'} in {location.neighborhood}</h2>
                  <p>
                    Truficient Energy Solutions provides expert {(location.primary_service || 'HVAC').toLowerCase()} services
                    to homeowners and businesses in {location.neighborhood}, {location.city}.
                    {location.housing_stock && ` The area is known for its ${location.housing_stock}, which often require specialized HVAC solutions.`}
                  </p>
                  {location.local_landmark && (
                    <p>
                      Located near {location.local_landmark}, our team is familiar with the unique comfort needs of this neighborhood.
                    </p>
                  )}
                  {location.utility_note && (
                    <p>
                      <strong>Utility Information:</strong> {location.utility_note}
                    </p>
                  )}
                </div>

                {location.recommended_system && (
                  <div className="bg-accent/50 rounded-lg p-6">
                    <h3 className="font-bold text-lg mb-2">Recommended System</h3>
                    <p className="text-muted-foreground">{location.recommended_system}</p>
                  </div>
                )}

                <div>
                  <h3 className="font-bold text-lg mb-4">Why Choose Truficient?</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {['Licensed & Insured Technicians', 'Free In-Home Estimates', 'Energy-Efficient Solutions', 'Same-Day Service Available'].map(item => (
                      <div key={item} className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                        <span className="text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {location.case_study_url && (
                  <div className="border rounded-lg p-4">
                    <p className="text-sm text-muted-foreground mb-2">Related reading:</p>
                    <Link to={location.case_study_url} className="text-primary hover:underline font-medium">
                      View our case study →
                    </Link>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <div className="bg-card border rounded-lg p-6">
                  <h3 className="font-bold mb-4">Get a Free Estimate</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Contact us for a free, no-obligation estimate for your {location.neighborhood} property.
                  </p>
                  <div className="space-y-3">
                    <Button className="w-full" asChild>
                      <a href="tel:972-598-9154" className="flex items-center justify-center gap-2">
                        <Phone className="h-4 w-4" />
                        972-598-9154
                      </a>
                    </Button>
                    <Button variant="outline" className="w-full" asChild>
                      <Link to="/hvac-estimate">Request Online Estimate</Link>
                    </Button>
                  </div>
                </div>

                <div className="bg-card border rounded-lg p-6">
                  <h3 className="font-bold mb-3 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    Service Area Info
                  </h3>
                  <dl className="space-y-2 text-sm">
                    <div><dt className="text-muted-foreground">Neighborhood</dt><dd className="font-medium">{location.neighborhood}</dd></div>
                    <div><dt className="text-muted-foreground">City</dt><dd className="font-medium">{location.city}, {location.state}</dd></div>
                    {location.zip_code && <div><dt className="text-muted-foreground">ZIP Code</dt><dd className="font-medium">{location.zip_code}</dd></div>}
                    {location.cluster && <div><dt className="text-muted-foreground">Region</dt><dd className="font-medium">{location.cluster}</dd></div>}
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default LocationPage;
