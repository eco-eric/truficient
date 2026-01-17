import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Phone, Calendar, MapPin } from 'lucide-react';
import { useScanner } from '../context/ScannerContext';

export function DFWCallToAction() {
  const { state } = useScanner();

  // Only show for DFW zip codes
  if (!state.isDfw) {
    return null;
  }

  return (
    <Card className="p-6 bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
            <MapPin className="w-5 h-5 text-secondary-foreground" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">
              You're in Our Service Area!
            </h3>
            <p className="text-muted-foreground">
              We offer free in-home evaluations for DFW homeowners.
            </p>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button asChild size="lg" className="flex-1 touch-target">
            <Link to="/contact">
              <Calendar className="w-5 h-5 mr-2" />
              Schedule Free Assessment
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="flex-1 touch-target"
          >
            <a href="tel:214-238-4349">
              <Phone className="w-5 h-5 mr-2" />
              Call 214-238-4349
            </a>
          </Button>
        </div>

        {/* Trust Elements */}
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground pt-2">
          <span className="flex items-center gap-1">
            ✓ Mitsubishi Diamond Contractor
          </span>
          <span className="flex items-center gap-1">
            ✓ HERS Certified
          </span>
          <span className="flex items-center gap-1">
            ✓ No Obligation
          </span>
        </div>
      </div>
    </Card>
  );
}
