import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowRight, ArrowLeft, Info } from 'lucide-react';
import { useScanner } from '../context/ScannerContext';

// Example data plate information for major brands
const EXAMPLE_PLATES = [
  {
    brand: 'Carrier',
    description: 'Look for the silver or white label on the side of the outdoor unit.',
    modelPrefix: '24ACC, 24ANA',
    serialFormat: 'Week/Year (e.g., 1519 = Week 15, 2019)',
  },
  {
    brand: 'Trane',
    description: 'Data plate is typically on the outdoor unit\'s access panel.',
    modelPrefix: 'XR13, XL15i, XV18',
    serialFormat: 'Year in 4th digit (e.g., 194... = 2019)',
  },
  {
    brand: 'Lennox',
    description: 'Check inside the indoor unit cabinet or on the outdoor condenser.',
    modelPrefix: 'XC21, XC25, SL18XC',
    serialFormat: 'Year in 1st-2nd digits (e.g., 19... = 2019)',
  },
  {
    brand: 'Goodman / Amana',
    description: 'Look for the rating plate on the outdoor unit side panel.',
    modelPrefix: 'GSX, GSXC, AVXC',
    serialFormat: 'Year/Month in first 4 digits (e.g., 1906 = June 2019)',
  },
  {
    brand: 'Rheem / Ruud',
    description: 'Data plate is on the side of the outdoor unit.',
    modelPrefix: 'RA17, RP17',
    serialFormat: 'Week/Year (e.g., 1219 = Week 12, 2019)',
  },
  {
    brand: 'Mitsubishi',
    description: 'Check the indoor wall unit or outdoor condenser nameplate.',
    modelPrefix: 'MSZ, MXZ, PUZ',
    serialFormat: 'Year encoded in serial sequence',
  },
];

export function ExampleDataPlates() {
  const { dispatch } = useScanner();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-foreground">
          Find Your Data Plate
        </h2>
        <p className="text-muted-foreground max-w-lg mx-auto">
          Your data plate contains the model and serial number we need. 
          Here's what to look for on common brands.
        </p>
      </div>

      {/* Example Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {EXAMPLE_PLATES.map((plate) => (
          <Card key={plate.brand} className="p-4 space-y-3">
            <h3 className="font-bold text-lg text-primary">{plate.brand}</h3>
            <p className="text-sm text-muted-foreground">{plate.description}</p>
            <div className="space-y-1 text-sm">
              <p>
                <span className="font-medium">Model Prefixes:</span>{' '}
                <span className="text-muted-foreground">{plate.modelPrefix}</span>
              </p>
              <p>
                <span className="font-medium">Serial Format:</span>{' '}
                <span className="text-muted-foreground">{plate.serialFormat}</span>
              </p>
            </div>
          </Card>
        ))}
      </div>

      {/* Tips Box */}
      <Card className="p-4 bg-muted/50 border-secondary/30">
        <div className="flex gap-3">
          <Info className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-medium text-foreground">Where to find your data plate:</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• <strong>Outdoor Unit:</strong> Side panel of the condenser or heat pump</li>
              <li>• <strong>Indoor Unit:</strong> Inside the furnace/air handler cabinet</li>
              <li>• <strong>Mini-Split:</strong> On the indoor wall unit or outdoor condenser</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button
          variant="outline"
          size="lg"
          onClick={() => dispatch({ type: 'GO_TO_STEP', payload: 'zip' })}
          className="touch-target"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button
          size="lg"
          onClick={() => dispatch({ type: 'GO_TO_STEP', payload: 'scan' })}
          className="touch-target"
        >
          I Found It - Continue
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
