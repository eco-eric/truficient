import { useState, useMemo } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useOttoInvoices, useCreateOttoInvoice } from '@/hooks/useOttoPay';
import { InvoiceDetailSheet } from '@/components/invoicing/InvoiceDetailSheet';
import { LineItemEditor } from '@/components/invoicing/LineItemEditor';
import { CustomerSelector } from '@/components/invoicing/CustomerSelector';
import { StatusBadge } from '@/components/invoicing/StatusBadge';
import { Search, Download, MoreHorizontal, CreditCard, CheckCircle, Eye, FileText, Plus } from 'lucide-react';
import { format, subDays, startOfMonth, subMonths, isAfter, isBefore } from 'date-fns';
import { toast } from 'sonner';
import { useSearchParams } from 'react-router-dom';
import type { LineItemDraft } from '@/integrations/ottopay/types';

const fmt = (v: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v);
const statusTabs = ['all', 'draft', 'sent', 'paid', 'partial', 'overdue'] as const;
const PAGE_SIZE = 25;

const InvoicesList = () => {
  const { data: invoices, isLoading } = useOttoInvoices();
  const createInvoice = useCreateOttoInvoice();
  const [searchParams] = useSearchParams();
  const customerFilter = searchParams.get('customer');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState('all');
  const [page, setPage] = useState(0);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [createOpen, setCreateOpen] = useState(false);

  // Create form state
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [taxRate, setTaxRate] = useState(0.0825);
  const [notes, setNotes] = useState('');
  const [terms, setTerms] = useState('');
  const [lineItems, setLineItems] = useState<LineItemDraft[]>([]);

  const filtered = useMemo(() => {
    let list = invoices || [];
    if (customerFilter) list = list.filter((i: any) => i.customer_id === customerFilter);
    if (statusFilter !== 'all') list = list.filter((i: any) => i.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((i: any) => i.invoice_number?.toLowerCase().includes(q) || i.customers?.name?.toLowerCase().includes(q));
    }
    const now = new Date();
    if (dateRange === 'this_month') { const s = startOfMonth(now); list = list.filter((i: any) => isAfter(new Date(i.created_at), s)); }
    else if (dateRange === 'last_month') { const s = startOfMonth(subMonths(now, 1)); const e = startOfMonth(now); list = list.filter((i: any) => isAfter(new Date(i.created_at), s) && isBefore(new Date(i.created_at), e)); }
    else if (dateRange === '90days') { const s = subDays(now, 90); list = list.filter((i: any) => isAfter(new Date(i.created_at), s)); }
    return list;
  }, [invoices, statusFilter, search, dateRange, customerFilter]);

  const totalValue = filtered.reduce((s: number, i: any) => s + (i.total || 0), 0);
  const totalCollected = filtered.reduce((s: number, i: any) => s + (i.total_paid || 0), 0);
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const exportCSV = () => {
    if (!filtered.length) { toast.info('No data to export'); return; }
    const header = 'Invoice #,Customer,Invoice Date,Due Date,Total,Paid,Balance,Status';
    const rows = filtered.map((i: any) => [i.invoice_number, `"${i.customers?.name || ''}"`, i.invoice_date, i.due_date || '', i.total, i.total_paid, i.total - i.total_paid, i.status].join(','));
    const blob = new Blob([header + '\n' + rows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `invoices-${format(new Date(), 'yyyy-MM-dd')}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exported');
  };

  const resetCreateForm = () => {
    setCustomerId(null);
    setInvoiceDate(new Date().toISOString().split('T')[0]);
    setDueDate('');
    setTaxRate(0.0825);
    setNotes('');
    setTerms('');
    setLineItems([]);
  };

  const handleCreate = async (status: string) => {
    if (!customerId) { toast.error('Select a customer'); return; }
    if (lineItems.length === 0) { toast.error('Add at least one line item'); return; }
    const subtotal = lineItems.reduce((s, i) => s + i.line_total, 0);
    const tax_amount = subtotal * taxRate;
    const total = subtotal + tax_amount;
    try {
      await createInvoice.mutateAsync({
        customer_id: customerId,
        invoice_date: invoiceDate,
        due_date: dueDate || null,
        subtotal, tax_rate: taxRate, tax_amount, total,
        notes: notes || null, terms: terms || null,
        status,
        line_items: lineItems.map((li, i) => ({ description: li.description, quantity: li.quantity, unit_price: li.unit_price, line_total: li.line_total, sort_order: i })),
      });
      toast.success(`Invoice created as ${status}`);
      setCreateOpen(false);
      resetCreateForm();
    } catch (e: any) { toast.error(e.message || 'Failed to create invoice'); }
  };

  const isOverdue = (dueDate: string | null, status: string) => dueDate && status !== 'paid' && isBefore(new Date(dueDate), new Date());
  const subtotal = lineItems.reduce((s, i) => s + i.line_total, 0);
  const taxAmount = subtotal * taxRate;
  const total = subtotal + taxAmount;

  return (
    <AdminLayout title="Invoices">
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search invoice # or customer…" value={search} onChange={e => { setSearch(e.target.value); setPage(0); }} className="pl-9" />
        </div>
        <Select value={dateRange} onValueChange={v => { setDateRange(v); setPage(0); }}>
          <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="this_month">This Month</SelectItem>
            <SelectItem value="last_month">Last Month</SelectItem>
            <SelectItem value="90days">Last 90 Days</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" onClick={exportCSV}><Download className="h-4 w-4 mr-1" /> Export</Button>
        <Button onClick={() => { resetCreateForm(); setCreateOpen(true); }}><Plus className="h-4 w-4 mr-1" /> New Invoice</Button>
      </div>

      <div className="flex gap-1 mb-4 flex-wrap">
        {statusTabs.map(s => (
          <Button key={s} variant={statusFilter === s ? 'default' : 'outline'} size="sm" className="capitalize" onClick={() => { setStatusFilter(s); setPage(0); }}>{s}</Button>
        ))}
      </div>

      <div className="flex gap-6 text-sm mb-4">
        <span className="text-muted-foreground">{filtered.length} invoices</span>
        <span>Total: <strong>{fmt(totalValue)}</strong></span>
        <span>Collected: <strong className="text-green-600">{fmt(totalCollected)}</strong></span>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
          ) : paged.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <FileText className="h-10 w-10 mb-3" /><p className="text-sm">No invoices match your filters</p>
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
                    <TableRow key={inv.id} className="cursor-pointer" onClick={() => setSelectedInvoice(inv)}>
                      <TableCell className="font-medium">{inv.invoice_number}</TableCell>
                      <TableCell>{inv.customers?.name || '—'}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{format(new Date(inv.invoice_date || inv.created_at), 'MMM d, yyyy')}</TableCell>
                      <TableCell className={`text-xs ${overdue ? 'text-destructive font-medium' : 'text-muted-foreground'}`}>{inv.due_date ? format(new Date(inv.due_date), 'MMM d, yyyy') : '—'}</TableCell>
                      <TableCell className="text-right">{fmt(inv.total)}</TableCell>
                      <TableCell className="text-right">{fmt(inv.total_paid)}</TableCell>
                      <TableCell className="text-right font-medium">{balance > 0 ? fmt(balance) : '—'}</TableCell>
                      <TableCell><StatusBadge status={inv.status} /></TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
                            <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={e => { e.stopPropagation(); setSelectedInvoice(inv); }}><Eye className="h-4 w-4 mr-2" /> View</DropdownMenuItem>
                            <DropdownMenuItem onClick={e => { e.stopPropagation(); setSelectedInvoice(inv); }} disabled={balance <= 0}><CreditCard className="h-4 w-4 mr-2" /> Charge</DropdownMenuItem>
                            <DropdownMenuItem onClick={e => { e.stopPropagation(); toast.success(`${inv.invoice_number} marked as paid`); }} disabled={balance <= 0}><CheckCircle className="h-4 w-4 mr-2" /> Mark Paid</DropdownMenuItem>
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

      {pageCount > 1 && (
        <div className="flex items-center justify-between mt-4 text-sm">
          <span className="text-muted-foreground">Page {page + 1} of {pageCount}</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>Previous</Button>
            <Button variant="outline" size="sm" disabled={page >= pageCount - 1} onClick={() => setPage(p => p + 1)}>Next</Button>
          </div>
        </div>
      )}

      <InvoiceDetailSheet invoice={selectedInvoice} open={!!selectedInvoice} onOpenChange={open => { if (!open) setSelectedInvoice(null); }} />

      {/* Create Invoice Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>New Invoice</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><Label>Customer *</Label><CustomerSelector value={customerId} onChange={setCustomerId} /></div>
              <div><Label>Invoice Date</Label><Input type="date" value={invoiceDate} onChange={e => setInvoiceDate(e.target.value)} /></div>
              <div><Label>Due Date</Label><Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} /></div>
              <div><Label>Tax Rate (%)</Label><Input type="number" step="0.01" value={(taxRate * 100).toFixed(2)} onChange={e => setTaxRate(parseFloat(e.target.value) / 100 || 0)} /></div>
            </div>
            <div><Label>Line Items</Label><LineItemEditor items={lineItems} onChange={setLineItems} /></div>
            <div className="border-t pt-3 space-y-1 text-sm text-right">
              <p>Subtotal: {fmt(subtotal)}</p>
              <p>Tax ({(taxRate * 100).toFixed(2)}%): {fmt(taxAmount)}</p>
              <p className="font-semibold text-base">Total: {fmt(total)}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><Label>Notes</Label><Textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} /></div>
              <div><Label>Terms</Label><Textarea value={terms} onChange={e => setTerms(e.target.value)} rows={3} /></div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button variant="outline" onClick={() => handleCreate('draft')} disabled={createInvoice.isPending}>Save as Draft</Button>
            <Button onClick={() => handleCreate('sent')} disabled={createInvoice.isPending}>Send Invoice</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default InvoicesList;
