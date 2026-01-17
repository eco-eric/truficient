import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Facebook, Instagram, Linkedin, Home } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { trackSocialLinkClick } from '@/hooks/useSocialLinkTracking';

interface SocialLink {
  id: string;
  platform: string;
  url: string | null;
  display_name: string;
  is_active: boolean;
}

const platformIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  facebook: Facebook,
  instagram: Instagram,
  linkedin: Linkedin,
  houzz: Home,
  google_maps: MapPin,
};

// Custom Yelp icon
const YelpIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.16 12.594l-4.995 1.433c-.96.276-1.74-.8-1.176-1.63l2.905-4.308a1.072 1.072 0 0 1 1.596-.206 9.194 9.194 0 0 1 1.813 3.03c.32.9-.143 1.68-1.143 1.68zM13.397 14.6l4.732 2.073c.913.4 1.06 1.533.387 2.213a9.24 9.24 0 0 1-2.885 1.673c-.88.34-1.66-.12-1.86-.96l-1.2-4.84c-.24-.96.826-1.76 1.826-1.16zM11.693 8.62V3.6c0-1 .76-1.47 1.62-1.073a9.22 9.22 0 0 1 2.88 2.3c.56.7.4 1.6-.36 2.12l-3.54 2.36c-.8.54-1.6.12-1.6-.687zM10.24 13.167l-2.4 4.533c-.48.91-1.593.953-2.2.12a9.22 9.22 0 0 1-1.26-3.16c-.2-.9.3-1.6 1.2-1.73l4.5-.6c.96-.13 1.48.927 1.16 1.837zM9.293 10.873l-4.88-.667c-.96-.133-1.38-.987-1.027-1.853a9.24 9.24 0 0 1 1.967-2.9c.64-.62 1.54-.54 2.08.18l3.113 3.78c.6.727.067 1.64-.853 1.46z"/>
  </svg>
);

// Fallback links if database fetch fails
const fallbackSocialLinks: SocialLink[] = [
  { id: '', platform: 'facebook', url: 'https://www.facebook.com/truficient', display_name: 'Facebook', is_active: true },
  { id: '', platform: 'instagram', url: 'https://www.instagram.com/truficient_hvac', display_name: 'Instagram', is_active: true },
  { id: '', platform: 'linkedin', url: 'https://www.linkedin.com/company/truficient/', display_name: 'LinkedIn', is_active: true },
];

const Footer = () => {
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);

  useEffect(() => {
    const fetchSocialLinks = async () => {
      const { data, error } = await supabase
        .from('social_links')
        .select('id, platform, url, display_name, is_active')
        .eq('is_active', true)
        .in('platform', ['facebook', 'instagram', 'linkedin']);

      if (error || !data) {
        console.error('Error fetching social links:', error);
        return;
      }
      setSocialLinks(data);
    };

    fetchSocialLinks();
  }, []);

  const getIcon = (platform: string) => {
    if (platform === 'yelp') return YelpIcon;
    return platformIcons[platform];
  };

  const handleClick = (link: SocialLink) => {
    trackSocialLinkClick(link.platform, 'footer', link.id || undefined);
  };

  const displayLinks = socialLinks.length > 0 
    ? socialLinks.filter(link => link.url) 
    : fallbackSocialLinks;

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
              {displayLinks.map((link) => {
                const IconComponent = getIcon(link.platform);
                if (!IconComponent || !link.url) return null;
                return (
                  <a 
                    key={link.platform}
                    href={link.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="hover:text-secondary transition-colors"
                    onClick={() => handleClick(link)}
                  >
                    <IconComponent className="w-5 h-5" />
                  </a>
                );
              })}
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
              <li><Link to="/privacy-policy" className="hover:text-secondary transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms-of-service" className="hover:text-secondary transition-colors">Terms of Service</Link></li>
            </ul>
          </div>

          {/* Services Links */}
          <div>
            <h4 className="font-bold mb-4 text-lg">SERVICES</h4>
            <ul className="space-y-2 text-sm opacity-80">
              <li><Link to="/services/residential" className="hover:text-secondary transition-colors">Residential Services</Link></li>
              <li><Link to="/services/commercial" className="hover:text-secondary transition-colors">Commercial Services</Link></li>
              <li><Link to="/services/residential#cooling" className="hover:text-secondary transition-colors">AC Installation</Link></li>
              <li><Link to="/services/residential#cooling" className="hover:text-secondary transition-colors">AC Repair</Link></li>
              <li><Link to="/services/ductless" className="hover:text-secondary transition-colors">Ductless Systems</Link></li>
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
            © {new Date().getFullYear()} Truficient Energy Solutions. All rights reserved. | Licensed & Insured HVAC Contractor | {' '}
            <Link to="/privacy-policy" className="hover:text-secondary transition-colors">Privacy Policy</Link> | {' '}
            <Link to="/terms-of-service" className="hover:text-secondary transition-colors">Terms of Service</Link>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
