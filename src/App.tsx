import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import Index from "./pages/Index";
import About from "./pages/About";
import ResidentialServices from "./pages/services/ResidentialServices";
import CommercialServices from "./pages/services/CommercialServices";
import DuctlessServices from "./pages/services/DuctlessServices";
import HvacEstimate from "./pages/HvacEstimate";
import SizingCalculator from "./pages/estimators/SizingCalculator";
import CostEstimator from "./pages/estimators/CostEstimator";
import SavingsCalculator from "./pages/estimators/SavingsCalculator";
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
import AdminEstimates from "./pages/admin/Estimates";
import AdminEstimateBuilder from "./pages/admin/EstimateBuilder";
import AdminEstimateTemplates from "./pages/admin/EstimateTemplates";
import AdminTemplateBuilder from "./pages/admin/TemplateBuilder";
import AdminGHLConversations from "./pages/admin/GHLConversations";
import AdminButtonClicks from "./pages/admin/ButtonClicks";
import { ProtectedRoute } from "./components/admin/ProtectedRoute";
import { TrackingScripts } from "./components/tracking/TrackingScripts";

// Blog imports
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";

const queryClient = new QueryClient();

// Root layout component that includes global elements
const RootLayout = () => (
  <>
    <TrackingScripts />
    <CookieConsent />
    <Outlet />
  </>
);

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: "/", element: <Index /> },
      { path: "/about", element: <About /> },
      { path: "/services/residential", element: <ResidentialServices /> },
      { path: "/services/commercial", element: <CommercialServices /> },
      { path: "/services/ductless", element: <DuctlessServices /> },
      // Legacy redirects - keep old URLs working
      { path: "/residential-services", element: <ResidentialServices /> },
      { path: "/commercial-services", element: <CommercialServices /> },
      { path: "/contact", element: <Contact /> },
      { path: "/service-areas/dallas-area", element: <DallasArea /> },
      { path: "/service-areas/north-dallas-area", element: <NorthDallasArea /> },
      { path: "/service-areas/frisco-mckinney-area", element: <FriscoMcKinneyArea /> },
      { path: "/service-areas/mid-cities-area", element: <MidCitiesArea /> },
      { path: "/service-areas/south-dallas-area", element: <SouthDallasArea /> },
      { path: "/hvac-estimate", element: <HvacEstimate /> },
      { path: "/estimators/sizing", element: <SizingCalculator /> },
      { path: "/estimators/cost", element: <CostEstimator /> },
      { path: "/estimators/savings", element: <SavingsCalculator /> },
      { path: "/careers", element: <Careers /> },
      { path: "/privacy-policy", element: <PrivacyPolicy /> },
      { path: "/terms-of-service", element: <TermsOfService /> },
      
      // Blog Routes
      { path: "/blog", element: <Blog /> },
      { path: "/blog/:slug", element: <BlogPost /> },
      
      // Admin Routes
      { path: "/admin/login", element: <AdminLogin /> },
      { path: "/admin", element: <ProtectedRoute><AdminDashboard /></ProtectedRoute> },
      { path: "/admin/submissions", element: <ProtectedRoute><AdminSubmissions /></ProtectedRoute> },
      { path: "/admin/submissions/:id", element: <ProtectedRoute><AdminSubmissionDetail /></ProtectedRoute> },
      { path: "/admin/blog", element: <ProtectedRoute><AdminBlogPosts /></ProtectedRoute> },
      { path: "/admin/blog/:id", element: <ProtectedRoute><AdminBlogPostEditor /></ProtectedRoute> },
      { path: "/admin/seo", element: <ProtectedRoute><AdminSEOManagement /></ProtectedRoute> },
      { path: "/admin/seo/:id", element: <ProtectedRoute><AdminSEOEditor /></ProtectedRoute> },
      { path: "/admin/calculators", element: <ProtectedRoute><AdminCalculators /></ProtectedRoute> },
      { path: "/admin/calculators/:id", element: <ProtectedRoute><AdminCalculatorEditor /></ProtectedRoute> },
      { path: "/admin/system-pricing", element: <ProtectedRoute><AdminSystemPricing /></ProtectedRoute> },
      { path: "/admin/materials", element: <ProtectedRoute><AdminMaterials /></ProtectedRoute> },
      { path: "/admin/labor-rates", element: <ProtectedRoute><AdminLaborRates /></ProtectedRoute> },
      { path: "/admin/admin-costs", element: <ProtectedRoute><AdminCosts /></ProtectedRoute> },
      { path: "/admin/estimates", element: <ProtectedRoute><AdminEstimates /></ProtectedRoute> },
      { path: "/admin/estimates/:id", element: <ProtectedRoute><AdminEstimateBuilder /></ProtectedRoute> },
      { path: "/admin/estimate-templates", element: <ProtectedRoute><AdminEstimateTemplates /></ProtectedRoute> },
      { path: "/admin/estimate-templates/:id/edit", element: <ProtectedRoute><AdminTemplateBuilder /></ProtectedRoute> },
      { path: "/admin/users", element: <ProtectedRoute><AdminUsers /></ProtectedRoute> },
      { path: "/admin/social-media", element: <ProtectedRoute><AdminSocialMediaTracker /></ProtectedRoute> },
      { path: "/admin/analytics", element: <ProtectedRoute><AdminAnalyticsTracking /></ProtectedRoute> },
      { path: "/admin/ghl-tags", element: <ProtectedRoute><AdminGHLTags /></ProtectedRoute> },
      { path: "/admin/ghl-conversations", element: <ProtectedRoute><AdminGHLConversations /></ProtectedRoute> },
      { path: "/admin/landing-pages", element: <ProtectedRoute><AdminLandingPageForms /></ProtectedRoute> },
      { path: "/admin/landing-pages/new", element: <ProtectedRoute><AdminLandingPageFormEditor /></ProtectedRoute> },
      { path: "/admin/landing-pages/submissions", element: <ProtectedRoute><AdminLandingPageSubmissions /></ProtectedRoute> },
      { path: "/admin/landing-pages/:id", element: <ProtectedRoute><AdminLandingPageFormEditor /></ProtectedRoute> },
      { path: "/admin/settings", element: <ProtectedRoute><AdminSettings /></ProtectedRoute> },
      { path: "/admin/button-clicks", element: <ProtectedRoute><AdminButtonClicks /></ProtectedRoute> },
      
      // Catch-all route
      { path: "*", element: <NotFound /> },
    ],
  },
]);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <RouterProvider router={router} />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
