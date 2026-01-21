import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import EstimatorCards from "@/components/home/EstimatorCards";
import FeaturesBar from "@/components/home/FeaturesBar";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import { usePageSEO } from "@/hooks/usePageSEO";

const HvacEstimate = () => {
  usePageSEO("/hvac-estimate");

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <EstimatorCards />
        <FeaturesBar />
        <TestimonialsSection />
      </main>
      <Footer />
    </div>
  );
};

export default HvacEstimate;
