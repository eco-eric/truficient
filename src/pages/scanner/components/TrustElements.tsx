import { Card } from '@/components/ui/card';
import { Shield, Award, Wrench } from 'lucide-react';

export function TrustElements() {
  return (
    <Card className="p-6 bg-muted/30">
      <div className="space-y-4">
        <h3 className="font-bold text-foreground text-center">
          Why We Built This Tool
        </h3>
        <p className="text-muted-foreground text-center text-sm max-w-lg mx-auto">
          As HVAC professionals, we know how hard it can be to find information about your equipment. 
          This free tool gives you instant access to the specs and documentation you need.
        </p>

        {/* Trust Badges */}
        <div className="grid grid-cols-3 gap-4 pt-4">
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <span className="text-xs font-medium text-foreground">
              Mitsubishi Diamond Contractor
            </span>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center mb-2">
              <Award className="w-6 h-6 text-secondary" />
            </div>
            <span className="text-xs font-medium text-foreground">
              HERS Certified
            </span>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
              <Wrench className="w-6 h-6 text-primary" />
            </div>
            <span className="text-xs font-medium text-foreground">
              Professional Service
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
