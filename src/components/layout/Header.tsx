import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, Menu, X, ChevronDown, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Top Bar */}
      <div className="bg-gray-800 text-white py-2">
        <div className="container mx-auto px-4 flex justify-between items-center text-sm">
          <div className="hidden md:flex items-center gap-1">
            {/* ABOUT Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 px-3 py-1 text-secondary hover:text-secondary/80 transition-colors font-medium">
                ABOUT <ChevronDown className="w-3 h-3" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-gray-800 border-gray-700">
                <DropdownMenuItem asChild>
                  <Link to="/about" className="text-white hover:text-secondary cursor-pointer">
                    Our Story
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/about#credentials" className="text-white hover:text-secondary cursor-pointer">
                    Credentials & Certifications
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/about#commitment" className="text-white hover:text-secondary cursor-pointer">
                    Our Commitment
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <span className="text-gray-500">|</span>

            {/* SERVICE AREAS Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 px-3 py-1 text-secondary hover:text-secondary/80 transition-colors font-medium">
                SERVICE AREAS <ChevronDown className="w-3 h-3" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-gray-800 border-gray-700">
                <DropdownMenuItem asChild>
                  <Link to="/service-areas/dallas-area" className="text-white hover:text-secondary cursor-pointer">
                    Dallas Area
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/service-areas/north-dallas-area" className="text-white hover:text-secondary cursor-pointer">
                    North Dallas Area
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/service-areas/frisco-mckinney-area" className="text-white hover:text-secondary cursor-pointer">
                    Frisco-McKinney Area
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/service-areas/mid-cities-area" className="text-white hover:text-secondary cursor-pointer">
                    Mid-Cities Area
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/service-areas/south-dallas-area" className="text-white hover:text-secondary cursor-pointer">
                    South Dallas Area
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <span className="text-gray-500">|</span>

            <Link to="/contact" className="px-3 py-1 text-secondary hover:text-secondary/80 transition-colors font-medium">
              CONTACT US
            </Link>
          </div>
          <div className="flex items-center gap-4 ml-auto">
            <button className="text-white hover:text-secondary transition-colors">
              <Search className="w-4 h-4" />
            </button>
            <Button variant="secondary" size="sm" className="font-semibold">
              Schedule Online
            </Button>
            <Button variant="outline" size="sm" className="border-white text-white hover:bg-white hover:text-gray-800 font-semibold">
              <Phone className="w-4 h-4 mr-1" />
              Call Now
            </Button>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="bg-background shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xl">T</span>
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground tracking-tight">truficient</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider">hvac solutions</div>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8">
              <Link to="/" className="text-foreground hover:text-primary font-medium transition-colors">
                Home
              </Link>
              <Link to="/residential-services" className="text-foreground hover:text-primary font-medium transition-colors flex items-center gap-1">
                Services <ChevronDown className="w-4 h-4" />
              </Link>
              <Link to="/about" className="text-foreground hover:text-primary font-medium transition-colors">
                About Us
              </Link>
              <Link to="/contact" className="text-foreground hover:text-primary font-medium transition-colors">
                Contact
              </Link>
            </nav>

            {/* Contact Info - Desktop */}
            <div className="hidden lg:flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-secondary" />
                <div>
                  <div className="text-xs text-muted-foreground">Emergency Services</div>
                  <a href="tel:214-238-4349" className="font-bold text-foreground hover:text-primary transition-colors">
                    214-238-4349
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-secondary" />
                <div>
                  <div className="text-xs text-muted-foreground">Email Us</div>
                  <a href="mailto:info@truficient.com" className="font-bold text-foreground hover:text-primary transition-colors">
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
                    onClick={() => setIsOpen(false)}
                  >
                    Home
                  </Link>
                  <Link 
                    to="/residential-services" 
                    className="text-lg font-medium text-foreground hover:text-primary transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    Services
                  </Link>
                  <Link 
                    to="/about" 
                    className="text-lg font-medium text-foreground hover:text-primary transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    About Us
                  </Link>
                  <Link 
                    to="/contact" 
                    className="text-lg font-medium text-foreground hover:text-primary transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    Contact
                  </Link>
                  <div className="border-t pt-4 mt-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Phone className="w-5 h-5 text-secondary" />
                      <a href="tel:214-238-4349" className="font-bold">214-238-4349</a>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-5 h-5 text-secondary" />
                      <a href="mailto:info@truficient.com" className="font-bold">info@truficient.com</a>
                    </div>
                  </div>
                  <Button className="mt-4 bg-secondary hover:bg-gold-dark text-secondary-foreground">
                    Schedule Service
                  </Button>
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
