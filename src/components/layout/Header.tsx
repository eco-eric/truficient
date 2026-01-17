import { useState } from "react";
import { Link } from "react-router-dom";
import truficientLogo from "@/assets/truficient-logo.png";
import { Phone, Mail, Menu, X, ChevronDown, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useButtonTracking } from "@/hooks/useButtonTracking";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { trackButtonClick } = useButtonTracking();

  const handleTrackClick = (buttonName: string, buttonLocation: string, destinationUrl?: string) => {
    trackButtonClick({ buttonName, buttonLocation, destinationUrl });
  };

  return (
    <>
      {/* Top Bar */}
      <div className="bg-gray-800 text-white py-2">
        <div className="container mx-auto px-4 flex justify-between items-center text-sm">
          <div className="hidden md:flex items-center gap-1">
            {/* ABOUT Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger 
                className="flex items-center gap-1 px-3 py-1 text-secondary hover:text-secondary/80 transition-colors font-medium"
                onClick={() => handleTrackClick('ABOUT Menu', 'Header - Top Bar')}
              >
                ABOUT <ChevronDown className="w-3 h-3" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-gray-800 border-gray-700">
                <DropdownMenuItem asChild>
                  <Link 
                    to="/about" 
                    className="text-white hover:text-secondary cursor-pointer"
                    onClick={() => handleTrackClick('Our Story', 'Header - Top Bar', '/about')}
                  >
                    Our Story
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link 
                    to="/about#credentials" 
                    className="text-white hover:text-secondary cursor-pointer"
                    onClick={() => handleTrackClick('Credentials & Certifications', 'Header - Top Bar', '/about#credentials')}
                  >
                    Credentials & Certifications
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link 
                    to="/about#commitment" 
                    className="text-white hover:text-secondary cursor-pointer"
                    onClick={() => handleTrackClick('Our Commitment', 'Header - Top Bar', '/about#commitment')}
                  >
                    Our Commitment
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <span className="text-gray-500">|</span>

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
              <Link
                to="/residential-services"
                className="text-foreground hover:text-primary font-medium transition-colors flex items-center gap-1"
                onClick={() => handleTrackClick('Services', 'Header - Main Nav', '/residential-services')}
              >
                Services <ChevronDown className="w-4 h-4" />
              </Link>
              <Link 
                to="/about" 
                className="text-foreground hover:text-primary font-medium transition-colors"
                onClick={() => handleTrackClick('About Us', 'Header - Main Nav', '/about')}
              >
                About Us
              </Link>
              <Link 
                to="/blog" 
                className="text-foreground hover:text-primary font-medium transition-colors"
                onClick={() => handleTrackClick('Blog', 'Header - Main Nav', '/blog')}
              >
                Blog
              </Link>
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
                <nav className="flex flex-col gap-4 mt-8">
                  <Link
                    to="/"
                    className="text-lg font-medium text-foreground hover:text-primary transition-colors"
                    onClick={() => {
                      handleTrackClick('Home', 'Header - Mobile Menu', '/');
                      setIsOpen(false);
                    }}
                  >
                    Home
                  </Link>
                  <Link
                    to="/residential-services"
                    className="text-lg font-medium text-foreground hover:text-primary transition-colors"
                    onClick={() => {
                      handleTrackClick('Services', 'Header - Mobile Menu', '/residential-services');
                      setIsOpen(false);
                    }}
                  >
                    Services
                  </Link>
                  <Link
                    to="/about"
                    className="text-lg font-medium text-foreground hover:text-primary transition-colors"
                    onClick={() => {
                      handleTrackClick('About Us', 'Header - Mobile Menu', '/about');
                      setIsOpen(false);
                    }}
                  >
                    About Us
                  </Link>
                  <Link
                    to="/blog"
                    className="text-lg font-medium text-foreground hover:text-primary transition-colors"
                    onClick={() => {
                      handleTrackClick('Blog', 'Header - Mobile Menu', '/blog');
                      setIsOpen(false);
                    }}
                  >
                    Blog
                  </Link>
                  <Link
                    to="/contact"
                    className="text-lg font-medium text-foreground hover:text-primary transition-colors"
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
