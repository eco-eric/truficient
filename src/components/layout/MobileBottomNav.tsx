import { Home, Calculator, MessageCircle, User, Plus } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Home", icon: Home, href: "/" },
  { label: "Estimates", icon: Calculator, href: "/estimate/ductless" },
  { label: "Request", icon: Plus, href: "/contact", isFab: true },
  { label: "Chat", icon: MessageCircle, href: "/contact" },
  { label: "Profile", icon: User, href: "/about" },
];

export const MobileBottomNav = () => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-lg border-t border-border z-50 lg:hidden safe-area-pb">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href;
          
          if (item.isFab) {
            return (
              <Link
                key={item.label}
                to={item.href}
                className="flex flex-col items-center justify-center -mt-6"
              >
                <div className="bg-primary rounded-full p-3 shadow-lg">
                  <item.icon className="h-6 w-6 text-primary-foreground" />
                </div>
              </Link>
            );
          }

          return (
            <Link
              key={item.label}
              to={item.href}
              className="flex flex-col items-center justify-center gap-1 py-2 px-3"
            >
              <item.icon 
                className={cn(
                  "h-5 w-5 transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground"
                )} 
              />
              <span 
                className={cn(
                  "text-xs font-medium transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
