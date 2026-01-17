import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Home, Snowflake } from 'lucide-react';

export function EstimatorLinks() {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground text-center">
        Thinking About Replacement?
      </h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Ducted System Card */}
        <Card className="p-5 hover:shadow-lg transition-shadow">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Home className="w-5 h-5 text-primary" />
              </div>
              <h4 className="font-bold text-foreground">Ducted System</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              Traditional central AC and heat pump options for whole-home comfort.
            </p>
            <Button asChild variant="outline" className="w-full touch-target">
              <Link to="/estimators/cost">
                Get an Estimate
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </Card>

        {/* Ductless System Card */}
        <Card className="p-5 hover:shadow-lg transition-shadow border-secondary/50">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center">
                <Snowflake className="w-5 h-5 text-secondary" />
              </div>
              <h4 className="font-bold text-foreground">Ductless System</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              Mini-split and multi-zone solutions for targeted comfort without ductwork.
            </p>
            <Button asChild className="w-full touch-target">
              <Link to="/estimate/ductless">
                Get an Estimate
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
