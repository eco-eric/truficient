import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ottopay } from '@/integrations/ottopay/client';
import { useOttoCustomers, useCreateOttoCustomer } from '@/hooks/useOttoPay';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Button } from '@/components/ui/button';
import { ChevronsUpDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const OTTO_BUSINESS_ID = import.meta.env.VITE_OTTOPAY_BUSINESS_ID;

interface CustomerSelectorProps {
  value: string | null;
  onChange: (customerId: string) => void;
}

// Fetches CRM customers from the main database
function useCrmCustomers() {
  return useQuery({
    queryKey: ['crm-customers-for-invoicing'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('crm_customers')
        .select('id, first_name, last_name, company_name, email, phone, billing_address, billing_city, billing_state, billing_zip')
        .is('deleted_at', null)
        .order('first_name');
      if (error) throw error;
      return data;
    },
  });
}

export function CustomerSelector({ value, onChange }: CustomerSelectorProps) {
  const { data: crmCustomers } = useCrmCustomers();
  const { data: ottoCustomers } = useOttoCustomers();
  const createOttoCustomer = useCreateOttoCustomer();
  const [open, setOpen] = useState(false);
  const [syncing, setSyncing] = useState(false);

  // Build display list from CRM customers
  const customerList = useMemo(() => {
    return (crmCustomers || []).map(c => {
      const name = [c.first_name, c.last_name].filter(Boolean).join(' ') || c.company_name || 'Unnamed';
      return { crmId: c.id, name, email: c.email, phone: c.phone, raw: c };
    }).sort((a, b) => a.name.localeCompare(b.name));
  }, [crmCustomers]);

  // Find currently selected customer's display name from Otto Pay customers
  const selectedOtto = (ottoCustomers || []).find((c: any) => c.id === value);

  // When a CRM customer is selected, find or create matching Otto Pay customer
  const handleSelect = async (crmId: string) => {
    setOpen(false);
    const crm = customerList.find(c => c.crmId === crmId);
    if (!crm) return;

    setSyncing(true);
    try {
      // Check if an Otto Pay customer already exists with matching name+email
      const existing = (ottoCustomers || []).find((oc: any) =>
        oc.name === crm.name && (oc.email === crm.email || (!oc.email && !crm.email))
      );

      if (existing) {
        onChange(existing.id);
      } else {
        // Create new Otto Pay customer from CRM data
        const raw = crm.raw;
        const address = [raw.billing_address, raw.billing_city, raw.billing_state, raw.billing_zip]
          .filter(Boolean).join(', ') || null;

        const newCustomer = await createOttoCustomer.mutateAsync({
          name: crm.name,
          email: crm.email || null,
          phone: crm.phone || null,
          address,
          city: raw.billing_city || null,
          state: raw.billing_state || null,
          zip: raw.billing_zip || null,
        } as any);
        onChange(newCustomer.id);
        toast.success(`Synced "${crm.name}" to invoicing`);
      }
    } catch (e: any) {
      toast.error(e.message || 'Failed to sync customer');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className="w-full justify-between font-normal"
          disabled={syncing}
        >
          {syncing ? 'Syncing…' : selectedOtto ? selectedOtto.name : 'Select customer…'}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search CRM customers…" />
          <CommandList>
            <CommandEmpty>No customers found in CRM.</CommandEmpty>
            <CommandGroup heading="CRM Customers">
              {customerList.map(c => (
                <CommandItem
                  key={c.crmId}
                  value={c.name}
                  onSelect={() => handleSelect(c.crmId)}
                >
                  <Check className={cn('mr-2 h-4 w-4', 'opacity-0')} />
                  <div>
                    <p className="text-sm font-medium">{c.name}</p>
                    {c.email && <p className="text-xs text-muted-foreground">{c.email}</p>}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
