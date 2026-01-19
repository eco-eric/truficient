import { AnimatePresence } from "framer-motion";
import { EstimatorProvider, useEstimator } from "./context/EstimatorContext";
import { ProgressIndicator } from "../ductless/components/ProgressIndicator";
import { Step1HomeType } from "./steps/Step1HomeType";
import { Step2HomeDetails } from "./steps/Step2HomeDetails";
import { Step3UsagePatterns } from "./steps/Step3UsagePatterns";
import { Step4HeatingType } from "./steps/Step4HeatingType";
import { Step5SystemSize } from "./steps/Step5SystemSize";
import { Step6EfficiencyTier } from "./steps/Step6EfficiencyTier";
import { Step7QuoteResults } from "./steps/Step7QuoteResults";
import { Step8CustomerInfo } from "./steps/Step8CustomerInfo";
import { Step9ThankYou } from "./steps/Step9ThankYou";
import { Link } from "react-router-dom";
import truficientLogo from "@/assets/truficient-logo.png";

const STEP_LABELS = [
  "Home Type",
  "Home Details",
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
        return <Step1HomeType />;
      case 1:
        return <Step2HomeDetails />;
      case 2:
        return <Step3UsagePatterns />;
      case 3:
        return <Step4HeatingType />;
      case 4:
        return <Step5SystemSize />;
      case 5:
        return <Step6EfficiencyTier />;
      case 6:
        return <Step7QuoteResults />;
      case 7:
        return <Step8CustomerInfo />;
      case 8:
        return <Step9ThankYou />;
      default:
        return <Step1HomeType />;
    }
  };

  // Show progress on steps 1-7 (after welcome, before thank you)
  const showProgress = currentStep > 0 && currentStep < 8;

  // Show header on all steps except first and last
  const showHeader = currentStep > 0 && currentStep < 8;

  return (
    <div className="min-h-screen bg-background">
      {/* Header - shown on steps 1-7 */}
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
          currentStep={currentStep}
          totalSteps={7}
          labels={STEP_LABELS.slice(1, 8)}
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