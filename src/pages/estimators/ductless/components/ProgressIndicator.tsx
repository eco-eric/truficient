import { cn } from "@/lib/utils";

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  labels?: string[];
}

export const ProgressIndicator = ({ currentStep, totalSteps, labels }: ProgressIndicatorProps) => {
  return (
    <div className="w-full px-4 py-3">
      {/* Step counter */}
      <div className="text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
        Step {currentStep} of {totalSteps}
      </div>

      {/* Dots */}
      <div className="flex items-center justify-center gap-2">
        {Array.from({ length: totalSteps }).map((_, i) => {
          const stepNum = i + 1;
          const isCompleted = stepNum < currentStep;
          const isCurrent = stepNum === currentStep;

          return (
            <div
              key={i}
              className={cn(
                "h-2.5 w-2.5 rounded-full transition-all duration-300",
                isCompleted && "bg-primary",
                isCurrent && "bg-primary ring-4 ring-primary/20",
                !isCompleted && !isCurrent && "bg-muted-foreground/30"
              )}
            />
          );
        })}
      </div>

      {/* Optional step label */}
      {labels && labels[currentStep - 1] && (
        <div className="text-center text-sm font-medium text-foreground mt-2">
          {labels[currentStep - 1]}
        </div>
      )}
    </div>
  );
};
