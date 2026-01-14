import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Facebook, Instagram, Linkedin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center">
                <span className="text-secondary-foreground font-bold text-lg">T</span>
              </div>
              <div>
                <div className="text-xl font-bold">truficient</div>
                <div className="text-xs uppercase tracking-wider opacity-80">hvac solutions</div>
              </div>
            </div>
            <p className="text-sm opacity-80 mb-4">
              Your trusted HVAC partner in the Dallas-Fort Worth Metroplex. Mitsubishi Diamond Contractor. Licensed, insured, and committed to energy efficiency.
            </p>
            <div className="flex gap-4">
              <a href="https://www.facebook.com/truficient" target="_blank" rel="noopener noreferrer" className="hover:text-secondary transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="https://www.instagram.com/truficient_hvac" target="_blank" rel="noopener noreferrer" className="hover:text-secondary transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="https://www.linkedin.com/company/truficient/" target="_blank" rel="noopener noreferrer" className="hover:text-secondary transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-bold mb-4 text-lg">COMPANY</h4>
            <ul className="space-y-2 text-sm opacity-80">
              <li><Link to="/about" className="hover:text-secondary transition-colors">About Us</Link></li>
              <li><Link to="/reviews" className="hover:text-secondary transition-colors">Reviews</Link></li>
              <li><Link to="/careers" className="hover:text-secondary transition-colors">Careers</Link></li>
              <li><Link to="/blog" className="hover:text-secondary transition-colors">Blog</Link></li>
            </ul>
          </div>

          {/* Services Links */}
          <div>
            <h4 className="font-bold mb-4 text-lg">SERVICES</h4>
            <ul className="space-y-2 text-sm opacity-80">
              <li><Link to="/residential-services" className="hover:text-secondary transition-colors">Residential Services</Link></li>
              <li><Link to="/commercial-services" className="hover:text-secondary transition-colors">Commercial Services</Link></li>
              <li><Link to="/residential-services" className="hover:text-secondary transition-colors">AC Installation</Link></li>
              <li><Link to="/residential-services" className="hover:text-secondary transition-colors">AC Repair</Link></li>
              <li><Link to="/residential-services" className="hover:text-secondary transition-colors">Ductless Systems</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-bold mb-4 text-lg">CONTACT</h4>
            <ul className="space-y-3 text-sm opacity-80">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>808 Business Parkway<br />Richardson, TX 75081</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 flex-shrink-0" />
                <a href="tel:214-238-4349" className="hover:text-secondary transition-colors">214-238-4349</a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 flex-shrink-0" />
                <a href="mailto:info@truficient.com" className="hover:text-secondary transition-colors">info@truficient.com</a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-primary-foreground/20">
        <div className="container mx-auto px-4 py-4">
          <p className="text-center text-sm opacity-60">
            © {new Date().getFullYear()} Truficient Energy Solutions. All rights reserved. | Licensed & Insured HVAC Contractor
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
