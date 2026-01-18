import { motion } from "framer-motion";
import { ShieldCheck, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

export const TrustBadge = () => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="px-4 pb-4 lg:hidden"
    >
      <Link to="/about" className="block">
        <div className="bg-gradient-to-r from-[#1e3a5f] to-[#2a4a6f] rounded-2xl p-4 text-white">
          <div className="flex items-start gap-3">
            <div className="bg-[#d4a84b]/20 rounded-xl p-2.5 flex-shrink-0">
              <ShieldCheck className="h-6 w-6 text-[#d4a84b]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold text-[#d4a84b] uppercase tracking-wide">
                  Diamond Elite
                </span>
              </div>
              <h3 className="font-semibold text-white text-base">
                Mitsubishi Preferred Installer
              </h3>
              <p className="text-white/70 text-sm mt-0.5">
                Top 5% of contractors in DFW
              </p>
            </div>
            <ChevronRight className="h-5 w-5 text-white/50 flex-shrink-0 mt-1" />
          </div>
        </div>
      </Link>
    </motion.section>
  );
};
