import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import ReactMarkdown from 'react-markdown';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Loader2, MapPin, Phone, CheckCircle, ImageIcon, Calculator, ScanLine } from 'lucide-react';
import EstimatorCards from '@/components/home/EstimatorCards';
import { LocationGallery } from '@/components/gallery/LocationGallery';
import { useLocationGalleryPhotos } from '@/hooks/useLocationGalleryPhotos';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

/**
 * Split markdown content at specific paragraph boundaries.
 * A "paragraph" is a text block between \n\n that doesn't start with #, -, *, |, >
 */
function splitMarkdownByParagraphs(content: string, splitAfter: number[]): string[] {
  const blocks = content.split(/\n\n+/);
  const chunks: string[] = [];
  let paragraphCount = 0;
  let currentChunk: string[] = [];
  let splitIndex = 0;

  for (const block of blocks) {
    currentChunk.push(block);
    const trimmed = block.trim();
    // Count as paragraph if it starts with a letter, digit, bracket, or quote mark
    if (trimmed && /^[a-zA-Z0-9\["'(]/.test(trimmed)) {
      paragraphCount++;
    }
    if (splitIndex < splitAfter.length && paragraphCount >= splitAfter[splitIndex]) {
      chunks.push(currentChunk.join('\n\n'));
      currentChunk = [];
      splitIndex++;
    }
  }
  if (currentChunk.length > 0) {
    chunks.push(currentChunk.join('\n\n'));
  }
  return chunks;
}

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
  schema_json: Record<string, unknown> | null;
  page_seo_id: string | null;
  content: string | null;
  meta_title: string | null;
  meta_description: string | null;
  geography_tag: string | null;
  zip_tag: string | null;
  city_tag: string | null;
  service_tags: string[] | null;
  property_tags: string[] | null;
  gallery_heading: string | null;
}

interface SeoData {
  meta_title: string | null;
  meta_description: string | null;
}

/** Parse FAQ Q&A pairs from markdown content */
function parseFAQsFromMarkdown(content: string): { question: string; answer: string }[] {
  const faqs: { question: string; answer: string }[] = [];
  // Match ## FAQ or ## Frequently Asked Questions section
  const faqMatch = content.match(/##\s*(?:FAQ|Frequently Asked Questions)[^\n]*\n([\s\S]*?)(?=\n##\s[^#]|$)/i);
  if (!faqMatch) return faqs;
  const faqSection = faqMatch[1];
  // Parse ### Question / answer pairs or **Question** / answer pairs
  const qaPairs = faqSection.split(/\n###\s+/).filter(Boolean);
  for (const pair of qaPairs) {
    const lines = pair.trim().split('\n');
    const question = lines[0]?.replace(/^\*\*|\*\*$/g, '').replace(/\??\s*$/, '?').trim();
    const answer = lines.slice(1).join(' ').replace(/\n/g, ' ').trim();
    if (question && answer) {
      faqs.push({ question, answer });
    }
  }
  return faqs;
}

const PHONE = '214-238-4349';
const PHONE_TEL = 'tel:2142384349';

const LocationPage = () => {
  const { locationSlug } = useParams<{ locationSlug: string }>();
  const [location, setLocation] = useState<LocationData | null>(null);
  const [seo, setSeo] = useState<SeoData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!locationSlug) { setLoading(false); return; }
    const fetchData = async () => {
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

  // Apply SEO meta tags — prefer location-level meta, fall back to page_seo
  useEffect(() => {
    const title = location?.meta_title || seo?.meta_title;
    const desc = location?.meta_description || seo?.meta_description;
    if (title) document.title = title;
    if (desc) {
      let meta = document.querySelector('meta[name="description"]');
      if (!meta) { meta = document.createElement('meta'); meta.setAttribute('name', 'description'); document.head.appendChild(meta); }
      meta.setAttribute('content', desc);
    }
  }, [seo, location]);

  // Inject JSON-LD schemas — HVACBusiness + Service + FAQPage
  useEffect(() => {
    if (!location) return;

    const schemas: Record<string, object> = {};

    // 1. HVACBusiness schema (existing)
    if (location.schema_enabled) {
      schemas['location-jsonld'] = location.schema_json || {
        "@context": "https://schema.org",
        "@type": "HVACBusiness",
        "name": "Truficient Energy Solutions",
        "url": `https://truficient.com${location.url_slug}`,
        "telephone": PHONE,
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
        "priceRange": "$$"
      };
    }

    // 2. Service schema
    if (location.primary_service) {
      schemas['location-service-jsonld'] = {
        "@context": "https://schema.org",
        "@type": "Service",
        "serviceType": location.primary_service,
        "provider": {
          "@type": "HVACBusiness",
          "name": "Truficient Energy Solutions",
          "telephone": PHONE,
          "url": "https://truficient.com"
        },
        "areaServed": {
          "@type": "City",
          "name": `${location.neighborhood}, ${location.city}, ${location.state}`
        },
        "url": `https://truficient.com${location.url_slug}`
      };
    }

    // 3. FAQPage schema — parse from markdown content
    if (location.content) {
      const faqs = parseFAQsFromMarkdown(location.content);
      if (faqs.length > 0) {
        schemas['location-faq-jsonld'] = {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": faqs.map(faq => ({
            "@type": "Question",
            "name": faq.question,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": faq.answer
            }
          }))
        };
      }
    }

    // Inject all schemas
    const scriptIds = Object.keys(schemas);
    scriptIds.forEach(id => {
      let existing = document.getElementById(id);
      if (existing) existing.remove();
      const script = document.createElement('script');
      script.id = id;
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(schemas[id]);
      document.head.appendChild(script);
    });

    return () => {
      scriptIds.forEach(id => document.getElementById(id)?.remove());
    };
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
  const hasFullContent = !!location.content;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
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
            <span className="text-foreground">{location.h1_title || location.neighborhood}</span>
          </nav>
        </div>

        {hasFullContent ? (
          // Full markdown content with inline galleries
          <FullContentWithGallery location={location} />
        ) : (
          // Legacy field-based rendering
          <>
            <section className="bg-primary text-primary-foreground py-16">
              <div className="container mx-auto px-4 text-center">
                <h1 className="text-4xl font-bold mb-4">{location.h1_title || `${location.primary_service} in ${location.neighborhood}`}</h1>
                <p className="text-lg opacity-90 max-w-2xl mx-auto">
                  Professional HVAC services for {location.neighborhood}, {location.city}, {location.state}
                </p>
                <div className="mt-6">
                  <Button size="lg" variant="secondary" asChild>
                    <a href={PHONE_TEL} className="flex items-center gap-2">
                      <Phone className="h-5 w-5" />
                      Call {PHONE}
                    </a>
                  </Button>
                </div>
              </div>
            </section>

            <section className="py-8">
              <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-8">
                    <div className="prose max-w-none">
                      <h2>{location.primary_service || 'HVAC Services'} in {location.neighborhood}</h2>
                      <p>
                        Truficient Energy Solutions provides expert {(location.primary_service || 'HVAC').toLowerCase()} services
                        to homeowners and businesses in {location.neighborhood}, {location.city}.
                        {location.housing_stock && ` The area is known for its ${location.housing_stock}, which often require specialized HVAC solutions.`}
                      </p>
                      {location.local_landmark && (
                        <p>Located near {location.local_landmark}, our team is familiar with the unique comfort needs of this neighborhood.</p>
                      )}
                      {location.utility_note && (
                        <p><strong>Utility Information:</strong> {location.utility_note}</p>
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
                        <Link to={location.case_study_url} className="text-primary hover:underline font-medium">View our case study →</Link>
                      </div>
                    )}
                  </div>
                  <div className="space-y-6">
                    <div className="bg-card border rounded-lg p-6">
                      <h3 className="font-bold mb-4">Get a Free Estimate</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Contact us for a free, no-obligation estimate for your {location.neighborhood} property.
                      </p>
                      <div className="space-y-3">
                        <Button className="w-full" asChild>
                          <a href={PHONE_TEL} className="flex items-center justify-center gap-2">
                            <Phone className="h-4 w-4" />
                            {PHONE}
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

            {/* Dynamic gallery for legacy pages too */}
            <div className="container mx-auto px-4">
              <div className="max-w-3xl mx-auto">
                <LocationGallery
                  neighborhood={location.neighborhood}
                  geographyTag={location.geography_tag}
                  zipTag={location.zip_tag}
                  cityTag={location.city_tag}
                  serviceTags={location.service_tags}
                  propertyTags={location.property_tags}
                  galleryHeading={location.gallery_heading}
                />
              </div>
            </div>

            {/* Tool Links for legacy pages too */}
            <div className="container mx-auto px-4 pb-16">
              <ToolLinksSection neighborhood={location.neighborhood} />
            </div>
          </>
        )}
      </main>
      <EstimatorCards />
      <Footer />
    </div>
  );
};

