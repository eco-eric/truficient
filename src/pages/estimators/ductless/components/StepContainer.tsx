import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface StepContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const StepContainer = ({ children, className }: StepContainerProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className={cn("flex flex-col min-h-[calc(100vh-200px)]", className)}
    >
      {children}
    </motion.div>
  );
};
