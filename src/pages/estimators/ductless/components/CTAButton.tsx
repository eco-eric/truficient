import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

interface CTAButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  loading?: boolean;
  variant?: "primary" | "secondary" | "outline";
  fullWidth?: boolean;
  className?: string;
}

export const CTAButton = ({
  children,
  onClick,
  type = "button",
  disabled = false,
  loading = false,
  variant = "primary",
  fullWidth = false,
  className,
}: CTAButtonProps) => {
  const baseClasses =
    "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

  const variantClasses = {
    primary:
      "bg-[#d4a84b] text-white hover:bg-[#c49a3f] focus:ring-[#d4a84b] shadow-lg hover:shadow-xl active:shadow-md",
    secondary:
      "bg-[#1e3a5f] text-white hover:bg-[#2a4a70] focus:ring-[#1e3a5f] shadow-lg hover:shadow-xl active:shadow-md",
    outline:
      "border-2 border-[#1e3a5f] text-[#1e3a5f] bg-transparent hover:bg-[#1e3a5f]/5 focus:ring-[#1e3a5f]",
  };

  const sizeClasses = "px-6 py-3 text-base min-h-[48px]";

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={!disabled && !loading ? { scale: 1.02 } : {}}
      whileTap={!disabled && !loading ? { scale: 0.98 } : {}}
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses,
        fullWidth && "w-full",
        className
      )}
    >
      {loading && <Loader2 className="h-5 w-5 animate-spin" />}
      {children}
    </motion.button>
  );
};
