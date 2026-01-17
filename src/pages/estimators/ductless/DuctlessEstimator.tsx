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
  
  // Show price bar on steps 4-7 (unit selection through summary)
  const showPriceBar = currentStep >= 4 && currentStep <= 7;
  
  // Determine if we should show a range (before tier is selected)
  const showRange = !state.systemTierId && tiers.length > 1;
  const zoneCount = state.selectedRooms.length;
  const baseEquipmentCost = (selectedUnit?.base_price || 0) * zoneCount;
  
  // Calculate range based on tier multipliers
  const multipliers = tiers.map((t) => t.price_multiplier);
  const minMultiplier = multipliers.length > 0 ? Math.min(...multipliers) : 1;
  const maxMultiplier = multipliers.length > 0 ? Math.max(...multipliers) : 1;
  const lowTotal = Math.round((baseEquipmentCost * minMultiplier + pricing.addonsTotal) * 1.0825);
  const highTotal = Math.round((baseEquipmentCost * maxMultiplier + pricing.addonsTotal) * 1.0825);

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
          totalSteps={7}
          labels={STEP_LABELS.slice(1, 8)}
        />
      )}

      {/* Step content */}
      <main className="pb-6">
        <AnimatePresence mode="wait">{renderStep()}</AnimatePresence>
      </main>

      {/* Price bar */}
      {showPriceBar && state.unitTypeId && (
        <PriceBar
          label="Estimated Total"
          amount={pricing.finalTotal}
          showRange={showRange}
          lowAmount={lowTotal}
          highAmount={highTotal}
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
