import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin, ArrowRight } from 'lucide-react';
import { useScanner } from '../context/ScannerContext';
import { isDfwZipCode } from '../types';

export function ZipCodeGate() {
  const { state, dispatch } = useScanner();
  const [localZip, setLocalZip] = useState(state.zipCode);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate zip code
    const cleanZip = localZip.replace(/\D/g, '');
    if (cleanZip.length < 5) {
      setError('Please enter a valid 5-digit zip code');
      return;
    }

    dispatch({ type: 'SET_ZIP_CODE', payload: cleanZip });
    dispatch({ type: 'GO_TO_STEP', payload: 'examples' });
  };

  const handleZipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 5);
    setLocalZip(value);
    setError('');
  };

  const showDfwMessage = localZip.length === 5 && isDfwZipCode(localZip);

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Zip Code Input */}
        <div className="space-y-2">
          <Label htmlFor="zip-code" className="text-base font-medium flex items-center gap-2">
            <MapPin className="w-4 h-4 text-secondary" />
            Enter your zip code to get started
          </Label>
          <Input
            id="zip-code"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="Enter zip code"
            value={localZip}
            onChange={handleZipChange}
            className="text-lg h-12 touch-target"
            autoComplete="postal-code"
            required
          />
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
          {showDfwMessage && (
            <p className="text-sm text-green-600 font-medium">
              ✓ Great! You're in our service area.
            </p>
          )}
        </div>

        {/* Submit Button */}
        <Button 
          type="submit" 
          size="lg" 
          className="w-full h-12 text-base font-semibold touch-target"
        >
          Get Started
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </form>
    </div>
  );
}
