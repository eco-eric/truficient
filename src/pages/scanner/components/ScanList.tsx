import { useScanner } from '../context/ScannerContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  X, 
  Snowflake, 
  Flame, 
  Wind, 
  Fan,
  ThermometerSun,
  LayoutGrid,
  Package
} from 'lucide-react';
import { AccumulatedScan } from '../types';

const EQUIPMENT_TYPE_ICONS: Record<string, React.ElementType> = {
  'Air Conditioner': Snowflake,
  'Heat Pump': ThermometerSun,
  'Furnace': Flame,
  'Air Handler': Wind,
  'Condenser': Fan,
  'Package Unit': Package,
  'Mini Split': LayoutGrid,
};

function ScanItem({ scan, onRemove }: { scan: AccumulatedScan; onRemove: () => void }) {
  const specs = scan.specs;
  const brand = specs.brand || 'Unknown';
  const equipmentType = specs.equipment_type || 'Equipment';
  const modelNumber = specs.model_number || 'N/A';
  const year = specs.manufactured_year;
  const age = year ? new Date().getFullYear() - year : null;
  
  const Icon = EQUIPMENT_TYPE_ICONS[equipmentType] || Package;

  return (
    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg group">
      <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0">
        <Icon className="w-5 h-5 text-secondary" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-foreground truncate">{brand}</span>
          <span className="text-muted-foreground text-sm">{equipmentType}</span>
        </div>
        <div className="text-sm text-muted-foreground flex items-center gap-2">
          <span className="truncate">{modelNumber}</span>
          {age !== null && (
            <>
              <span className="text-muted-foreground/50">•</span>
              <span>{age} yrs old</span>
            </>
          )}
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 opacity-50 group-hover:opacity-100 transition-opacity"
        onClick={onRemove}
      >
        <X className="w-4 h-4" />
        <span className="sr-only">Remove</span>
      </Button>
    </div>
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
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground">Your Scanned Units</h3>
          <Badge variant="secondary" className="font-mono">
            {scanCount}/{maxScans}
          </Badge>
        </div>
        
        <div className="space-y-2">
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
      </CardContent>
    </Card>
  );
}
