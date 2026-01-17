import { AnimatePresence } from "framer-motion";
import { QuoteProvider, useQuote } from "./context/QuoteContext";
import { ProgressIndicator } from "./components/ProgressIndicator";
import { WelcomeHero } from "./steps/WelcomeHero";
import { RoomSelector } from "./steps/RoomSelector";
import { RoomDetails } from "./steps/RoomDetails";
import { UnitStyleSelector } from "./steps/UnitStyleSelector";
import { SystemTierComparison } from "./steps/SystemTierComparison";
import { AddOnsSelector } from "./steps/AddOnsSelector";
import { QuoteSummary } from "./steps/QuoteSummary";
import { ThankYou } from "./steps/ThankYou";
import { Link } from "react-router-dom";
import truficientLogo from "@/assets/truficient-logo.png";

const STEP_LABELS = [
  "Welcome",
  "Select Rooms",
  "Room Details",
  "Unit Style",
  "System Tier",
  "Add-ons",
  "Your Quote",
  "Thank You",
];

const EstimatorContent = () => {
  const { state } = useQuote();
  const { currentStep } = state;

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <WelcomeHero />;
      case 1:
        return <RoomSelector />;
      case 2:
        return <RoomDetails />;
      case 3:
        return <UnitStyleSelector />;
      case 4:
        return <SystemTierComparison />;
      case 5:
        return <AddOnsSelector />;
      case 6:
        return <QuoteSummary />;
      case 7:
        return <ThankYou />;
      default:
        return <WelcomeHero />;
    }
  };

  const showProgress = currentStep > 0 && currentStep < 7;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src={truficientLogo} alt="Truficient" className="h-8 w-8 object-contain rounded" />
            <span className="font-semibold text-[#1e3a5f] text-sm hidden sm:inline">Truficient</span>
          </Link>
          <span className="text-xs text-muted-foreground uppercase tracking-wide">Ductless Estimator</span>
        </div>
      </header>

      {/* Progress indicator */}
      {showProgress && (
        <ProgressIndicator
          currentStep={currentStep}
          totalSteps={6}
          labels={STEP_LABELS.slice(1, 7)}
        />
      )}

      {/* Step content */}
      <main className="pb-6">
        <AnimatePresence mode="wait">{renderStep()}</AnimatePresence>
      </main>
    </div>
  );
};

const DuctlessEstimator = () => {
  return (
    <QuoteProvider>
      <EstimatorContent />
    </QuoteProvider>
  );
};

export default DuctlessEstimator;
