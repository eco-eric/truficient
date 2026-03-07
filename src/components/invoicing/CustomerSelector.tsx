import { useState } from 'react';
import { useOttoCustomers, useCreateOttoCustomer } from '@/hooks/useOttoPay';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from '@/components/ui/command';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { ChevronsUpDown, Plus, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface CustomerSelectorProps {
  value: string | null;
  onChange: (customerId: string) => void;
}

export function CustomerSelector({ value, onChange }: CustomerSelectorProps) {
  const { data: customers } = useOttoCustomers();
  const createCustomer = useCreateOttoCustomer();
  const [open, setOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');

  const selected = (customers || []).find((c: any) => c.id === value);

  const handleCreate = async () => {
    if (!newName.trim()) { toast.error('Name is required'); return; }
    try {
      const customer = await createCustomer.mutateAsync({
        name: newName.trim(),
        email: newEmail.trim() || null,
        phone: newPhone.trim() || null,
      } as any);
      onChange(customer.id);
      setCreateOpen(false);
      setNewName('');
      setNewEmail('');
      setNewPhone('');
      toast.success('Customer created');
    } catch (e: any) {
      toast.error(e.message || 'Failed to create customer');
    }
  };

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" role="combobox" className="w-full justify-between font-normal">
            {selected ? selected.name : 'Select customer…'}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[320px] p-0" align="start">
          <Command>
            <CommandInput placeholder="Search customers…" />
            <CommandList>
              <CommandEmpty>No customers found.</CommandEmpty>
              <CommandGroup>
                {(customers || []).map((c: any) => (
                  <CommandItem
                    key={c.id}
                    value={c.name}
                    onSelect={() => { onChange(c.id); setOpen(false); }}
                  >
                    <Check className={cn('mr-2 h-4 w-4', value === c.id ? 'opacity-100' : 'opacity-0')} />
                    <div>
                      <p className="text-sm font-medium">{c.name}</p>
                      {c.email && <p className="text-xs text-muted-foreground">{c.email}</p>}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup>
                <CommandItem onSelect={() => { setOpen(false); setCreateOpen(true); }}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create new customer
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Customer</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div><Label>Name *</Label><Input value={newName} onChange={e => setNewName(e.target.value)} /></div>
            <div><Label>Email</Label><Input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} /></div>
            <div><Label>Phone</Label><Input value={newPhone} onChange={e => setNewPhone(e.target.value)} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={createCustomer.isPending}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
