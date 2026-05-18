import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/home/HeroSection';
import FeaturesBar from '@/components/home/FeaturesBar';
import EstimatorCards from '@/components/home/EstimatorCards';
import ServiceAreaBanner from '@/components/home/ServiceAreaBanner';
import MitsubishiSection from '@/components/home/MitsubishiSection';
import ServicesOverview from '@/components/home/ServicesOverview';
import TestimonialsSection from '@/components/home/TestimonialsSection';
import ScannerPromo from '@/components/home/ScannerPromo';
import GalleryPreview from '@/components/home/GalleryPreview';
import ServicesGrid from '@/components/home/ServicesGrid';
import BlogSection from '@/components/home/BlogSection';
import CTASection from '@/components/home/CTASection';
import { DeferredWidget } from '@/components/admin/dashboard/DeferredWidget';
import { usePageSEO } from '@/hooks/usePageSEO';

const Index = () => {
  usePageSEO();
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <EstimatorCards />
        <FeaturesBar />
        <DeferredWidget minHeight={200}><ServiceAreaBanner /></DeferredWidget>
        <DeferredWidget minHeight={500}><MitsubishiSection /></DeferredWidget>
        <DeferredWidget minHeight={500}><ServicesOverview /></DeferredWidget>
        <DeferredWidget minHeight={500}><TestimonialsSection /></DeferredWidget>
        <DeferredWidget minHeight={400}><ScannerPromo /></DeferredWidget>
        <DeferredWidget minHeight={400}><GalleryPreview /></DeferredWidget>
        <DeferredWidget minHeight={500}><ServicesGrid /></DeferredWidget>
        <DeferredWidget minHeight={400}><BlogSection /></DeferredWidget>
        <DeferredWidget minHeight={300}><CTASection /></DeferredWidget>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
