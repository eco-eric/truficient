import { Loader2, Cpu, Database, FileSearch } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useEffect, useState } from 'react';

const PROCESSING_STEPS = [
  { icon: Cpu, label: 'Analyzing equipment data...' },
  { icon: Database, label: 'Decoding specifications...' },
  { icon: FileSearch, label: 'Searching documentation...' },
];

export function ProcessingState() {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % PROCESSING_STEPS.length);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const CurrentIcon = PROCESSING_STEPS[currentStep].icon;

  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="p-8 text-center space-y-6">
        {/* Animated Icon */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
              <CurrentIcon className="w-10 h-10 text-primary animate-pulse" />
            </div>
            <div className="absolute -bottom-1 -right-1">
              <Loader2 className="w-8 h-8 text-secondary animate-spin" />
            </div>
          </div>
        </div>

        {/* Processing Text */}
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-foreground">
            {PROCESSING_STEPS[currentStep].label}
          </h2>
          <p className="text-muted-foreground">
            This usually takes just a few seconds.
          </p>
        </div>

        {/* Progress Dots */}
        <div className="flex justify-center gap-2">
          {PROCESSING_STEPS.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentStep ? 'bg-primary' : 'bg-muted'
              }`}
            />
          ))}
        </div>
      </Card>
    </div>
  );
}
