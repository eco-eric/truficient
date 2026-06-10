import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CreditCard, Info } from "lucide-react";
import { formatMoney } from "@/lib/serviceArea";

interface FinancingOption {
  id: string;
  plan_name: string;
  promotional_offer: string;
  interest_rate: number;
  payment_factor: number;
  months_to_payoff: number | null;
  is_active: boolean;
  sort_order: number;
  applies_to: string[] | null;
  notes: string | null;
}

interface FinancingOptionsSectionProps {
  estimatorType: "ducted" | "ductless";
  finalTotal: number;
}

export const FinancingOptionsSection = ({
  estimatorType,
  finalTotal,
}: FinancingOptionsSectionProps) => {
  const { data: financingOptions = [], isLoading } = useQuery({
    queryKey: ["financing_options", estimatorType],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("financing_options")
        .select("*")
        .eq("is_active", true)
        .contains("applies_to", [estimatorType])
        .order("sort_order");
      
      if (error) {
        console.error("Error fetching financing options:", error);
        return [];
      }
      return data as FinancingOption[];
    },
  });

  if (isLoading || financingOptions.length === 0) {
    return null;
  }

  // Check if any options are deferred interest (plans 920, 924, etc.)
  const hasDeferredInterestPlan = financingOptions.some(
    (plan) => plan.plan_name.includes("920") || plan.plan_name.includes("924")
  );

  // Get an example plan for the APR disclosure
  const examplePlan = financingOptions.find((p) => p.interest_rate > 0 && p.months_to_payoff);

  return (
    <div className="rounded-xl border border-border p-4 mb-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-[#1e3a5f]/10 rounded-full">
          <CreditCard className="h-5 w-5 text-[#1e3a5f]" />
        </div>
        <div>
          <h4 className="font-semibold text-foreground">Financing Options</h4>
          <p className="text-xs text-muted-foreground">
            Subject to credit approval • Powered by Synchrony
          </p>
        </div>
      </div>

      {/* Financing Plans */}
      <div className="space-y-3 mb-4">
        {financingOptions.map((plan) => {
          const monthlyPayment = finalTotal * plan.payment_factor;
          const isPromoNoInterest = plan.interest_rate === 0;

          return (
            <div
              key={plan.id}
              className="rounded-lg border border-border bg-muted/30 p-3"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <p className="font-medium text-foreground text-sm">
                    {plan.plan_name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {plan.promotional_offer}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-[#1e3a5f]">
                    ~{formatMoney(Math.round(monthlyPayment))}/mo
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span className="px-2 py-0.5 bg-background rounded">
                  {isPromoNoInterest ? "0%" : `${plan.interest_rate}%`} APR
                </span>
                {plan.months_to_payoff && (
                  <span className="px-2 py-0.5 bg-background rounded">
                    {plan.months_to_payoff} months
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Synchrony Disclaimers */}
      <div className="border-t border-border pt-3">
        <div className="flex items-start gap-2 text-[10px] text-muted-foreground leading-relaxed">
          <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
          <div className="space-y-2">
            {/* Primary disclaimer */}
            <p>
              *Subject to credit approval. Minimum monthly payments required. 
              See store for details. Financing provided by Synchrony Bank.
            </p>

            {/* APR/Payment Example */}
            {examplePlan && (
              <p>
                Example: A {formatMoney(finalTotal)} purchase at {examplePlan.interest_rate}% APR 
                for {examplePlan.months_to_payoff} months requires monthly payments of approximately{" "}
                {formatMoney(Math.round(finalTotal * examplePlan.payment_factor))}.
              </p>
            )}

            {/* Deferred Interest Disclosure */}
            {hasDeferredInterestPlan && (
              <p>
                For deferred interest promotions: No interest will be charged on this purchase 
                if you pay the promotional balance in full within the promotional period. 
                Interest will be charged to your account from the purchase date if the 
                promotional balance is not paid in full within the promotional period. 
                Minimum monthly payments required.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
