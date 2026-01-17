import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin, ArrowRight, Loader2, CheckCircle } from 'lucide-react';
import { useScanner } from '../context/ScannerContext';
import { isDfwZipCode, isDfwByCity } from '../types';
import { trackScanStarted } from '@/utils/conversionTracking';
import { validateZipCode } from '../utils/validateZipCode';

export function ZipCodeGate() {
  const { state, dispatch } = useScanner();
  const [localZip, setLocalZip] = useState(state.zipCode);
  const [error, setError] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validatedLocation, setValidatedLocation] = useState<{ city: string; state: string; formatted: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic format validation
    const cleanZip = localZip.replace(/\D/g, '');
    if (cleanZip.length < 5) {
      setError('Please enter a valid 5-digit zip code');
      return;
    }

    setIsValidating(true);
    setError('');

    try {
      const validation = await validateZipCode(cleanZip);
      
      if (!validation.valid) {
        setError(validation.error || 'Please enter a valid US zip code');
        setIsValidating(false);
        return;
      }

      // Use city-based detection if available, fallback to zip prefix
      const isDfw = validation.city 
        ? isDfwByCity(validation.city, validation.state)
        : isDfwZipCode(cleanZip);

      trackScanStarted(cleanZip, isDfw);
      
      dispatch({ type: 'SET_ZIP_CODE', payload: cleanZip });
      dispatch({ type: 'SET_LOCATION', payload: { city: validation.city, state: validation.state } });
      dispatch({ type: 'SET_IS_DFW', payload: isDfw });
      dispatch({ type: 'GO_TO_STEP', payload: 'examples' });
    } catch (err) {
      console.error('Zip validation error:', err);
      // On error, allow through with basic validation
      const isDfw = isDfwZipCode(cleanZip);
      trackScanStarted(cleanZip, isDfw);
      dispatch({ type: 'SET_ZIP_CODE', payload: cleanZip });
      dispatch({ type: 'SET_IS_DFW', payload: isDfw });
      dispatch({ type: 'GO_TO_STEP', payload: 'examples' });
    } finally {
      setIsValidating(false);
    }
  };

  const handleZipChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 5);
    setLocalZip(value);
    setError('');
    setValidatedLocation(null);

    // Auto-validate when 5 digits entered
    if (value.length === 5) {
      setIsValidating(true);
      try {
        const validation = await validateZipCode(value);
        if (validation.valid && validation.city && validation.state && validation.formatted) {
          setValidatedLocation({
            city: validation.city,
            state: validation.state,
            formatted: validation.formatted
          });
        } else if (!validation.valid) {
          setError(validation.error || 'Please enter a valid US zip code');
        }
      } catch (err) {
        console.error('Zip validation error:', err);
      } finally {
        setIsValidating(false);
      }
    }
  };

  const showDfwMessage = validatedLocation 
    ? isDfwByCity(validatedLocation.city, validatedLocation.state)
    : (localZip.length === 5 && isDfwZipCode(localZip));

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Zip Code Input */}
        <div className="space-y-2">
          <Label htmlFor="zip-code" className="text-base font-medium flex items-center gap-2">
            <MapPin className="w-4 h-4 text-secondary" />
            Enter your zip code to get started
          </Label>
          <div className="relative">
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
              disabled={isValidating}
            />
            {isValidating && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            )}
          </div>
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
          {validatedLocation && (
            <p className="text-sm text-green-600 font-medium flex items-center gap-1">
              <CheckCircle className="w-4 h-4" />
              {validatedLocation.formatted}
            </p>
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
          disabled={isValidating}
        >
          {isValidating ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Validating...
            </>
          ) : (
            <>
              Get Started
              <ArrowRight className="w-5 h-5 ml-2" />
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
