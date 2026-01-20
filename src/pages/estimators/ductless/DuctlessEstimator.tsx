import { AnimatePresence } from "framer-motion";
import { QuoteProvider, useQuote } from "./context/QuoteContext";
import { ProgressIndicator } from "./components/ProgressIndicator";
import { PriceBar } from "./components/PriceBar";
import { usePricing } from "./hooks/usePricing";
import { WelcomeHero } from "./steps/WelcomeHero";
import { CustomerInfoStep } from "./steps/CustomerInfoStep";
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
  "Your Info",
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

  // Get pricing for the price bar
  const { pricing, tiers, selectedUnit } = usePricing({
    rooms: state.selectedRooms,
    unitTypeId: state.unitTypeId,
    systemTierId: state.systemTierId,
    selectedAddonIds: state.selectedAddonIds,
  });

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <WelcomeHero />;
      case 1:
        return <CustomerInfoStep />;
      case 2:
        return <RoomSelector />;
      case 3:
        return <RoomDetails />;
      case 4:
        return <UnitStyleSelector />;
      case 5:
        return <SystemTierComparison />;
      case 6:
        return <AddOnsSelector />;
      case 7:
        return <QuoteSummary />;
      case 8:
        return <ThankYou />;
      default:
        return <WelcomeHero />;
    }
  };

  const showProgress = currentStep > 0 && currentStep < 8;
  
  // Show price bar on steps 4-7 (tier selection through summary)
  const showPriceBar = currentStep >= 4 && currentStep <= 7;
  
  // Check if all rooms have unit types assigned
  const allRoomsHaveUnits = state.selectedRooms.every(room => room.unitTypeId);
  
  // Show range when tier is selected but not all rooms have units yet
  const showRange = state.systemTierId && !allRoomsHaveUnits;
  
  // Calculate base equipment cost from per-room unit selections
  const baseEquipmentCost = pricing.baseEquipmentCost;

  // Show header on all steps except first (welcome) and last (thank you)
  const showHeader = currentStep > 0 && currentStep < 8;

  return (
    <div className="min-h-screen bg-background">
      {/* Header - shown on steps 1-7 */}
      {showHeader && (
        <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b">
          <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <img src={truficientLogo} alt="Truficient" className="h-8 w-8 object-contain rounded" />
              <span className="font-semibold text-primary text-sm hidden sm:inline">Truficient</span>
            </Link>
            <span className="text-xs text-muted-foreground uppercase tracking-wide">Ductless Estimator</span>
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

      {/* Price bar */}
      {showPriceBar && state.systemTierId && (
        <PriceBar
          label="Estimated Total"
          amount={pricing.finalTotal}
          showRange={showRange}
          lowAmount={pricing.finalTotal}
          highAmount={pricing.finalTotal}
        />
      )}
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
