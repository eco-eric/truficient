import { Link } from 'react-router-dom';
import logo from '@/assets/truficient-logo.webp';

interface LandingPageShellProps {
  children: React.ReactNode;
}

export default function LandingPageShell({ children }: LandingPageShellProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Minimal Top Bar */}
      <header className="py-4 px-4 border-b border-border/50">
        <div className="container mx-auto flex justify-center">
          <img src={logo} alt="Truficient Energy Solutions" className="h-10" />
        </div>
      </header>

      {children}

      {/* Minimal Footer */}
      <footer className="py-6 border-t border-border/50">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground space-y-2">
          <p>© {new Date().getFullYear()} Truficient Energy Solutions • TACLA142792E</p>
          <div className="flex justify-center gap-4">
            <Link to="/privacy-policy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
            <Link to="/terms-of-service" className="hover:text-foreground transition-colors">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
