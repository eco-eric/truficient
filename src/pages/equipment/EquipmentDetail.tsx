import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ChevronRight,
  Thermometer,
  Calendar,
  Zap,
  Wind,
  Gauge,
  Factory,
  FileText,
  ExternalLink,
  AlertTriangle,
  Info,
  ScanLine,
  Home,
  Phone,
  Snowflake,
  Flame,
  Fan,
  Droplets,
  LayoutGrid,
  GitBranch,
  Beaker,
  Plug,
  ShieldCheck,
} from 'lucide-react';
import { usePageSEO } from '@/hooks/usePageSEO';

const EQUIPMENT_TYPE_ICONS: Record<string, React.ReactNode> = {
  'Air Conditioner': <Snowflake className="w-4 h-4" />,
  'Heat Pump': <Thermometer className="w-4 h-4" />,
  'Furnace': <Flame className="w-4 h-4" />,
  'Air Handler': <Fan className="w-4 h-4" />,
  'Evaporator Coil': <Droplets className="w-4 h-4" />,
  'Window Unit': <LayoutGrid className="w-4 h-4" />,
  'Branch Box': <GitBranch className="w-4 h-4" />,
  'Condenser': <Snowflake className="w-4 h-4" />,
  'Mini Split': <Wind className="w-4 h-4" />,
};
import { documentationApi, DocumentResult, getBrandSupportUrl } from '@/lib/api/documentation';
import { useState, useEffect } from 'react';

interface SpecRowProps {
  icon: React.ReactNode;
  label: string;
  value: string | number | null | undefined;
}

function SpecRow({ icon, label, value }: SpecRowProps) {
  if (!value) return null;

  return (
    <div className="flex items-center justify-between py-3 border-b border-border last:border-0">
      <div className="flex items-center gap-3">
        <div className="text-muted-foreground">{icon}</div>
        <span className="font-medium text-foreground">{label}</span>
      </div>
      <span className="text-foreground font-semibold">{value}</span>
    </div>
  );
}

