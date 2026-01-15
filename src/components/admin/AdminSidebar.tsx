import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  PenSquare,
  Search,
  Calculator,
  Users,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import truficientLogo from '@/assets/truficient-logo.png';
import { useUserRole } from '@/hooks/useUserRole';

const navItems = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard, adminOnly: false },
  { label: 'Submissions', href: '/admin/submissions', icon: FileText, adminOnly: false },
  { label: 'Blog', href: '/admin/blog', icon: PenSquare, adminOnly: false },
  { label: 'SEO', href: '/admin/seo', icon: Search, adminOnly: true },
  { label: 'Calculators', href: '/admin/calculators', icon: Calculator, adminOnly: true },
  { label: 'Users', href: '/admin/users', icon: Users, adminOnly: true },
  { label: 'Settings', href: '/admin/settings', icon: Settings, adminOnly: false },
];


export const AdminSidebar = () => {
  const location = useLocation();
  const { signOut } = useAuth();
  const { isAdmin } = useUserRole();
  const [collapsed, setCollapsed] = useState(false);

  const handleSignOut = async () => {
    await signOut();
  };

  // Filter nav items based on role
  const visibleNavItems = navItems.filter(item => !item.adminOnly || isAdmin);

  return (
    <aside 
      className={cn(
        "bg-[#1e3a5f] min-h-screen flex flex-col transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo Section */}
      <div className="p-4 border-b border-white/10">
        <Link to="/admin" className="flex items-center gap-3">
          <img 
            src={truficientLogo} 
            alt="Truficient" 
            className="h-10 w-10 object-contain rounded"
          />
          {!collapsed && (
            <span className="text-white font-semibold text-lg">Admin</span>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {visibleNavItems.map((item) => {
            const isActive = location.pathname === item.href || 
              (item.href !== '/admin' && location.pathname.startsWith(item.href));
            
            return (
              <li key={item.href}>
                <Link
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                    isActive 
                      ? "bg-[#d4a84b] text-[#1e3a5f] font-medium" 
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  )}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-white/10 space-y-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="w-full justify-start text-white/80 hover:bg-white/10 hover:text-white"
        >
          {collapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <>
              <ChevronLeft className="h-5 w-5 mr-2" />
              <span>Collapse</span>
            </>
          )}
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSignOut}
          className="w-full justify-start text-white/80 hover:bg-white/10 hover:text-white"
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          {!collapsed && <span className="ml-2">Sign Out</span>}
        </Button>
      </div>
    </aside>
  );
};
