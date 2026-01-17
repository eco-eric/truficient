import { StepContainer } from "../../ductless/components/StepContainer";
import { CTAButton } from "../../ductless/components/CTAButton";
import { SelectableCard } from "../../ductless/components/SelectableCard";
import { useEstimator } from "../context/EstimatorContext";
import { Flame, Zap, ThermometerSun, DollarSign, Leaf, Wrench } from "lucide-react";
import type { HeatingType } from "../types";

interface HeatingTypeOption {
  value: HeatingType;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  iconColor: string;
  bgColor: string;
  benefits: { icon: React.ElementType; text: string }[];
  badge?: string;
}

const HEATING_TYPE_OPTIONS: HeatingTypeOption[] = [
  {
    value: "gas_system",
    title: "Gas Furnace + AC",
    subtitle: "Traditional Heating & Cooling",
    icon: Flame,
    iconColor: "text-orange-500",
    bgColor: "bg-orange-50",
    benefits: [
      { icon: ThermometerSun, text: "Powerful heating in coldest weather" },
      { icon: DollarSign, text: "Lower equipment cost" },
      { icon: Wrench, text: "Time-tested reliability" },
    ],
  },
  {
    value: "heat_pump",
    title: "Heat Pump System",
    subtitle: "All-Electric Heating & Cooling",
    icon: Zap,
    iconColor: "text-emerald-500",
    bgColor: "bg-emerald-50",
    badge: "Most Efficient",
    benefits: [
      { icon: Leaf, text: "Up to 300% more efficient" },
      { icon: DollarSign, text: "Lower operating costs" },
      { icon: ThermometerSun, text: "Heating + cooling in one unit" },
    ],
  },
];

export const Step4HeatingType = () => {
  const { state, setHeatingType, nextStep, prevStep } = useEstimator();

  const handleSelect = (type: HeatingType) => {
    setHeatingType(type);
  };

  return (
    <StepContainer className="px-4 pb-28">
      <div className="max-w-lg mx-auto w-full">
        <h2 className="text-2xl font-bold text-[#1e3a5f] mb-2">
          Choose Your Heating Type
        </h2>
        <p className="text-muted-foreground mb-6">
          Select the heating system that best fits your home and preferences.
        </p>

        <div className="space-y-4 mb-8">
          {HEATING_TYPE_OPTIONS.map((option) => {
            const Icon = option.icon;
            return (
              <SelectableCard
                key={option.value}
                selected={state.heatingType === option.value}
                onClick={() => handleSelect(option.value)}
                badge={option.badge}
                className="w-full"
              >
                <div className="w-full">
                  {/* Header with icon */}
                  <div className="flex items-start gap-4 mb-3">
                    <div
                      className={`flex-shrink-0 w-12 h-12 rounded-xl ${option.bgColor} flex items-center justify-center`}
                    >
                      <Icon className={`h-6 w-6 ${option.iconColor}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground text-lg">
                        {option.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {option.subtitle}
                      </p>
                    </div>
                  </div>

                  {/* Benefits list */}
                  <div className="space-y-2 mt-4 pl-16">
                    {option.benefits.map((benefit, idx) => {
                      const BenefitIcon = benefit.icon;
                      return (
                        <div
                          key={idx}
                          className="flex items-center gap-2 text-sm text-muted-foreground"
                        >
                          <BenefitIcon className="h-4 w-4 text-[#a5a983] flex-shrink-0" />
                          <span>{benefit.text}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </SelectableCard>
            );
          })}
        </div>

        {/* Info box */}
        <div className="rounded-xl bg-[#1e3a5f]/5 border border-[#1e3a5f]/10 p-4 mb-8">
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">Not sure which to choose?</strong>{" "}
            Heat pumps are ideal for Texas climates and offer year-round efficiency. 
            Gas systems provide powerful heating during rare cold snaps.
          </p>
        </div>

        {/* Navigation */}
        <div className="flex gap-3">
          <CTAButton variant="outline" onClick={prevStep} className="flex-1">
            Back
          </CTAButton>
          <CTAButton
            onClick={nextStep}
            disabled={!state.heatingType}
            className="flex-1"
          >
            Continue
          </CTAButton>
        </div>
      </div>
    </StepContainer>
  );
};
