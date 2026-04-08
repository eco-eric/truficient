import { useState, useEffect, useMemo, useCallback } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Loader2, Search, Pencil, Plus, Check, X, ExternalLink, ArrowUpDown, MapPin, FileText, ChevronDown, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

const PAGE_TYPES = ['Core Page', 'Neighborhood Hub', 'Service+City', 'ZIP Code', 'Housing Type', 'Commercial', 'Energy Content', 'Equipment'];
const CLUSTERS = ['Core Site', 'Oak Cliff', 'East Dallas', 'North Dallas', 'Downtown Dallas', 'South Dallas', 'Outer Ring'];
const INDEX_STATUSES = ['Indexed', 'Pending', 'Not Indexed', 'Excluded'];

interface PageSEO {
  id: string;
  page_path: string;
  page_name: string;
  meta_title: string | null;
  meta_description: string | null;
  updated_at: string;
  page_type: string | null;
  target_keyword: string | null;
  cluster: string | null;
  index_status: string | null;
  gsc_impressions: number | null;
  gsc_clicks: number | null;
  avg_position: number | null;
  internal_links: number | null;
  schema_applied: boolean | null;
  last_content_update: string | null;
}

type SortField = 'status' | 'avg_position' | 'gsc_clicks' | 'last_content_update' | 'page_name';

