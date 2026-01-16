import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import About from "./pages/About";
import ResidentialServices from "./pages/ResidentialServices";
import CommercialServices from "./pages/CommercialServices";
import HvacEstimate from "./pages/HvacEstimate";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import CookieConsent from "./components/CookieConsent";
import DallasArea from "./pages/service-areas/DallasArea";
import NorthDallasArea from "./pages/service-areas/NorthDallasArea";
import FriscoMcKinneyArea from "./pages/service-areas/FriscoMcKinneyArea";
import MidCitiesArea from "./pages/service-areas/MidCitiesArea";
import SouthDallasArea from "./pages/service-areas/SouthDallasArea";
import Careers from "./pages/Careers";

// Admin imports
import AdminLogin from "./pages/admin/Login";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminSubmissions from "./pages/admin/Submissions";
import AdminSubmissionDetail from "./pages/admin/SubmissionDetail";
import AdminSettings from "./pages/admin/Settings";
import AdminBlogPosts from "./pages/admin/BlogPosts";
import AdminBlogPostEditor from "./pages/admin/BlogPostEditor";
import AdminSEOManagement from "./pages/admin/SEOManagement";
import AdminSEOEditor from "./pages/admin/SEOEditor";
import AdminCalculators from "./pages/admin/Calculators";
import AdminCalculatorEditor from "./pages/admin/CalculatorEditor";
import AdminUsers from "./pages/admin/Users";
import AdminSocialMediaTracker from "./pages/admin/SocialMediaTracker";
import AdminAnalyticsTracking from "./pages/admin/AnalyticsTracking";
import AdminGHLTags from "./pages/admin/GHLTags";
import AdminLandingPageForms from "./pages/admin/LandingPageForms";
import AdminLandingPageFormEditor from "./pages/admin/LandingPageFormEditor";
import AdminLandingPageSubmissions from "./pages/admin/LandingPageSubmissions";
import AdminSystemPricing from "./pages/admin/SystemPricing";
import AdminMaterials from "./pages/admin/Materials";
import AdminLaborRates from "./pages/admin/LaborRates";
import AdminCosts from "./pages/admin/AdminCosts";
import { ProtectedRoute } from "./components/admin/ProtectedRoute";
import { TrackingScripts } from "./components/tracking/TrackingScripts";

// Blog imports
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <TrackingScripts />
        <CookieConsent />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/about" element={<About />} />
          <Route path="/residential-services" element={<ResidentialServices />} />
          <Route path="/commercial-services" element={<CommercialServices />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/service-areas/dallas-area" element={<DallasArea />} />
          <Route path="/service-areas/north-dallas-area" element={<NorthDallasArea />} />
          <Route path="/service-areas/frisco-mckinney-area" element={<FriscoMcKinneyArea />} />
          <Route path="/service-areas/mid-cities-area" element={<MidCitiesArea />} />
          <Route path="/service-areas/south-dallas-area" element={<SouthDallasArea />} />
          <Route path="/hvac-estimate" element={<HvacEstimate />} />
          <Route path="/careers" element={<Careers />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          
          {/* Blog Routes */}
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/submissions" element={<ProtectedRoute><AdminSubmissions /></ProtectedRoute>} />
          <Route path="/admin/submissions/:id" element={<ProtectedRoute><AdminSubmissionDetail /></ProtectedRoute>} />
          <Route path="/admin/blog" element={<ProtectedRoute><AdminBlogPosts /></ProtectedRoute>} />
          <Route path="/admin/blog/:id" element={<ProtectedRoute><AdminBlogPostEditor /></ProtectedRoute>} />
          <Route path="/admin/seo" element={<ProtectedRoute><AdminSEOManagement /></ProtectedRoute>} />
          <Route path="/admin/seo/:id" element={<ProtectedRoute><AdminSEOEditor /></ProtectedRoute>} />
          <Route path="/admin/calculators" element={<ProtectedRoute><AdminCalculators /></ProtectedRoute>} />
          <Route path="/admin/calculators/:id" element={<ProtectedRoute><AdminCalculatorEditor /></ProtectedRoute>} />
          <Route path="/admin/system-pricing" element={<ProtectedRoute><AdminSystemPricing /></ProtectedRoute>} />
          <Route path="/admin/materials" element={<ProtectedRoute><AdminMaterials /></ProtectedRoute>} />
          <Route path="/admin/labor-rates" element={<ProtectedRoute><AdminLaborRates /></ProtectedRoute>} />
          <Route path="/admin/admin-costs" element={<ProtectedRoute><AdminCosts /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute><AdminUsers /></ProtectedRoute>} />
          <Route path="/admin/social-media" element={<ProtectedRoute><AdminSocialMediaTracker /></ProtectedRoute>} />
          <Route path="/admin/analytics" element={<ProtectedRoute><AdminAnalyticsTracking /></ProtectedRoute>} />
          <Route path="/admin/ghl-tags" element={<ProtectedRoute><AdminGHLTags /></ProtectedRoute>} />
          <Route path="/admin/landing-pages" element={<ProtectedRoute><AdminLandingPageForms /></ProtectedRoute>} />
          <Route path="/admin/landing-pages/new" element={<ProtectedRoute><AdminLandingPageFormEditor /></ProtectedRoute>} />
          <Route path="/admin/landing-pages/submissions" element={<ProtectedRoute><AdminLandingPageSubmissions /></ProtectedRoute>} />
          <Route path="/admin/landing-pages/:id" element={<ProtectedRoute><AdminLandingPageFormEditor /></ProtectedRoute>} />
          <Route path="/admin/settings" element={<ProtectedRoute><AdminSettings /></ProtectedRoute>} />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
