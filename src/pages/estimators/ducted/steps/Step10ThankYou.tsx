import { useState } from "react";
import { Link } from "react-router-dom";
import { StepContainer } from "@/pages/estimators/ductless/components/StepContainer";
import { CTAButton } from "@/pages/estimators/ductless/components/CTAButton";
import { useEstimator } from "../context/EstimatorContext";
import { useDuctedPricing, formatMoney } from "../hooks/useDuctedPricing";
import { motion } from "framer-motion";
import { 
  CheckCircle, 
  Phone, 
  FileText, 
  Wrench, 
  Download, 
  Eye,
  MessageSquare,
  ClipboardCheck,
  UserCheck,
  Home,
  Gauge,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { generateDuctedQuotePDF } from "@/utils/generateDuctedQuotePDF";
import { format, addDays } from "date-fns";

// Label mappings for display
const HOME_TYPE_LABELS: Record<string, string> = {
  single_family: "Single Family",
  townhouse: "Townhouse",
  condo: "Condo",
  mobile_home: "Mobile Home",
  duplex: "Duplex",
  other: "Other",
};

const HEATING_TYPE_LABELS: Record<string, string> = {
  gas_system: "Gas Furnace + AC",
  heat_pump: "Heat Pump System",
};

export const Step10ThankYou = () => {
  const { resetEstimator, state } = useEstimator();
  const { pricing, isLoading } = useDuctedPricing(state);
  const [showQuoteDialog, setShowQuoteDialog] = useState(false);

  const steps = [
    {
      icon: ClipboardCheck,
      title: "Expert Quote Review",
      description: "Our team is reviewing your request now to ensure every detail of the estimate is accurate and tailored to your home's specific needs.",
    },
    {
      icon: UserCheck,
      title: "Personal Consultation",
      description: "A Comfort Advisor will call you within one business day to walk through your quote, answer technical questions, and discuss financing if needed.",
    },
    {
      icon: Home,
      title: "Technical Site Assessment",
      description: "We'll perform an on-site visit to verify equipment sizing and installation requirements. This ensures the system we quoted is the perfect fit for your space.",
    },
    {
      icon: Wrench,
      title: "Precision Installation",
      description: "Once approved, our trained team of installers will install your new system with surgical care, adhering to all local codes and manufacturer specifications.",
    },
    {
      icon: Gauge,
      title: "Performance Optimization",
      description: "After installation, we conduct a rigorous post-install test. We calibrate the system to ensure it's operating at peak efficiency and providing maximum comfort for long term operation.",
    },
    {
      icon: ShieldCheck,
      title: "Warranty & Final Paperwork",
      description: "warranty_step",
      isFinal: true,
    },
  ];

  const handleDownloadPDF = () => {
    generateDuctedQuotePDF({
      customerInfo: state.customerInfo,
      homeType: state.homeType,
      homeLayout: state.homeLayout,
      squareFootage: state.squareFootage,
      systemCount: state.systemCount,
      coverage: state.coverage,
      atticInsulation: state.atticInsulation,
      windowType: state.windowType,
      homeAge: state.homeAge,
      heatingType: state.heatingType,
      selectedTonnage: pricing.effectiveTonnage,
      equipment: pricing.selectedEquipment ? {
        brand: pricing.selectedEquipment.brand,
        systemName: pricing.selectedEquipment.system_name,
        seer2Rating: pricing.selectedEquipment.seer2_rating,
        hspf2Rating: pricing.selectedEquipment.hspf2_rating,
        warrantyYears: pricing.selectedEquipment.warranty_years,
      } : null,
      tier: pricing.selectedTier ? {
        displayName: pricing.selectedTier.display_name,
      } : null,
      addonsBreakdown: pricing.addonsBreakdown.map(a => ({ name: a.name, price: a.price })),
      pricing: {
        equipmentCost: pricing.equipmentCost,
        installationCost: pricing.installationCost,
        addonsCost: pricing.addonsCost,
        finalTotal: pricing.finalTotal,
        monthlyFinancing: pricing.monthlyFinancing,
      },
    });
  };

  const validUntilDate = format(addDays(new Date(), 30), "MMMM d, yyyy");

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
        <p className="text-muted-foreground mb-6">
          Your HVAC estimate request has been submitted.
        </p>

        {/* Estimate Summary Card */}
        {!isLoading && pricing.finalTotal > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-xl border-2 border-[#1e3a5f]/20 bg-gradient-to-br from-[#1e3a5f]/5 to-transparent p-5 mb-8 text-left"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-full bg-[#1e3a5f]/10 flex items-center justify-center">
                <FileText className="h-5 w-5 text-[#1e3a5f]" />
              </div>
              <div>
                <h3 className="font-semibold text-[#1e3a5f]">Your Estimate Summary</h3>
                <p className="text-sm text-muted-foreground">Download or view your quote details</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button 
                onClick={handleDownloadPDF}
                className="flex-1 bg-[#1e3a5f] hover:bg-[#1e3a5f]/90"
              >
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
              <Button 
                variant="outline"
                onClick={() => setShowQuoteDialog(true)}
                className="flex-1 border-[#1e3a5f]/30 text-[#1e3a5f] hover:bg-[#1e3a5f]/5"
              >
                <Eye className="h-4 w-4 mr-2" />
                View Estimate
              </Button>
            </div>
          </motion.div>
        )}

        {/* What happens next */}
        <p className="text-sm font-medium text-muted-foreground mb-4">Here's what happens next:</p>

        {/* Timeline */}
        <div className="space-y-4 mb-8 text-left">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className={`flex items-start gap-4 rounded-xl border p-4 ${
                step.isFinal 
                  ? 'border-[#a5a983]/40 bg-gradient-to-r from-[#a5a983]/5 to-transparent' 
                  : ''
              }`}
            >
              <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                step.isFinal 
                  ? 'bg-[#a5a983]/20 text-[#a5a983]'
                  : 'bg-[#1e3a5f]/10 text-[#1e3a5f]'
              }`}>
                <step.icon className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground">{step.title}</h4>
                {step.description === "warranty_step" ? (
                  <p className="text-sm text-muted-foreground">
                    Relax—we've got the paperwork covered. We will register your equipment to secure your{" "}
                    <span className="font-semibold text-[#1e3a5f]">10-12 year</span>{" "}
                    parts warranty and provide you with a full digital report of your system's performance.
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Contact info callout */}
        <div className="bg-[#1e3a5f]/5 rounded-xl p-4 mb-8">
          <p className="text-sm text-muted-foreground mb-3">
            Have questions? Call or text us:
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <a 
              href="tel:+12142384349" 
              className="flex items-center gap-2 text-xl font-bold text-[#1e3a5f] hover:underline"
            >
              <Phone className="h-5 w-5" />
              (214) 238-4349
            </a>
            <span className="text-muted-foreground hidden sm:inline">|</span>
            <a 
              href="sms:+12142384349" 
              className="flex items-center gap-2 text-[#1e3a5f] font-medium hover:underline"
            >
              <MessageSquare className="h-4 w-4" />
              Send a Text
            </a>
          </div>
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

      {/* View Estimate Dialog */}
      <Dialog open={showQuoteDialog} onOpenChange={setShowQuoteDialog}>
        <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#1e3a5f]">Your Estimate Details</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            {/* Customer Info */}
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="font-medium text-foreground">{state.customerInfo.name}</p>
              <p className="text-sm text-muted-foreground">{state.customerInfo.email}</p>
              {state.customerInfo.formattedAddress && (
                <p className="text-sm text-muted-foreground mt-1">{state.customerInfo.formattedAddress}</p>
              )}
            </div>

            {/* System Configuration */}
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">System Configuration</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type</span>
                  <span className="font-medium">{state.heatingType ? HEATING_TYPE_LABELS[state.heatingType] : "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Capacity</span>
                  <span className="font-medium">{pricing.effectiveTonnage ? `${pricing.effectiveTonnage} Ton` : "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tier</span>
                  <span className="font-medium">{pricing.selectedTier?.display_name || "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Brand</span>
                  <span className="font-medium">{pricing.selectedEquipment?.brand || "—"}</span>
                </div>
              </div>
            </div>

            {/* Pricing Breakdown */}
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Investment Breakdown</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Equipment Package</span>
                  <span className="font-medium">{formatMoney(pricing.equipmentCost)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Professional Installation</span>
                  <span className="font-medium">{formatMoney(pricing.installationCost)}</span>
                </div>
                {pricing.addonsBreakdown.map((addon) => (
                  <div key={addon.id} className="flex justify-between">
                    <span>{addon.name}</span>
                    <span className="font-medium">{formatMoney(addon.price)}</span>
                  </div>
                ))}
                <div className="flex justify-between pt-2 border-t border-border font-semibold text-base">
                  <span>Total Investment</span>
                  <span className="text-[#1e3a5f]">{formatMoney(pricing.finalTotal)}</span>
                </div>
              </div>
            </div>

            {/* Financing */}
            <div className="rounded-lg bg-gradient-to-r from-[#d4a84b]/20 to-[#d4a84b]/10 p-4 text-center">
              <p className="text-2xl font-bold text-[#1e3a5f]">{formatMoney(pricing.monthlyFinancing)}/mo</p>
              <p className="text-xs text-muted-foreground">with financing at 5.99% APR for 60 months</p>
            </div>

            {/* Valid Until */}
            <p className="text-xs text-center text-muted-foreground">
              Estimate valid until {validUntilDate}
            </p>

            {/* Download Button */}
            <Button 
              onClick={handleDownloadPDF}
              className="w-full bg-[#1e3a5f] hover:bg-[#1e3a5f]/90"
            >
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </StepContainer>
  );
};