const SEOManagement = () => {
  const [loading, setLoading] = useState(true);
  const [pages, setPages] = useState<PageSEO[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPageType, setFilterPageType] = useState<string>('all');
  const [filterCluster, setFilterCluster] = useState<string>('all');
  const [filterIndexStatus, setFilterIndexStatus] = useState<string>('all');
  const [filterSchema, setFilterSchema] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('page_name');
  const [sortAsc, setSortAsc] = useState(true);
  const { toast } = useToast();

  const fetchPages = async () => {
    try {
      const { data, error } = await supabase
        .from('page_seo' as any)
        .select('id, page_path, page_name, meta_title, meta_description, updated_at, page_type, target_keyword, cluster, index_status, gsc_impressions, gsc_clicks, avg_position, internal_links, schema_applied, last_content_update')
        .order('page_name', { ascending: true });

      if (error) throw error;
      setPages((data as unknown as PageSEO[]) || []);
    } catch (error) {
      console.error('Error fetching pages:', error);
      toast({ title: 'Error', description: 'Failed to load SEO settings.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPages(); }, []);

  const getSEOStatus = (page: PageSEO) => {
    const hasTitle = page.meta_title && page.meta_title.length > 0;
    const hasDescription = page.meta_description && page.meta_description.length > 0;
    const titleInRange = hasTitle && page.meta_title!.length >= 20 && page.meta_title!.length <= 70;
    const descInRange = hasDescription && page.meta_description!.length >= 50 && page.meta_description!.length <= 165;
    if (hasTitle && hasDescription && titleInRange && descInRange) return { label: 'Good', className: 'bg-green-100 text-green-800', order: 0 };
    if (hasTitle && hasDescription) return { label: 'Needs Review', className: 'bg-amber-100 text-amber-800', order: 1 };
    return { label: 'Needs Attention', className: 'bg-red-100 text-red-800', order: 2 };
  };

  const getIndexBadge = (status: string | null) => {
    switch (status) {
      case 'Indexed': return 'bg-green-100 text-green-800';
      case 'Pending': return 'bg-amber-100 text-amber-800';
      case 'Not Indexed': return 'bg-red-100 text-red-800';
      case 'Excluded': return 'bg-gray-100 text-gray-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const filteredPages = useMemo(() => {
    let result = [...pages];

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.page_name.toLowerCase().includes(q) ||
        p.page_path.toLowerCase().includes(q) ||
        (p.target_keyword?.toLowerCase() || '').includes(q) ||
        (p.meta_title?.toLowerCase() || '').includes(q)
      );
    }

    // Filters
    if (filterPageType !== 'all') result = result.filter(p => p.page_type === filterPageType);
    if (filterCluster !== 'all') result = result.filter(p => p.cluster === filterCluster);
    if (filterIndexStatus !== 'all') result = result.filter(p => p.index_status === filterIndexStatus);
    if (filterSchema === 'yes') result = result.filter(p => p.schema_applied === true);
    if (filterSchema === 'no') result = result.filter(p => !p.schema_applied);

    // Sort
    result.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'status':
          cmp = getSEOStatus(a).order - getSEOStatus(b).order;
          break;
        case 'avg_position':
          cmp = (a.avg_position ?? 999) - (b.avg_position ?? 999);
          break;
        case 'gsc_clicks':
          cmp = (b.gsc_clicks ?? 0) - (a.gsc_clicks ?? 0);
          break;
        case 'last_content_update':
          cmp = new Date(b.last_content_update || '1970').getTime() - new Date(a.last_content_update || '1970').getTime();
          break;
        default:
          cmp = a.page_name.localeCompare(b.page_name);
      }
      return sortAsc ? cmp : -cmp;
    });

    return result;
  }, [pages, searchQuery, filterPageType, filterCluster, filterIndexStatus, filterSchema, sortField, sortAsc]);

  // Summary stats
  const totalPages = pages.length;
  const optimizedCount = pages.filter(p => getSEOStatus(p).label === 'Good').length;
  const needsAttentionCount = totalPages - optimizedCount;
  const locationPages = pages.filter(p => p.page_type === 'location');
  const indexedCount = pages.filter(p => p.index_status === 'Indexed').length;
  const notIndexedCount = pages.filter(p => p.index_status !== 'Indexed').length;
  const missingSchemaCount = pages.filter(p => !p.schema_applied).length;
  const pagesWithPosition = locationPages.filter(p => p.avg_position != null && p.avg_position > 0);
  const avgPosition = pagesWithPosition.length > 0
    ? (pagesWithPosition.reduce((sum, p) => sum + (p.avg_position || 0), 0) / pagesWithPosition.length).toFixed(1)
    : '—';

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(field === 'avg_position');
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
              placeholder="Search pages, slugs, keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex items-center gap-2">
            <SitemapButton />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="bg-[#1e3a5f] hover:bg-[#1e3a5f]/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Page
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link to="/admin/seo/new" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Core Page
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/admin/seo/location/new" className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Location Page
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          <div className="bg-white p-3 rounded-lg border">
            <div className="text-2xl font-bold">{totalPages}</div>
            <div className="text-xs text-muted-foreground">Total Pages</div>
          </div>
          <div className="bg-white p-3 rounded-lg border">
            <div className="text-2xl font-bold text-green-600">{optimizedCount}</div>
            <div className="text-xs text-muted-foreground">Optimized</div>
          </div>
          <div className="bg-white p-3 rounded-lg border">
            <div className="text-2xl font-bold text-amber-600">{needsAttentionCount}</div>
            <div className="text-xs text-muted-foreground">Needs Attention</div>
          </div>
          <div className="bg-white p-3 rounded-lg border">
            <div className="text-2xl font-bold text-blue-600">{locationPages.length}</div>
            <div className="text-xs text-muted-foreground">Location Pages</div>
          </div>
          <div className="bg-white p-3 rounded-lg border">
            <div className="text-2xl font-bold">
              <span className="text-green-600">{indexedCount}</span>
              <span className="text-muted-foreground text-lg"> / </span>
              <span className="text-red-500">{notIndexedCount}</span>
            </div>
            <div className="text-xs text-muted-foreground">Indexed / Not</div>
          </div>
          <div className="bg-white p-3 rounded-lg border">
            <div className="text-2xl font-bold text-orange-600">{missingSchemaCount}</div>
            <div className="text-xs text-muted-foreground">Missing Schema</div>
          </div>
          <div className="bg-white p-3 rounded-lg border">
            <div className="text-2xl font-bold">{avgPosition}</div>
            <div className="text-xs text-muted-foreground">Avg Position</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <Select value={filterPageType} onValueChange={setFilterPageType}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Page Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {PAGE_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={filterCluster} onValueChange={setFilterCluster}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Cluster" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Clusters</SelectItem>
              {CLUSTERS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={filterIndexStatus} onValueChange={setFilterIndexStatus}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Index Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {INDEX_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={filterSchema} onValueChange={setFilterSchema}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Schema" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="yes">Schema Applied</SelectItem>
              <SelectItem value="no">No Schema</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortField} onValueChange={(v) => handleSort(v as SortField)}>
            <SelectTrigger className="w-[180px]">
              <ArrowUpDown className="h-3.5 w-3.5 mr-2" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="page_name">Name</SelectItem>
              <SelectItem value="status">Status</SelectItem>
              <SelectItem value="avg_position">Avg Position</SelectItem>
              <SelectItem value="gsc_clicks">GSC Clicks</SelectItem>
              <SelectItem value="last_content_update">Content Updated</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        {filteredPages.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground border rounded-md">
            {pages.length === 0 ? 'No pages configured' : 'No pages match your filters'}
          </div>
        ) : (
          <div className="rounded-md border bg-white overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Page</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Keyword</TableHead>
                  <TableHead>Cluster</TableHead>
                  <TableHead>Meta Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Index</TableHead>
                  <TableHead className="text-right">Impressions</TableHead>
                  <TableHead className="text-right">Clicks</TableHead>
                  <TableHead className="text-right">Avg Pos</TableHead>
                  <TableHead className="text-right">Links</TableHead>
                  <TableHead>Schema</TableHead>
                  <TableHead>Content Updated</TableHead>
                  <TableHead className="w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPages.map((page) => {
                  const status = getSEOStatus(page);
                  return (
                    <TableRow key={page.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium text-sm">{page.page_name}</div>
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            {page.page_path}
                            <a href={page.page_path} target="_blank" rel="noopener noreferrer" className="hover:text-foreground">
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs">{page.page_type || '—'}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-muted-foreground">{page.target_keyword || '—'}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs">{page.cluster || '—'}</span>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[150px]">
                          {page.meta_title ? (
                            <div>
                              <p className="truncate text-xs">{page.meta_title}</p>
                              <p className={`text-[10px] ${page.meta_title.length > 60 ? 'text-red-500' : 'text-muted-foreground'}`}>
                                {page.meta_title.length}/60
                              </p>
                            </div>
                          ) : (
                            <span className="text-muted-foreground italic text-xs">Not set</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`border-0 text-[10px] ${status.className}`}>
                          {status.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`border-0 text-[10px] ${getIndexBadge(page.index_status)}`}>
                          {page.index_status || 'Pending'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-xs text-muted-foreground">
                        {page.gsc_impressions ?? 0}
                      </TableCell>
                      <TableCell className="text-right text-xs text-muted-foreground">
                        {page.gsc_clicks ?? 0}
                      </TableCell>
                      <TableCell className="text-right text-xs text-muted-foreground">
                        {page.avg_position != null ? page.avg_position.toFixed(1) : '—'}
                      </TableCell>
                      <TableCell className="text-right text-xs text-muted-foreground">
                        {page.internal_links ?? 0}
                      </TableCell>
                      <TableCell>
                        {page.schema_applied ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <X className="h-4 w-4 text-red-400" />
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {page.last_content_update
                          ? format(new Date(page.last_content_update), 'MMM d, yyyy')
                          : '—'}
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
            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-600" />Meta titles should be under 60 characters</li>
            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-600" />Meta descriptions should be under 160 characters</li>
            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-600" />Include your main keyword in the title</li>
            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-600" />Add Open Graph tags for social sharing</li>
          </ul>
        </div>
      </div>
    </AdminLayout>
  );
};

export default SEOManagement;
