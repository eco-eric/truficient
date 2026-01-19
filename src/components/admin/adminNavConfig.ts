import { 
  LayoutDashboard, 
  FileText, 
  PenSquare,
  Search,
  Calculator,
  Users,
  Settings,
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
  Target,
  Trash2
} from 'lucide-react';

export interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  adminOnly: boolean;
}

export interface NavSection {
  title: string;
  items: NavItem[];
  adminOnly?: boolean;
}

export const navSections: NavSection[] = [
  {
    title: 'General',
    items: [
      { label: 'Dashboard', href: '/admin', icon: LayoutDashboard, adminOnly: false },
      { label: 'Submissions', href: '/admin/submissions', icon: FileText, adminOnly: false },
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
      { label: 'Trash Bin', href: '/admin/trash-bin', icon: Trash2, adminOnly: true },
      { label: 'Settings', href: '/admin/settings', icon: Settings, adminOnly: false },
    ],
  },
];
