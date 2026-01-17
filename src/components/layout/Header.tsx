import { useState } from "react";
import { Link } from "react-router-dom";
import truficientLogo from "@/assets/truficient-logo.png";
import { Phone, Mail, Menu, ChevronDown, Search, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useButtonTracking } from "@/hooks/useButtonTracking";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [openMobileMenus, setOpenMobileMenus] = useState<Record<string, boolean>>({});
  const { trackButtonClick } = useButtonTracking();

  const handleTrackClick = (buttonName: string, buttonLocation: string, destinationUrl?: string) => {
    trackButtonClick({ buttonName, buttonLocation, destinationUrl });
  };

  const toggleMobileMenu = (menu: string) => {
    setOpenMobileMenus(prev => ({ ...prev, [menu]: !prev[menu] }));
  };

  return (
    <>
      {/* Top Bar */}
      <div className="bg-gray-800 text-white py-2">
        <div className="container mx-auto px-4 flex justify-between items-center text-sm">
          <div className="hidden md:flex items-center gap-1">
            {/* SERVICE AREAS Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger 
                className="flex items-center gap-1 px-3 py-1 text-secondary hover:text-secondary/80 transition-colors font-medium"
                onClick={() => handleTrackClick('SERVICE AREAS Menu', 'Header - Top Bar')}
              >
                SERVICE AREAS <ChevronDown className="w-3 h-3" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-gray-800 border-gray-700">
                <DropdownMenuItem asChild>
                  <Link 
                    to="/service-areas/dallas-area" 
                    className="text-white hover:text-secondary cursor-pointer"
                    onClick={() => handleTrackClick('Dallas Area', 'Header - Top Bar', '/service-areas/dallas-area')}
                  >
                    Dallas Area
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    to="/service-areas/north-dallas-area"
                    className="text-white hover:text-secondary cursor-pointer"
                    onClick={() => handleTrackClick('North Dallas Area', 'Header - Top Bar', '/service-areas/north-dallas-area')}
                  >
                    North Dallas Area
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    to="/service-areas/frisco-mckinney-area"
                    className="text-white hover:text-secondary cursor-pointer"
                    onClick={() => handleTrackClick('Frisco-McKinney Area', 'Header - Top Bar', '/service-areas/frisco-mckinney-area')}
                  >
                    Frisco-McKinney Area
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link 
                    to="/service-areas/mid-cities-area" 
                    className="text-white hover:text-secondary cursor-pointer"
                    onClick={() => handleTrackClick('Mid-Cities Area', 'Header - Top Bar', '/service-areas/mid-cities-area')}
                  >
                    Mid-Cities Area
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    to="/service-areas/south-dallas-area"
                    className="text-white hover:text-secondary cursor-pointer"
                    onClick={() => handleTrackClick('South Dallas Area', 'Header - Top Bar', '/service-areas/south-dallas-area')}
                  >
                    South Dallas Area
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <span className="text-gray-500">|</span>

            <Link
              to="/contact"
              className="px-3 py-1 text-secondary hover:text-secondary/80 transition-colors font-medium"
              onClick={() => handleTrackClick('CONTACT US', 'Header - Top Bar', '/contact')}
            >
              CONTACT US
            </Link>
          </div>
          <div className="flex items-center gap-4 ml-auto">
            <button 
              className="text-white hover:text-secondary transition-colors"
              onClick={() => handleTrackClick('Search', 'Header - Top Bar')}
            >
              <Search className="w-4 h-4" />
            </button>
            <Link 
              to="/contact"
              onClick={() => handleTrackClick('Schedule Online', 'Header - Top Bar', '/contact')}
            >
              <Button variant="secondary" size="sm" className="font-semibold">
                Schedule Online
              </Button>
            </Link>
            <a 
              href="tel:214-238-4349"
              onClick={() => handleTrackClick('Call Now', 'Header - Top Bar', 'tel:214-238-4349')}
            >
              <Button
                variant="outline"
                size="sm"
                className="bg-gray-900 border-gray-900 text-white hover:bg-gray-700 hover:border-gray-700 font-semibold"
              >
                <Phone className="w-4 h-4 mr-1" />
                Call Now
              </Button>
            </a>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="bg-background shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            {/* Logo */}
            <Link 
              to="/" 
              className="flex items-center"
              onClick={() => handleTrackClick('Logo', 'Header - Main Nav', '/')}
            >
              <img 
                src={truficientLogo} 
                alt="Truficient HVAC Solutions" 
                className="h-14 w-auto"
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8">
              <Link 
                to="/" 
                className="text-foreground hover:text-primary font-medium transition-colors"
                onClick={() => handleTrackClick('Home', 'Header - Main Nav', '/')}
              >
                Home
              </Link>

              {/* Services Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger 
                  className="flex items-center gap-1 text-foreground hover:text-primary font-medium transition-colors"
                  onClick={() => handleTrackClick('Services Menu', 'Header - Main Nav')}
                >
                  Services <ChevronDown className="w-4 h-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-background border-border">
                  <DropdownMenuItem asChild>
                    <Link 
                      to="/services/residential" 
                      className="cursor-pointer"
                      onClick={() => handleTrackClick('Residential', 'Header - Main Nav', '/services/residential')}
                    >
                      Residential
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link 
                      to="/services/commercial" 
                      className="cursor-pointer"
                      onClick={() => handleTrackClick('Commercial', 'Header - Main Nav', '/services/commercial')}
                    >
                      Commercial
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link 
                      to="/services/ductless" 
                      className="cursor-pointer"
                      onClick={() => handleTrackClick('Ductless (Mini-Splits)', 'Header - Main Nav', '/services/ductless')}
                    >
                      Ductless (Mini-Splits)
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Estimators Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger 
                  className="flex items-center gap-1 text-foreground hover:text-primary font-medium transition-colors"
                  onClick={() => handleTrackClick('Estimators Menu', 'Header - Main Nav')}
                >
                  Estimators <ChevronDown className="w-4 h-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-background border-border">
                  <DropdownMenuItem asChild>
                    <Link 
                      to="/estimators/sizing" 
                      className="cursor-pointer"
                      onClick={() => handleTrackClick('Sizing Calculator', 'Header - Main Nav', '/estimators/sizing')}
                    >
                      Sizing Calculator
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link 
                      to="/estimators/cost" 
                      className="cursor-pointer"
                      onClick={() => handleTrackClick('Cost Estimator', 'Header - Main Nav', '/estimators/cost')}
                    >
                      Cost Estimator
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link 
                      to="/estimators/savings" 
                      className="cursor-pointer"
                      onClick={() => handleTrackClick('Savings Calculator', 'Header - Main Nav', '/estimators/savings')}
                    >
                      Savings Calculator
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* About Us Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger 
                  className="flex items-center gap-1 text-foreground hover:text-primary font-medium transition-colors"
                  onClick={() => handleTrackClick('About Us Menu', 'Header - Main Nav')}
                >
                  About Us <ChevronDown className="w-4 h-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-background border-border">
                  <DropdownMenuItem asChild>
                    <Link 
                      to="/about" 
                      className="cursor-pointer"
                      onClick={() => handleTrackClick('Our Story', 'Header - Main Nav', '/about')}
                    >
                      Our Story
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link 
                      to="/blog" 
                      className="cursor-pointer"
                      onClick={() => handleTrackClick('Blog', 'Header - Main Nav', '/blog')}
                    >
                      Blog
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link 
                      to="/careers" 
                      className="cursor-pointer"
                      onClick={() => handleTrackClick('Careers', 'Header - Main Nav', '/careers')}
                    >
                      Careers
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Link 
                to="/contact" 
                className="text-foreground hover:text-primary font-medium transition-colors"
                onClick={() => handleTrackClick('Contact', 'Header - Main Nav', '/contact')}
              >
                Contact
              </Link>
            </nav>

            {/* Contact Info - Desktop */}
            <div className="hidden lg:flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-secondary" />
                <div>
                  <div className="text-xs text-muted-foreground">Text or Call</div>
                  <a 
                    href="tel:214-238-4349" 
                    className="font-bold text-foreground hover:text-primary transition-colors"
                    onClick={() => handleTrackClick('Phone: 214-238-4349', 'Header - Main Nav', 'tel:214-238-4349')}
                  >
                    214-238-4349
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-secondary" />
                <div>
                  <div className="text-xs text-muted-foreground">Email Us</div>
                  <a
                    href="mailto:info@truficient.com"
                    className="font-bold text-foreground hover:text-primary transition-colors"
                    onClick={() => handleTrackClick('Email: info@truficient.com', 'Header - Main Nav', 'mailto:info@truficient.com')}
                  >
                    info@truficient.com
                  </a>
                </div>
              </div>
            </div>

            {/* Mobile Menu */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <nav className="flex flex-col gap-2 mt-8">
                  <Link
                    to="/"
                    className="text-lg font-medium text-foreground hover:text-primary transition-colors py-2"
                    onClick={() => {
                      handleTrackClick('Home', 'Header - Mobile Menu', '/');
                      setIsOpen(false);
                    }}
                  >
                    Home
                  </Link>

                  {/* Services Collapsible */}
                  <Collapsible open={openMobileMenus.services} onOpenChange={() => toggleMobileMenu('services')}>
                    <CollapsibleTrigger className="flex items-center justify-between w-full text-lg font-medium text-foreground hover:text-primary transition-colors py-2">
                      Services
                      <ChevronRight className={`w-4 h-4 transition-transform ${openMobileMenus.services ? 'rotate-90' : ''}`} />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pl-4 space-y-2">
                      <Link
                        to="/services/residential"
                        className="block text-base text-muted-foreground hover:text-primary transition-colors py-1"
                        onClick={() => {
                          handleTrackClick('Residential', 'Header - Mobile Menu', '/services/residential');
                          setIsOpen(false);
                        }}
                      >
                        Residential
                      </Link>
                      <Link
                        to="/services/commercial"
                        className="block text-base text-muted-foreground hover:text-primary transition-colors py-1"
                        onClick={() => {
                          handleTrackClick('Commercial', 'Header - Mobile Menu', '/services/commercial');
                          setIsOpen(false);
                        }}
                      >
                        Commercial
                      </Link>
                      <Link
                        to="/services/ductless"
                        className="block text-base text-muted-foreground hover:text-primary transition-colors py-1"
                        onClick={() => {
                          handleTrackClick('Ductless (Mini-Splits)', 'Header - Mobile Menu', '/services/ductless');
                          setIsOpen(false);
                        }}
                      >
                        Ductless (Mini-Splits)
                      </Link>
                    </CollapsibleContent>
                  </Collapsible>

                  {/* Estimators Collapsible */}
                  <Collapsible open={openMobileMenus.estimators} onOpenChange={() => toggleMobileMenu('estimators')}>
                    <CollapsibleTrigger className="flex items-center justify-between w-full text-lg font-medium text-foreground hover:text-primary transition-colors py-2">
                      Estimators
                      <ChevronRight className={`w-4 h-4 transition-transform ${openMobileMenus.estimators ? 'rotate-90' : ''}`} />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pl-4 space-y-2">
                      <Link
                        to="/estimators/sizing"
                        className="block text-base text-muted-foreground hover:text-primary transition-colors py-1"
                        onClick={() => {
                          handleTrackClick('Sizing Calculator', 'Header - Mobile Menu', '/estimators/sizing');
                          setIsOpen(false);
                        }}
                      >
                        Sizing Calculator
                      </Link>
                      <Link
                        to="/estimators/cost"
                        className="block text-base text-muted-foreground hover:text-primary transition-colors py-1"
                        onClick={() => {
                          handleTrackClick('Cost Estimator', 'Header - Mobile Menu', '/estimators/cost');
                          setIsOpen(false);
                        }}
                      >
                        Cost Estimator
                      </Link>
                      <Link
                        to="/estimators/savings"
                        className="block text-base text-muted-foreground hover:text-primary transition-colors py-1"
                        onClick={() => {
                          handleTrackClick('Savings Calculator', 'Header - Mobile Menu', '/estimators/savings');
                          setIsOpen(false);
                        }}
                      >
                        Savings Calculator
                      </Link>
                    </CollapsibleContent>
                  </Collapsible>

                  {/* About Us Collapsible */}
                  <Collapsible open={openMobileMenus.about} onOpenChange={() => toggleMobileMenu('about')}>
                    <CollapsibleTrigger className="flex items-center justify-between w-full text-lg font-medium text-foreground hover:text-primary transition-colors py-2">
                      About Us
                      <ChevronRight className={`w-4 h-4 transition-transform ${openMobileMenus.about ? 'rotate-90' : ''}`} />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pl-4 space-y-2">
                      <Link
                        to="/about"
                        className="block text-base text-muted-foreground hover:text-primary transition-colors py-1"
                        onClick={() => {
                          handleTrackClick('Our Story', 'Header - Mobile Menu', '/about');
                          setIsOpen(false);
                        }}
                      >
                        Our Story
                      </Link>
                      <Link
                        to="/blog"
                        className="block text-base text-muted-foreground hover:text-primary transition-colors py-1"
                        onClick={() => {
                          handleTrackClick('Blog', 'Header - Mobile Menu', '/blog');
                          setIsOpen(false);
                        }}
                      >
                        Blog
                      </Link>
                      <Link
                        to="/careers"
                        className="block text-base text-muted-foreground hover:text-primary transition-colors py-1"
                        onClick={() => {
                          handleTrackClick('Careers', 'Header - Mobile Menu', '/careers');
                          setIsOpen(false);
                        }}
                      >
                        Careers
                      </Link>
                    </CollapsibleContent>
                  </Collapsible>

                  {/* Service Areas Collapsible */}
                  <Collapsible open={openMobileMenus.serviceAreas} onOpenChange={() => toggleMobileMenu('serviceAreas')}>
                    <CollapsibleTrigger className="flex items-center justify-between w-full text-lg font-medium text-foreground hover:text-primary transition-colors py-2">
                      Service Areas
                      <ChevronRight className={`w-4 h-4 transition-transform ${openMobileMenus.serviceAreas ? 'rotate-90' : ''}`} />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pl-4 space-y-2">
                      <Link
                        to="/service-areas/dallas-area"
                        className="block text-base text-muted-foreground hover:text-primary transition-colors py-1"
                        onClick={() => {
                          handleTrackClick('Dallas Area', 'Header - Mobile Menu', '/service-areas/dallas-area');
                          setIsOpen(false);
                        }}
                      >
                        Dallas Area
                      </Link>
                      <Link
                        to="/service-areas/north-dallas-area"
                        className="block text-base text-muted-foreground hover:text-primary transition-colors py-1"
                        onClick={() => {
                          handleTrackClick('North Dallas Area', 'Header - Mobile Menu', '/service-areas/north-dallas-area');
                          setIsOpen(false);
                        }}
                      >
                        North Dallas Area
                      </Link>
                      <Link
                        to="/service-areas/frisco-mckinney-area"
                        className="block text-base text-muted-foreground hover:text-primary transition-colors py-1"
                        onClick={() => {
                          handleTrackClick('Frisco-McKinney Area', 'Header - Mobile Menu', '/service-areas/frisco-mckinney-area');
                          setIsOpen(false);
                        }}
                      >
                        Frisco-McKinney Area
                      </Link>
                      <Link
                        to="/service-areas/mid-cities-area"
                        className="block text-base text-muted-foreground hover:text-primary transition-colors py-1"
                        onClick={() => {
                          handleTrackClick('Mid-Cities Area', 'Header - Mobile Menu', '/service-areas/mid-cities-area');
                          setIsOpen(false);
                        }}
                      >
                        Mid-Cities Area
                      </Link>
                      <Link
                        to="/service-areas/south-dallas-area"
                        className="block text-base text-muted-foreground hover:text-primary transition-colors py-1"
                        onClick={() => {
                          handleTrackClick('South Dallas Area', 'Header - Mobile Menu', '/service-areas/south-dallas-area');
                          setIsOpen(false);
                        }}
                      >
                        South Dallas Area
                      </Link>
                    </CollapsibleContent>
                  </Collapsible>

                  <Link
                    to="/contact"
                    className="text-lg font-medium text-foreground hover:text-primary transition-colors py-2"
                    onClick={() => {
                      handleTrackClick('Contact', 'Header - Mobile Menu', '/contact');
                      setIsOpen(false);
                    }}
                  >
                    Contact
                  </Link>

                  <div className="border-t pt-4 mt-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Phone className="w-5 h-5 text-secondary" />
                      <a 
                        href="tel:214-238-4349" 
                        className="font-bold"
                        onClick={() => handleTrackClick('Phone: 214-238-4349', 'Header - Mobile Menu', 'tel:214-238-4349')}
                      >
                        214-238-4349
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-5 h-5 text-secondary" />
                      <a 
                        href="mailto:info@truficient.com" 
                        className="font-bold"
                        onClick={() => handleTrackClick('Email: info@truficient.com', 'Header - Mobile Menu', 'mailto:info@truficient.com')}
                      >
                        info@truficient.com
                      </a>
                    </div>
                  </div>
                  <Link 
                    to="/contact" 
                    onClick={() => {
                      handleTrackClick('Schedule Service', 'Header - Mobile Menu', '/contact');
                      setIsOpen(false);
                    }}
                  >
                    <Button className="w-full mt-4 bg-secondary hover:bg-gold-dark text-secondary-foreground">
                      Schedule Service
                    </Button>
                  </Link>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;