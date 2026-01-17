import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Search, Loader2 } from 'lucide-react';
import { useScanner } from '../context/ScannerContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { trackScanCompleted } from '@/utils/conversionTracking';

export function ManualEntry() {
  const { state, dispatch } = useScanner();
  const [localModel, setLocalModel] = useState(state.modelNumber);
  const [localSerial, setLocalSerial] = useState(state.serialNumber);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!localModel.trim()) {
      toast.error('Please enter a model number');
      return;
    }

    dispatch({ type: 'SET_MODEL_NUMBER', payload: localModel.trim().toUpperCase() });
    dispatch({ type: 'SET_SERIAL_NUMBER', payload: localSerial.trim().toUpperCase() });
    dispatch({ type: 'START_PROCESSING' });

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.functions.invoke('decode-equipment', {
        body: {
          modelNumber: localModel.trim().toUpperCase(),
          serialNumber: localSerial.trim().toUpperCase() || null,
          zipCode: state.zipCode,
          email: state.email || null,
          isDfw: state.isDfw,
        },
      });

      if (error) {
        console.error('Decode error:', error);
        dispatch({ type: 'SET_ERROR', payload: error.message || 'Failed to decode equipment' });
        toast.error('Failed to decode equipment. Please try again.');
        dispatch({ type: 'GO_TO_STEP', payload: 'scan' });
        return;
      }

      if (data?.error) {
        dispatch({ type: 'SET_ERROR', payload: data.error });
        toast.error(data.error);
        dispatch({ type: 'GO_TO_STEP', payload: 'scan' });
        return;
      }

      dispatch({
        type: 'SET_RESULT',
        payload: {
          id: data.scanId,
          specs: data.specs,
          raw_ai_response: data.raw_ai_response,
        },
      });

      // Track scan completion
      trackScanCompleted(data.specs?.brand, data.specs?.equipment_type);
      
      toast.success('Equipment decoded successfully!');
    } catch (err) {
      console.error('Decode error:', err);
      dispatch({ type: 'SET_ERROR', payload: 'An unexpected error occurred' });
      toast.error('An unexpected error occurred. Please try again.');
      dispatch({ type: 'GO_TO_STEP', payload: 'scan' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-foreground">
          Enter Equipment Info
        </h2>
        <p className="text-muted-foreground">
          Type in your model and serial number from the data plate.
        </p>
      </div>

      {/* Form Card */}
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Model Number */}
          <div className="space-y-2">
            <Label htmlFor="model-number" className="text-base font-medium">
              Model Number <span className="text-destructive">*</span>
            </Label>
            <Input
              id="model-number"
              type="text"
              placeholder="e.g., 24ACC636A003"
              value={localModel}
              onChange={(e) => setLocalModel(e.target.value.toUpperCase())}
              className="text-lg h-12 touch-target font-mono"
              autoComplete="off"
              disabled={isSubmitting}
              required
            />
            <p className="text-xs text-muted-foreground">
              Usually starts with letters followed by numbers
            </p>
          </div>

          {/* Serial Number */}
          <div className="space-y-2">
            <Label htmlFor="serial-number" className="text-base font-medium">
              Serial Number <span className="text-muted-foreground">(optional but recommended)</span>
            </Label>
            <Input
              id="serial-number"
              type="text"
              placeholder="e.g., 2519E12345"
              value={localSerial}
              onChange={(e) => setLocalSerial(e.target.value.toUpperCase())}
              className="text-lg h-12 touch-target font-mono"
              autoComplete="off"
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground">
              Helps us determine the manufacturing date
            </p>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            size="lg"
            className="w-full h-12 text-base font-semibold touch-target"
            disabled={isSubmitting || !localModel.trim()}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Search className="w-5 h-5 mr-2" />
                Decode Equipment
              </>
            )}
          </Button>
        </form>
      </Card>

      {/* Back Button */}
      <div className="text-center">
        <Button
          variant="ghost"
          onClick={() => dispatch({ type: 'GO_TO_STEP', payload: 'examples' })}
          disabled={isSubmitting}
          className="touch-target"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to examples
        </Button>
      </div>
    </div>
  );
}
