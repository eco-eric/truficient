import { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { CustomerTable } from '@/components/admin/customers/CustomerTable';
import { CustomerFormDialog } from '@/components/admin/customers/CustomerFormDialog';
import { DeleteCustomerDialog } from '@/components/admin/customers/DeleteCustomerDialog';
import type { Database } from '@/integrations/supabase/types';

type Customer = Database['public']['Tables']['crm_customers']['Row'];

const Customers = () => {
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const handleEdit = (customer: Customer) => {
    setSelectedCustomer(customer);
    setFormOpen(true);
  };

  const handleDelete = (customer: Customer) => {
    setSelectedCustomer(customer);
    setDeleteOpen(true);
  };

  const handleNewCustomer = () => {
    setSelectedCustomer(null);
    setFormOpen(true);
  };

  return (
    <AdminLayout title="Customers">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Customers</h1>
            <p className="text-muted-foreground">
              Manage your customer database and lead information
            </p>
          </div>
          <Button onClick={handleNewCustomer}>
            <Plus className="h-4 w-4 mr-2" />
            New Customer
          </Button>
        </div>

        <CustomerTable onEdit={handleEdit} onDelete={handleDelete} />

        <CustomerFormDialog
          open={formOpen}
          onOpenChange={setFormOpen}
          customer={selectedCustomer}
        />

        <DeleteCustomerDialog
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          customer={selectedCustomer}
        />
      </div>
    </AdminLayout>
  );
};

export default Customers;
