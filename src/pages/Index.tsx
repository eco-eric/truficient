import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/home/HeroSection';
import FeaturesBar from '@/components/home/FeaturesBar';
import ServiceAreaBanner from '@/components/home/ServiceAreaBanner';
import MitsubishiSection from '@/components/home/MitsubishiSection';
import ServicesOverview from '@/components/home/ServicesOverview';
import TestimonialsSection from '@/components/home/TestimonialsSection';
import GalleryPreview from '@/components/home/GalleryPreview';
import ServicesGrid from '@/components/home/ServicesGrid';
import BlogSection from '@/components/home/BlogSection';
import CTASection from '@/components/home/CTASection';
import { MobileHero } from '@/components/home/MobileHero';
import { TrustBadge } from '@/components/home/TrustBadge';
import { EstimatorsCarousel } from '@/components/home/EstimatorsCarousel';
import { MobileTestimonial } from '@/components/home/MobileTestimonial';
import { InsightsList } from '@/components/home/InsightsList';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { usePageSEO } from '@/hooks/usePageSEO';

const Index = () => {
  usePageSEO();
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        {/* Mobile-optimized sections */}
        <MobileHero />
        <TrustBadge />
        <EstimatorsCarousel />
        <MobileTestimonial />
        <InsightsList />

        {/* Desktop sections */}
        <div className="hidden lg:block">
          <HeroSection />
          <FeaturesBar />
          <ServiceAreaBanner />
          <MitsubishiSection />
          <ServicesOverview />
          <TestimonialsSection />
          <GalleryPreview />
          <ServicesGrid />
          <BlogSection />
          <CTASection />
        </div>
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default Index;
