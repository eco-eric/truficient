import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ottopay } from '@/integrations/ottopay/client';

const OTTO_BUSINESS_ID = import.meta.env.VITE_OTTOPAY_BUSINESS_ID;

export interface OttoExpense {
  id: string;
  business_id: string;
  category: string;
  amount: number;
  expense_date: string;
  vendor: string | null;
  notes: string | null;
  receipt_url: string | null;
  created_at: string;
  updated_at: string;
}

export const useOttoExpenses = () =>
  useQuery({
    queryKey: ['otto-expenses'],
    queryFn: async () => {
      const { data, error } = await ottopay
        .from('expenses')
        .select('*')
        .eq('business_id', OTTO_BUSINESS_ID)
        .order('expense_date', { ascending: false });
      if (error) throw error;
      return data as OttoExpense[];
    },
  });

export const useCreateOttoExpense = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      category: string;
      amount: number;
      expense_date: string;
      vendor?: string;
      notes?: string;
      receipt_url?: string;
    }) => {
      const { data, error } = await ottopay
        .from('expenses')
        .insert({
          ...payload,
          business_id: OTTO_BUSINESS_ID,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['otto-expenses'] });
    },
  });
};

export const useDeleteOttoExpense = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await ottopay
        .from('expenses')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['otto-expenses'] });
    },
  });
};

export const uploadExpenseReceipt = async (file: File): Promise<string> => {
  const ext = file.name.split('.').pop();
  const path = `${OTTO_BUSINESS_ID}/${crypto.randomUUID()}.${ext}`;
  const { error } = await ottopay.storage
    .from('expense-receipts')
    .upload(path, file, { contentType: file.type });
  if (error) throw error;
  const { data } = ottopay.storage
    .from('expense-receipts')
    .getPublicUrl(path);
  return data.publicUrl;
};
