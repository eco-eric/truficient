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
  Trash2,
  ScanLine,
  ShoppingCart,
  UserCircle,
  MapPin,
  Kanban,
  Megaphone,
  Tags,
  Briefcase,
  UsersRound,
  Wrench,
  Camera,
  Shield
} from 'lucide-react';

export interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  permissionKey: string;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export const navSections: NavSection[] = [
  {
    title: 'Overview',
    items: [
      { label: 'Dashboard', href: '/admin', icon: LayoutDashboard, permissionKey: 'nav.dashboard' },
      { label: 'Abandoned Carts', href: '/admin/abandoned-carts', icon: ShoppingCart, permissionKey: 'nav.abandoned-carts' },
    ],
  },
  {
    title: 'CRM',
    items: [
      { label: 'Customers', href: '/admin/customers', icon: UserCircle, permissionKey: 'nav.customers' },
      { label: 'Locations', href: '/admin/locations', icon: MapPin, permissionKey: 'nav.locations' },
      { label: 'Submissions', href: '/admin/submissions', icon: FileText, permissionKey: 'nav.submissions' },
      { label: 'Pipeline', href: '/admin/pipeline', icon: Kanban, permissionKey: 'nav.pipeline' },
      { label: 'DFW Watch List', href: '/admin/dfw-watchlist', icon: Target, permissionKey: 'nav.dfw-watchlist' },
    ],
  },
  {
    title: 'Operations',
    items: [
      { label: 'Calendar', href: '/admin/calendar', icon: LayoutDashboard, permissionKey: 'nav.calendar' },
      { label: 'Jobs Board', href: '/admin/jobs', icon: Briefcase, permissionKey: 'nav.jobs' },
      { label: 'Teams & Crew', href: '/admin/teams', icon: UsersRound, permissionKey: 'nav.teams' },
      { label: 'WorkEdge Projects', href: '/admin/workedge', icon: Camera, permissionKey: 'nav.workedge' },
      { label: 'Job Types', href: '/admin/job-types', icon: Wrench, permissionKey: 'nav.job-types' },
      { label: 'Calendar Settings', href: '/admin/calendars', icon: Settings, permissionKey: 'nav.calendars' },
    ],
  },
  {
    title: 'Content',
    items: [
      { label: 'Blog', href: '/admin/blog', icon: PenSquare, permissionKey: 'nav.blog' },
      { label: 'Gallery', href: '/admin/gallery', icon: Images, permissionKey: 'nav.gallery' },
      { label: 'Equipment Library', href: '/admin/equipment-library', icon: Library, permissionKey: 'nav.equipment-library' },
    ],
  },
  {
    title: 'Estimators',
    items: [
      { label: 'Estimates', href: '/admin/estimates', icon: FileText, permissionKey: 'nav.estimates' },
      { label: 'Templates', href: '/admin/estimate-templates', icon: LayoutTemplate, permissionKey: 'nav.estimate-templates' },
      { label: 'System Pricing', href: '/admin/system-pricing', icon: DollarSign, permissionKey: 'nav.system-pricing' },
      { label: 'Customer Equipment', href: '/admin/customer-equipment', icon: Package, permissionKey: 'nav.customer-equipment' },
      { label: 'Ductless Config', href: '/admin/ductless-config', icon: AirVent, permissionKey: 'nav.ductless-config' },
    ],
  },
  {
    title: 'Financials',
    items: [
      { label: 'Materials', href: '/admin/materials', icon: Package, permissionKey: 'nav.materials' },
      { label: 'Labor Rates', href: '/admin/labor-rates', icon: ClipboardList, permissionKey: 'nav.labor-rates' },
      { label: 'Admin Costs', href: '/admin/admin-costs', icon: Receipt, permissionKey: 'nav.admin-costs' },
      { label: 'Financing', href: '/admin/financing', icon: CreditCard, permissionKey: 'nav.financing' },
    ],
  },
  {
    title: 'Marketing',
    items: [
      { label: 'SEO', href: '/admin/seo', icon: Search, permissionKey: 'nav.seo' },
      { label: 'Calculators', href: '/admin/calculators', icon: Calculator, permissionKey: 'nav.calculators' },
      { label: 'Landing Pages', href: '/admin/landing-pages', icon: FileInput, permissionKey: 'nav.landing-pages' },
      { label: 'GHL Tags', href: '/admin/ghl-tags', icon: Tag, permissionKey: 'nav.ghl-tags' },
      { label: 'GHL Conversations', href: '/admin/ghl-conversations', icon: MessageSquare, permissionKey: 'nav.ghl-conversations' },
    ],
  },
  {
    title: 'Analytics',
    items: [
      { label: 'Scanner Analytics', href: '/admin/scanner-analytics', icon: ScanLine, permissionKey: 'nav.scanner-analytics' },
      { label: 'Button Clicks', href: '/admin/button-clicks', icon: MousePointer, permissionKey: 'nav.button-clicks' },
      { label: 'Analytics', href: '/admin/analytics', icon: BarChart3, permissionKey: 'nav.analytics' },
      { label: 'Social Media', href: '/admin/social-media', icon: Share2, permissionKey: 'nav.social-media' },
    ],
  },
  {
    title: 'System',
    items: [
      { label: 'Users', href: '/admin/users', icon: Users, permissionKey: 'nav.users' },
      { label: 'Role Permissions', href: '/admin/permissions', icon: Shield, permissionKey: 'nav.permissions' },
      { label: 'AI Settings', href: '/admin/ai-settings', icon: Settings, permissionKey: 'nav.ai-settings' },
      { label: 'Automations', href: '/admin/automations', icon: Wrench, permissionKey: 'nav.automations' },
      { label: 'Lead Sources', href: '/admin/lead-sources', icon: Megaphone, permissionKey: 'nav.lead-sources' },
      { label: 'Campaign Tags', href: '/admin/campaign-tags', icon: Tags, permissionKey: 'nav.campaign-tags' },
      { label: 'Trash Bin', href: '/admin/trash-bin', icon: Trash2, permissionKey: 'nav.trash-bin' },
      { label: 'Settings', href: '/admin/settings', icon: Settings, permissionKey: 'nav.settings' },
    ],
  },
];
