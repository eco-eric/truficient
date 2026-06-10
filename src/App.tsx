import { lazy, Suspense, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createBrowserRouter, RouterProvider, Outlet, Navigate, useLocation } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ScrollToTop } from "./components/ScrollToTop";
import { TrackingScripts } from "./components/tracking/TrackingScripts";
import CookieConsent from "./components/CookieConsent";
import { loadGA4, trackPageView } from "./lib/analytics";
import { Loader2 } from "lucide-react";

// Critical path — loaded eagerly (homepage)
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Lazy-loaded public pages
const About = lazy(() => import("./pages/About"));
const ResidentialServices = lazy(() => import("./pages/services/ResidentialServices"));
const CommercialServices = lazy(() => import("./pages/services/CommercialServices"));
const DuctlessServices = lazy(() => import("./pages/services/DuctlessServices"));
const HvacEstimate = lazy(() => import("./pages/HvacEstimate"));
const HeatPumpAdvantage = lazy(() => import("./pages/HeatPumpAdvantage"));
const SizingCalculator = lazy(() => import("./pages/estimators/SizingCalculator"));
const CostEstimator = lazy(() => import("./pages/estimators/CostEstimator"));
const SavingsCalculator = lazy(() => import("./pages/estimators/SavingsCalculator"));
const SmartGroupEntry = lazy(() => import("./pages/estimators/SmartGroupEntry"));
const CentralAcEstimate = lazy(() => import("./pages/estimates/CentralAcEstimate"));
const MiniSplitEstimate = lazy(() => import("./pages/estimates/MiniSplitEstimate"));
const MultiZoneEstimate = lazy(() => import("./pages/estimates/MultiZoneEstimate"));
const Contact = lazy(() => import("./pages/Contact"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const CookiePreferences = lazy(() => import("./pages/CookiePreferences"));
const DallasArea = lazy(() => import("./pages/service-areas/DallasArea"));
const NorthDallasArea = lazy(() => import("./pages/service-areas/NorthDallasArea"));
const FriscoMcKinneyArea = lazy(() => import("./pages/service-areas/FriscoMcKinneyArea"));
const MidCitiesArea = lazy(() => import("./pages/service-areas/MidCitiesArea"));
const SouthDallasArea = lazy(() => import("./pages/service-areas/SouthDallasArea"));
const ServiceAreasHub = lazy(() => import("./pages/service-areas/ServiceAreasHub"));
const ClusterSubHub = lazy(() => import("./pages/service-areas/ClusterSubHub"));
const LocationPage = lazy(() => import("./pages/service-areas/LocationPage"));
const Careers = lazy(() => import("./pages/Careers"));
const Financing = lazy(() => import("./pages/Financing"));
const FreeHvacAgeCheckerFB = lazy(() => import("./pages/landing/FreeHvacAgeCheckerFB"));
const CampaignLandingPage = lazy(() => import("./pages/landing/CampaignLandingPage"));
const SmartGroupMarchLanding = lazy(() => import("./pages/landing/SmartGroupMarchLanding"));
const SmartGroupMarchV2Landing = lazy(() => import("./pages/landing/SmartGroupMarchV2Landing"));
const SmartGroupMarchGoogleLanding = lazy(() => import("./pages/landing/SmartGroupMarchGoogleLanding"));
const PublicEstimatePreview = lazy(() => import("./pages/PublicEstimatePreview"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const BlogCategory = lazy(() => import("./pages/BlogCategory"));
const Gallery = lazy(() => import("./pages/Gallery"));
const Scanner = lazy(() => import("./pages/scanner/Scanner"));
const EquipmentReport = lazy(() => import("./pages/scanner/EquipmentReport"));
const EquipmentLibrary = lazy(() => import("./pages/equipment/EquipmentLibrary"));
const EquipmentDetail = lazy(() => import("./pages/equipment/EquipmentDetail"));
const TraneBrand = lazy(() => import("./pages/equipment/TraneBrand"));
const Catalogs = lazy(() => import("./pages/resources/Catalogs"));
const CatalogDetail = lazy(() => import("./pages/resources/CatalogDetail"));

// Lazy-loaded admin pages
const AdminRouteLayout = lazy(() => import("./components/admin/AdminRouteLayout").then(m => ({ default: m.AdminRouteLayout })));
const AdminLogin = lazy(() => import("./pages/admin/Login"));
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const AdminUnifiedSubmissions = lazy(() => import("./pages/admin/UnifiedSubmissions"));
const AdminSettings = lazy(() => import("./pages/admin/Settings"));
const AdminBlogPosts = lazy(() => import("./pages/admin/BlogPosts"));
const AdminBlogPostEditor = lazy(() => import("./pages/admin/BlogPostEditor"));
const AdminSEOManagement = lazy(() => import("./pages/admin/SEOManagement"));
const AdminSEOPerformance = lazy(() => import("./pages/admin/SEOPerformance"));
const AdminSEOEditor = lazy(() => import("./pages/admin/SEOEditor"));
const AdminLocationPageBuilder = lazy(() => import("./pages/admin/LocationPageBuilder"));
const AdminCalculators = lazy(() => import("./pages/admin/Calculators"));
const AdminCalculatorEditor = lazy(() => import("./pages/admin/CalculatorEditor"));
const AdminUsers = lazy(() => import("./pages/admin/Users"));
const AdminSocialMediaTracker = lazy(() => import("./pages/admin/SocialMediaTracker"));
const AdminAnalyticsTracking = lazy(() => import("./pages/admin/AnalyticsTracking"));
const AdminGHLTags = lazy(() => import("./pages/admin/GHLTags"));
const AdminLandingPageForms = lazy(() => import("./pages/admin/LandingPageForms"));
const AdminLandingPageFormEditor = lazy(() => import("./pages/admin/LandingPageFormEditor"));
const AdminSystemPricing = lazy(() => import("./pages/admin/SystemPricing"));
const AdminMaterials = lazy(() => import("./pages/admin/Materials"));
const AdminLaborRates = lazy(() => import("./pages/admin/LaborRates"));
const AdminCosts = lazy(() => import("./pages/admin/AdminCosts"));
const AdminEstimates = lazy(() => import("./pages/admin/Estimates"));
const AdminEstimateBuilder = lazy(() => import("./pages/admin/EstimateBuilder"));
const AdminEstimateTemplates = lazy(() => import("./pages/admin/EstimateTemplates"));
const AdminTemplateBuilder = lazy(() => import("./pages/admin/TemplateBuilder"));
const AdminGHLConversations = lazy(() => import("./pages/admin/GHLConversations"));
const AdminButtonClicks = lazy(() => import("./pages/admin/ButtonClicks"));
const AdminScannerAnalytics = lazy(() => import("./pages/admin/ScannerAnalytics"));
const AdminDuctlessConfig = lazy(() => import("./pages/admin/DuctlessConfig"));
const AdminGallery = lazy(() => import("./pages/admin/Gallery"));
const AdminFinancingOptions = lazy(() => import("./pages/admin/FinancingOptions"));
const AdminEquipmentLibrary = lazy(() => import("./pages/admin/EquipmentLibrary"));
const AdminDFWWatchList = lazy(() => import("./pages/admin/DFWWatchList"));
const AdminCustomerEquipment = lazy(() => import("./pages/admin/CustomerEquipment"));
const AdminIndividualEquipmentPricing = lazy(() => import("./pages/admin/IndividualEquipmentPricing"));
const AdminTrashBin = lazy(() => import("./pages/admin/TrashBin"));
const AdminAbandonedCarts = lazy(() => import("./pages/admin/AbandonedCarts"));
const AdminCustomers = lazy(() => import("./pages/admin/Customers"));
const AdminCustomerDetail = lazy(() => import("./pages/admin/CustomerDetail"));
const AdminLocations = lazy(() => import("./pages/admin/Locations"));
const AdminPipeline = lazy(() => import("./pages/admin/Pipeline"));
const AdminLeadSourcesConfig = lazy(() => import("./pages/admin/LeadSourcesConfig"));
const AdminCampaignTagsConfig = lazy(() => import("./pages/admin/CampaignTagsConfig"));
const AdminJobs = lazy(() => import("./pages/admin/Jobs"));
const AdminJobDetail = lazy(() => import("./pages/admin/JobDetail"));
const AdminMaintenanceContracts = lazy(() => import("./pages/admin/MaintenanceContracts"));
const AdminMaintenanceContractDetail = lazy(() => import("./pages/admin/MaintenanceContractDetail"));
const AdminMaintenanceContractCandidates = lazy(() => import("./pages/admin/MaintenanceContractCandidates"));
const AdminMaintenanceContractTiers = lazy(() => import("./pages/admin/MaintenanceContractTiers"));
const AdminJobTypesConfig = lazy(() => import("./pages/admin/JobTypesConfig"));
const AdminTeams = lazy(() => import("./pages/admin/Teams"));
const AdminWorkEdgeProjects = lazy(() => import("./pages/admin/WorkEdgeProjects"));
const AdminCalendar = lazy(() => import("./pages/admin/Calendar"));
const AdminCalendarSettings = lazy(() => import("./pages/admin/CalendarSettings"));
const AdminAISettings = lazy(() => import("./pages/admin/AISettings"));
const AdminAutomations = lazy(() => import("./pages/admin/Automations"));
const AdminRolePermissions = lazy(() => import("./pages/admin/RolePermissions"));
const AdminCompanies = lazy(() => import("./pages/admin/Companies"));
const AdminCompanyDetail = lazy(() => import("./pages/admin/CompanyDetail"));
const AdminTasks = lazy(() => import("./pages/admin/Tasks"));
const AdminInbox = lazy(() => import("./pages/admin/Inbox"));
const AdminEmailTemplates = lazy(() => import("./pages/admin/EmailTemplates"));
const AdminEmailSettings = lazy(() => import("./pages/admin/EmailSettings"));
const AdminKnowledgeBase = lazy(() => import("./pages/admin/KnowledgeBase"));
const AdminTimesheets = lazy(() => import("./pages/admin/Timesheets"));
const AdminSearchResults = lazy(() => import("./pages/admin/SearchResults"));
const InvoicingMissionControl = lazy(() => import("./pages/admin/invoicing/InvoicingMissionControl"));
const InvoicesList = lazy(() => import("./pages/admin/invoicing/InvoicesList"));
const OttoEstimatesList = lazy(() => import("./pages/admin/invoicing/OttoEstimatesList"));
const InvoiceClients = lazy(() => import("./pages/admin/invoicing/InvoiceClients"));
const PaymentsList = lazy(() => import("./pages/admin/invoicing/PaymentsList"));
const InvoiceTemplates = lazy(() => import("./pages/admin/invoicing/InvoiceTemplates"));
const InvoiceCatalog = lazy(() => import("./pages/admin/invoicing/InvoiceCatalog"));
const InvoiceExpenses = lazy(() => import("./pages/admin/invoicing/InvoiceExpenses"));
const InvoiceReports = lazy(() => import("./pages/admin/invoicing/InvoiceReports"));
const InvoiceSettings = lazy(() => import("./pages/admin/invoicing/InvoiceSettings"));

// Eagerly loaded (small, needed everywhere)
import { ProtectedRoute } from "./components/admin/ProtectedRoute";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Lightweight loading fallback
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <Loader2 className="w-8 h-8 animate-spin text-primary" />
  </div>
);

// Root layout component that includes global elements
const RootLayout = () => {
  const location = useLocation();
  useEffect(() => { loadGA4(); }, []);
  useEffect(() => { trackPageView(location.pathname + location.search); }, [location.pathname, location.search]);
  return (
    <>
      <ScrollToTop />
      <TrackingScripts />
      <CookieConsent />
      <Suspense fallback={<PageLoader />}>
        <Outlet />
      </Suspense>
    </>
  );
};

// Admin layout wrapper with its own Suspense
const LazyAdminLayout = () => (
  <Suspense fallback={<PageLoader />}>
    <AdminRouteLayout />
  </Suspense>
);

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: "/", element: <Index /> },
      { path: "/about", element: <About /> },
      { path: "/about.html", element: <About /> },
      { path: "/services/residential", element: <ResidentialServices /> },
      { path: "/services/residential.html", element: <ResidentialServices /> },
      { path: "/services/commercial", element: <CommercialServices /> },
      { path: "/services/commercial.html", element: <CommercialServices /> },
      { path: "/services/ductless", element: <DuctlessServices /> },
      { path: "/services/ductless.html", element: <DuctlessServices /> },
      { path: "/residential-services", element: <ResidentialServices /> },
      { path: "/residential-services.html", element: <ResidentialServices /> },
      { path: "/commercial-services", element: <CommercialServices /> },
      { path: "/commercial-services.html", element: <CommercialServices /> },
      { path: "/contact", element: <Contact /> },
      { path: "/contact.html", element: <Contact /> },
      { path: "/service-areas", element: <ServiceAreasHub /> },
      { path: "/service-areas.html", element: <ServiceAreasHub /> },
      { path: "/service-areas/dallas-area", element: <DallasArea /> },
      { path: "/service-areas/dallas-area.html", element: <DallasArea /> },
      { path: "/service-areas/north-dallas-area", element: <NorthDallasArea /> },
      { path: "/service-areas/north-dallas-area.html", element: <NorthDallasArea /> },
      { path: "/service-areas/frisco-mckinney-area", element: <FriscoMcKinneyArea /> },
      { path: "/service-areas/frisco-mckinney-area.html", element: <FriscoMcKinneyArea /> },
      { path: "/service-areas/mid-cities-area", element: <MidCitiesArea /> },
      { path: "/service-areas/mid-cities-area.html", element: <MidCitiesArea /> },
      { path: "/service-areas/south-dallas-area", element: <SouthDallasArea /> },
      { path: "/service-areas/south-dallas-area.html", element: <SouthDallasArea /> },
      { path: "/service-areas/:clusterSlug", element: <ClusterSubHub /> },
      { path: "/hvac-estimate", element: <HvacEstimate /> },
      { path: "/heat-pump-advantage", element: <HeatPumpAdvantage /> },
      { path: "/estimators/sizing", element: <SizingCalculator /> },
      { path: "/estimators/cost", element: <CostEstimator /> },
      { path: "/estimators/savings", element: <SavingsCalculator /> },
      { path: "/estimate/smart-group-march", element: <SmartGroupEntry /> },
      { path: "/central-ac-estimate", element: <CentralAcEstimate /> },
      { path: "/mini-split-estimate", element: <MiniSplitEstimate /> },
      { path: "/multi-zone-estimate", element: <MultiZoneEstimate /> },
      { path: "/careers", element: <Careers /> },
      { path: "/careers.html", element: <Careers /> },
      { path: "/financing", element: <Financing /> },
      { path: "/financing.html", element: <Financing /> },
      { path: "/privacy-policy", element: <PrivacyPolicy /> },
      { path: "/privacy-policy.html", element: <PrivacyPolicy /> },
      { path: "/terms-of-service", element: <TermsOfService /> },
      { path: "/terms-of-service.html", element: <TermsOfService /> },
      { path: "/cookie-preferences", element: <CookiePreferences /> },
      
      { path: "/blog", element: <Blog /> },
      { path: "/blog.html", element: <Blog /> },
      { path: "/blog/:slug", element: <BlogPost /> },
      { path: "/category/:slug", element: <BlogCategory /> },
      { path: "/gallery", element: <Gallery /> },
      { path: "/gallery.html", element: <Gallery /> },
      { path: "/scanner", element: <Scanner /> },
      { path: "/scanner/report", element: <EquipmentReport /> },
      { path: "/equipment", element: <EquipmentLibrary /> },
      { path: "/equipment.html", element: <EquipmentLibrary /> },
      { path: "/equipment/trane", element: <TraneBrand /> },
      { path: "/equipment/*", element: <EquipmentDetail /> },
      { path: "/resources/catalogs", element: <Catalogs /> },
      { path: "/resources/catalogs/:slug", element: <CatalogDetail /> },
      { path: "/free-hvac-age-checker-fb-feb-2026", element: <FreeHvacAgeCheckerFB /> },
      { path: "/smart-group-march-F-26", element: <SmartGroupMarchLanding /> },
      { path: "/smart-group-march-F-26v2", element: <SmartGroupMarchV2Landing /> },
      { path: "/smart-group-march-G-26", element: <SmartGroupMarchGoogleLanding /> },
      
      { path: "/smart-group-march", element: <CampaignLandingPage /> },
      { path: "/smart-group-march-g", element: <CampaignLandingPage /> },
      
      { path: "/estimate/preview/:id", element: <PublicEstimatePreview /> },
      
      { path: "/:locationSlug", element: <LocationPage /> },
      
      // Admin Routes
      { path: "/admin/login", element: <AdminLogin /> },
      {
        element: <LazyAdminLayout />,
        children: [
          { path: "/admin", element: <ProtectedRoute><AdminDashboard /></ProtectedRoute> },
          { path: "/admin/search", element: <ProtectedRoute><AdminSearchResults /></ProtectedRoute> },
          { path: "/admin/abandoned-carts", element: <ProtectedRoute><AdminAbandonedCarts /></ProtectedRoute> },
          { path: "/admin/customers", element: <ProtectedRoute><AdminCustomers /></ProtectedRoute> },
          { path: "/admin/companies", element: <ProtectedRoute><AdminCompanies /></ProtectedRoute> },
          { path: "/admin/companies/:id", element: <ProtectedRoute><AdminCompanyDetail /></ProtectedRoute> },
          { path: "/admin/customers/:id", element: <ProtectedRoute><AdminCustomerDetail /></ProtectedRoute> },
          { path: "/admin/locations", element: <ProtectedRoute><AdminLocations /></ProtectedRoute> },
          { path: "/admin/submissions", element: <ProtectedRoute><AdminUnifiedSubmissions /></ProtectedRoute> },
          { path: "/admin/pipeline", element: <ProtectedRoute><AdminPipeline /></ProtectedRoute> },
          { path: "/admin/dfw-watchlist", element: <ProtectedRoute><AdminDFWWatchList /></ProtectedRoute> },
          { path: "/admin/jobs", element: <ProtectedRoute><AdminJobs /></ProtectedRoute> },
          { path: "/admin/jobs/:id", element: <ProtectedRoute><AdminJobDetail /></ProtectedRoute> },
          { path: "/admin/job-types", element: <ProtectedRoute><AdminJobTypesConfig /></ProtectedRoute> },
          { path: "/admin/contracts", element: <ProtectedRoute><AdminMaintenanceContracts /></ProtectedRoute> },
          { path: "/admin/contracts/candidates", element: <ProtectedRoute><AdminMaintenanceContractCandidates /></ProtectedRoute> },
          { path: "/admin/maintenance-contracts/tiers", element: <ProtectedRoute><AdminMaintenanceContractTiers /></ProtectedRoute> },
          { path: "/admin/contracts/:id", element: <ProtectedRoute><AdminMaintenanceContractDetail /></ProtectedRoute> },
          { path: "/admin/teams", element: <ProtectedRoute><AdminTeams /></ProtectedRoute> },
          { path: "/admin/timesheets", element: <ProtectedRoute><AdminTimesheets /></ProtectedRoute> },
          { path: "/admin/workedge", element: <ProtectedRoute><AdminWorkEdgeProjects /></ProtectedRoute> },
          { path: "/admin/calendar", element: <ProtectedRoute><AdminCalendar /></ProtectedRoute> },
          { path: "/admin/calendars", element: <ProtectedRoute><AdminCalendarSettings /></ProtectedRoute> },
          { path: "/admin/blog", element: <ProtectedRoute><AdminBlogPosts /></ProtectedRoute> },
          { path: "/admin/blog/:id", element: <ProtectedRoute><AdminBlogPostEditor /></ProtectedRoute> },
          { path: "/admin/seo", element: <ProtectedRoute><AdminSEOManagement /></ProtectedRoute> },
          { path: "/admin/seo-performance", element: <ProtectedRoute><AdminSEOPerformance /></ProtectedRoute> },
          { path: "/admin/seo/:id", element: <ProtectedRoute><AdminSEOEditor /></ProtectedRoute> },
          { path: "/admin/seo/location/:id", element: <ProtectedRoute><AdminLocationPageBuilder /></ProtectedRoute> },
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
          { path: "/admin/landing-pages/submissions", element: <ProtectedRoute><AdminUnifiedSubmissions /></ProtectedRoute> },
          { path: "/admin/landing-pages/:id", element: <ProtectedRoute><AdminLandingPageFormEditor /></ProtectedRoute> },
          { path: "/admin/ductless-config", element: <ProtectedRoute><AdminDuctlessConfig /></ProtectedRoute> },
          { path: "/admin/customer-equipment", element: <ProtectedRoute><AdminCustomerEquipment /></ProtectedRoute> },
          { path: "/admin/equipment-pricing", element: <ProtectedRoute><AdminIndividualEquipmentPricing /></ProtectedRoute> },
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
          { path: "/admin/ai-settings", element: <ProtectedRoute><AdminAISettings /></ProtectedRoute> },
          { path: "/admin/automations", element: <ProtectedRoute><AdminAutomations /></ProtectedRoute> },
          { path: "/admin/permissions", element: <ProtectedRoute><AdminRolePermissions /></ProtectedRoute> },
          { path: "/admin/tasks", element: <ProtectedRoute><AdminTasks /></ProtectedRoute> },
          { path: "/admin/inbox", element: <ProtectedRoute><AdminInbox /></ProtectedRoute> },
          { path: "/admin/email-templates", element: <ProtectedRoute><AdminEmailTemplates /></ProtectedRoute> },
          { path: "/admin/email-settings", element: <ProtectedRoute><AdminEmailSettings /></ProtectedRoute> },
          { path: "/admin/invoicing", element: <ProtectedRoute><InvoicingMissionControl /></ProtectedRoute> },
          { path: "/admin/invoices", element: <ProtectedRoute><InvoicesList /></ProtectedRoute> },
          { path: "/admin/otto-estimates", element: <ProtectedRoute><OttoEstimatesList /></ProtectedRoute> },
          { path: "/admin/invoice-clients", element: <ProtectedRoute><InvoiceClients /></ProtectedRoute> },
          { path: "/admin/payments", element: <ProtectedRoute><PaymentsList /></ProtectedRoute> },
          { path: "/admin/invoice-templates", element: <ProtectedRoute><InvoiceTemplates /></ProtectedRoute> },
          { path: "/admin/invoice-catalog", element: <ProtectedRoute><InvoiceCatalog /></ProtectedRoute> },
          { path: "/admin/invoice-expenses", element: <ProtectedRoute><InvoiceExpenses /></ProtectedRoute> },
          { path: "/admin/invoice-reports", element: <ProtectedRoute><InvoiceReports /></ProtectedRoute> },
          { path: "/admin/invoice-settings", element: <ProtectedRoute><InvoiceSettings /></ProtectedRoute> },
          { path: "/admin/invoice-customers", element: <Navigate to="/admin/invoice-clients" replace /> },
          { path: "/admin/knowledge-base", element: <ProtectedRoute><AdminKnowledgeBase /></ProtectedRoute> },
        ],
      },
      
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
