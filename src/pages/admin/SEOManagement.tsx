import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Loader2, Search, Pencil, Plus, Check, X, ExternalLink } from 'lucide-react';

interface PageSEO {
  id: string;
  page_path: string;
  page_name: string;
  meta_title: string | null;
  meta_description: string | null;
  updated_at: string;
}

const SEOManagement = () => {
  const [loading, setLoading] = useState(true);
  const [pages, setPages] = useState<PageSEO[]>([]);
  const [filteredPages, setFilteredPages] = useState<PageSEO[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  const fetchPages = async () => {
    try {
      const { data, error } = await supabase
        .from('page_seo' as any)
        .select('id, page_path, page_name, meta_title, meta_description, updated_at')
        .order('page_name', { ascending: true });

      if (error) throw error;
      setPages((data as unknown as PageSEO[]) || []);
      setFilteredPages((data as unknown as PageSEO[]) || []);
    } catch (error) {
      console.error('Error fetching pages:', error);
      toast({
        title: 'Error',
        description: 'Failed to load SEO settings.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      setFilteredPages(
        pages.filter(
          p =>
            p.page_name.toLowerCase().includes(query) ||
            p.page_path.toLowerCase().includes(query) ||
            (p.meta_title?.toLowerCase() || '').includes(query)
        )
      );
    } else {
      setFilteredPages(pages);
    }
  }, [searchQuery, pages]);

  const getSEOStatus = (page: PageSEO) => {
    const hasTitle = page.meta_title && page.meta_title.length > 0;
    const hasDescription = page.meta_description && page.meta_description.length > 0;
    const titleOk = hasTitle && page.meta_title!.length <= 60;
    const descOk = hasDescription && page.meta_description!.length <= 160;

    if (hasTitle && hasDescription && titleOk && descOk) {
      return { label: 'Good', className: 'bg-green-100 text-green-800' };
    } else if (hasTitle && hasDescription) {
      return { label: 'Needs Review', className: 'bg-amber-100 text-amber-800' };
    } else {
      return { label: 'Incomplete', className: 'bg-red-100 text-red-800' };
    }
  };

  if (loading) {
    return (
      <AdminLayout title="SEO Management">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-[#1e3a5f]" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="SEO Management">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search pages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Button asChild className="bg-[#1e3a5f] hover:bg-[#1e3a5f]/90">
            <Link to="/admin/seo/new">
              <Plus className="h-4 w-4 mr-2" />
              Add Page
            </Link>
          </Button>
        </div>

        {/* Info cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-2xl font-bold">{pages.length}</div>
            <div className="text-sm text-muted-foreground">Total Pages</div>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-2xl font-bold text-green-600">
              {pages.filter(p => getSEOStatus(p).label === 'Good').length}
            </div>
            <div className="text-sm text-muted-foreground">Optimized</div>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-2xl font-bold text-amber-600">
              {pages.filter(p => getSEOStatus(p).label !== 'Good').length}
            </div>
            <div className="text-sm text-muted-foreground">Needs Attention</div>
          </div>
        </div>

        {/* Table */}
        {filteredPages.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground border rounded-md">
            {pages.length === 0 ? 'No pages configured' : 'No pages match your search'}
          </div>
        ) : (
          <div className="rounded-md border bg-white">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Page</TableHead>
                  <TableHead>Meta Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPages.map((page) => {
                  const status = getSEOStatus(page);
                  return (
                    <TableRow key={page.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{page.page_name}</div>
                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                            {page.page_path}
                            <a 
                              href={page.page_path} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="hover:text-foreground"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          {page.meta_title ? (
                            <div>
                              <p className="truncate text-sm">{page.meta_title}</p>
                              <p className={`text-xs ${page.meta_title.length > 60 ? 'text-red-500' : 'text-muted-foreground'}`}>
                                {page.meta_title.length}/60 chars
                              </p>
                            </div>
                          ) : (
                            <span className="text-muted-foreground italic">Not set</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`border-0 ${status.className}`}>
                          {status.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {format(new Date(page.updated_at), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" asChild>
                          <Link to={`/admin/seo/${page.id}`}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}

        {/* SEO Tips */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">SEO Best Practices</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-600" />
              Meta titles should be under 60 characters
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-600" />
              Meta descriptions should be under 160 characters
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-600" />
              Include your main keyword in the title
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-600" />
              Add Open Graph tags for social sharing
            </li>
          </ul>
        </div>
      </div>
    </AdminLayout>
  );
};

export default SEOManagement;
