import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, Menu, X, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Top Bar */}
      <div className="bg-primary text-primary-foreground py-2">
        <div className="container mx-auto px-4 flex justify-between items-center text-sm">
          <div className="hidden md:flex items-center gap-6">
            <a href="#about" className="hover:text-secondary transition-colors flex items-center gap-1">
              ABOUT <ChevronDown className="w-3 h-3" />
            </a>
            <a href="#service-areas" className="hover:text-secondary transition-colors flex items-center gap-1">
              SERVICE AREAS <ChevronDown className="w-3 h-3" />
            </a>
            <a href="#contact" className="hover:text-secondary transition-colors flex items-center gap-1">
              CONTACT US <ChevronDown className="w-3 h-3" />
            </a>
          </div>
          <div className="flex items-center gap-4 ml-auto">
            <Button variant="secondary" size="sm" className="font-semibold">
              Schedule Online
            </Button>
            <Button variant="outline" size="sm" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary font-semibold">
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
              <a href="#services" className="text-foreground hover:text-primary font-medium transition-colors flex items-center gap-1">
                Services <ChevronDown className="w-4 h-4" />
              </a>
              <a href="#about" className="text-foreground hover:text-primary font-medium transition-colors">
                About Us
              </a>
              <a href="#contact" className="text-foreground hover:text-primary font-medium transition-colors">
                Contact
              </a>
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
                  <a 
                    href="#services" 
                    className="text-lg font-medium text-foreground hover:text-primary transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    Services
                  </a>
                  <a 
                    href="#about" 
                    className="text-lg font-medium text-foreground hover:text-primary transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    About Us
                  </a>
                  <a 
                    href="#contact" 
                    className="text-lg font-medium text-foreground hover:text-primary transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    Contact
                  </a>
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
