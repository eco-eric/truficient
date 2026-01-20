import { Link } from "react-router-dom";
import { Phone, Mail, MapPin } from "lucide-react";

export const EstimatorFooter = () => {
  return (
    <footer className="bg-muted/50 border-t py-6 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Company info */}
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Truficient HVAC</span>
            <span className="hidden sm:inline">•</span>
            <span>TACLA134812C</span>
            <span className="hidden sm:inline">•</span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              Dallas-Fort Worth
            </span>
          </div>

          {/* Contact & Links */}
          <div className="flex items-center gap-4 sm:gap-6 text-sm">
            <a
              href="tel:214-238-4349"
              className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">214-238-4349</span>
            </a>
            <a
              href="mailto:info@truficient.com"
              className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors"
            >
              <Mail className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Email Us</span>
            </a>
            <Link
              to="/privacy"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Privacy
            </Link>
            <Link
              to="/terms"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Terms
            </Link>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center mt-4 pt-4 border-t border-border/50">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Truficient HVAC. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
