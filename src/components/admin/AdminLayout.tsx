import { ReactNode, useEffect, useState } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';
import { MobileAdminNav } from './MobileAdminNav';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { AssistantProvider } from './assistant/AssistantContext';
import { AIAssistantPanel } from './assistant/AIAssistantPanel';
import { AssistantToggle } from './assistant/AssistantToggle';

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
}

export const AdminLayout = ({ children, title }: AdminLayoutProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Set document title for admin pages
  useEffect(() => {
    document.title = `${title} | Admin - Truficient`;
  }, [title]);

  // Add noindex meta tag to prevent search engine indexing of admin pages
  useEffect(() => {
    const existingMeta = document.querySelector('meta[name="robots"]');
    const meta = existingMeta || document.createElement('meta');
    meta.setAttribute('name', 'robots');
    meta.setAttribute('content', 'noindex, nofollow');
    
    if (!existingMeta) {
      document.head.appendChild(meta);
    }
    
    return () => {
      // Restore default robots meta when leaving admin pages
      if (meta.parentNode) {
        meta.setAttribute('content', 'index, follow');
      }
    };
  }, []);

  return (
    <AssistantProvider>
      <div className="flex min-h-screen bg-gray-50">
        {/* Desktop Sidebar - hidden on mobile, visible on tablet and up */}
        <div className="hidden md:block">
          <AdminSidebar />
        </div>
        
        {/* Mobile Sheet Menu */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetContent side="left" className="p-0 w-64 border-0">
            <MobileAdminNav onClose={() => setMobileMenuOpen(false)} />
          </SheetContent>
        </Sheet>
        
        <div className="flex-1 flex flex-col min-w-0">
          <AdminHeader 
            title={title} 
            onMenuClick={() => setMobileMenuOpen(true)} 
          />
          <main className="flex-1 p-4 lg:p-6 overflow-auto">
            {children}
          </main>
        </div>

        {/* AI Assistant */}
        <AssistantToggle />
        <AIAssistantPanel />
      </div>
    </AssistantProvider>
  );
};
