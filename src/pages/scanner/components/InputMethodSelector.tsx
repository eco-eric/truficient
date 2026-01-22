import { useScanner } from '../context/ScannerContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Camera, Upload, Keyboard, ArrowLeft, Images } from 'lucide-react';
import { InputMethod } from '../types';
import { WorkEdgeBanner } from '@/components/WorkEdgeBanner';

interface MethodOption {
  id: InputMethod;
  icon: React.ReactNode;
  title: string;
  description: string;
}

const MAX_SCANS = 5;

const methods: MethodOption[] = [
  {
    id: 'scan',
    icon: <Camera className="w-8 h-8" />,
    title: 'Scan with Camera',
    description: 'Take a photo of your data plate',
  },
  {
    id: 'upload',
    icon: <Upload className="w-8 h-8" />,
    title: 'Upload Photo',
    description: 'Select an existing photo from your device',
  },
  {
    id: 'bulk-upload',
    icon: <Images className="w-8 h-8" />,
    title: 'Upload Multiple',
    description: 'Upload up to 5 data plate photos at once',
  },
  {
    id: 'manual',
    icon: <Keyboard className="w-8 h-8" />,
    title: 'Enter Manually',
    description: 'Type in your model and serial numbers',
  },
];

export function InputMethodSelector() {
  const { state, dispatch } = useScanner();
  
  const remainingSlots = MAX_SCANS - state.results.length;
  
  // Filter out bulk-upload if only 1 slot remains (single upload is better)
  const availableMethods = remainingSlots <= 1 
    ? methods.filter(m => m.id !== 'bulk-upload')
    : methods;

  const handleSelect = (method: InputMethod) => {
    dispatch({ type: 'SET_INPUT_METHOD', payload: method });
    dispatch({ type: 'GO_TO_STEP', payload: method });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-foreground">
          How would you like to enter your equipment info?
        </h2>
        <p className="text-muted-foreground">
          Choose the method that works best for you
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {availableMethods.map((method) => (
          <Card
            key={method.id}
            className="cursor-pointer hover:border-secondary hover:bg-secondary/5 transition-all duration-200 group"
            onClick={() => handleSelect(method.id)}
          >
            <CardContent className="p-6 text-center space-y-3">
              <div className="flex justify-center text-muted-foreground group-hover:text-secondary transition-colors">
                {method.icon}
              </div>
              <h3 className="font-semibold text-foreground">{method.title}</h3>
              <p className="text-sm text-muted-foreground">{method.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Workedge Pro Attribution Banner */}
      <div className="max-w-md mx-auto">
        <WorkEdgeBanner location="Scanner - Input Method" variant="document" />
      </div>

      <div className="text-center pt-4">
        <Button
          variant="ghost"
          onClick={() => dispatch({ type: 'GO_TO_STEP', payload: 'examples' })}
          className="text-muted-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Examples
        </Button>
      </div>
    </div>
  );
}
