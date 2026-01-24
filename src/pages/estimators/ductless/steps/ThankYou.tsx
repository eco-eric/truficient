import { Link } from "react-router-dom";
import { StepContainer } from "../components/StepContainer";
import { CTAButton } from "../components/CTAButton";
import { useQuote } from "../context/QuoteContext";
import { usePricing } from "../hooks/usePricing";
import { motion } from "framer-motion";
import { 
  CheckCircle, 
  Phone, 
  Download, 
  Loader2, 
  MessageSquare,
  ClipboardCheck,
  UserCheck,
  Home,
  Wrench,
  Gauge,
  ShieldCheck,
  Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { generateDuctlessQuotePDF } from "@/utils/generateDuctlessQuotePDF";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const ThankYou = () => {
  const { state, resetQuote } = useQuote();
  const [isDownloading, setIsDownloading] = useState(false);
  const [showQuoteDialog, setShowQuoteDialog] = useState(false);

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

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const firstName = state.customerInfo.name?.split(" ")[0] || "Friend";

  const steps = [
    {
      icon: ClipboardCheck,
      title: "Expert Quote Review",
      description: "Our team is reviewing your request now to ensure every detail of the estimate is accurate and tailored to your home's specific needs.",
      isFinal: false,
    },
    {
      icon: UserCheck,
      title: "Personal Consultation",
      description: "A Comfort Advisor will call you within one business day to walk through your quote, answer technical questions, and discuss financing if needed.",
      isFinal: false,
    },
    {
      icon: Home,
      title: "Technical Site Assessment",
      description: "We'll perform an on-site visit to verify equipment sizing and installation requirements. This ensures the system we quoted is the perfect fit for your space.",
      isFinal: false,
    },
    {
      icon: Wrench,
      title: "Precision Installation",
      description: "Once approved, our trained team of installers will install your new system with surgical care, adhering to all local codes and manufacturer specifications.",
      isFinal: false,
    },
    {
      icon: Gauge,
      title: "Post Installation Inspection",
      description: "After installation, we conduct an inspection to ensure it's operating at peak efficiency and providing maximum comfort for long term operation.",
      isFinal: false,
    },
    {
      icon: ShieldCheck,
      title: "Warranty & Final Paperwork",
      description: "warranty_step",
      isFinal: true,
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
          Thank You, {firstName}!
        </h2>
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
                <ClipboardCheck className="h-5 w-5 text-[#1e3a5f]" />
              </div>
              <div>
                <h3 className="font-semibold text-[#1e3a5f]">Your Estimate Summary</h3>
                <p className="text-sm text-muted-foreground">
                  {pricing.zoneCount} zone{pricing.zoneCount !== 1 ? 's' : ''} • {selectedTier?.display_name || 'Standard'} tier
                </p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={handleDownloadPDF}
                disabled={isDownloading}
                className="flex-1 bg-[#1e3a5f] hover:bg-[#1e3a5f]/90"
              >
                {isDownloading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowQuoteDialog(true)}
                className="flex-1 border-[#1e3a5f]/20 text-[#1e3a5f]"
              >
                <Eye className="h-4 w-4 mr-2" />
                View Estimate
              </Button>
            </div>
          </motion.div>
        )}

        {/* What happens next */}
        <p className="text-muted-foreground mb-4 text-left font-medium">Here's what happens next:</p>

        {/* Timeline */}
        <div className="space-y-3 mb-8 text-left">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className={`flex items-start gap-4 rounded-xl border p-4 ${
                step.isFinal 
                  ? 'border-[#a5a983]/40 bg-gradient-to-r from-[#a5a983]/10 to-transparent' 
                  : ''
              }`}
            >
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
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
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="bg-[#1e3a5f]/5 rounded-xl p-4 mb-8"
        >
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
        </motion.div>

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

      {/* View Estimate Dialog */}
      <Dialog open={showQuoteDialog} onOpenChange={setShowQuoteDialog}>
        <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#1e3a5f]">Your Ductless Estimate</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 text-sm">
            {/* Customer Info */}
            <div className="bg-muted/50 rounded-lg p-3">
              <h4 className="font-semibold mb-2">Customer Information</h4>
              <div className="space-y-1 text-muted-foreground">
                <p><span className="font-medium text-foreground">Name:</span> {state.customerInfo.name}</p>
                <p><span className="font-medium text-foreground">Email:</span> {state.customerInfo.email}</p>
                {state.customerInfo.phone && (
                  <p><span className="font-medium text-foreground">Phone:</span> {state.customerInfo.phone}</p>
                )}
                {(state.customerInfo.streetAddress || state.customerInfo.formattedAddress) && (
                  <p>
                    <span className="font-medium text-foreground">Address:</span>{" "}
                    {state.customerInfo.streetAddress 
                      ? `${state.customerInfo.streetAddress}, ${state.customerInfo.city}, ${state.customerInfo.state || 'TX'} ${state.customerInfo.zipCode}`
                      : state.customerInfo.formattedAddress}
                  </p>
                )}
              </div>
            </div>

            {/* System Configuration */}
            <div className="bg-muted/50 rounded-lg p-3">
              <h4 className="font-semibold mb-2">System Configuration</h4>
              <div className="space-y-1 text-muted-foreground">
                <p><span className="font-medium text-foreground">Zones:</span> {pricing.zoneCount}</p>
                <p><span className="font-medium text-foreground">System Tier:</span> {selectedTier?.display_name || 'Standard'}</p>
                <p><span className="font-medium text-foreground">Total Capacity:</span> {(pricing.totalBtu / 1000).toFixed(0)}k BTU</p>
              </div>
            </div>

            {/* Configured Zones */}
            {state.selectedRooms.length > 0 && (
              <div className="bg-muted/50 rounded-lg p-3">
                <h4 className="font-semibold mb-2">Configured Zones</h4>
                <div className="space-y-2">
                  {state.selectedRooms.map((room) => {
                    const unitType = unitTypes.find(u => u.id === room.unitTypeId);
                    return (
                      <div key={room.id} className="flex justify-between text-muted-foreground">
                        <span>{room.label}</span>
                        <span className="text-foreground">{unitType?.display_name || 'Wall Mount'} • {room.recommendedBtu / 1000}k BTU</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Pricing Breakdown */}
            <div className="bg-muted/50 rounded-lg p-3">
              <h4 className="font-semibold mb-2">Investment Summary</h4>
              <div className="space-y-1">
                <div className="flex justify-between text-muted-foreground">
                  <span>Equipment & Installation</span>
                  <span>{formatMoney(pricing.equipmentTotal)}</span>
                </div>
                {pricing.addonsTotal > 0 && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>Add-ons</span>
                    <span>{formatMoney(pricing.addonsTotal)}</span>
                  </div>
                )}
                <div className="flex justify-between text-muted-foreground">
                  <span>Sales Tax</span>
                  <span>{formatMoney(pricing.taxAmount)}</span>
                </div>
                {pricing.rebates > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Rebates</span>
                    <span>-{formatMoney(pricing.rebates)}</span>
                  </div>
                )}
                <div className="border-t pt-2 mt-2 flex justify-between font-bold text-[#1e3a5f]">
                  <span>Total Investment</span>
                  <span>{formatMoney(pricing.finalTotal)}</span>
                </div>
              </div>
            </div>

            {/* Download Button */}
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
                  Download Full Quote
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </StepContainer>
  );
};
