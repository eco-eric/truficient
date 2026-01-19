import { Link } from "react-router-dom";
import { StepContainer } from "@/pages/estimators/ductless/components/StepContainer";
import { CTAButton } from "@/pages/estimators/ductless/components/CTAButton";
import { useEstimator } from "../context/EstimatorContext";
import { motion } from "framer-motion";
import { CheckCircle, Phone, Calendar, FileText, Wrench } from "lucide-react";

export const Step9ThankYou = () => {
  const { resetEstimator, state } = useEstimator();

  const steps = [
    {
      icon: FileText,
      title: "Review Your Quote",
      description: "We're preparing a detailed proposal tailored to your home's needs.",
    },
    {
      icon: Phone,
      title: "Expert Consultation",
      description: "A comfort advisor will call within 1 business day to answer questions.",
    },
    {
      icon: Calendar,
      title: "Free In-Home Assessment",
      description: "We'll schedule a no-obligation visit to confirm sizing and discuss options.",
    },
    {
      icon: Wrench,
      title: "Professional Installation",
      description: "Our licensed technicians will install your new system with care.",
    },
  ];

  return (
    <StepContainer className="px-4 pb-28">
      <div className="max-w-lg mx-auto w-full text-center">
        {/* Success icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="flex items-center justify-center mb-6"
        >
          <div className="h-20 w-20 rounded-full bg-[#a5a983]/20 flex items-center justify-center">
            <CheckCircle className="h-12 w-12 text-[#a5a983]" />
          </div>
        </motion.div>

        <h2 className="text-2xl font-bold text-[#1e3a5f] mb-2">
          Thank You, {state.customerInfo.name.split(" ")[0] || "Friend"}!
        </h2>
        <p className="text-muted-foreground mb-8">
          Your HVAC estimate request has been submitted. Here's what happens next:
        </p>

        {/* Timeline */}
        <div className="space-y-4 mb-10 text-left">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.15 }}
              className="flex items-start gap-4 rounded-xl border p-4"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1e3a5f]/10 text-[#1e3a5f]">
                <step.icon className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground">{step.title}</h4>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Contact info callout */}
        <div className="bg-[#1e3a5f]/5 rounded-xl p-4 mb-8">
          <p className="text-sm text-muted-foreground mb-2">
            Have questions? Call us directly:
          </p>
          <a 
            href="tel:9724020184" 
            className="text-xl font-bold text-[#1e3a5f] hover:underline"
          >
            (972) 402-0184
          </a>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Link to="/" onClick={resetEstimator}>
            <CTAButton fullWidth>Return to Homepage</CTAButton>
          </Link>
          <Link to="/contact">
            <CTAButton variant="outline" fullWidth>
              Contact Us
            </CTAButton>
          </Link>
        </div>
      </div>
    </StepContainer>
  );
};
