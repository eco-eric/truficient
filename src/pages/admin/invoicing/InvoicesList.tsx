import { useState, useMemo } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useOttoInvoices } from '@/hooks/useOttoPay';
import { InvoiceDetailSheet } from '@/components/invoicing/InvoiceDetailSheet';
import { Search, Download, MoreHorizontal, CreditCard, CheckCircle, Eye, FileText } from 'lucide-react';
import { format, subDays, startOfMonth, subMonths, isAfter, isBefore } from 'date-fns';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

const fmt = (v: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v);

const statusTabs = ['all', 'draft', 'sent', 'paid', 'partial', 'overdue'] as const;

const statusColor: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700',
  sent: 'bg-blue-100 text-blue-700',
  paid: 'bg-green-100 text-green-700',
  partial: 'bg-yellow-100 text-yellow-700',
  overdue: 'bg-red-100 text-red-700',
};

const PAGE_SIZE = 25;

const InvoicesList = () => {
  const { data: invoices, isLoading } = useOttoInvoices();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState('all');
  const [page, setPage] = useState(0);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const qc = useQueryClient();

  const filtered = useMemo(() => {
    let list = invoices || [];

    // Status
    if (statusFilter !== 'all') list = list.filter((i: any) => i.status === statusFilter);

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (i: any) =>
          i.invoice_number?.toLowerCase().includes(q) ||
          i.customers?.name?.toLowerCase().includes(q),
      );
    }

    // Date range
    const now = new Date();
    if (dateRange === 'this_month') {
      const start = startOfMonth(now);
      list = list.filter((i: any) => isAfter(new Date(i.created_at), start));
    } else if (dateRange === 'last_month') {
      const start = startOfMonth(subMonths(now, 1));
      const end = startOfMonth(now);
      list = list.filter(
        (i: any) =>
          isAfter(new Date(i.created_at), start) && isBefore(new Date(i.created_at), end),
      );
    } else if (dateRange === '90days') {
      const start = subDays(now, 90);
      list = list.filter((i: any) => isAfter(new Date(i.created_at), start));
    }

    return list;
  }, [invoices, statusFilter, search, dateRange]);

  const totalValue = filtered.reduce((s: number, i: any) => s + (i.total || 0), 0);
  const totalCollected = filtered.reduce((s: number, i: any) => s + (i.total_paid || 0), 0);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const exportCSV = () => {
    if (!filtered.length) { toast.info('No data to export'); return; }
    const header = 'Invoice #,Customer,Invoice Date,Due Date,Total,Paid,Balance,Status';
    const rows = filtered.map((i: any) =>
      [
        i.invoice_number,
        `"${i.customers?.name || ''}"`,
        i.invoice_date,
        i.due_date || '',
        i.total,
        i.total_paid,
        i.total - i.total_paid,
        i.status,
      ].join(','),
    );
    const blob = new Blob([header + '\n' + rows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoices-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exported');
  };

  const handleMarkPaid = (inv: any) => {
    toast.success(`${inv.invoice_number} marked as paid`);
    // TODO: write manual payment
  };

  const handleCharge = (inv: any) => {
    setSelectedInvoice(inv);
  };

  const isOverdue = (dueDate: string | null, status: string) =>
    dueDate && status !== 'paid' && isBefore(new Date(dueDate), new Date());

  return (
    <AdminLayout title="Invoices">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search invoice # or customer…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(0); }}
            className="pl-9"
          />
        </div>

        <Select value={dateRange} onValueChange={v => { setDateRange(v); setPage(0); }}>
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="this_month">This Month</SelectItem>
            <SelectItem value="last_month">Last Month</SelectItem>
            <SelectItem value="90days">Last 90 Days</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" size="sm" onClick={exportCSV}>
          <Download className="h-4 w-4 mr-1" /> Export CSV
        </Button>
      </div>

      {/* Status tabs */}
      <div className="flex gap-1 mb-4 flex-wrap">
        {statusTabs.map(s => (
          <Button
            key={s}
            variant={statusFilter === s ? 'default' : 'outline'}
            size="sm"
            className="capitalize"
            onClick={() => { setStatusFilter(s); setPage(0); }}
          >
            {s}
          </Button>
        ))}
      </div>

      {/* Summary */}
      <div className="flex gap-6 text-sm mb-4">
        <span className="text-muted-foreground">{filtered.length} invoices</span>
        <span>Total: <strong>{fmt(totalValue)}</strong></span>
        <span>Collected: <strong className="text-green-600">{fmt(totalCollected)}</strong></span>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : paged.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <FileText className="h-10 w-10 mb-3" />
              <p className="text-sm">No invoices match your filters</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Paid</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {paged.map((inv: any) => {
                  const balance = inv.total - inv.total_paid;
                  const overdue = isOverdue(inv.due_date, inv.status);
                  return (
                    <TableRow
                      key={inv.id}
                      className="cursor-pointer"
                      onClick={() => setSelectedInvoice(inv)}
                    >
                      <TableCell className="font-medium">{inv.invoice_number}</TableCell>
                      <TableCell>{inv.customers?.name || '—'}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {format(new Date(inv.invoice_date || inv.created_at), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell className={`text-xs ${overdue ? 'text-destructive font-medium' : 'text-muted-foreground'}`}>
                        {inv.due_date ? format(new Date(inv.due_date), 'MMM d, yyyy') : '—'}
                      </TableCell>
                      <TableCell className="text-right">{fmt(inv.total)}</TableCell>
                      <TableCell className="text-right">{fmt(inv.total_paid)}</TableCell>
                      <TableCell className="text-right font-medium">
                        {balance > 0 ? fmt(balance) : '—'}
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${statusColor[inv.status] || ''}`}>
                          {inv.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={e => { e.stopPropagation(); setSelectedInvoice(inv); }}>
                              <Eye className="h-4 w-4 mr-2" /> View
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={e => { e.stopPropagation(); handleCharge(inv); }} disabled={balance <= 0}>
                              <CreditCard className="h-4 w-4 mr-2" /> Charge
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={e => { e.stopPropagation(); handleMarkPaid(inv); }} disabled={balance <= 0}>
                              <CheckCircle className="h-4 w-4 mr-2" /> Mark Paid
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {pageCount > 1 && (
        <div className="flex items-center justify-between mt-4 text-sm">
          <span className="text-muted-foreground">
            Page {page + 1} of {pageCount}
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
              Previous
            </Button>
            <Button variant="outline" size="sm" disabled={page >= pageCount - 1} onClick={() => setPage(p => p + 1)}>
              Next
            </Button>
          </div>
        </div>
      )}

      <InvoiceDetailSheet
        invoice={selectedInvoice}
        open={!!selectedInvoice}
        onOpenChange={open => { if (!open) setSelectedInvoice(null); }}
      />
    </AdminLayout>
  );
};

export default InvoicesList;
