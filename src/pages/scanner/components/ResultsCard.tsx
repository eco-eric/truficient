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
  Snowflake,
  Flame,
  Fan,
  Droplets,
  LayoutGrid,
  GitBranch,
  Beaker,
  Plug,
  Plus,
  Check,
  Camera,
} from 'lucide-react';
import { useScanner } from '../context/ScannerContext';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { WarrantyNotice } from './WarrantyNotice';

const MAX_SCANS = 5;

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
  const { state, dispatch } = useScanner();
  const { result, results } = state;
  
  const isAlreadyAdded = result?.id ? results.some(s => s.id === result.id) : false;
  const canAddMore = results.length < MAX_SCANS;
  const canScanMore = results.length < MAX_SCANS || (results.length === 0 && result);
  const scanNumber = results.length + 1;

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
          <Badge variant="secondary" className="text-sm flex items-center gap-1.5">
            {EQUIPMENT_TYPE_ICONS[specs.equipment_type] || <Factory className="w-4 h-4" />}
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
        <SpecRow
          icon={<Beaker className="w-5 h-5" />}
          label="Factory Charge"
          value={specs.factory_charge}
        />
        <SpecRow
          icon={<Plug className="w-5 h-5" />}
          label="Voltage/Phase"
          value={specs.voltage_info}
        />
      </div>

      {/* Warranty Notice */}
      <WarrantyNotice age={age} brand={specs.brand || ''} />

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

      {/* Side-by-side action buttons */}
      <div className="grid grid-cols-2 gap-3 pt-4">
        {canAddMore && !isAlreadyAdded ? (
          <Button 
            onClick={() => dispatch({ type: 'ADD_TO_RESULTS' })}
            className="bg-secondary hover:bg-secondary/90 h-12"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add ({scanNumber}/5)
          </Button>
        ) : (
          <Button 
            disabled
            variant="outline"
            className="border-green-500 text-green-600 h-12"
          >
            <Check className="w-4 h-4 mr-2" />
            Added
          </Button>
        )}
        
        {canScanMore && (
          <Button
            onClick={() => dispatch({ type: 'SCAN_ANOTHER' })}
            className="bg-primary hover:bg-primary/90 font-semibold h-12"
          >
            <Camera className="w-4 h-4 mr-2" />
            Scan Another
          </Button>
        )}
      </div>
    </Card>
  );
}
