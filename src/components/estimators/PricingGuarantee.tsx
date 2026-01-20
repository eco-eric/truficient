import { BadgeCheck, DollarSign } from "lucide-react";
import { motion } from "framer-motion";

interface PricingGuaranteeProps {
  variant?: "default" | "compact";
}

export const PricingGuarantee = ({ variant = "default" }: PricingGuaranteeProps) => {
  if (variant === "compact") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex items-center justify-center gap-2 text-sm text-emerald-700 bg-emerald-50 rounded-lg px-4 py-2 border border-emerald-200"
      >
        <BadgeCheck className="w-4 h-4 flex-shrink-0" />
        <span className="font-medium">Real prices, not estimates — what you see is what you pay</span>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="bg-gradient-to-r from-emerald-50 to-emerald-100/50 border border-emerald-200 rounded-xl p-4 sm:p-5"
    >
      <div className="flex items-start gap-3 sm:gap-4">
        <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
          <BadgeCheck className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-emerald-800 text-base sm:text-lg mb-1">
            Real Prices, Not Just Estimates
          </h3>
          <p className="text-sm text-emerald-700 leading-relaxed">
            The prices you see are our actual installation costs — no surprises, no hidden fees. 
            As long as your home matches the details you provide, this is the final price you'll pay.
          </p>
        </div>
      </div>

      {/* Additional trust indicators */}
      <div className="flex flex-wrap items-center gap-4 mt-4 pt-3 border-t border-emerald-200/50">
        <div className="flex items-center gap-1.5 text-xs text-emerald-700">
          <DollarSign className="w-3.5 h-3.5" />
          <span>No hidden fees</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-emerald-700">
          <BadgeCheck className="w-3.5 h-3.5" />
          <span>Price-match guarantee</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-emerald-700">
          <BadgeCheck className="w-3.5 h-3.5" />
          <span>Licensed & insured</span>
        </div>
      </div>
    </motion.div>
  );
};
