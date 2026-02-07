import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import Index from "./pages/Index";
import About from "./pages/About";
import ResidentialServices from "./pages/services/ResidentialServices";
import CommercialServices from "./pages/services/CommercialServices";
import DuctlessServices from "./pages/services/DuctlessServices";
import HvacEstimate from "./pages/HvacEstimate";
import HeatPumpAdvantage from "./pages/HeatPumpAdvantage";
import SizingCalculator from "./pages/estimators/SizingCalculator";
import CostEstimator from "./pages/estimators/CostEstimator";
import SavingsCalculator from "./pages/estimators/SavingsCalculator";
import DuctlessEstimator from "./pages/estimators/ductless/DuctlessEstimator";
import DuctedEstimator from "./pages/estimators/ducted/DuctedEstimator";
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
import Financing from "./pages/Financing";

// Admin imports
import AdminLogin from "./pages/admin/Login";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminUnifiedSubmissions from "./pages/admin/UnifiedSubmissions";
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
// AdminLandingPageSubmissions removed - now handled by UnifiedSubmissions
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
import AdminScannerAnalytics from "./pages/admin/ScannerAnalytics";
import AdminDuctlessConfig from "./pages/admin/DuctlessConfig";
import AdminGallery from "./pages/admin/Gallery";
import AdminFinancingOptions from "./pages/admin/FinancingOptions";
import AdminEquipmentLibrary from "./pages/admin/EquipmentLibrary";
import AdminDFWWatchList from "./pages/admin/DFWWatchList";
import AdminCustomerEquipment from "./pages/admin/CustomerEquipment";
import AdminTrashBin from "./pages/admin/TrashBin";
import AdminAbandonedCarts from "./pages/admin/AbandonedCarts";
import AdminCustomers from "./pages/admin/Customers";
import AdminCustomerDetail from "./pages/admin/CustomerDetail";
import AdminLocations from "./pages/admin/Locations";
import AdminPipeline from "./pages/admin/Pipeline";
import AdminLeadSourcesConfig from "./pages/admin/LeadSourcesConfig";
import AdminCampaignTagsConfig from "./pages/admin/CampaignTagsConfig";
import AdminJobs from "./pages/admin/Jobs";
import AdminJobDetail from "./pages/admin/JobDetail";
import AdminJobTypesConfig from "./pages/admin/JobTypesConfig";
import AdminTeams from "./pages/admin/Teams";
import AdminWorkEdgeProjects from "./pages/admin/WorkEdgeProjects";
import AdminCalendar from "./pages/admin/Calendar";
import AdminCalendarSettings from "./pages/admin/CalendarSettings";
import { Navigate } from "react-router-dom";
import { ProtectedRoute } from "./components/admin/ProtectedRoute";
import { TrackingScripts } from "./components/tracking/TrackingScripts";
import { ScrollToTop } from "./components/ScrollToTop";

// Blog imports
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";

// Public pages
import Gallery from "./pages/Gallery";
import Scanner from "./pages/scanner/Scanner";
import EquipmentReport from "./pages/scanner/EquipmentReport";
import EquipmentLibrary from "./pages/equipment/EquipmentLibrary";
import EquipmentDetail from "./pages/equipment/EquipmentDetail";

const queryClient = new QueryClient();

