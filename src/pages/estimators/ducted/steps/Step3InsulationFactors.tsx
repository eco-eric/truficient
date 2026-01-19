import { StepContainer } from "../../ductless/components/StepContainer";
import { CTAButton } from "../../ductless/components/CTAButton";
import { SelectableCard } from "../../ductless/components/SelectableCard";
import { useEstimator } from "../context/EstimatorContext";
import {
  ATTIC_INSULATION_OPTIONS,
  WINDOW_TYPE_OPTIONS,
  HOME_AGE_OPTIONS,
  type AtticInsulation,
  type WindowType,
  type HomeAge,
} from "../types";
import { Home, Thermometer, Calendar } from "lucide-react";

export const Step3InsulationFactors = () => {
  const {
    state,
    setAtticInsulation,
    setWindowType,
    setHomeAge,
    nextStep,
    prevStep,
  } = useEstimator();

  const canContinue =
    state.atticInsulation && state.windowType && state.homeAge;

  return (
    <StepContainer className="px-4 pb-28">
      <div className="max-w-lg mx-auto w-full space-y-8">
        {/* Header */}
        <div>
          <h2 className="text-xl font-bold text-[#1e3a5f] mb-2">
            Insulation & Efficiency Factors
          </h2>
          <p className="text-muted-foreground mb-4">
            These factors help us recommend the right system size and efficiency.
          </p>
        </div>

        {/* Attic insulation selection */}
        <div>
          <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
            <Thermometer className="h-4 w-4 text-[#a5a983]" />
            Attic insulation?
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {ATTIC_INSULATION_OPTIONS.map((option) => (
              <SelectableCard
                key={option.value}
                selected={state.atticInsulation === option.value}
                onClick={() => setAtticInsulation(option.value as AtticInsulation)}
                className="py-3 px-2 text-center"
              >
                <span className="text-sm font-medium">{option.label}</span>
              </SelectableCard>
            ))}
          </div>
        </div>

        {/* Window type selection */}
        <div>
          <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
            <Home className="h-4 w-4 text-[#a5a983]" />
            Window type?
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {WINDOW_TYPE_OPTIONS.map((option) => (
              <SelectableCard
                key={option.value}
                selected={state.windowType === option.value}
                onClick={() => setWindowType(option.value as WindowType)}
                className="py-3 px-2 text-center"
              >
                <span className="text-sm font-medium">{option.label}</span>
              </SelectableCard>
            ))}
          </div>
        </div>

        {/* Home age selection */}
        <div>
          <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-[#a5a983]" />
            When was your home built?
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {HOME_AGE_OPTIONS.map((option) => (
              <SelectableCard
                key={option.value}
                selected={state.homeAge === option.value}
                onClick={() => setHomeAge(option.value as HomeAge)}
                className="py-3 px-2 text-center"
              >
                <span className="text-sm font-medium">{option.label}</span>
              </SelectableCard>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex gap-3 pt-4">
          <CTAButton variant="outline" onClick={prevStep} className="flex-1">
            Back
          </CTAButton>
          <CTAButton
            onClick={nextStep}
            disabled={!canContinue}
            className="flex-1"
          >
            Continue
          </CTAButton>
        </div>
      </div>
    </StepContainer>
  );
};
