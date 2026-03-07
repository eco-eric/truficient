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
import { useOttoEstimates, useCreateOttoEstimate, useConvertEstimateToInvoice, useOttoEstimateLineItems } from '@/hooks/useOttoPay';
import { LineItemEditor } from '@/components/invoicing/LineItemEditor';
import { CustomerSelector } from '@/components/invoicing/CustomerSelector';
import { StatusBadge } from '@/components/invoicing/StatusBadge';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Search, Download, MoreHorizontal, Eye, FileText, Plus, ArrowRightCircle, CheckCircle, XCircle } from 'lucide-react';
import { format, subDays, startOfMonth, subMonths, isAfter, isBefore } from 'date-fns';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { ottoPatch } from '@/integrations/ottopay/client';
import type { LineItemDraft } from '@/integrations/ottopay/types';

const fmt = (v: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v);
const statusTabs = ['all', 'draft', 'sent', 'accepted', 'declined', 'converted'] as const;
const PAGE_SIZE = 25;

const OttoEstimatesList = () => {
  const { data: estimates, isLoading } = useOttoEstimates();
  const createEstimate = useCreateOttoEstimate();
  const convertToInvoice = useConvertEstimateToInvoice();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState('all');
  const [page, setPage] = useState(0);
  const [selectedEstimate, setSelectedEstimate] = useState<any>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const [customerId, setCustomerId] = useState<string | null>(null);
  const [estimateDate, setEstimateDate] = useState(new Date().toISOString().split('T')[0]);
  const [validUntil, setValidUntil] = useState('');
  const [taxRate, setTaxRate] = useState(0.0825);
  const [notes, setNotes] = useState('');
  const [terms, setTerms] = useState('');
  const [lineItems, setLineItems] = useState<LineItemDraft[]>([]);

  const { data: detailLineItems } = useOttoEstimateLineItems(selectedEstimate?.id ?? null);

  const filtered = useMemo(() => {
    let list = estimates || [];
    if (statusFilter !== 'all') list = list.filter((e: any) => e.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((e: any) => e.estimate_number?.toLowerCase().includes(q) || e.customers?.name?.toLowerCase().includes(q));
    }
    const now = new Date();
    if (dateRange === 'this_month') { const s = startOfMonth(now); list = list.filter((e: any) => isAfter(new Date(e.created_at), s)); }
    else if (dateRange === 'last_month') { const s = startOfMonth(subMonths(now, 1)); const end = startOfMonth(now); list = list.filter((e: any) => isAfter(new Date(e.created_at), s) && isBefore(new Date(e.created_at), end)); }
    else if (dateRange === '90days') { const s = subDays(now, 90); list = list.filter((e: any) => isAfter(new Date(e.created_at), s)); }
    return list;
  }, [estimates, statusFilter, search, dateRange]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const resetForm = () => { setCustomerId(null); setEstimateDate(new Date().toISOString().split('T')[0]); setValidUntil(''); setTaxRate(0.0825); setNotes(''); setTerms(''); setLineItems([]); };

  const handleCreate = async (status: string) => {
    if (!customerId) { toast.error('Select a customer'); return; }
    if (lineItems.length === 0) { toast.error('Add at least one line item'); return; }
    const subtotal = lineItems.reduce((s, i) => s + i.line_total, 0);
    const tax_amount = subtotal * taxRate;
    const total = subtotal + tax_amount;
    try {
      await createEstimate.mutateAsync({
        customer_id: customerId, estimate_date: estimateDate, valid_until: validUntil || null,
        subtotal, tax_rate: taxRate, tax_amount, total, notes: notes || null, terms: terms || null, status,
        line_items: lineItems.map((li, i) => ({ description: li.description, quantity: li.quantity, unit_price: li.unit_price, line_total: li.line_total, sort_order: i })),
      });
      toast.success(`Estimate created as ${status}`);
      setCreateOpen(false); resetForm();
    } catch (e: any) { toast.error(e.message || 'Failed to create estimate'); }
  };

  const handleConvert = async (est: any) => {
    try {
      await convertToInvoice.mutateAsync(est.id);
      toast.success('Estimate converted to invoice');
      setSelectedEstimate(null);
    } catch (e: any) { toast.error(e.message || 'Conversion failed'); }
  };

  const handleStatusUpdate = async (est: any, newStatus: string) => {
    try {
      const { error } = await ottoPatch('estimates', est.id, { status: newStatus });
      if (error) throw new Error(error.message);
      qc.invalidateQueries({ queryKey: ['otto-estimates'] });
      toast.success(`Estimate marked as ${newStatus}`);
    } catch (e: any) { toast.error(e.message); }
  };

  const subtotal = lineItems.reduce((s, i) => s + i.line_total, 0);
  const taxAmount = subtotal * taxRate;
  const total = subtotal + taxAmount;

  return (
    <AdminLayout title="Estimates">
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search estimate # or customer…" value={search} onChange={e => { setSearch(e.target.value); setPage(0); }} className="pl-9" />
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
        <Button onClick={() => { resetForm(); setCreateOpen(true); }}><Plus className="h-4 w-4 mr-1" /> New Estimate</Button>
      </div>

      <div className="flex gap-1 mb-4 flex-wrap">
        {statusTabs.map(s => (
          <Button key={s} variant={statusFilter === s ? 'default' : 'outline'} size="sm" className="capitalize" onClick={() => { setStatusFilter(s); setPage(0); }}>{s}</Button>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
          ) : paged.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <FileText className="h-10 w-10 mb-3" /><p className="text-sm">No estimates match your filters</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Estimate #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Valid Until</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {paged.map((est: any) => (
                  <TableRow key={est.id} className="cursor-pointer" onClick={() => setSelectedEstimate(est)}>
                    <TableCell className="font-medium">{est.estimate_number}</TableCell>
                    <TableCell>{est.customers?.name || '—'}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{format(new Date(est.estimate_date || est.created_at), 'MMM d, yyyy')}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{est.valid_until ? format(new Date(est.valid_until), 'MMM d, yyyy') : '—'}</TableCell>
                    <TableCell className="text-right">{fmt(est.total)}</TableCell>
                    <TableCell><StatusBadge status={est.status} /></TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={e => { e.stopPropagation(); setSelectedEstimate(est); }}><Eye className="h-4 w-4 mr-2" /> View</DropdownMenuItem>
                          <DropdownMenuItem onClick={e => { e.stopPropagation(); handleConvert(est); }} disabled={est.status === 'converted'}><ArrowRightCircle className="h-4 w-4 mr-2" /> Convert to Invoice</DropdownMenuItem>
                          <DropdownMenuItem onClick={e => { e.stopPropagation(); handleStatusUpdate(est, 'accepted'); }}><CheckCircle className="h-4 w-4 mr-2" /> Mark Accepted</DropdownMenuItem>
                          <DropdownMenuItem onClick={e => { e.stopPropagation(); handleStatusUpdate(est, 'declined'); }}><XCircle className="h-4 w-4 mr-2" /> Mark Declined</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
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

      {/* Estimate Detail Sheet */}
      <Sheet open={!!selectedEstimate} onOpenChange={open => { if (!open) setSelectedEstimate(null); }}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {selectedEstimate && (
            <>
              <SheetHeader className="pb-4">
                <SheetTitle className="flex items-center gap-3">
                  {selectedEstimate.estimate_number}
                  <StatusBadge status={selectedEstimate.status} />
                </SheetTitle>
              </SheetHeader>
              <div className="space-y-1 text-sm mb-6">
                <p className="font-medium">{selectedEstimate.customers?.name || 'Unknown'}</p>
                {selectedEstimate.customers?.email && <p className="text-muted-foreground">{selectedEstimate.customers.email}</p>}
              </div>
              <h4 className="font-semibold text-sm mb-2">Line Items</h4>
              <Table>
                <TableHeader><TableRow><TableHead>Description</TableHead><TableHead className="text-right">Qty</TableHead><TableHead className="text-right">Price</TableHead><TableHead className="text-right">Total</TableHead></TableRow></TableHeader>
                <TableBody>
                  {(detailLineItems || []).map((li: any) => (
                    <TableRow key={li.id}><TableCell>{li.description}</TableCell><TableCell className="text-right">{li.quantity}</TableCell><TableCell className="text-right">{fmt(li.unit_price)}</TableCell><TableCell className="text-right">{fmt(li.line_total)}</TableCell></TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="border-t pt-3 space-y-1 text-sm mb-6 mt-4">
                <div className="flex justify-between"><span>Subtotal</span><span>{fmt(selectedEstimate.subtotal)}</span></div>
                <div className="flex justify-between"><span>Tax ({((selectedEstimate.tax_rate || 0) * 100).toFixed(1)}%)</span><span>{fmt(selectedEstimate.tax_amount)}</span></div>
                <div className="flex justify-between font-semibold text-base"><span>Total</span><span>{fmt(selectedEstimate.total)}</span></div>
              </div>
              {selectedEstimate.notes && <div className="mb-4"><h4 className="font-semibold text-sm mb-1">Notes</h4><p className="text-sm text-muted-foreground">{selectedEstimate.notes}</p></div>}
              <div className="flex gap-2 flex-wrap">
                <Button size="sm" onClick={() => handleConvert(selectedEstimate)} disabled={selectedEstimate.status === 'converted' || convertToInvoice.isPending}>
                  <ArrowRightCircle className="h-4 w-4 mr-1" /> Convert to Invoice
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleStatusUpdate(selectedEstimate, 'accepted')}><CheckCircle className="h-4 w-4 mr-1" /> Accept</Button>
                <Button size="sm" variant="outline" onClick={() => handleStatusUpdate(selectedEstimate, 'declined')}><XCircle className="h-4 w-4 mr-1" /> Decline</Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Create Estimate Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>New Estimate</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><Label>Customer *</Label><CustomerSelector value={customerId} onChange={setCustomerId} /></div>
              <div><Label>Estimate Date</Label><Input type="date" value={estimateDate} onChange={e => setEstimateDate(e.target.value)} /></div>
              <div><Label>Valid Until</Label><Input type="date" value={validUntil} onChange={e => setValidUntil(e.target.value)} /></div>
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
            <Button variant="outline" onClick={() => handleCreate('draft')} disabled={createEstimate.isPending}>Save as Draft</Button>
            <Button onClick={() => handleCreate('sent')} disabled={createEstimate.isPending}>Send Estimate</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default OttoEstimatesList;
