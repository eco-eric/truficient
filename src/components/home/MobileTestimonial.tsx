import { motion } from "framer-motion";
import { Star } from "lucide-react";

export const MobileTestimonial = () => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.4 }}
      className="px-4 pb-6 lg:hidden"
    >
      <h2 className="text-lg font-semibold text-foreground mb-3">What Neighbors Say</h2>
      
      <div className="bg-card rounded-2xl p-4 border border-border">
        {/* Stars */}
        <div className="flex gap-0.5 mb-3">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="h-4 w-4 fill-[#d4a84b] text-[#d4a84b]" />
          ))}
        </div>

        {/* Quote */}
        <p className="text-foreground text-sm leading-relaxed mb-3">
          "The team was professional, on time, and the installation was flawless. 
          Our new mini-split system is whisper quiet and our energy bills have dropped significantly."
        </p>

        {/* Author */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-xs font-semibold text-primary">JM</span>
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Jennifer M.</p>
            <p className="text-xs text-muted-foreground">Plano, TX</p>
          </div>
        </div>
      </div>
    </motion.section>
  );
};
