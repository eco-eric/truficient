import { useState, useMemo } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useOttoCustomers, useOttoInvoices } from '@/hooks/useOttoPay';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Mail, Phone, FileText, ExternalLink, DollarSign, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

const InvoiceCustomers = () => {
  const { data: customers, isLoading: loadingCustomers } = useOttoCustomers();
  const { data: invoices, isLoading: loadingInvoices } = useOttoInvoices();
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const navigate = useNavigate();

  const enriched = useMemo(() => {
    if (!customers) return [];
    const invByCustomer = (invoices || []).reduce((map: Record<string, any[]>, inv: any) => {
      if (inv.customer_id) {
        if (!map[inv.customer_id]) map[inv.customer_id] = [];
        map[inv.customer_id].push(inv);
      }
      return map;
    }, {});

    return customers.map((c: any) => {
      const custInvoices = invByCustomer[c.id] || [];
      const ltv = custInvoices.filter((i: any) => i.status === 'paid').reduce((s: number, i: any) => s + i.total, 0);
      const lastDate = custInvoices.length ? custInvoices.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0].created_at : null;
      return { ...c, invoiceCount: custInvoices.length, ltv, lastInvoiceDate: lastDate };
    });
  }, [customers, invoices]);

  const filtered = useMemo(() => {
    let list = enriched;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((c: any) =>
        c.name?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.phone?.includes(q)
      );
    }
    if (sortBy === 'name') list = [...list].sort((a: any, b: any) => (a.name || '').localeCompare(b.name || ''));
    else if (sortBy === 'ltv') list = [...list].sort((a: any, b: any) => b.ltv - a.ltv);
    else if (sortBy === 'recent') list = [...list].sort((a: any, b: any) => {
      if (!a.lastInvoiceDate) return 1;
      if (!b.lastInvoiceDate) return -1;
      return new Date(b.lastInvoiceDate).getTime() - new Date(a.lastInvoiceDate).getTime();
    });
    return list;
  }, [enriched, search, sortBy]);

  const isLoading = loadingCustomers || loadingInvoices;
  const initials = (name: string) => name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?';

  return (
    <AdminLayout title="Invoice Customers">
      <div className="space-y-6">
        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search name, email, phone…" value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Sort by Name</SelectItem>
              <SelectItem value="ltv">Lifetime Value</SelectItem>
              <SelectItem value="recent">Most Recent</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}><CardContent className="p-5"><Skeleton className="h-28 w-full" /></CardContent></Card>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">No customers found</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((c: any) => (
              <Card key={c.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-5 space-y-4">
                  {/* Header */}
                  <div className="flex items-center gap-3">
                    <Avatar className="h-11 w-11">
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">{initials(c.name)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="font-semibold truncate">{c.name}</p>
                      {c.email && <p className="text-xs text-muted-foreground flex items-center gap-1 truncate"><Mail className="h-3 w-3 shrink-0" />{c.email}</p>}
                    </div>
                  </div>

                  {c.phone && <p className="text-xs text-muted-foreground flex items-center gap-1"><Phone className="h-3 w-3" />{c.phone}</p>}

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-muted/50 rounded-md p-2">
                      <p className="text-lg font-bold">{c.invoiceCount}</p>
                      <p className="text-[10px] text-muted-foreground">Invoices</p>
                    </div>
                    <div className="bg-muted/50 rounded-md p-2">
                      <p className="text-lg font-bold text-green-700">{fmt(c.ltv)}</p>
                      <p className="text-[10px] text-muted-foreground">Lifetime</p>
                    </div>
                    <div className="bg-muted/50 rounded-md p-2">
                      <p className="text-sm font-medium">{c.lastInvoiceDate ? format(new Date(c.lastInvoiceDate), 'MMM d') : '—'}</p>
                      <p className="text-[10px] text-muted-foreground">Last Inv.</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => navigate(`/admin/invoicing/invoices?customer=${c.id}`)}>
                      <FileText className="h-3.5 w-3.5 mr-1" />Invoices
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => window.open('https://ottopay.lovable.app/invoices/new', '_blank')}>
                      <ExternalLink className="h-3.5 w-3.5 mr-1" />New Invoice
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default InvoiceCustomers;