/** Markdown link renderer shared by all content sections */
const markdownComponents = {
  a: ({ href, children, ...props }: any) => {
    if (href === '#contact') {
      return <Link to="/hvac-estimate" className="text-primary hover:underline font-medium" {...props}>{children}</Link>;
    }
    if (href?.startsWith('tel:')) {
      return <a href={PHONE_TEL} className="text-primary hover:underline font-medium" {...props}>{children}</a>;
    }
    if (href?.startsWith('/')) {
      return <Link to={href} className="text-primary hover:underline" {...props}>{children}</Link>;
    }
    return <a href={href} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer" {...props}>{children}</a>;
  },
};

/** Full-content pages with inline gallery placement */
function FullContentWithGallery({ location }: { location: LocationData }) {
  const { data: photos = [], isLoading } = useLocationGalleryPhotos({
    geographyTag: location.geography_tag,
    zipTag: location.zip_tag,
    cityTag: location.city_tag,
    serviceTags: location.service_tags,
    propertyTags: location.property_tags,
  });

  const chunks = splitMarkdownByParagraphs(location.content!, [1, 3]);

  const proseClasses = `prose prose-lg max-w-none
    prose-headings:text-foreground prose-p:text-muted-foreground
    prose-a:text-primary prose-strong:text-foreground
    prose-h1:text-3xl prose-h1:md:text-4xl prose-h1:font-bold prose-h1:mb-6
    prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
    prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
    prose-li:text-muted-foreground
    prose-hr:border-border prose-hr:my-8`;

  return (
    <article className="container mx-auto px-4 pb-16">
      <div className="max-w-3xl mx-auto">
        {/* Chunk 1: up to paragraph 1 */}
        {chunks[0] && (
          <div className={proseClasses}>
            <ReactMarkdown components={markdownComponents}>{chunks[0]}</ReactMarkdown>
          </div>
        )}

        {/* First inline gallery: 4 photos after paragraph 1 */}
        <LocationGallery
          neighborhood={location.neighborhood}
          geographyTag={location.geography_tag}
          zipTag={location.zip_tag}
          cityTag={location.city_tag}
          serviceTags={location.service_tags}
          propertyTags={location.property_tags}
          galleryHeading={location.gallery_heading}
          photos={photos}
          isLoading={isLoading}
          maxPhotos={4}
          offset={0}
          compact
        />

        {/* Chunk 2: paragraphs 2-3 */}
        {chunks[1] && (
          <div className={proseClasses}>
            <ReactMarkdown components={markdownComponents}>{chunks[1]}</ReactMarkdown>
          </div>
        )}

        {/* Second inline gallery: next 4 photos after paragraph 3 */}
        {photos.length > 4 && (
          <LocationGallery
            neighborhood={location.neighborhood}
            geographyTag={location.geography_tag}
            zipTag={location.zip_tag}
            cityTag={location.city_tag}
            serviceTags={location.service_tags}
            propertyTags={location.property_tags}
            photos={photos}
            isLoading={isLoading}
            maxPhotos={4}
            offset={4}
            compact
          />
        )}

        {/* Chunk 3: rest of content */}
        {chunks[2] && (
          <div className={proseClasses}>
            <ReactMarkdown components={markdownComponents}>{chunks[2]}</ReactMarkdown>
          </div>
        )}

        {/* Tool Links Section */}
        <ToolLinksSection neighborhood={location.neighborhood} />
      </div>
    </article>
  );
}


function ToolLinksSection({ neighborhood }: { neighborhood: string }) {
  const tools = [
    {
      icon: ImageIcon,
      label: `See Our ${neighborhood} Installations`,
      href: '#gallery',
      description: `Browse photos from real mini-split and heat pump installations in ${neighborhood} homes.`,
    },
    {
      icon: Calculator,
      label: 'Get an Instant Estimate',
      href: '/hvac-estimate',
      description: 'Answer a few questions about your home and get a ballpark cost for your project.',
    },
    {
      icon: ScanLine,
      label: "Scan Your Home's Efficiency",
      href: '/scanner/',
      description: "Find out where your home is losing conditioned air and what upgrades make the most sense.",
    },
  ];

  return (
    <section className="mt-12 pt-8 border-t border-border">
      <h2 className="text-xl font-bold mb-6 text-foreground">Tools to Help You Decide</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {tools.map((tool) => (
          <Link key={tool.href} to={tool.href}>
            <Card className="h-full hover:shadow-md transition-shadow hover:border-primary/40">
              <CardContent className="p-5 flex flex-col items-start gap-3">
                <tool.icon className="h-6 w-6 text-primary" />
                <h3 className="font-semibold text-sm text-foreground">{tool.label}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{tool.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default LocationPage;
