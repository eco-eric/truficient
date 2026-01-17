import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Download, Camera, Phone, Mail, MapPin, User, Calendar, Gauge, Thermometer, Zap, CheckCircle2, Award, Shield, Clock } from 'lucide-react';
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
                        <Button variant="outline" className="w-full border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
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