export default function EquipmentDetail() {
  const { "*": slug } = useParams();
  const [documents, setDocuments] = useState<DocumentResult[]>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(false);

  const { data: equipment, isLoading } = useQuery({
    queryKey: ['equipment-detail', slug],
    queryFn: async () => {
      if (!slug) return null;

      const { data, error } = await supabase
        .from('equipment_pages')
        .select('*')
        .eq('slug', slug)
        .eq('published', true)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  // Query for related pages with same model number but different brands
  const { data: relatedPages } = useQuery({
    queryKey: ['equipment-related', equipment?.model_number],
    queryFn: async () => {
      if (!equipment?.model_number) return [];

      const { data, error } = await supabase
        .from('equipment_pages')
        .select('id, slug, brand, model_number')
        .ilike('model_number', equipment.model_number)
        .neq('id', equipment.id)
        .eq('published', true);

      if (error) throw error;
      return data || [];
    },
    enabled: !!equipment?.model_number && !!equipment?.id,
  });

  const specs = equipment?.specs as Record<string, unknown> | undefined;
  const currentYear = new Date().getFullYear();
  const manufacturedYear = specs?.manufactured_year as number | undefined;
  const age = manufacturedYear ? currentYear - manufacturedYear : null;
  const refrigerant = specs?.refrigerant as string | undefined;
  const isR22 = refrigerant?.toLowerCase().includes('r-22') || refrigerant?.toLowerCase().includes('r22');

  // Set page title manually since usePageSEO expects a path
  usePageSEO(`/equipment/${slug}`);

  // Load documentation
  useEffect(() => {
    async function loadDocs() {
      if (!equipment) return;
      setIsLoadingDocs(true);
      try {
        const docs = await documentationApi.getDocumentsForEquipment(
          equipment.brand,
          equipment.model_number
        );
        setDocuments(docs);
      } catch (err) {
        console.error('Error loading documents:', err);
      } finally {
        setIsLoadingDocs(false);
      }
    }
    loadDocs();
  }, [equipment]);

  const handleSearchDocs = async () => {
    if (!equipment) return;
    setIsLoadingDocs(true);
    try {
      const response = await documentationApi.searchDocumentation(
        equipment.brand,
        equipment.model_number
      );
      if (response.success && response.documents) {
        setDocuments(response.documents);
      }
    } catch (err) {
      console.error('Error searching docs:', err);
    } finally {
      setIsLoadingDocs(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-64 mb-4" />
          <Skeleton className="h-48 w-full mb-6" />
          <Skeleton className="h-64 w-full" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!equipment) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Equipment Not Found</h1>
          <p className="text-muted-foreground mb-6">
            We couldn't find this equipment in our library.
          </p>
          <Link to="/equipment">
            <Button>Browse Equipment Library</Button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Breadcrumb */}
        <div className="bg-muted/50 border-b">
          <div className="container mx-auto px-4 py-3">
            <nav className="flex items-center gap-2 text-sm">
              <Link to="/equipment" className="text-muted-foreground hover:text-foreground">
                Equipment Library
              </Link>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
              <Link
                to={`/equipment?brand=${equipment.brand.toLowerCase()}`}
                className="text-muted-foreground hover:text-foreground capitalize"
              >
                {equipment.brand}
              </Link>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
              <span className="text-foreground font-medium">{equipment.model_number}</span>
            </nav>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Header Card */}
              <Card className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary" className="capitalize">
                        {equipment.brand}
                      </Badge>
                      {equipment.equipment_type && (
                        <Badge variant="outline" className="flex items-center gap-1.5">
                          {EQUIPMENT_TYPE_ICONS[equipment.equipment_type] || <Factory className="w-4 h-4" />}
                          {equipment.equipment_type}
                        </Badge>
                      )}
                    </div>
                    <h1 className="text-3xl font-bold font-mono">
                      {equipment.model_number}
                    </h1>
                  </div>
                </div>
              </Card>

              {/* Specifications Card */}
              <Card className="p-6">
                <h2 className="text-xl font-bold mb-4">Equipment Specifications</h2>
                <div className="space-y-1">
                  <SpecRow
                    icon={<Calendar className="w-5 h-5" />}
                    label="Manufactured"
                    value={manufacturedYear ? `${manufacturedYear}${age ? ` (${age} years old)` : ''}` : undefined}
                  />
                  <SpecRow
                    icon={<Thermometer className="w-5 h-5" />}
                    label="Tonnage"
                    value={specs?.tonnage as string}
                  />
                  <SpecRow
                    icon={<Gauge className="w-5 h-5" />}
                    label="SEER Rating"
                    value={specs?.seer_rating as number}
                  />
                  <SpecRow
                    icon={<Wind className="w-5 h-5" />}
                    label="Refrigerant"
                    value={refrigerant}
                  />
                  <SpecRow
                    icon={<Zap className="w-5 h-5" />}
                    label="Breaker Size"
                    value={specs?.breaker_size ? `${specs.breaker_size} Amp` : undefined}
                  />
                  <SpecRow
                    icon={<Factory className="w-5 h-5" />}
                    label="Fan Motor"
                    value={specs?.fan_motor_info as string}
                  />
                  <SpecRow
                    icon={<Factory className="w-5 h-5" />}
                    label="Compressor"
                    value={specs?.compressor_info as string}
                  />
                  <SpecRow
                    icon={<Beaker className="w-5 h-5" />}
                    label="Factory Charge"
                    value={specs?.factory_charge as string}
                  />
                  <SpecRow
                    icon={<Plug className="w-5 h-5" />}
                    label="Voltage/Phase"
                    value={specs?.voltage_info as string}
                  />
                </div>

                <div className="flex gap-2 p-3 bg-muted/50 rounded-lg text-sm mt-4">
                  <Info className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <p className="text-muted-foreground">
                    <strong>Note:</strong> Specifications are decoded from the model/serial number.
                    Consult a professional for precise system evaluation.
                  </p>
                </div>
              </Card>

              {/* Documentation Card */}
              <Card className="p-6">
                <h2 className="text-xl font-bold mb-4">Documentation & Manuals</h2>

                {isLoadingDocs ? (
                  <div className="space-y-3">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                ) : documents.length > 0 ? (
                  <div className="space-y-2">
                    {documents.map((doc, index) => (
                      <div
                        key={`${doc.document_url}-${index}`}
                        className="flex items-center justify-between py-3 border-b last:border-0"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <FileText className="w-5 h-5 text-primary flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="font-medium truncate">
                              {doc.document_title || doc.document_type}
                            </p>
                            {doc.source_domain && (
                              <p className="text-xs text-muted-foreground">
                                {doc.source_domain}
                              </p>
                            )}
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" asChild>
                          <a href={doc.document_url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-4 h-4 mr-1" />
                            Open
                          </a>
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <FileText className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
                    <p className="text-muted-foreground mb-4">
                      No documentation cached for this model yet
                    </p>
                    <Button onClick={handleSearchDocs} disabled={isLoadingDocs}>
                      Search for Documentation
                    </Button>
                  </div>
                )}

                {documents.length === 0 && !isLoadingDocs && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-muted-foreground mb-2">
                      Can't find what you need? Try the manufacturer directly:
                    </p>
                    <Button variant="outline" size="sm" asChild>
                      <a href={getBrandSupportUrl(equipment.brand)} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Visit {equipment.brand} Support
                      </a>
                    </Button>
                  </div>
                )}
              </Card>

              {/* Warranty Notice */}
              {age && age <= 10 && (
                <Card className="p-6 border-green-500/50 bg-green-500/10">
                  <div className="flex gap-4">
                    <ShieldCheck className="w-6 h-6 text-green-600 flex-shrink-0" />
                    <div>
                      <h3 className="font-bold text-green-700 dark:text-green-400 mb-2">Warranty Information</h3>
                      {age < 5 ? (
                        <p className="text-green-700/80 dark:text-green-400/80">
                          At {age} years old, all parts should still be covered under the manufacturer 
                          warranty if this unit was registered for residential use.
                        </p>
                      ) : (
                        <p className="text-green-700/80 dark:text-green-400/80">
                          At {age} years old, this equipment may still have partial warranty coverage. 
                          Verify with your serial number at the manufacturer's website.
                        </p>
                      )}
                      <Button variant="outline" size="sm" className="mt-3" asChild>
                        <a href={getBrandSupportUrl(equipment.brand)} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Check {equipment.brand} Warranty Status
                        </a>
                      </Button>
                    </div>
                  </div>
                </Card>
              )}

              {/* Alerts */}
              {isR22 && (
                <Card className="p-6 border-amber-500/50 bg-amber-500/10">
                  <div className="flex gap-4">
                    <AlertTriangle className="w-6 h-6 text-amber-500 flex-shrink-0" />
                    <div>
                      <h3 className="font-bold text-amber-700 mb-2">R-22 Refrigerant (Legacy)</h3>
                      <p className="text-amber-700/80">
                        This system uses R-22 refrigerant, which was fully phased out in 2020.
                        Repairs requiring refrigerant are extremely costly due to limited supply. Consider
                        upgrading to a modern system using R-454B or R-32.
                      </p>
                    </div>
                  </div>
                </Card>
              )}

              {age && age > 12 && (
                <Card className="p-6 border-blue-500/50 bg-blue-500/10">
                  <div className="flex gap-4">
                    <Info className="w-6 h-6 text-blue-500 flex-shrink-0" />
                    <div>
                      <h3 className="font-bold text-blue-700 mb-2">System Age Consideration</h3>
                      <p className="text-blue-700/80">
                        HVAC systems typically last 15-20 years. At {age} years old, your system may
                        be approaching the age where replacement becomes more cost-effective than repair.
                        Modern systems offer significantly improved efficiency.
                      </p>
                    </div>
                  </div>
                </Card>
              )}

              {/* Related Equipment (Same Model, Different Brands) */}
              {relatedPages && relatedPages.length > 0 && (
                <Card className="p-6">
                  <h2 className="text-xl font-bold mb-4">Related Equipment Pages</h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    This model number appears under multiple brand variations:
                  </p>
                  <div className="space-y-2">
                    {relatedPages.map((page) => (
                      <Link
                        key={page.id}
                        to={`/equipment/${page.slug}`}
                        className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="capitalize">
                            {page.brand}
                          </Badge>
                          <span className="font-mono text-sm">{page.model_number}</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </Link>
                    ))}
                  </div>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Replacement CTA */}
              <Card className="p-6">
                <h3 className="font-bold mb-4">Thinking About Replacement?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Get an instant estimate for a new system - no appointment needed
                </p>
                <div className="space-y-3">
                  <Link to="/estimate/ductless" className="block">
                    <Button className="w-full" variant="default">
                      Ductless Estimator
                    </Button>
                  </Link>
                  <Link to="/estimators/cost" className="block">
                    <Button className="w-full" variant="outline">
                      Cost Calculator
                    </Button>
                  </Link>
                </div>
              </Card>

              {/* DFW CTA */}
              <Card className="p-6 bg-gradient-to-br from-[#1e3a5f] to-[#0f1f33] text-white">
                <Home className="w-8 h-8 text-secondary mb-3" />
                <h3 className="font-bold mb-2">In Dallas-Fort Worth?</h3>
                <p className="text-sm text-white/80 mb-4">
                  Truficient offers free in-home assessments for DFW homeowners
                </p>
                <Link to="/contact">
                  <Button variant="secondary" className="w-full">
                    <Phone className="w-4 h-4 mr-2" />
                    Schedule Free Assessment
                  </Button>
                </Link>
              </Card>

              {/* Scan Another */}
              <Card className="p-6">
                <ScanLine className="w-8 h-8 text-muted-foreground mb-3" />
                <h3 className="font-bold mb-2">Have Different Equipment?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Scan another unit to decode its specifications
                </p>
                <Link to="/scanner">
                  <Button variant="outline" className="w-full">
                    Scan Another Unit
                  </Button>
                </Link>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
