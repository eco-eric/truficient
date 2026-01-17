import { motion } from "framer-motion";

interface PriceBarProps {
  label?: string;
  amount: number;
  showRange?: boolean;
  lowAmount?: number;
  highAmount?: number;
}

const formatMoney = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

export const PriceBar = ({ label = "Estimated Total", amount, showRange, lowAmount, highAmount }: PriceBarProps) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#1e3a5f] text-white py-3 px-4 md:py-4 md:px-6 shadow-lg pb-safe">
      <div className="max-w-md mx-auto flex items-center justify-between gap-2">
        <span className="text-xs sm:text-sm font-medium">{label}</span>

        <motion.div
          key={amount}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="text-right flex-shrink-0"
        >
          {showRange && lowAmount !== undefined && highAmount !== undefined ? (
            <span className="text-base sm:text-lg font-bold">
              {formatMoney(lowAmount)} – {formatMoney(highAmount)}
            </span>
          ) : (
            <span className="text-base sm:text-lg font-bold">{formatMoney(amount)}</span>
          )}
        </motion.div>
      </div>
    </div>
  );
};
