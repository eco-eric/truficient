import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Download, Camera, Phone, Mail, MapPin, User, Calendar, Gauge, Thermometer, Zap, CheckCircle2, Award, Shield, Clock, DollarSign, TrendingUp, Ruler, Snowflake, AlertTriangle, Leaf } from 'lucide-react';
import { generateEquipmentReportPDF } from '@/utils/generateEquipmentReportPDF';
import type { AccumulatedScan } from './types';
import { trackReportPageView, trackPDFDownload } from '@/utils/conversionTracking';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

interface ScanData {
  id: string;
  brand: string | null;
  model_number: string;
  serial_number: string | null;
  manufactured_year: number | null;
  tonnage: string | null;
  refrigerant: string | null;
  seer_rating: number | null;
  equipment_type: string | null;
  voltage_info: string | null;
  breaker_size: string | null;
  fan_motor_info: string | null;
  compressor_info: string | null;
  factory_charge: string | null;
  customer_name: string | null;
  customer_phone: string | null;
  customer_address: string | null;
  email: string | null;
  created_at: string | null;
}

export default function EquipmentReport() {
  const [searchParams] = useSearchParams();
  const [scans, setScans] = useState<ScanData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const scanIds = searchParams.get('scans')?.split(',').filter(Boolean) || [];
  const emailParam = searchParams.get('email');

  useEffect(() => {
    async function fetchScans() {
      if (scanIds.length === 0) {
        setError('No scan IDs provided');
        setIsLoading(false);
        return;
      }

      try {
        const { data, error: fetchError } = await supabase
          .from('equipment_scans')
          .select('*')
          .in('id', scanIds)
          .order('created_at', { ascending: true });

        if (fetchError) throw fetchError;

        if (!data || data.length === 0) {
          setError('No equipment scans found');
        } else {
          setScans(data);
          // Track report page view
          trackReportPageView(data.length);
        }
      } catch (err) {
        console.error('Failed to fetch scans:', err);
        setError('Failed to load equipment report');
      } finally {
        setIsLoading(false);
      }
    }

    fetchScans();
  }, [scanIds.join(',')]);

  const customerInfo = scans[0] ? {
    name: scans[0].customer_name || undefined,
    email: scans[0].email || emailParam || undefined,
    phone: scans[0].customer_phone || undefined,
    address: scans[0].customer_address || undefined,
  } : { email: emailParam || undefined };

  const handleDownloadPDF = () => {
    const formattedScans: AccumulatedScan[] = scans.map(scan => ({
      id: scan.id,
      scannedAt: new Date(scan.created_at || Date.now()),
      specs: {
        brand: scan.brand,
        model_number: scan.model_number,
        serial_number: scan.serial_number,
        manufactured_year: scan.manufactured_year,
        tonnage: scan.tonnage,
        refrigerant: scan.refrigerant,
        seer_rating: scan.seer_rating,
        equipment_type: scan.equipment_type,
        voltage_info: scan.voltage_info,
        breaker_size: scan.breaker_size,
        fan_motor_info: scan.fan_motor_info,
        compressor_info: scan.compressor_info,
        factory_charge: scan.factory_charge,
      }
    }));

    // Track PDF download
    trackPDFDownload(scans.length);
    
    generateEquipmentReportPDF(formattedScans, customerInfo);
  };

  const getEquipmentAge = (year: number | null) => {
    if (!year) return null;
    const currentYear = new Date().getFullYear();
    const age = currentYear - year;
    return age;
  };

  // Equipment analysis helpers
  const getOverallStatus = () => {
    const ages = scans.map(s => getEquipmentAge(s.manufactured_year)).filter(a => a !== null) as number[];
    if (ages.length === 0) return { status: 'unknown', label: 'Unknown Age', color: 'muted' };
    const maxAge = Math.max(...ages);
    if (maxAge > 15) return { status: 'old', label: 'Consider Replacement', color: 'red' };
    if (maxAge > 10) return { status: 'aging', label: 'Aging Equipment', color: 'amber' };
    return { status: 'good', label: 'Good Condition', color: 'green' };
  };

  const hasR22Refrigerant = scans.some(s => s.refrigerant?.toLowerCase().includes('r-22') || s.refrigerant?.toLowerCase().includes('r22'));
  const hasLowSeer = scans.some(s => s.seer_rating !== null && s.seer_rating < 14);
  const overallStatus = getOverallStatus();

  const estimatorLinks = [
    {
      title: 'Cost Estimator',
      description: 'Get an instant replacement cost estimate',
      icon: DollarSign,
      href: '/estimators/cost',
      color: 'bg-green-500'
    },
    {
      title: 'Savings Calculator',
      description: 'See how much you could save with a new system',
      icon: TrendingUp,
      href: '/estimators/savings',
      color: 'bg-blue-500'
    },
    {
      title: 'Sizing Guide',
      description: 'Find the right size system for your home',
      icon: Ruler,
      href: '/estimators/sizing',
      color: 'bg-purple-500'
    },
    {
      title: 'Ductless Quote',
      description: 'Get a mini-split system estimate',
      icon: Snowflake,
      href: '/estimate/ductless',
      color: 'bg-cyan-500'
    }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1">
          <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="text-center mb-8">
              <Skeleton className="h-12 w-48 mx-auto mb-4" />
              <Skeleton className="h-6 w-64 mx-auto" />
            </div>
            <Skeleton className="h-48 w-full mb-4" />
            <Skeleton className="h-64 w-full" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="max-w-md mx-auto px-4 py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
              <Camera className="w-8 h-8 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-4">Report Not Found</h1>
            <p className="text-muted-foreground mb-8">{error}</p>
            <Link to="/scanner">
              <Button size="lg" className="bg-secondary hover:bg-secondary/90">
                <Camera className="w-4 h-4 mr-2" />
                Scan Equipment
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/5 via-secondary/5 to-background py-8 md:py-12 border-b">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 mb-4">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-medium">Equipment Report Ready</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
                Your HVAC Equipment Report
              </h1>
              <p className="text-muted-foreground text-lg">
                {scans.length} {scans.length === 1 ? 'unit' : 'units'} analyzed • Generated on {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <Button 
                onClick={handleDownloadPDF}
                size="lg"
                className="flex-1 bg-secondary hover:bg-secondary/90 text-secondary-foreground"
              >
                <Download className="w-5 h-5 mr-2" />
                Download PDF Report
              </Button>
              <Link to="/scanner" className="flex-1">
                <Button 
                  variant="outline"
                  size="lg"
                  className="w-full"
                >
                  <Camera className="w-5 h-5 mr-2" />
                  Scan More Equipment
                </Button>
              </Link>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Main Content - Equipment Cards */}
              <div className="md:col-span-2 space-y-4">
                {/* Customer Info Card */}
                {(customerInfo.name || customerInfo.email || customerInfo.phone || customerInfo.address) && (
                  <Card className="border-primary/20">
                    <CardContent className="p-5">
                      <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                        <User className="w-5 h-5 text-primary" />
                        Property Information
                      </h2>
                      <div className="grid sm:grid-cols-2 gap-3 text-sm">
                        {customerInfo.name && (
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                            <span className="text-foreground">{customerInfo.name}</span>
                          </div>
                        )}
                        {customerInfo.email && (
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                            <span className="text-foreground">{customerInfo.email}</span>
                          </div>
                        )}
                        {customerInfo.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                            <span className="text-foreground">{customerInfo.phone}</span>
                          </div>
                        )}
                        {customerInfo.address && (
                          <div className="flex items-center gap-2 sm:col-span-2">
                            <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                            <span className="text-foreground">{customerInfo.address}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Equipment Cards */}
                {scans.map((scan, index) => {
                  const age = getEquipmentAge(scan.manufactured_year);
                  const isAging = age !== null && age > 10;
                  const isOld = age !== null && age > 15;
                  
                  return (
                    <Card key={scan.id} className="overflow-hidden">
                      <div className={`px-5 py-3 border-b flex items-center justify-between ${
                        isOld ? 'bg-red-50 dark:bg-red-950/20 border-red-100 dark:border-red-900/30' :
                        isAging ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900/30' :
                        'bg-muted border-border'
                      }`}>
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                            {index + 1}
                          </span>
                          <div>
                            <span className="font-semibold text-foreground">
                              {scan.brand?.toUpperCase() || 'UNKNOWN BRAND'}
                            </span>
                            <span className="text-muted-foreground ml-2">
                              {scan.equipment_type || 'HVAC Unit'}
                            </span>
                          </div>
                        </div>
                        {age !== null && (
                          <span className={`text-xs font-medium px-3 py-1 rounded-full ${
                            isOld ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400' :
                            isAging ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400' :
                            'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400'
                          }`}>
                            {age} years old
                          </span>
                        )}
                      </div>
                      <CardContent className="p-5">
                        <div className="grid sm:grid-cols-2 gap-4 text-sm">
                          <div className="space-y-3">
                            <div>
                              <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">Model Number</p>
                              <p className="font-mono font-semibold text-foreground">{scan.model_number}</p>
                            </div>
                            {scan.serial_number && (
                              <div>
                                <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">Serial Number</p>
                                <p className="font-mono font-medium text-foreground">{scan.serial_number}</p>
                              </div>
                            )}
                            {scan.manufactured_year && (
                              <div className="flex items-start gap-2">
                                <Calendar className="w-4 h-4 text-muted-foreground mt-0.5" />
                                <div>
                                  <p className="text-muted-foreground text-xs">Manufactured</p>
                                  <p className="font-medium text-foreground">{scan.manufactured_year}</p>
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="space-y-3">
                            {scan.tonnage && (
                              <div className="flex items-start gap-2">
                                <Gauge className="w-4 h-4 text-muted-foreground mt-0.5" />
                                <div>
                                  <p className="text-muted-foreground text-xs">Tonnage</p>
                                  <p className="font-medium text-foreground">{scan.tonnage}</p>
                                </div>
                              </div>
                            )}
                            {scan.seer_rating && (
                              <div className="flex items-start gap-2">
                                <Thermometer className="w-4 h-4 text-muted-foreground mt-0.5" />
                                <div>
                                  <p className="text-muted-foreground text-xs">SEER Rating</p>
                                  <p className="font-medium text-foreground">{scan.seer_rating}</p>
                                </div>
                              </div>
                            )}
                            {scan.refrigerant && (
                              <div>
                                <p className="text-muted-foreground text-xs">Refrigerant</p>
                                <p className="font-medium text-foreground">{scan.refrigerant}</p>
                              </div>
                            )}
                            {scan.voltage_info && (
                              <div className="flex items-start gap-2">
                                <Zap className="w-4 h-4 text-muted-foreground mt-0.5" />
                                <div>
                                  <p className="text-muted-foreground text-xs">Voltage</p>
                                  <p className="font-medium text-foreground">{scan.voltage_info}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Additional specs if available */}
                        {(scan.breaker_size || scan.fan_motor_info || scan.compressor_info || scan.factory_charge) && (
                          <div className="mt-4 pt-4 border-t border-border">
                            <div className="grid sm:grid-cols-2 gap-3 text-sm">
                              {scan.breaker_size && (
                                <div>
                                  <p className="text-muted-foreground text-xs">Breaker Size</p>
                                  <p className="font-medium text-foreground">{scan.breaker_size}</p>
                                </div>
                              )}
                              {scan.fan_motor_info && (
                                <div>
                                  <p className="text-muted-foreground text-xs">Fan Motor</p>
                                  <p className="font-medium text-foreground">{scan.fan_motor_info}</p>
                                </div>
                              )}
                              {scan.compressor_info && (
                                <div>
                                  <p className="text-muted-foreground text-xs">Compressor</p>
                                  <p className="font-medium text-foreground">{scan.compressor_info}</p>
                                </div>
                              )}
                              {scan.factory_charge && (
                                <div>
                                  <p className="text-muted-foreground text-xs">Factory Charge</p>
                                  <p className="font-medium text-foreground">{scan.factory_charge}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}

                {/* Equipment Analysis Section */}
                <Card className="border-2 border-dashed border-primary/30 bg-primary/5">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                      <Gauge className="w-5 h-5 text-primary" />
                      Equipment Analysis
                    </h3>
                    
                    {/* Overall Status */}
                    <div className="flex items-center gap-3 p-4 rounded-lg bg-background mb-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        overallStatus.color === 'red' ? 'bg-red-100 dark:bg-red-900/30' :
                        overallStatus.color === 'amber' ? 'bg-amber-100 dark:bg-amber-900/30' :
                        overallStatus.color === 'green' ? 'bg-green-100 dark:bg-green-900/30' :
                        'bg-muted'
                      }`}>
                        {overallStatus.color === 'red' ? (
                          <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                        ) : overallStatus.color === 'amber' ? (
                          <Clock className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                        ) : overallStatus.color === 'green' ? (
                          <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
                        ) : (
                          <Gauge className="w-6 h-6 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{overallStatus.label}</p>
                        <p className="text-sm text-muted-foreground">
                          {scans.length} {scans.length === 1 ? 'unit' : 'units'} analyzed
                        </p>
                      </div>
                    </div>

                    {/* Warnings/Recommendations */}
                    <div className="space-y-3">
                      {hasR22Refrigerant && (
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-medium text-amber-800 dark:text-amber-300 text-sm">R-22 Refrigerant (Legacy)</p>
                            <p className="text-xs text-amber-700 dark:text-amber-400">R-22 was fully phased out in 2020. Consider upgrading to a system using R-454B or R-32.</p>
                          </div>
                        </div>
                      )}
                      {hasLowSeer && (
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
                          <Leaf className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-medium text-blue-800 dark:text-blue-300 text-sm">Efficiency Opportunity</p>
                            <p className="text-xs text-blue-700 dark:text-blue-400">Newer systems (16+ SEER) can reduce energy costs by 30-50%.</p>
                          </div>
                        </div>
                      )}
                      {overallStatus.status === 'old' && (
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
                          <Clock className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-medium text-red-800 dark:text-red-300 text-sm">Equipment Approaching End of Life</p>
                            <p className="text-xs text-red-700 dark:text-red-400">Systems over 15 years old typically cost more to repair than replace. Consider your options now.</p>
                          </div>
                        </div>
                      )}
                      {overallStatus.status === 'good' && !hasR22Refrigerant && !hasLowSeer && (
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
                          <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-medium text-green-800 dark:text-green-300 text-sm">Equipment in Good Condition</p>
                            <p className="text-xs text-green-700 dark:text-green-400">Regular maintenance will help maximize the lifespan of your system.</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Estimator Links Section */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-bold text-foreground mb-2">Explore Your Options</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Use our online tools to estimate costs and savings for a new system.
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      {estimatorLinks.map((link) => (
                        <Link key={link.href} to={link.href}>
                          <div className="p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/50 transition-colors group cursor-pointer h-full">
                            <div className={`w-10 h-10 rounded-lg ${link.color} flex items-center justify-center mb-3`}>
                              <link.icon className="w-5 h-5 text-white" />
                            </div>
                            <p className="font-medium text-foreground text-sm group-hover:text-primary transition-colors">{link.title}</p>
                            <p className="text-xs text-muted-foreground mt-1">{link.description}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-4">
                {/* CTA Card */}
                <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground overflow-hidden">
                  <CardContent className="p-5">
                    <h3 className="text-lg font-bold mb-2">Need HVAC Service?</h3>
                    <p className="text-sm opacity-90 mb-4">
                      Our certified technicians are ready to help with repairs, maintenance, or replacement.
                    </p>
                    <div className="space-y-2">
                      <a href="tel:4695060053" className="block">
                        <Button variant="secondary" className="w-full">
                          <Phone className="w-4 h-4 mr-2" />
                          (469) 506-0053
                        </Button>
                      </a>
                      <Link to="/contact" className="block">
                        <Button variant="outline" className="w-full border-primary-foreground/30 text-navy bg-white hover:bg-primary-foreground/10">
                          Request a Quote
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>

                {/* Trust Badges */}
                <Card>
                  <CardContent className="p-5">
                    <h3 className="font-semibold text-foreground mb-4">Why Choose Truficient?</h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0">
                          <Award className="w-4 h-4 text-secondary" />
                        </div>
                        <div>
                          <p className="font-medium text-sm text-foreground">Mitsubishi Diamond Contractor</p>
                          <p className="text-xs text-muted-foreground">Elite certified dealer</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0">
                          <Shield className="w-4 h-4 text-secondary" />
                        </div>
                        <div>
                          <p className="font-medium text-sm text-foreground">Licensed & Insured</p>
                          <p className="text-xs text-muted-foreground">TACLA #00145723C</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0">
                          <Clock className="w-4 h-4 text-secondary" />
                        </div>
                        <div>
                          <p className="font-medium text-sm text-foreground">Same-Day Service</p>
                          <p className="text-xs text-muted-foreground">Available 7 days a week</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Download Button (Mobile) */}
                <div className="md:hidden">
                  <Button 
                    onClick={handleDownloadPDF}
                    size="lg"
                    className="w-full bg-secondary hover:bg-secondary/90"
                  >
                    <Download className="w-5 h-5 mr-2" />
                    Download PDF Report
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
