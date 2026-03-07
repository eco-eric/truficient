import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ottopay } from '@/integrations/ottopay/client';
import type { OttoCustomer, OttoEstimate } from '@/integrations/ottopay/types';

const OTTO_BUSINESS_ID = import.meta.env.VITE_OTTOPAY_BUSINESS_ID;

// ─── Invoices ────────────────────────────────────────────────
export const useOttoInvoices = () =>
  useQuery({
    queryKey: ['otto-invoices'],
    queryFn: async () => {
      const { data, error } = await ottopay
        .from('invoices')
        .select(`*, customers(id, name, email, phone)`)
        .eq('business_id', OTTO_BUSINESS_ID)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

export const useCreateOttoInvoice = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      customer_id: string;
      invoice_date: string;
      due_date: string | null;
      subtotal: number;
      tax_rate: number;
      tax_amount: number;
      total: number;
      notes: string | null;
      terms: string | null;
      status: string;
      line_items: { description: string; quantity: number; unit_price: number; line_total: number; sort_order: number }[];
    }) => {
      // Generate invoice number
      const { data: existing } = await ottopay
        .from('invoices')
        .select('invoice_number')
        .eq('business_id', OTTO_BUSINESS_ID)
        .order('created_at', { ascending: false })
        .limit(1);
      
      const year = new Date().getFullYear();
      let nextNum = 1;
      if (existing && existing.length > 0) {
        const match = existing[0].invoice_number?.match(/(\d+)$/);
        if (match) nextNum = parseInt(match[1]) + 1;
      }
      const invoice_number = `INV-${year}-${String(nextNum).padStart(4, '0')}`;

      const { data: invoice, error } = await ottopay
        .from('invoices')
        .insert({
          business_id: OTTO_BUSINESS_ID,
          customer_id: payload.customer_id,
          invoice_number,
          invoice_date: payload.invoice_date,
          due_date: payload.due_date,
          subtotal: payload.subtotal,
          tax_rate: payload.tax_rate,
          tax_amount: payload.tax_amount,
          total: payload.total,
          total_paid: 0,
          notes: payload.notes,
          terms: payload.terms,
          status: payload.status,
        })
        .select()
        .single();
      if (error) throw error;

      if (payload.line_items.length > 0) {
        const { error: liError } = await ottopay
          .from('invoice_line_items')
          .insert(payload.line_items.map((li, i) => ({
            invoice_id: invoice.id,
            description: li.description,
            quantity: li.quantity,
            unit_price: li.unit_price,
            line_total: li.line_total,
            sort_order: li.sort_order || i,
          })));
        if (liError) throw liError;
      }

      return invoice;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['otto-invoices'] });
      qc.invalidateQueries({ queryKey: ['otto-metrics'] });
    },
  });
};

// ─── Estimates ───────────────────────────────────────────────
export const useOttoEstimates = () =>
  useQuery({
    queryKey: ['otto-estimates'],
    queryFn: async () => {
      const { data, error } = await ottopay
        .from('estimates')
        .select(`*, customers(id, name, email, phone)`)
        .eq('business_id', OTTO_BUSINESS_ID)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

export const useCreateOttoEstimate = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      customer_id: string;
      estimate_date: string;
      valid_until: string | null;
      subtotal: number;
      tax_rate: number;
      tax_amount: number;
      total: number;
      notes: string | null;
      terms: string | null;
      status: string;
      line_items: { description: string; quantity: number; unit_price: number; line_total: number; sort_order: number }[];
    }) => {
      const { data: existing } = await ottopay
        .from('estimates')
        .select('estimate_number')
        .eq('business_id', OTTO_BUSINESS_ID)
        .order('created_at', { ascending: false })
        .limit(1);

      const year = new Date().getFullYear();
      let nextNum = 1;
      if (existing && existing.length > 0) {
        const match = existing[0].estimate_number?.match(/(\d+)$/);
        if (match) nextNum = parseInt(match[1]) + 1;
      }
      const estimate_number = `EST-${year}-${String(nextNum).padStart(4, '0')}`;

      const { data: estimate, error } = await ottopay
        .from('estimates')
        .insert({
          business_id: OTTO_BUSINESS_ID,
          customer_id: payload.customer_id,
          estimate_number,
          estimate_date: payload.estimate_date,
          valid_until: payload.valid_until,
          subtotal: payload.subtotal,
          tax_rate: payload.tax_rate,
          tax_amount: payload.tax_amount,
          total: payload.total,
          notes: payload.notes,
          terms: payload.terms,
          status: payload.status,
        })
        .select()
        .single();
      if (error) throw error;

      if (payload.line_items.length > 0) {
        const { error: liError } = await ottopay
          .from('estimate_line_items')
          .insert(payload.line_items.map((li, i) => ({
            estimate_id: estimate.id,
            description: li.description,
            quantity: li.quantity,
            unit_price: li.unit_price,
            line_total: li.line_total,
            sort_order: li.sort_order || i,
          })));
        if (liError) throw liError;
      }

      return estimate;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['otto-estimates'] });
    },
  });
};

