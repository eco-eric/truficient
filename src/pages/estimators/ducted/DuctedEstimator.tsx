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
import { Step7EfficiencyTier } from "./steps/Step7EfficiencyTier";
import { Step8QuoteResults } from "./steps/Step8QuoteResults";
import { Step9CustomerInfo } from "./steps/Step9CustomerInfo";
import { Step10ThankYou } from "./steps/Step10ThankYou";
import { Link } from "react-router-dom";
import truficientLogo from "@/assets/truficient-logo.png";

const STEP_LABELS = [
  "Location",
  "Home Type",
  "Home Details",
  "Insulation",
  "Comfort",
  "Heating Type",
  "System Size",
  "Efficiency",
  "Your Quote",
  "Contact Info",
  "Thank You",
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
        return <Step7EfficiencyTier />;
      case 8:
        return <Step8QuoteResults />;
      case 9:
        return <Step9CustomerInfo />;
      case 10:
        return <Step10ThankYou />;
      default:
        return <Step0ZipCodeGate />;
    }
  };

  // Show progress on steps 1-9 (after zip gate, before thank you)
  const showProgress = currentStep > 0 && currentStep < 10;

  // Show header on all steps except first (zip gate) and last (thank you)
  const showHeader = currentStep > 0 && currentStep < 10;

  return (
    <div className="min-h-screen bg-background">
      {/* Header - shown on steps 1-8 */}
      {showHeader && (
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
          totalSteps={9}
          labels={STEP_LABELS.slice(1, 10)}
        />
      )}

      {/* Step content */}
      <main className="pb-6">
        <AnimatePresence mode="wait">{renderStep()}</AnimatePresence>
      </main>
    </div>
  );
};

const DuctedEstimator = () => {
  return (
    <EstimatorProvider>
      <EstimatorContent />
    </EstimatorProvider>
  );
};

export default DuctedEstimator;
