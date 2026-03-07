import { useState, useMemo, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Button } from '@/components/ui/button';
import { ChevronsUpDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  const queryClient = useQueryClient();
  const { data: crmCustomers } = useCrmCustomers();
  const [open, setOpen] = useState(false);

  // Subscribe to realtime CRM customer changes
  useEffect(() => {
    const channel = supabase
      .channel('crm-customers-invoicing')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'crm_customers' }, () => {
        queryClient.invalidateQueries({ queryKey: ['crm-customers-for-invoicing'] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  // Build display list from CRM customers
  const customerList = useMemo(() => {
    return (crmCustomers || []).map(c => {
      const name = [c.first_name, c.last_name].filter(Boolean).join(' ') || c.company_name || 'Unnamed';
      return { id: c.id, name, email: c.email };
    }).sort((a, b) => a.name.localeCompare(b.name));
  }, [crmCustomers]);

  // Find selected customer display name
  const selected = customerList.find(c => c.id === value);

  const handleSelect = (id: string) => {
    setOpen(false);
    onChange(id);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className="w-full justify-between font-normal"
        >
          {selected ? selected.name : 'Select customer…'}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search customers…" />
          <CommandList>
            <CommandEmpty>No customers found.</CommandEmpty>
            <CommandGroup heading="Customers">
              {customerList.map(c => (
                <CommandItem
                  key={c.id}
                  value={c.name}
                  onSelect={() => handleSelect(c.id)}
                >
                  <Check className={cn('mr-2 h-4 w-4', value === c.id ? 'opacity-100' : 'opacity-0')} />
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
