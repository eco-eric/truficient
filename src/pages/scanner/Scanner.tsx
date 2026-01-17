import { ScannerProvider, useScanner } from './context/ScannerContext';
import { ZipCodeGate } from './components/ZipCodeGate';
import { ExampleDataPlates } from './components/ExampleDataPlates';
import { InputMethodSelector } from './components/InputMethodSelector';
import { CameraScanner } from './components/CameraScanner';
import { ImageUpload } from './components/ImageUpload';
import { ManualEntry } from './components/ManualEntry';
import { ProcessingState } from './components/ProcessingState';
import { ResultsCard } from './components/ResultsCard';
import { EmailCapture } from './components/EmailCapture';
import { ContextualMessages } from './components/ContextualMessages';
import { EstimatorLinks } from './components/EstimatorLinks';
import { DFWCallToAction } from './components/DFWCallToAction';
import { DocumentationSearch } from './components/DocumentationSearch';
import { TrustElements } from './components/TrustElements';
import { ScanList } from './components/ScanList';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { RotateCcw, ScanLine, Info, Camera } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useEffect } from 'react';

const MAX_SCANS = 5;

function ScannerContent() {
  const { state, dispatch } = useScanner();

  // Set page SEO
  useEffect(() => {
    document.title = 'Free HVAC Equipment Scanner - Find Your System Age & Specs | Truficient';
    
    // Update meta description
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', 'Scan your AC or heating unit\'s data plate to instantly get specs, age, refrigerant type, and downloadable manuals. Free tool from Truficient Energy Solutions.');
    }
  }, []);

  const canScanMore = state.results.length < MAX_SCANS;

  const renderStep = () => {
    switch (state.step) {
      case 'zip':
        return <ZipCodeGate />;
      case 'examples':
        return <ExampleDataPlates />;
      case 'input-method':
        return <InputMethodSelector />;
      case 'scan':
        return <CameraScanner />;
      case 'upload':
        return <ImageUpload />;
      case 'manual':
        return <ManualEntry />;
      case 'processing':
        return <ProcessingState />;
      case 'results':
        return (
          <div className="space-y-6">
            <ResultsCard />
            <DocumentationSearch />
            
            {/* Scan List - show accumulated scans */}
            <ScanList />
            
            <EmailCapture />
            <ContextualMessages />
            <DFWCallToAction />
            <EstimatorLinks />
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              {canScanMore && (
                <Button
                  variant="default"
                  size="lg"
                  onClick={() => dispatch({ type: 'SCAN_ANOTHER' })}
                  className="flex-1 bg-secondary hover:bg-secondary/90 touch-target"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Scan Another Unit ({state.results.length}/{MAX_SCANS})
                </Button>
              )}
              <Button
                variant="outline"
                size="lg"
                onClick={() => dispatch({ type: 'RESET' })}
                className="flex-1 touch-target"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Start Over
              </Button>
            </div>
          </div>
        );
      default:
        return <ZipCodeGate />;
    }
  };

  return (
    <div className="min-h-dvh flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-primary/5 to-background py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="text-center space-y-4 max-w-3xl mx-auto">
              {/* Icon */}
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-full bg-secondary/20 flex items-center justify-center">
                  <ScanLine className="w-8 h-8 text-secondary" />
                </div>
              </div>
              
              {/* Headline */}
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
                How Old Is Your HVAC System?
              </h1>
              
              {/* Subheadline */}
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                Get instant specs, age, and documentation for your heating and cooling equipment
              </p>

              {/* Service Area Notice */}
              <Card className="inline-flex items-center gap-2 px-4 py-2 bg-muted/50 border-secondary/30">
                <Info className="w-4 h-4 text-secondary" />
                <span className="text-sm text-muted-foreground">
                  Truficient serves the Dallas-Fort Worth area, but everyone is welcome to use this free tool!
                </span>
              </Card>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-8 md:py-12">
          <div className="container mx-auto px-4">
            {renderStep()}
          </div>
        </section>

        {/* Trust Elements - Show on initial steps */}
        {(state.step === 'zip' || state.step === 'examples' || state.step === 'input-method') && (
          <section className="py-8 md:py-12 bg-muted/20">
            <div className="container mx-auto px-4 max-w-3xl">
              <TrustElements />
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function Scanner() {
  return (
    <ScannerProvider>
      <ScannerContent />
    </ScannerProvider>
  );
}
