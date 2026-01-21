import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import EstimatorCards from "@/components/home/EstimatorCards";
import { usePageSEO } from "@/hooks/usePageSEO";

const HvacEstimate = () => {
  usePageSEO("/hvac-estimate");

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <EstimatorCards />
      </main>
      <Footer />
    </div>
  );
};

export default HvacEstimate;
