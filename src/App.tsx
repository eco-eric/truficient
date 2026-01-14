import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import About from "./pages/About";
import ResidentialServices from "./pages/ResidentialServices";
import CommercialServices from "./pages/CommercialServices";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import DallasArea from "./pages/service-areas/DallasArea";
import NorthDallasArea from "./pages/service-areas/NorthDallasArea";
import FriscoMcKinneyArea from "./pages/service-areas/FriscoMcKinneyArea";
import MidCitiesArea from "./pages/service-areas/MidCitiesArea";
import SouthDallasArea from "./pages/service-areas/SouthDallasArea";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
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
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
