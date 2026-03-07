import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Receipt, Clock } from 'lucide-react';

const InvoiceExpenses = () => {
  return (
    <AdminLayout title="Expenses">
      <div className="flex flex-col items-center justify-center py-24">
        <div className="bg-muted rounded-full p-4 mb-4">
          <Receipt className="h-10 w-10 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-semibold mb-2">Expense Logging Coming Soon</h2>
        <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
          Track business expenses, categorize spending, and generate profit reports — all integrated with your invoicing data.
        </p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>This feature is part of the Pro tier and will be available in a future update.</span>
        </div>
      </div>
    </AdminLayout>
  );
};

export default InvoiceExpenses;
