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
  ChevronRight,
  Share2,
  BarChart3,
  MousePointer,
  Tag,
  FileInput,
  DollarSign,
  Package,
  Receipt,
  ClipboardList,
  LayoutTemplate,
  MessageSquare,
  AirVent,
  Images,
  CreditCard,
  Library,
  Target
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import truficientLogo from '@/assets/truficient-logo.png';
import { useUserRole } from '@/hooks/useUserRole';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  adminOnly: boolean;
}

interface NavSection {
  title: string;
  items: NavItem[];
  adminOnly?: boolean;
}

const navSections: NavSection[] = [
  {
    title: 'General',
    items: [
      { label: 'Dashboard', href: '/admin', icon: LayoutDashboard, adminOnly: false },
      { label: 'Submissions', href: '/admin/submissions', icon: FileText, adminOnly: false },
      { label: 'Ducted Submissions', href: '/admin/ducted-submissions', icon: AirVent, adminOnly: false },
      { label: 'DFW Watch List', href: '/admin/dfw-watchlist', icon: Target, adminOnly: true },
      { label: 'Blog', href: '/admin/blog', icon: PenSquare, adminOnly: false },
    ],
  },
  {
    title: 'Project Estimator',
    adminOnly: true,
    items: [
      { label: 'Estimates', href: '/admin/estimates', icon: FileText, adminOnly: true },
      { label: 'Templates', href: '/admin/estimate-templates', icon: LayoutTemplate, adminOnly: true },
      { label: 'Materials', href: '/admin/materials', icon: Package, adminOnly: true },
      { label: 'Labor Rates', href: '/admin/labor-rates', icon: ClipboardList, adminOnly: true },
      { label: 'Admin Costs', href: '/admin/admin-costs', icon: Receipt, adminOnly: true },
    ],
  },
  {
    title: 'Configuration',
    adminOnly: true,
    items: [
      { label: 'SEO', href: '/admin/seo', icon: Search, adminOnly: true },
      { label: 'Calculators', href: '/admin/calculators', icon: Calculator, adminOnly: true },
      { label: 'System Pricing', href: '/admin/system-pricing', icon: DollarSign, adminOnly: true },
      { label: 'Customer Equipment', href: '/admin/customer-equipment', icon: Package, adminOnly: true },
      { label: 'Ductless Config', href: '/admin/ductless-config', icon: AirVent, adminOnly: true },
      { label: 'Financing', href: '/admin/financing', icon: CreditCard, adminOnly: true },
      { label: 'GHL Tags', href: '/admin/ghl-tags', icon: Tag, adminOnly: true },
      { label: 'GHL Conversations', href: '/admin/ghl-conversations', icon: MessageSquare, adminOnly: true },
      { label: 'Landing Pages', href: '/admin/landing-pages', icon: FileInput, adminOnly: true },
      { label: 'Gallery', href: '/admin/gallery', icon: Images, adminOnly: true },
      { label: 'Equipment Library', href: '/admin/equipment-library', icon: Library, adminOnly: true },
      { label: 'Button Clicks', href: '/admin/button-clicks', icon: MousePointer, adminOnly: true },
      { label: 'Analytics', href: '/admin/analytics', icon: BarChart3, adminOnly: true },
      { label: 'Social Media', href: '/admin/social-media', icon: Share2, adminOnly: true },
    ],
  },
  {
    title: 'System',
    items: [
      { label: 'Users', href: '/admin/users', icon: Users, adminOnly: true },
      { label: 'Settings', href: '/admin/settings', icon: Settings, adminOnly: false },
    ],
  },
];


export const AdminSidebar = () => {
  const location = useLocation();
  const { signOut } = useAuth();
  const { isAdmin } = useUserRole();
  const [collapsed, setCollapsed] = useState(false);

  const handleSignOut = async () => {
    await signOut();
  };

  // Filter sections and items based on role
  const visibleSections = navSections
    .filter(section => !section.adminOnly || isAdmin)
    .map(section => ({
      ...section,
      items: section.items.filter(item => !item.adminOnly || isAdmin),
    }))
    .filter(section => section.items.length > 0);

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
      <nav className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-6">
          {visibleSections.map((section) => (
            <div key={section.title}>
              {!collapsed && (
                <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2 px-3">
                  {section.title}
                </h3>
              )}
              <ul className="space-y-1">
                {section.items.map((item) => {
                  const isActive = location.pathname === item.href || 
                    (item.href !== '/admin' && location.pathname.startsWith(item.href));
                  
                  return (
                    <li key={item.href}>
                      <Link
                        to={item.href}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
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
            </div>
          ))}
        </div>
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
