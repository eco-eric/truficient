import { motion } from "framer-motion";
import { StepContainer } from "../../ductless/components/StepContainer";
import { CTAButton } from "../../ductless/components/CTAButton";
import { useEstimator } from "../context/EstimatorContext";
import ownerImage from "@/assets/owner-eric.webp";
import {
  Zap,
  Wind,
  SlidersHorizontal,
  Shield,
  FileCheck,
  BadgeCheck,
  Wifi,
  Award,
  Diamond,
  Home,
  Star,
} from "lucide-react";

const INCLUDED_ITEMS = [
  {
    icon: Zap,
    title: "Whole-System Surge Protector",
    description: "Protects your investment from power surges",
    badge: "$150 Value",
  },
  {
    icon: Wind,
    title: "Professional Air Balancing",
    description: "Every room tested for optimal airflow",
    badge: "$200 Value",
  },
  {
    icon: SlidersHorizontal,
    title: "Balancing Dampers",
    description: "Precision airflow control for consistent temps",
    badge: "$175 Value",
  },
  {
    icon: Shield,
    title: "Plenum Air Sealing",
    description: "Complete sealing to maximize efficiency",
    badge: "$125 Value",
  },
  {
    icon: FileCheck,
    title: "Full Commissioning Report",
    description: "Detailed documentation of system performance",
    badge: "Included",
  },
  {
    icon: BadgeCheck,
    title: "2-Year Labor Warranty",
    description: "Any issues? We fix them at no cost",
    badge: "Peace of Mind",
  },
  {
    icon: Wifi,
    title: "WiFi Smart Thermostat",
    description: "Control your comfort from anywhere",
    badge: "$250 Value",
  },
  {
    icon: Award,
    title: "Performance Guarantee",
    description: "If it doesn't perform as promised, we make it right",
    badge: "100% Guaranteed",
  },
];

const TRUST_BADGES = [
  { icon: Diamond, label: "Mitsubishi Diamond" },
  { icon: Home, label: "HERS Certified" },
  { icon: Star, label: "4.9★ Google Rating" },
  { icon: BadgeCheck, label: "Licensed & Insured" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export const Step7WhatsIncluded = () => {
  const { nextStep, prevStep } = useEstimator();

  return (
    <StepContainer className="px-4 pb-28">
      <div className="max-w-3xl mx-auto w-full">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-[#1e3a5f] mb-2">
            Every Truficient Installation Includes
          </h2>
          <p className="text-muted-foreground">
            We don't cut corners. Here's what sets us apart.
          </p>
        </motion.div>

        {/* Owner Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
          className="flex flex-col sm:flex-row items-center gap-4 bg-[#1e3a5f]/5 rounded-xl p-4 md:p-6 mb-6"
        >
          <img
            src={ownerImage}
            alt="Eric, Owner of Truficient"
            className="w-24 h-24 md:w-28 md:h-28 rounded-full object-cover border-4 border-white shadow-lg flex-shrink-0"
          />
          <div className="text-center sm:text-left">
            <p className="text-foreground italic text-sm md:text-base mb-2">
              "I personally stand behind every installation. My team and I are
              committed to delivering quality work that keeps your family
              comfortable for years to come."
            </p>
            <p className="font-semibold text-[#1e3a5f]">— Eric, Owner</p>
          </div>
        </motion.div>

        {/* 8-Item Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6"
        >
          {INCLUDED_ITEMS.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                className="bg-card border border-border rounded-xl p-3 md:p-4 flex flex-col items-center text-center hover:shadow-md transition-shadow"
              >
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#a5a983]/15 flex items-center justify-center mb-2">
                  <IconComponent className="h-5 w-5 md:h-6 md:w-6 text-[#a5a983]" />
                </div>
                <h3 className="font-semibold text-foreground text-xs md:text-sm mb-1 leading-tight">
                  {item.title}
                </h3>
                <p className="text-muted-foreground text-[10px] md:text-xs mb-2 leading-tight hidden sm:block">
                  {item.description}
                </p>
                <span className="mt-auto inline-block bg-[#1e3a5f]/10 text-[#1e3a5f] text-[10px] md:text-xs font-semibold px-2 py-0.5 rounded-full">
                  {item.badge}
                </span>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Total Value Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-r from-[#1e3a5f] to-[#2d5a8f] text-white rounded-xl p-4 md:p-5 text-center mb-6"
        >
          <p className="text-lg md:text-xl font-bold mb-1">
            Total Added Value: Over $900
          </p>
          <p className="text-white/80 text-sm">
            Other contractors charge extra for these — we include them standard.
          </p>
        </motion.div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex flex-wrap justify-center gap-2 md:gap-4 mb-8"
        >
          {TRUST_BADGES.map((badge, index) => {
            const BadgeIcon = badge.icon;
            return (
              <div
                key={index}
                className="flex items-center gap-1.5 bg-muted/50 px-3 py-1.5 rounded-full"
              >
                <BadgeIcon className="h-4 w-4 text-[#a5a983]" />
                <span className="text-xs font-medium text-muted-foreground">
                  {badge.label}
                </span>
              </div>
            );
          })}
        </motion.div>

        {/* Navigation */}
        <div className="flex gap-3">
          <CTAButton variant="outline" onClick={prevStep} className="flex-1">
            Back
          </CTAButton>
          <CTAButton onClick={nextStep} className="flex-1">
            Continue
          </CTAButton>
        </div>
      </div>
    </StepContainer>
  );
};
