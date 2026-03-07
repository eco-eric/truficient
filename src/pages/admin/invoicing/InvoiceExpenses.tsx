import { useState, useRef } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useOttoExpenses, useCreateOttoExpense, useDeleteOttoExpense, uploadExpenseReceipt } from '@/hooks/useOttoExpenses';
import { useReceiptScanner } from '@/hooks/useOttoAI';
import { Receipt, Plus, Trash2, ScanLine, Upload, Image } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

const fmt = (v: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v);

const CATEGORIES = [
  'materials', 'tools', 'fuel', 'office', 'meals', 'travel', 'equipment', 'supplies', 'other'
];

const InvoiceExpenses = () => {
  const { data: expenses, isLoading } = useOttoExpenses();
  const createExpense = useCreateOttoExpense();
  const deleteExpense = useDeleteOttoExpense();
  const { scan, loading: scanning } = useReceiptScanner();

  const [createOpen, setCreateOpen] = useState(false);
  const [category, setCategory] = useState('materials');
  const [amount, setAmount] = useState('');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [vendor, setVendor] = useState('');
  const [notes, setNotes] = useState('');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setCategory('materials');
    setAmount('');
    setExpenseDate(new Date().toISOString().split('T')[0]);
    setVendor('');
    setNotes('');
    setReceiptFile(null);
    setReceiptPreview(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setReceiptFile(file);
    const reader = new FileReader();
    reader.onload = () => setReceiptPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleScanReceipt = async () => {
    if (!receiptFile) {
      toast.error('Upload a receipt image first');
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = (reader.result as string).split(',')[1];
      const result = await scan(base64);
      if (result) {
        setVendor(result.vendor || '');
        setAmount(String(result.amount || ''));
        setExpenseDate(result.date || expenseDate);
        setCategory(result.category || 'other');
        toast.success('Receipt scanned! Review and save.');
      }
    };
    reader.readAsDataURL(receiptFile);
  };

  const handleSave = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Enter a valid amount');
      return;
    }
    try {
      let receipt_url: string | undefined;
      if (receiptFile) {
        receipt_url = await uploadExpenseReceipt(receiptFile);
      }
      await createExpense.mutateAsync({
        category,
        amount: parseFloat(amount),
        expense_date: expenseDate,
        vendor: vendor || undefined,
        notes: notes || undefined,
        receipt_url,
      });
      toast.success('Expense saved');
      setCreateOpen(false);
      resetForm();
    } catch (e: any) {
      toast.error(e.message || 'Failed to save expense');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteExpense.mutateAsync(id);
      toast.success('Expense deleted');
    } catch (e: any) {
      toast.error(e.message || 'Failed to delete');
    }
  };

  const totalExpenses = (expenses || []).reduce((s, e) => s + e.amount, 0);
  const thisMonthExpenses = (expenses || []).filter(e => {
    const d = new Date(e.expense_date);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).reduce((s, e) => s + e.amount, 0);

  return (
    <AdminLayout title="Expenses">
      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total Expenses</p>
            <p className="text-2xl font-bold">{fmt(totalExpenses)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">This Month</p>
            <p className="text-2xl font-bold">{fmt(thisMonthExpenses)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total Records</p>
            <p className="text-2xl font-bold">{expenses?.length || 0}</p>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mb-4">
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-1" /> Log Expense
        </Button>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead>Receipt</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {(expenses || []).map(exp => (
                  <TableRow key={exp.id}>
                    <TableCell className="text-sm">{format(new Date(exp.expense_date), 'MMM d, yyyy')}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium capitalize">
                        {exp.category}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm">{exp.vendor || '—'}</TableCell>
                    <TableCell className="text-right font-medium">{fmt(exp.amount)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">{exp.notes || '—'}</TableCell>
                    <TableCell>
                      {exp.receipt_url ? (
                        <a href={exp.receipt_url} target="_blank" rel="noreferrer" className="text-primary hover:underline text-xs flex items-center gap-1">
                          <Image className="h-3 w-3" /> View
                        </a>
                      ) : '—'}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(exp.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {(!expenses || expenses.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-12">
                      <Receipt className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      No expenses logged yet
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={o => { if (!o) { resetForm(); } setCreateOpen(o); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Log Expense</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Receipt upload + scan */}
            <div className="border-2 border-dashed rounded-lg p-4 text-center">
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              {receiptPreview ? (
                <div className="space-y-2">
                  <img src={receiptPreview} alt="Receipt" className="max-h-32 mx-auto rounded" />
                  <div className="flex gap-2 justify-center">
                    <Button variant="outline" size="sm" onClick={handleScanReceipt} disabled={scanning}>
                      <ScanLine className="h-4 w-4 mr-1" />
                      {scanning ? 'Scanning...' : 'AI Scan Receipt'}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => { setReceiptFile(null); setReceiptPreview(null); }}>
                      Remove
                    </Button>
                  </div>
                </div>
              ) : (
                <Button variant="outline" onClick={() => fileRef.current?.click()}>
                  <Upload className="h-4 w-4 mr-1" /> Upload Receipt Photo
                </Button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(c => (
                      <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Amount</Label>
                <Input type="number" step="0.01" min="0" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Date</Label>
                <Input type="date" value={expenseDate} onChange={e => setExpenseDate(e.target.value)} />
              </div>
              <div>
                <Label>Vendor</Label>
                <Input value={vendor} onChange={e => setVendor(e.target.value)} placeholder="Store or vendor name" />
              </div>
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="Optional notes" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setCreateOpen(false); resetForm(); }}>Cancel</Button>
            <Button onClick={handleSave} disabled={createExpense.isPending}>
              {createExpense.isPending ? 'Saving...' : 'Save Expense'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default InvoiceExpenses;
