import { StepContainer } from "../../ductless/components/StepContainer";
import { CTAButton } from "../../ductless/components/CTAButton";
import { SelectableCard } from "../../ductless/components/SelectableCard";
import { useEstimator } from "../context/EstimatorContext";
import {
  HOT_COLD_SPOTS_OPTIONS,
  TEMP_PREFERENCE_OPTIONS,
  SUMMER_TEMP_OPTIONS,
  type HotColdSpots,
  type TempPreference,
} from "../types";
import { Thermometer, Sun, Snowflake } from "lucide-react";

export const Step3UsagePatterns = () => {
  const {
    state,
    setHotColdSpots,
    setWinterTemp,
    setSummerTemp,
    nextStep,
    prevStep,
  } = useEstimator();

  const canContinue =
    state.hotColdSpots !== null &&
    state.winterTemp !== null &&
    state.summerTemp !== null;

  return (
    <StepContainer className="px-4 pb-28">
      <div className="max-w-lg mx-auto w-full space-y-8">
        <div>
          <h2 className="text-xl font-bold text-[#1e3a5f] mb-2">
            Your Comfort Preferences
          </h2>
          <p className="text-muted-foreground">
            Help us understand how you use your current system.
          </p>
        </div>

        {/* Hot/Cold Spots */}
        <div>
          <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
            <Thermometer className="h-4 w-4 text-[#a5a983]" />
            Does your home have hot or cold spots?
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {HOT_COLD_SPOTS_OPTIONS.map((option) => (
              <SelectableCard
                key={option.value}
                selected={state.hotColdSpots === option.value}
                onClick={() => setHotColdSpots(option.value as HotColdSpots)}
                className="py-4 px-3 text-center"
              >
                <span className="font-medium text-sm block">{option.label}</span>
                <span className="text-xs text-muted-foreground mt-1 block">
                  {option.description}
                </span>
              </SelectableCard>
            ))}
          </div>
        </div>

        {/* Winter Temperature Preference */}
        <div>
          <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
            <Snowflake className="h-4 w-4 text-blue-500" />
            Preferred winter temperature
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {TEMP_PREFERENCE_OPTIONS.map((option) => (
              <SelectableCard
                key={option.value}
                selected={state.winterTemp === option.value}
                onClick={() => setWinterTemp(option.value as TempPreference)}
                className="py-4 px-4"
              >
                <span className="font-semibold text-lg text-[#1e3a5f] block">
                  {option.label}
                </span>
                {option.description && (
                  <span className="text-xs text-muted-foreground">
                    {option.description}
                  </span>
                )}
              </SelectableCard>
            ))}
          </div>
        </div>

        {/* Summer Temperature Preference */}
        <div>
          <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
            <Sun className="h-4 w-4 text-orange-500" />
            Preferred summer temperature
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {SUMMER_TEMP_OPTIONS.map((option) => (
              <SelectableCard
                key={option.value}
                selected={state.summerTemp === option.value}
                onClick={() => setSummerTemp(option.value as TempPreference)}
                className="py-4 px-4"
              >
                <span className="font-semibold text-lg text-[#1e3a5f] block">
                  {option.label}
                </span>
                {option.description && (
                  <span className="text-xs text-muted-foreground">
                    {option.description}
                  </span>
                )}
              </SelectableCard>
            ))}
          </div>
        </div>

        {/* Insight box */}
        <div className="rounded-xl bg-[#1e3a5f]/5 border border-[#1e3a5f]/10 p-4">
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">Why we ask:</strong> Your
            temperature preferences help us recommend the right efficiency tier
            to maximize your comfort and savings.
          </p>
        </div>

        {/* Navigation */}
        <div className="flex gap-3">
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
