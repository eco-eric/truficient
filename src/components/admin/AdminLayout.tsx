import { ReactNode, useEffect } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
}

export const AdminLayout = ({ children, title }: AdminLayoutProps) => {
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
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <AdminHeader title={title} />
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
