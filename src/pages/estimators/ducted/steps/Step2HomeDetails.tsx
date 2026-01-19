import { StepContainer } from "../../ductless/components/StepContainer";
import { CTAButton } from "../../ductless/components/CTAButton";
import { SelectableCard } from "../../ductless/components/SelectableCard";
import { useEstimator } from "../context/EstimatorContext";
import {
  HOME_LAYOUT_OPTIONS,
  SQUARE_FOOTAGE_OPTIONS,
  SYSTEM_COUNT_OPTIONS,
  COVERAGE_OPTIONS,
  type HomeLayout,
  type SquareFootage,
  type SystemCount,
  type Coverage,
} from "../types";
import {
  Minus,
  Layers2,
  Layers,
  AlignVerticalJustifyStart,
  ArrowDown,
  ArrowUp,
  Ruler,
} from "lucide-react";

// Icon mapping for layouts
const LAYOUT_ICON_MAP: Record<string, React.ElementType> = {
  Minus,
  Layers2,
  Layers,
  AlignVerticalJustifyStart,
  ArrowDown,
  ArrowUp,
};

export const Step2HomeDetails = () => {
  const {
    state,
    setHomeLayout,
    setSquareFootage,
    setSystemCount,
    setCoverage,
    nextStep,
    prevStep,
  } = useEstimator();

  const canContinue =
    state.homeLayout && state.squareFootage && state.coverage;

  return (
    <StepContainer className="px-4 pb-28">
      <div className="max-w-lg mx-auto w-full space-y-8">
        {/* Layout selection */}
        <div>
          <h2 className="text-xl font-bold text-[#1e3a5f] mb-2">
            Tell Us About Your Home
          </h2>
          <p className="text-muted-foreground mb-4">
            This helps us size your system correctly.
          </p>

          <h3 className="text-sm font-medium text-foreground mb-3">
            Home Layout
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {HOME_LAYOUT_OPTIONS.map((option) => {
              const Icon = LAYOUT_ICON_MAP[option.icon] || Minus;
              return (
                <SelectableCard
                  key={option.value}
                  selected={state.homeLayout === option.value}
                  onClick={() => setHomeLayout(option.value as HomeLayout)}
                  className="flex flex-col items-center py-3 px-2"
                >
                  <Icon className="h-5 w-5 text-[#1e3a5f] mb-1" />
                  <span className="text-xs font-medium text-center">
                    {option.label}
                  </span>
                </SelectableCard>
              );
            })}
          </div>
        </div>

        {/* Square footage selection */}
        <div>
          <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
            <Ruler className="h-4 w-4 text-[#a5a983]" />
            Square Footage (conditioned area)
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {SQUARE_FOOTAGE_OPTIONS.map((option) => (
              <SelectableCard
                key={option.value}
                selected={state.squareFootage === option.value}
                onClick={() => setSquareFootage(option.value as SquareFootage)}
                className="py-3 px-2 text-center"
              >
                <span className="text-sm font-medium">{option.label}</span>
                <span className="block text-xs text-muted-foreground">
                  sq ft
                </span>
              </SelectableCard>
            ))}
          </div>
        </div>

        {/* System count - always visible */}
        <div>
          <h3 className="text-sm font-medium text-foreground mb-3">
            How many HVAC systems do you have?
          </h3>
          <div className="grid grid-cols-4 gap-3">
            {SYSTEM_COUNT_OPTIONS.map((option) => (
              <SelectableCard
                key={option.value}
                selected={state.systemCount === option.value}
                onClick={() => setSystemCount(option.value as SystemCount)}
                className="py-6 text-center"
              >
                <span className="text-2xl font-bold">{option.label}</span>
              </SelectableCard>
            ))}
          </div>
        </div>

        {/* Coverage selection */}
        <div>
          <h3 className="text-sm font-medium text-foreground mb-3">
            What coverage do you need?
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {COVERAGE_OPTIONS.map((option) => (
              <SelectableCard
                key={option.value}
                selected={state.coverage === option.value}
                onClick={() => setCoverage(option.value as Coverage)}
                className="py-4 px-4"
              >
                <span className="font-medium text-sm">{option.label}</span>
                <span className="block text-xs text-muted-foreground mt-1">
                  {option.description}
                </span>
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
