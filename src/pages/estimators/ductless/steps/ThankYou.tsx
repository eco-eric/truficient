import { Link } from "react-router-dom";
import { StepContainer } from "../components/StepContainer";
import { CTAButton } from "../components/CTAButton";
import { useQuote } from "../context/QuoteContext";
import { usePricing } from "../hooks/usePricing";
import { motion } from "framer-motion";
import { CheckCircle, Phone, Calendar, FileText, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { generateDuctlessQuotePDF } from "@/utils/generateDuctlessQuotePDF";

export const ThankYou = () => {
  const { state, resetQuote } = useQuote();
  const [isDownloading, setIsDownloading] = useState(false);

  // Use the pricing engine to get all pricing data for PDF
  const { pricing, selectedTier, unitTypes } = usePricing({
    rooms: state.selectedRooms,
    unitTypeId: state.unitTypeId,
    systemTierId: state.systemTierId,
    selectedAddonIds: state.selectedAddonIds,
  });

  const handleDownloadPDF = async () => {
    if (isDownloading) return;
    setIsDownloading(true);

    try {
      // Build rooms data with unit type names
      const roomsData = state.selectedRooms.map(room => {
        const unitType = unitTypes.find(u => u.id === room.unitTypeId);
        return {
          id: room.id,
          label: room.label,
          roomType: room.roomType,
          size: room.size,
          recommendedBtu: room.recommendedBtu,
          unitTypeName: unitType?.display_name || "Wall Mount",
        };
      });

      await generateDuctlessQuotePDF({
        customerInfo: {
          name: state.customerInfo.name,
          email: state.customerInfo.email,
          phone: state.customerInfo.phone,
          address: state.customerInfo.address,
          formattedAddress: state.customerInfo.formattedAddress,
          streetAddress: state.customerInfo.streetAddress,
          city: state.customerInfo.city,
          state: state.customerInfo.state,
          zipCode: state.customerInfo.zipCode,
        },
        rooms: roomsData,
        tierName: selectedTier?.display_name || "Standard",
        pricing: {
          zoneCount: pricing.zoneCount,
          totalBtu: pricing.totalBtu,
          baseEquipmentCost: pricing.baseEquipmentCost,
          equipmentTotal: pricing.equipmentTotal,
          tierMultiplier: pricing.tierMultiplier,
          addonsTotal: pricing.addonsTotal,
          addonsBreakdown: pricing.addonsBreakdown,
          subtotal: pricing.subtotal,
          taxAmount: pricing.taxAmount,
          rebates: pricing.rebates,
          finalTotal: pricing.finalTotal,
        },
      });
    } catch (err) {
      console.error("PDF generation error:", err);
    } finally {
      setIsDownloading(false);
    }
  };

  const steps = [
    {
      icon: FileText,
      title: "Review Your Quote",
      description: "We're preparing a detailed PDF quote tailored to your home.",
    },
    {
      icon: Phone,
      title: "Expert Consultation",
      description: "A comfort advisor will call within 1 business day to answer questions.",
    },
    {
      icon: Calendar,
      title: "Schedule Your Install",
      description: "Choose a convenient date for your professional installation.",
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

        <h2 className="text-2xl font-bold text-[#1e3a5f] mb-2">Thank You!</h2>
        <p className="text-muted-foreground mb-6">
          Your ductless estimate request has been submitted.
        </p>

        {/* Estimate Summary Card */}
        {pricing.finalTotal > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-xl border-2 border-[#1e3a5f]/20 bg-gradient-to-br from-[#1e3a5f]/5 to-transparent p-5 mb-8 text-left"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-full bg-[#1e3a5f]/10 flex items-center justify-center">
                <FileText className="h-5 w-5 text-[#1e3a5f]" />
              </div>
              <div>
                <h3 className="font-semibold text-[#1e3a5f]">Your Estimate Summary</h3>
                <p className="text-sm text-muted-foreground">Download your quote details</p>
              </div>
            </div>
            
            <Button 
              onClick={handleDownloadPDF}
              disabled={isDownloading}
              className="w-full bg-[#1e3a5f] hover:bg-[#1e3a5f]/90"
            >
              {isDownloading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating PDF...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </>
              )}
            </Button>
          </motion.div>
        )}

        {/* What happens next */}
        <p className="text-muted-foreground mb-4 text-left">Here's what happens next:</p>

        {/* Timeline */}
        <div className="space-y-4 mb-10 text-left">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.15 }}
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

        {/* Actions */}
        <div className="space-y-3">
          <Link to="/" onClick={resetQuote}>
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
