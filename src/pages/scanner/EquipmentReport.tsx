import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Download, Camera, Phone, Mail, MapPin, User, Calendar, Gauge, Thermometer, Zap, CheckCircle2 } from 'lucide-react';
import { generateEquipmentReportPDF } from '@/utils/generateEquipmentReportPDF';
import type { AccumulatedScan } from './types';
import truficientLogo from '@/assets/truficient-logo.png';
import { trackReportPageView, trackPDFDownload } from '@/utils/conversionTracking';

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
  } : {};

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
      <div className="min-h-screen bg-background">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <Skeleton className="h-12 w-48 mx-auto mb-4" />
            <Skeleton className="h-6 w-64 mx-auto" />
          </div>
          <Skeleton className="h-48 w-full mb-4" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-2xl mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Report Not Found</h1>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Link to="/scanner">
            <Button>
              <Camera className="w-4 h-4 mr-2" />
              Scan Equipment
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Header */}
      <div className="bg-primary text-primary-foreground py-4">
        <div className="max-w-2xl mx-auto px-4 flex items-center justify-between">
          <img src={truficientLogo} alt="Truficient" className="h-8 object-contain brightness-0 invert" />
          <a href="tel:4695060053" className="flex items-center gap-2 text-sm hover:underline">
            <Phone className="w-4 h-4" />
            (469) 506-0053
          </a>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Success Banner */}
        <Card className="border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-800 mb-6">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="font-semibold text-green-800 dark:text-green-200">Your Equipment Report is Ready!</p>
              <p className="text-sm text-green-600 dark:text-green-400">
                {scans.length} {scans.length === 1 ? 'unit' : 'units'} scanned • Download your PDF below
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Customer Info Card */}
        {(customerInfo.name || customerInfo.email || customerInfo.phone || customerInfo.address) && (
          <Card className="mb-6">
            <CardContent className="p-4">
              <h2 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <User className="w-4 h-4 text-primary" />
                Property Information
              </h2>
              <div className="space-y-2 text-sm">
                {customerInfo.name && (
                  <p className="text-foreground">{customerInfo.name}</p>
                )}
                {customerInfo.address && (
                  <p className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-4 h-4 flex-shrink-0" />
                    {customerInfo.address}
                  </p>
                )}
                {customerInfo.email && (
                  <p className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="w-4 h-4 flex-shrink-0" />
                    {customerInfo.email}
                  </p>
                )}
                {customerInfo.phone && (
                  <p className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="w-4 h-4 flex-shrink-0" />
                    {customerInfo.phone}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Equipment Cards */}
        <div className="space-y-4 mb-6">
          {scans.map((scan, index) => {
            const age = getEquipmentAge(scan.manufactured_year);
            return (
              <Card key={scan.id} className="overflow-hidden">
                <div className="bg-muted px-4 py-2 border-b flex items-center justify-between">
                  <span className="font-medium text-sm text-foreground">
                    #{index + 1} {scan.brand?.toUpperCase() || 'UNKNOWN'} - {scan.equipment_type || 'HVAC Unit'}
                  </span>
                  {age !== null && (
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      age > 15 ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                      age > 10 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                      'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    }`}>
                      {age} years old
                    </span>
                  )}
                </div>
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground text-xs">Model Number</p>
                      <p className="font-mono font-medium text-foreground">{scan.model_number}</p>
                    </div>
                    {scan.serial_number && (
                      <div>
                        <p className="text-muted-foreground text-xs">Serial Number</p>
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
                    {scan.breaker_size && (
                      <div>
                        <p className="text-muted-foreground text-xs">Breaker Size</p>
                        <p className="font-medium text-foreground">{scan.breaker_size}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Button 
            onClick={handleDownloadPDF}
            className="bg-primary hover:bg-primary/90"
            size="lg"
          >
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
          <Link to="/scanner" className="w-full">
            <Button 
              variant="outline"
              className="w-full"
              size="lg"
            >
              <Camera className="w-4 h-4 mr-2" />
              Scan More
            </Button>
          </Link>
        </div>

        {/* CTA Section */}
        <Card className="bg-secondary/10 border-secondary/20">
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-semibold text-foreground mb-2">Need HVAC Service?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Our certified technicians can help with repairs, maintenance, or replacement quotes.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a href="tel:4695060053">
                <Button variant="default" className="w-full sm:w-auto bg-secondary hover:bg-secondary/90">
                  <Phone className="w-4 h-4 mr-2" />
                  Call (469) 506-0053
                </Button>
              </a>
              <Link to="/contact">
                <Button variant="outline" className="w-full sm:w-auto">
                  Request a Quote
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground mt-8 pb-4">
          <p>Report generated on {new Date().toLocaleDateString()}</p>
          <p className="mt-1">© {new Date().getFullYear()} Truficient HVAC • Dallas-Fort Worth</p>
        </div>
      </div>
    </div>
  );
}