export const useConvertEstimateToInvoice = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (estimateId: string) => {
      // Get estimate + line items
      const { data: est, error: estErr } = await ottopay
        .from('estimates')
        .select('*, customers(id, name, email, phone)')
        .eq('id', estimateId)
        .single();
      if (estErr) throw estErr;

      const { data: lineItems } = await ottopay
        .from('estimate_line_items')
        .select('*')
        .eq('estimate_id', estimateId)
        .order('sort_order');

      // Generate invoice number
      const { data: existing } = await ottopay
        .from('invoices')
        .select('invoice_number')
        .eq('business_id', OTTO_BUSINESS_ID)
        .order('created_at', { ascending: false })
        .limit(1);

      const year = new Date().getFullYear();
      let nextNum = 1;
      if (existing && existing.length > 0) {
        const match = existing[0].invoice_number?.match(/(\d+)$/);
        if (match) nextNum = parseInt(match[1]) + 1;
      }
      const invoice_number = `INV-${year}-${String(nextNum).padStart(4, '0')}`;

      // Create invoice
      const { data: invoice, error: invErr } = await ottopay
        .from('invoices')
        .insert({
          business_id: OTTO_BUSINESS_ID,
          customer_id: est.customer_id,
          invoice_number,
          invoice_date: new Date().toISOString().split('T')[0],
          due_date: null,
          subtotal: est.subtotal,
          tax_rate: est.tax_rate,
          tax_amount: est.tax_amount,
          total: est.total,
          total_paid: 0,
          notes: est.notes,
          terms: est.terms,
          status: 'draft',
        })
        .select()
        .single();
      if (invErr) throw invErr;

      // Copy line items
      if (lineItems && lineItems.length > 0) {
        await ottopay.from('invoice_line_items').insert(
          lineItems.map((li: any) => ({
            invoice_id: invoice.id,
            description: li.description,
            quantity: li.quantity,
            unit_price: li.unit_price,
            line_total: li.line_total,
            sort_order: li.sort_order,
          }))
        );
      }

      // Update estimate status
      await ottopay
        .from('estimates')
        .update({ status: 'converted', converted_invoice_id: invoice.id })
        .eq('id', estimateId);

      return invoice;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['otto-estimates'] });
      qc.invalidateQueries({ queryKey: ['otto-invoices'] });
      qc.invalidateQueries({ queryKey: ['otto-metrics'] });
    },
  });
};

export const useOttoEstimateLineItems = (estimateId: string | null) =>
  useQuery({
    queryKey: ['otto-estimate-line-items', estimateId],
    queryFn: async () => {
      if (!estimateId) return [];
      const { data, error } = await ottopay
        .from('estimate_line_items')
        .select('*')
        .eq('estimate_id', estimateId)
        .order('sort_order');
      if (error) throw error;
      return data;
    },
    enabled: !!estimateId,
  });

// ─── Payments ────────────────────────────────────────────────
export const useOttoPayments = () =>
  useQuery({
    queryKey: ['otto-payments'],
    queryFn: async () => {
      const { data, error } = await ottopay
        .from('payment_history')
        .select(`*, invoices(invoice_number, total, customer_id, customers(name))`)
        .order('payment_date', { ascending: false })
        .limit(500);
      if (error) throw error;
      return data;
    },
  });

// ─── Customers ───────────────────────────────────────────────
export const useOttoCustomers = () =>
  useQuery({
    queryKey: ['otto-customers'],
    queryFn: async () => {
      const { data, error } = await ottopay
        .from('customers')
        .select('*')
        .eq('business_id', OTTO_BUSINESS_ID)
        .order('name');
      if (error) throw error;
      return data;
    },
  });

export const useCreateOttoCustomer = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<OttoCustomer>) => {
      const { data, error } = await ottopay
        .from('customers')
        .insert({ ...payload, business_id: OTTO_BUSINESS_ID })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['otto-customers'] });
    },
  });
};