// Root layout component that includes global elements
const RootLayout = () => (
  <>
    <ScrollToTop />
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
      { path: "/heat-pump-advantage", element: <HeatPumpAdvantage /> },
      { path: "/estimators/sizing", element: <SizingCalculator /> },
      { path: "/estimators/cost", element: <CostEstimator /> },
      { path: "/estimators/savings", element: <SavingsCalculator /> },
      { path: "/estimate/ductless", element: <DuctlessEstimator /> },
      { path: "/estimate/ducted", element: <DuctedEstimator /> },
      { path: "/careers", element: <Careers /> },
      { path: "/financing", element: <Financing /> },
      { path: "/privacy-policy", element: <PrivacyPolicy /> },
      { path: "/terms-of-service", element: <TermsOfService /> },
      
      // Blog Routes
      { path: "/blog", element: <Blog /> },
      { path: "/blog/:slug", element: <BlogPost /> },
      { path: "/gallery", element: <Gallery /> },
      { path: "/scanner", element: <Scanner /> },
      { path: "/scanner/report", element: <EquipmentReport /> },
      { path: "/equipment", element: <EquipmentLibrary /> },
      { path: "/equipment/*", element: <EquipmentDetail /> },
      
      // Admin Routes
      { path: "/admin/login", element: <AdminLogin /> },
      { path: "/admin", element: <ProtectedRoute><AdminDashboard /></ProtectedRoute> },
      { path: "/admin/abandoned-carts", element: <ProtectedRoute><AdminAbandonedCarts /></ProtectedRoute> },
      { path: "/admin/customers", element: <ProtectedRoute><AdminCustomers /></ProtectedRoute> },
      { path: "/admin/customers/:id", element: <ProtectedRoute><AdminCustomerDetail /></ProtectedRoute> },
      { path: "/admin/locations", element: <ProtectedRoute><AdminLocations /></ProtectedRoute> },
      { path: "/admin/submissions", element: <ProtectedRoute><AdminUnifiedSubmissions /></ProtectedRoute> },
      { path: "/admin/pipeline", element: <ProtectedRoute><AdminPipeline /></ProtectedRoute> },
      { path: "/admin/dfw-watchlist", element: <ProtectedRoute><AdminDFWWatchList /></ProtectedRoute> },
      { path: "/admin/jobs", element: <ProtectedRoute><AdminJobs /></ProtectedRoute> },
      { path: "/admin/jobs/:id", element: <ProtectedRoute><AdminJobDetail /></ProtectedRoute> },
      { path: "/admin/job-types", element: <ProtectedRoute><AdminJobTypesConfig /></ProtectedRoute> },
      { path: "/admin/teams", element: <ProtectedRoute><AdminTeams /></ProtectedRoute> },
      { path: "/admin/workedge", element: <ProtectedRoute><AdminWorkEdgeProjects /></ProtectedRoute> },
      { path: "/admin/calendar", element: <ProtectedRoute><AdminCalendar /></ProtectedRoute> },
      { path: "/admin/calendars", element: <ProtectedRoute><AdminCalendarSettings /></ProtectedRoute> },
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
      // Redirect old landing page submissions route to unified submissions
      { path: "/admin/landing-pages/submissions", element: <ProtectedRoute><AdminUnifiedSubmissions /></ProtectedRoute> },
      { path: "/admin/landing-pages/:id", element: <ProtectedRoute><AdminLandingPageFormEditor /></ProtectedRoute> },
      { path: "/admin/ductless-config", element: <ProtectedRoute><AdminDuctlessConfig /></ProtectedRoute> },
      { path: "/admin/customer-equipment", element: <ProtectedRoute><AdminCustomerEquipment /></ProtectedRoute> },
      { path: "/admin/ducted-submissions", element: <Navigate to="/admin/submissions" replace /> },
      { path: "/admin/financing", element: <ProtectedRoute><AdminFinancingOptions /></ProtectedRoute> },
      { path: "/admin/gallery", element: <ProtectedRoute><AdminGallery /></ProtectedRoute> },
      { path: "/admin/equipment-library", element: <ProtectedRoute><AdminEquipmentLibrary /></ProtectedRoute> },
      { path: "/admin/trash-bin", element: <ProtectedRoute><AdminTrashBin /></ProtectedRoute> },
      { path: "/admin/settings", element: <ProtectedRoute><AdminSettings /></ProtectedRoute> },
      { path: "/admin/button-clicks", element: <ProtectedRoute><AdminButtonClicks /></ProtectedRoute> },
      { path: "/admin/scanner-analytics", element: <ProtectedRoute><AdminScannerAnalytics /></ProtectedRoute> },
      { path: "/admin/lead-sources", element: <ProtectedRoute><AdminLeadSourcesConfig /></ProtectedRoute> },
      { path: "/admin/campaign-tags", element: <ProtectedRoute><AdminCampaignTagsConfig /></ProtectedRoute> },
      
      // Catch-all route
      { path: "*", element: <NotFound /> },
    ],
  },
]);

const App = () => (
  <ThemeProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <RouterProvider router={router} />
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
