import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Thermometer,
  Calendar,
  Zap,
  Wind,
  Gauge,
  Factory,
  Info,
  ExternalLink,
} from 'lucide-react';
import { useScanner } from '../context/ScannerContext';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface SpecRowProps {
  icon: React.ReactNode;
  label: string;
  value: string | number | null;
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

export function ResultsCard() {
  const { state } = useScanner();
  const { result } = state;

  if (!result?.specs) {
    return null;
  }

  const { specs } = result;

  // Calculate age if we have manufactured year
  const currentYear = new Date().getFullYear();
  const age = specs.manufactured_year
    ? currentYear - specs.manufactured_year
    : null;

  return (
    <Card className="p-6 space-y-4">
      {/* Header with Brand */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            {specs.brand || 'Unknown Brand'}
          </h2>
          <p className="text-muted-foreground font-mono text-sm">
            Model: {specs.model_number}
          </p>
          {specs.serial_number && (
            <p className="text-muted-foreground font-mono text-xs">
              Serial: {specs.serial_number}
            </p>
          )}
        </div>
        {specs.equipment_type && (
          <Badge variant="secondary" className="text-sm">
            {specs.equipment_type}
          </Badge>
        )}
      </div>

      <Separator />

      {/* Specifications Grid */}
      <div className="space-y-1">
        <SpecRow
          icon={<Calendar className="w-5 h-5" />}
          label="Manufactured"
          value={
            specs.manufactured_year
              ? `${specs.manufactured_year} (${age} years old)`
              : null
          }
        />
        <SpecRow
          icon={<Thermometer className="w-5 h-5" />}
          label="Tonnage"
          value={specs.tonnage}
        />
        <SpecRow
          icon={<Gauge className="w-5 h-5" />}
          label="SEER Rating"
          value={specs.seer_rating}
        />
        <SpecRow
          icon={<Wind className="w-5 h-5" />}
          label="Refrigerant"
          value={specs.refrigerant}
        />
        <SpecRow
          icon={<Zap className="w-5 h-5" />}
          label="Breaker Size"
          value={specs.breaker_size ? `${specs.breaker_size} Amp` : null}
        />
        <SpecRow
          icon={<Factory className="w-5 h-5" />}
          label="Fan Motor"
          value={specs.fan_motor_info}
        />
        <SpecRow
          icon={<Factory className="w-5 h-5" />}
          label="Compressor"
          value={specs.compressor_info}
        />
      </div>

      {/* Disclaimer */}
      <div className="flex gap-2 p-3 bg-muted/50 rounded-lg text-sm">
        <Info className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
        <p className="text-muted-foreground">
          <strong>Note:</strong> Manufactured date is based on serial number decoding. 
          Actual installation date may differ.
        </p>
      </div>

      {/* View Full Equipment Page Link */}
      {specs.brand && specs.model_number && (
        <div className="pt-2">
          <Button asChild variant="outline" className="w-full">
            <Link to={`/equipment/${specs.brand.toLowerCase().replace(/\s+/g, '-')}/${specs.model_number.toLowerCase()}`}>
              <ExternalLink className="w-4 h-4 mr-2" />
              View Full Equipment Page
            </Link>
          </Button>
        </div>
      )}
    </Card>
  );
}
