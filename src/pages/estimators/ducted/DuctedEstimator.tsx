import { AnimatePresence } from "framer-motion";
import { EstimatorProvider, useEstimator } from "./context/EstimatorContext";
import { ProgressIndicator } from "../ductless/components/ProgressIndicator";
import { Step0ZipCodeGate } from "./steps/Step0ZipCodeGate";
import { Step1HomeType } from "./steps/Step1HomeType";
import { Step2HomeDetails } from "./steps/Step2HomeDetails";
import { Step3InsulationFactors } from "./steps/Step3InsulationFactors";
import { Step4UsagePatterns } from "./steps/Step4UsagePatterns";
import { Step5HeatingType } from "./steps/Step5HeatingType";
import { Step6SystemSize } from "./steps/Step6SystemSize";
import { Step7WhatsIncluded } from "./steps/Step7WhatsIncluded";
import { Step8AddOns } from "./steps/Step8AddOns";
import { Step8CustomerInfo } from "./steps/Step8CustomerInfo";
import { Step9EfficiencyTier } from "./steps/Step9EfficiencyTier";
import { Step10QuoteResults } from "./steps/Step10QuoteResults";
import { Step11ThankYou } from "./steps/Step11ThankYou";
import { Link } from "react-router-dom";
import truficientLogo from "@/assets/truficient-logo.png";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useAbandonedCartTracker } from "./hooks/useAbandonedCartTracker";

// Component that enables abandoned cart tracking
const AbandonedCartTracker = () => {
  const { state, setPartialSubmissionId } = useEstimator();
  useAbandonedCartTracker(state, setPartialSubmissionId);
  return null;
};

const STEP_LABELS = [
  "Location",        // 0
  "Home Type",       // 1
  "Home Details",    // 2
  "Insulation",      // 3
  "Comfort",         // 4
  "Heating Type",    // 5
  "System Size",     // 6
  "What's Included", // 7
  "Add-ons",         // 8 - NEW
  "Contact Info",    // 9
  "Efficiency",      // 10
  "Your Quote",      // 11
  "Thank You",       // 12
];

const EstimatorContent = () => {
  const { state } = useEstimator();
  const { currentStep } = state;

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <Step0ZipCodeGate />;
      case 1:
        return <Step1HomeType />;
      case 2:
        return <Step2HomeDetails />;
      case 3:
        return <Step3InsulationFactors />;
      case 4:
        return <Step4UsagePatterns />;
      case 5:
        return <Step5HeatingType />;
      case 6:
        return <Step6SystemSize />;
      case 7:
        return <Step7WhatsIncluded />;
      case 8:
        return <Step8AddOns />;
      case 9:
        return <Step8CustomerInfo />;
      case 10:
        return <Step9EfficiencyTier />;
      case 11:
        return <Step10QuoteResults />;
      case 12:
        return <Step11ThankYou />;
      default:
        return <Step0ZipCodeGate />;
    }
  };

  // Show progress on steps 1-11 (after zip gate, before thank you)
  const showProgress = currentStep > 0 && currentStep < 12;

  // Show compact custom header on steps 1-11 (middle steps)
  const showCompactHeader = currentStep > 0 && currentStep < 12;

  // Show standard website header on step 0 (welcome)
  const showStandardHeader = currentStep === 0;

  // Show standard website footer on step 0 and step 12 (welcome and thank you)
  const showStandardFooter = currentStep === 0 || currentStep === 12;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Standard website header - shown on step 0 (welcome) */}
      {showStandardHeader && <Header />}

      {/* Compact header - shown on steps 1-10 */}
      {showCompactHeader && (
        <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b">
          <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <img
                src={truficientLogo}
                alt="Truficient"
                className="h-8 w-8 object-contain rounded"
              />
              <span className="font-semibold text-[#1e3a5f] text-sm hidden sm:inline">
                Truficient
              </span>
            </Link>
            <span className="text-xs text-muted-foreground uppercase tracking-wide">
              AC | Heat Pump Estimator
            </span>
          </div>
        </header>
      )}

      {/* Progress indicator */}
      {showProgress && (
        <ProgressIndicator
          currentStep={currentStep - 1}
          totalSteps={11}
          labels={STEP_LABELS.slice(1, 12)}
        />
      )}

      {/* Step content */}
      <main className="flex-1 pb-6">
        <AnimatePresence mode="wait">{renderStep()}</AnimatePresence>
      </main>

      {/* Standard website footer - shown on step 0 and step 11 */}
      {showStandardFooter && <Footer />}
    </div>
  );
};

const DuctedEstimator = () => {
  return (
    <EstimatorProvider>
      <AbandonedCartTracker />
      <EstimatorContent />
    </EstimatorProvider>
  );
};

export default DuctedEstimator;
