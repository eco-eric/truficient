import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { motion } from "framer-motion";

interface SelectableCardProps {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
  badge?: string;
}

export const SelectableCard = ({ selected, onClick, children, className, badge }: SelectableCardProps) => {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "relative flex flex-col items-start rounded-2xl border-2 p-4 md:p-5 text-left transition-all duration-200 touch-target w-full",
        selected
          ? "border-[#d4a84b] bg-[#d4a84b]/10 shadow-md"
          : "border-border bg-card hover:border-primary/50 hover:shadow-sm",
        className
      )}
    >
      {/* Selected indicator */}
      {selected && (
        <div className="absolute top-2 right-2 md:top-3 md:right-3 flex h-6 w-6 items-center justify-center rounded-full bg-[#d4a84b] text-white">
          <Check className="h-4 w-4" />
        </div>
      )}

      {/* Badge */}
      {badge && (
        <div className="absolute -top-2.5 left-3 md:left-4 rounded-full bg-[#d4a84b] px-2.5 md:px-3 py-0.5 text-xs font-semibold text-white shadow">
          {badge}
        </div>
      )}

      {children}
    </motion.button>
  );
};