export const useUpdateOttoCustomer = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: Partial<OttoCustomer> & { id: string }) => {
      const { data, error } = await ottopay
        .from('customers')
        .update(payload)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['otto-customers'] });
    },
  });
};

// ─── Metrics ─────────────────────────────────────────────────
export const useOttoMetrics = () =>
  useQuery({
    queryKey: ['otto-metrics'],
    queryFn: async () => {
      const { data: invoices, error } = await ottopay
        .from('invoices')
        .select('status, total, total_paid, created_at')
        .eq('business_id', OTTO_BUSINESS_ID);
      if (error) throw error;

      const totalRevenue = (invoices || [])
        .filter(i => i.status === 'paid')
        .reduce((sum, i) => sum + i.total, 0);

      const outstanding = (invoices || [])
        .filter(i => ['sent', 'partial', 'overdue'].includes(i.status))
        .reduce((sum, i) => sum + (i.total - i.total_paid), 0);

      const overdueCount = (invoices || []).filter(i => i.status === 'overdue').length;

      const thisMonth = (invoices || []).filter(i => {
        const d = new Date(i.created_at);
        const now = new Date();
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      }).length;

      return { totalRevenue, outstanding, overdueCount, thisMonth, invoices };
    },
  });

// ─── Line Items ──────────────────────────────────────────────
export const useOttoLineItems = (invoiceId: string | null) =>
  useQuery({
    queryKey: ['otto-line-items', invoiceId],
    queryFn: async () => {
      if (!invoiceId) return [];
      const { data, error } = await ottopay
        .from('invoice_line_items')
        .select('*')
        .eq('invoice_id', invoiceId)
        .order('sort_order');
      if (error) throw error;
      return data;
    },
    enabled: !!invoiceId,
  });

export const useOttoInvoicePayments = (invoiceId: string | null) =>
  useQuery({
    queryKey: ['otto-invoice-payments', invoiceId],
    queryFn: async () => {
      if (!invoiceId) return [];
      const { data, error } = await ottopay
        .from('payment_history')
        .select('*')
        .eq('invoice_id', invoiceId)
        .order('payment_date', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!invoiceId,
  });

// ─── Templates ───────────────────────────────────────────────
export const useOttoTemplates = () =>
  useQuery({
    queryKey: ['otto-templates'],
    queryFn: async () => {
      const { data, error } = await ottopay
        .from('service_templates')
        .select('*')
        .eq('business_id', OTTO_BUSINESS_ID)
        .order('name');
      if (error) throw error;
      return data;
    },
  });

export const useOttoTemplateLineItems = (templateId: string | null) =>
  useQuery({
    queryKey: ['otto-template-line-items', templateId],
    queryFn: async () => {
      if (!templateId) return [];
      const { data, error } = await ottopay
        .from('template_line_items')
        .select('*')
        .eq('template_id', templateId)
        .order('sort_order');
      if (error) throw error;
      return data;
    },
    enabled: !!templateId,
  });

// ─── Catalog ─────────────────────────────────────────────────
export const useOttoMaterials = () =>
  useQuery({
    queryKey: ['otto-materials'],
    queryFn: async () => {
      const { data, error } = await ottopay
        .from('materials')
        .select('*')
        .eq('business_id', OTTO_BUSINESS_ID)
        .order('name');
      if (error) throw error;
      return data;
    },
  });

export const useOttoEquipmentCatalog = () =>
  useQuery({
    queryKey: ['otto-equipment-catalog'],
    queryFn: async () => {
      const { data, error } = await ottopay
        .from('equipment_catalog')
        .select('*')
        .eq('business_id', OTTO_BUSINESS_ID)
        .order('name');
      if (error) throw error;
      return data;
    },
  });

// ─── Business Settings ──────────────────────────────────────
export const useOttoBusiness = () =>
  useQuery({
    queryKey: ['otto-business'],
    queryFn: async () => {
      const { data, error } = await ottopay
        .from('businesses')
        .select('*')
        .eq('id', OTTO_BUSINESS_ID)
        .single();
      if (error) throw error;
      return data;
    },
  });

export const useUpdateOttoBusiness = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Record<string, any>) => {
      const { data, error } = await ottopay
        .from('businesses')
        .update(payload)
        .eq('id', OTTO_BUSINESS_ID)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['otto-business'] });
    },
  });
};
