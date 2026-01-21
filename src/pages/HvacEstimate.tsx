import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import EstimatorCards from "@/components/home/EstimatorCards";
import FeaturesBar from "@/components/home/FeaturesBar";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import OnsiteEstimateForm from "@/components/forms/OnsiteEstimateForm";
import { usePageSEO } from "@/hooks/usePageSEO";
import { motion } from "framer-motion";
import { HelpCircle } from "lucide-react";

const HvacEstimate = () => {
  usePageSEO("/hvac-estimate");

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <EstimatorCards />
        
        {/* Request a Visit Section */}
        <section className="py-12 md:py-16 bg-muted/30">
          <div className="container px-4 mx-auto">
            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="text-center mb-8"
              >
                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-4">
                  <HelpCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">Need a Custom Quote?</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
                  Have a Unique Situation?
                </h2>
                <p className="text-muted-foreground text-base md:text-lg max-w-xl mx-auto">
                  Multi-zone systems, complex installations, or just prefer an in-person consultation? 
                  Schedule a free onsite estimate with our HVAC experts.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="max-w-lg mx-auto"
              >
                <OnsiteEstimateForm />
              </motion.div>
            </div>
          </div>
        </section>

        <FeaturesBar />
        <TestimonialsSection />
      </main>
      <Footer />
    </div>
  );
};

export default HvacEstimate;
