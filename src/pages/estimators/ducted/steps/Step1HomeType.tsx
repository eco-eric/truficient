import { StepContainer } from "../../ductless/components/StepContainer";
import { CTAButton } from "../../ductless/components/CTAButton";
import { SelectableCard } from "../../ductless/components/SelectableCard";
import { useEstimator } from "../context/EstimatorContext";
import { HOME_TYPE_OPTIONS, type HomeType } from "../types";
import { Home, Building2, Building, Caravan, Columns2, HelpCircle } from "lucide-react";
import truficientLogo from "@/assets/truficient-logo.webp";
import { Link } from "react-router-dom";

// Icon mapping for home types
const ICON_MAP: Record<string, React.ElementType> = {
  Home,
  Building2,
  Building,
  Caravan,
  Columns2,
  HelpCircle,
};

export const Step1HomeType = () => {
  const { state, setHomeType, nextStep } = useEstimator();

  const handleSelect = (type: HomeType) => {
    setHomeType(type);
  };

  return (
    <StepContainer className="px-4 pb-8 pt-0">
      <div className="max-w-lg mx-auto w-full">
        {/* Hero section */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Link to="/">
              <img
                src={truficientLogo}
                alt="Truficient"
                className="h-16 w-16 object-contain rounded-xl shadow-lg"
              />
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-[#1e3a5f] mb-2">
            Your Custom HVAC Quote
          </h1>
          <p className="text-muted-foreground">
            Get an instant estimate for your ducted heating & cooling system in just a few minutes.
          </p>
        </div>

        {/* Home type selection */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            What type of home do you have?
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {HOME_TYPE_OPTIONS.map((option) => {
              const Icon = ICON_MAP[option.icon] || Home;
              return (
                <SelectableCard
                  key={option.value}
                  selected={state.homeType === option.value}
                  onClick={() => handleSelect(option.value)}
                  className="flex flex-col items-center py-5 px-4"
                >
                  <Icon className="h-8 w-8 text-[#1e3a5f] mb-2" />
                  <span className="font-medium text-sm text-center">
                    {option.label}
                  </span>
                </SelectableCard>
              );
            })}
          </div>
        </div>

        {/* Trust elements */}
        <div className="rounded-xl bg-[#a5a983]/10 border border-[#a5a983]/20 p-4 mb-8">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full bg-[#1e3a5f] flex items-center justify-center text-white text-xs font-bold">
                4.9
              </div>
              <div className="w-8 h-8 rounded-full bg-[#a5a983] flex items-center justify-center text-white text-xs">
                ★
              </div>
            </div>
            <span>
              <strong className="text-foreground">500+ systems installed</strong> across DFW this year
            </span>
          </div>
        </div>

        {/* CTA */}
        <CTAButton
          onClick={nextStep}
          disabled={!state.homeType}
          className="w-full"
        >
          Get My Estimate
        </CTAButton>

        <p className="text-xs text-center text-muted-foreground mt-4">
          No obligation • Takes about 2 minutes
        </p>
      </div>
    </StepContainer>
  );
};
