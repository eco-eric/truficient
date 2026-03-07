import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useOttoBusiness, useUpdateOttoBusiness } from '@/hooks/useOttoPay';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Save } from 'lucide-react';
import { toast } from 'sonner';

const InvoiceSettings = () => {
  const { data: biz, isLoading } = useOttoBusiness();
  const update = useUpdateOttoBusiness();

  const [taxRate, setTaxRate] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('');
  const [defaultNotes, setDefaultNotes] = useState('');
  const [invoicePrefix, setInvoicePrefix] = useState('');
  const [estimatePrefix, setEstimatePrefix] = useState('');
  const [estimateValidDays, setEstimateValidDays] = useState('');

  useEffect(() => {
    if (biz) {
      setTaxRate(((biz.default_tax_rate || 0) * 100).toFixed(2));
      setPaymentTerms(biz.default_payment_terms || '');
      setDefaultNotes(biz.default_notes || '');
      setInvoicePrefix(biz.invoice_prefix || 'INV');
      setEstimatePrefix(biz.estimate_prefix || 'EST');
      setEstimateValidDays(String(biz.estimate_valid_days || 30));
    }
  }, [biz]);

  const handleSave = async () => {
    try {
      await update.mutateAsync({
        default_tax_rate: parseFloat(taxRate) / 100 || 0,
        default_payment_terms: paymentTerms || null,
        default_notes: defaultNotes || null,
        invoice_prefix: invoicePrefix || 'INV',
        estimate_prefix: estimatePrefix || 'EST',
        estimate_valid_days: parseInt(estimateValidDays) || 30,
      });
      toast.success('Settings saved');
    } catch (e: any) {
      toast.error(e.message || 'Failed to save');
    }
  };

  if (isLoading) {
    return (
      <AdminLayout title="Invoice Settings">
        <div className="space-y-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Invoice Settings">
      <div className="max-w-2xl space-y-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Invoice Defaults</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Default Tax Rate (%)</Label><Input type="number" step="0.01" value={taxRate} onChange={e => setTaxRate(e.target.value)} /></div>
              <div><Label>Payment Terms</Label><Input value={paymentTerms} onChange={e => setPaymentTerms(e.target.value)} placeholder="Net 30" /></div>
            </div>
            <div><Label>Default Notes</Label><Textarea value={defaultNotes} onChange={e => setDefaultNotes(e.target.value)} rows={3} placeholder="Appears on all new invoices" /></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Estimate Defaults</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Estimate Prefix</Label><Input value={estimatePrefix} onChange={e => setEstimatePrefix(e.target.value)} /></div>
              <div><Label>Valid Days</Label><Input type="number" value={estimateValidDays} onChange={e => setEstimateValidDays(e.target.value)} /></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Numbering</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Invoice Prefix</Label><Input value={invoicePrefix} onChange={e => setInvoicePrefix(e.target.value)} /></div>
              <div>
                <Label>Format Preview</Label>
                <p className="text-sm text-muted-foreground mt-2">{invoicePrefix}-{new Date().getFullYear()}-0001</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Business Info</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><span className="text-muted-foreground">Business:</span> {biz?.name}</p>
            <p><span className="text-muted-foreground">Owner:</span> {biz?.owner_name}</p>
            {biz?.email && <p><span className="text-muted-foreground">Email:</span> {biz.email}</p>}
            {biz?.phone && <p><span className="text-muted-foreground">Phone:</span> {biz.phone}</p>}
          </CardContent>
        </Card>

        <Button onClick={handleSave} disabled={update.isPending} className="w-full sm:w-auto">
          <Save className="h-4 w-4 mr-1" /> Save Settings
        </Button>
      </div>
    </AdminLayout>
  );
};

export default InvoiceSettings;
