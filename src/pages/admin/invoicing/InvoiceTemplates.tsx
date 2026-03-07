import { useState, useMemo } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useOttoTemplates, useOttoTemplateLineItems } from '@/hooks/useOttoPay';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ottopay } from '@/integrations/ottopay/client';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { LineItemEditor } from '@/components/invoicing/LineItemEditor';
import { Plus, FileText, Trash2, Edit2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import type { LineItemDraft } from '@/integrations/ottopay/types';

const OTTO_BUSINESS_ID = import.meta.env.VITE_OTTOPAY_BUSINESS_ID;
const fmt = (v: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v);

const InvoiceTemplates = () => {
  const { data: templates, isLoading } = useOttoTemplates();
  const qc = useQueryClient();
  const [selected, setSelected] = useState<any>(null);
  const { data: templateItems } = useOttoTemplateLineItems(selected?.id ?? null);
  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [lineItems, setLineItems] = useState<LineItemDraft[]>([]);

  const createTemplate = useMutation({
    mutationFn: async () => {
      const { data, error } = await ottopay.from('service_templates').insert({ business_id: OTTO_BUSINESS_ID, name, description: description || null }).select().single();
      if (error) throw error;
      if (lineItems.length > 0) {
        await ottopay.from('template_line_items').insert(lineItems.map((li, i) => ({
          template_id: data.id, description: li.description, quantity: li.quantity, unit_price: li.unit_price, sort_order: i,
        })));
      }
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['otto-templates'] }); toast.success('Template created'); setCreateOpen(false); setName(''); setDescription(''); setLineItems([]); },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteTemplate = useMutation({
    mutationFn: async (id: string) => {
      await ottopay.from('template_line_items').delete().eq('template_id', id);
      const { error } = await ottopay.from('service_templates').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['otto-templates'] }); toast.success('Template deleted'); setSelected(null); },
  });

  return (
    <AdminLayout title="Invoice Templates">
      <div className="flex justify-between items-center mb-6">
        <p className="text-sm text-muted-foreground">{(templates || []).length} templates</p>
        <Button onClick={() => { setName(''); setDescription(''); setLineItems([]); setCreateOpen(true); }}><Plus className="h-4 w-4 mr-1" /> New Template</Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
      ) : (templates || []).length === 0 ? (
        <div className="text-center py-16 text-muted-foreground"><FileText className="h-10 w-10 mx-auto mb-3" /><p>No templates yet</p></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(templates || []).map((t: any) => (
            <Card key={t.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelected(t)}>
              <CardHeader className="pb-2"><CardTitle className="text-base">{t.name}</CardTitle></CardHeader>
              <CardContent>
                {t.description && <p className="text-sm text-muted-foreground mb-2">{t.description}</p>}
                <p className="text-xs text-muted-foreground">{format(new Date(t.created_at), 'MMM d, yyyy')}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Detail Sheet */}
      <Sheet open={!!selected} onOpenChange={open => { if (!open) setSelected(null); }}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {selected && (
            <>
              <SheetHeader className="pb-4"><SheetTitle>{selected.name}</SheetTitle></SheetHeader>
              {selected.description && <p className="text-sm text-muted-foreground mb-4">{selected.description}</p>}
              <h4 className="font-semibold text-sm mb-2">Line Items</h4>
              <Table>
                <TableHeader><TableRow><TableHead>Description</TableHead><TableHead className="text-right">Qty</TableHead><TableHead className="text-right">Price</TableHead></TableRow></TableHeader>
                <TableBody>
                  {(templateItems || []).map((li: any) => (
                    <TableRow key={li.id}><TableCell>{li.description}</TableCell><TableCell className="text-right">{li.quantity}</TableCell><TableCell className="text-right">{fmt(li.unit_price)}</TableCell></TableRow>
                  ))}
                  {(templateItems || []).length === 0 && <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground">No items</TableCell></TableRow>}
                </TableBody>
              </Table>
              <div className="mt-6">
                <Button variant="destructive" size="sm" onClick={() => deleteTemplate.mutate(selected.id)}><Trash2 className="h-4 w-4 mr-1" /> Delete Template</Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>New Template</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Name *</Label><Input value={name} onChange={e => setName(e.target.value)} /></div>
            <div><Label>Description</Label><Input value={description} onChange={e => setDescription(e.target.value)} /></div>
            <div><Label>Line Items</Label><LineItemEditor items={lineItems} onChange={setLineItems} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={() => createTemplate.mutate()} disabled={createTemplate.isPending || !name.trim()}>Create Template</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default InvoiceTemplates;
