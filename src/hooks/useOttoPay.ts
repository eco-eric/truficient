import { useQuery } from '@tanstack/react-query';
import { ottopay } from '@/integrations/ottopay/client';

const OTTO_BUSINESS_ID = import.meta.env.VITE_OTTOPAY_BUSINESS_ID;

export const useOttoInvoices = () =>
  useQuery({
    queryKey: ['otto-invoices'],
    queryFn: async () => {
      const { data, error } = await ottopay
        .from('invoices')
        .select(`*, customers(name, email, phone)`)
        .eq('business_id', OTTO_BUSINESS_ID)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

export const useOttoPayments = () =>
  useQuery({
    queryKey: ['otto-payments'],
    queryFn: async () => {
      const { data, error } = await ottopay
        .from('payment_history')
        .select(`*, invoices(invoice_number, total, customers(name))`)
        .order('payment_date', { ascending: false })
        .limit(100);
      if (error) throw error;
      return data;
    },
  });

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
