import { useScanner } from '../context/ScannerContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { 
  X, 
  Snowflake, 
  Flame, 
  Wind, 
  Fan,
  ThermometerSun,
  LayoutGrid,
  Package,
  Calendar,
  Gauge,
  Zap,
  Plug,
  Beaker,
  Factory,
  Thermometer,
  ExternalLink
} from 'lucide-react';
import { AccumulatedScan } from '../types';
import { WarrantyNotice } from './WarrantyNotice';

const EQUIPMENT_TYPE_ICONS: Record<string, React.ElementType> = {
  'Air Conditioner': Snowflake,
  'Heat Pump': ThermometerSun,
  'Furnace': Flame,
  'Air Handler': Wind,
  'Condenser': Fan,
  'Package Unit': Package,
  'Mini Split': LayoutGrid,
};

interface SpecRowProps {
  icon: React.ReactNode;
  label: string;
  value: string | number | null | undefined;
}

function SpecRow({ icon, label, value }: SpecRowProps) {
  if (!value) return null;
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-muted-foreground">{icon}</span>
      <span className="text-muted-foreground">{label}:</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}

function ScanItem({ scan, onRemove }: { scan: AccumulatedScan; onRemove: () => void }) {
  const specs = scan.specs;
  const brand = specs.brand || 'Unknown';
  const equipmentType = specs.equipment_type || 'Equipment';
  const modelNumber = specs.model_number || 'N/A';
  const serialNumber = specs.serial_number || 'N/A';
  const year = specs.manufactured_year;
  const age = year ? new Date().getFullYear() - year : null;
  
  const Icon = EQUIPMENT_TYPE_ICONS[equipmentType] || Package;

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4 space-y-3">
        {/* Header Row: Brand + Type + Remove */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0">
              <Icon className="w-5 h-5 text-secondary" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-lg text-foreground">{brand}</span>
                <Badge variant="secondary" className="text-xs">
                  {equipmentType}
                </Badge>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 flex-shrink-0"
            onClick={onRemove}
          >
            <X className="w-4 h-4" />
            <span className="sr-only">Remove</span>
          </Button>
        </div>
        
        {/* Model/Serial Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm bg-muted/50 rounded-lg p-3">
          <div>
            <span className="text-muted-foreground">Model: </span>
            <span className="font-mono font-medium text-foreground">{modelNumber}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Serial: </span>
            <span className="font-mono font-medium text-foreground">{serialNumber}</span>
          </div>
        </div>
        
        {/* Specifications Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-border">
          {specs.manufactured_year && (
            <SpecRow 
              icon={<Calendar className="w-4 h-4" />} 
              label="Manufactured" 
              value={age !== null ? `${specs.manufactured_year} (${age} yrs)` : specs.manufactured_year} 
            />
          )}
          {specs.tonnage && (
            <SpecRow 
              icon={<Thermometer className="w-4 h-4" />} 
              label="Tonnage" 
              value={specs.tonnage} 
            />
          )}
          {specs.seer_rating && (
            <SpecRow 
              icon={<Gauge className="w-4 h-4" />} 
              label="SEER" 
              value={specs.seer_rating} 
            />
          )}
          {specs.refrigerant && (
            <SpecRow 
              icon={<Beaker className="w-4 h-4" />} 
              label="Refrigerant" 
              value={specs.refrigerant} 
            />
          )}
          {specs.breaker_size && (
            <SpecRow 
              icon={<Zap className="w-4 h-4" />} 
              label="Breaker" 
              value={specs.breaker_size} 
            />
          )}
          {specs.voltage_info && (
            <SpecRow 
              icon={<Plug className="w-4 h-4" />} 
              label="Voltage" 
              value={specs.voltage_info} 
            />
          )}
          {specs.fan_motor_info && (
            <SpecRow 
              icon={<Fan className="w-4 h-4" />} 
              label="Fan Motor" 
              value={specs.fan_motor_info} 
            />
          )}
          {specs.compressor_info && (
            <SpecRow 
              icon={<Factory className="w-4 h-4" />} 
              label="Compressor" 
              value={specs.compressor_info} 
            />
          )}
          {specs.factory_charge && (
            <SpecRow 
              icon={<Wind className="w-4 h-4" />} 
              label="Factory Charge" 
              value={specs.factory_charge} 
            />
          )}
        </div>

        {/* Warranty Notice */}
        <WarrantyNotice age={age} brand={brand} />

      </CardContent>
    </Card>
  );
}

export function ScanList() {
  const { state, dispatch } = useScanner();
  const { results } = state;
  const scanCount = results.length;
  const maxScans = 5;
  
  if (scanCount === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground text-lg">Your Scanned Units</h3>
        <Badge variant="secondary" className="font-mono">
          {scanCount}/{maxScans}
        </Badge>
      </div>
      
      <div className="space-y-3">
        {results.map((scan) => (
          <ScanItem
            key={scan.id}
            scan={scan}
            onRemove={() => dispatch({ type: 'REMOVE_FROM_RESULTS', payload: scan.id! })}
          />
        ))}
      </div>

      {scanCount >= maxScans && (
        <p className="text-sm text-muted-foreground text-center py-2">
          Maximum of {maxScans} units reached
        </p>
      )}
    </div>
  );
}
