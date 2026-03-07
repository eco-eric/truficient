export interface OttoInvoice {
  id: string;
  business_id: string;
  customer_id: string;
  invoice_number: string;
  invoice_date: string;
  due_date: string | null;
  status: 'draft' | 'sent' | 'paid' | 'partial' | 'overdue';
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total: number;
  total_paid: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface OttoCustomer {
  id: string;
  business_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  created_at: string;
  updated_at: string;
}

export interface OttoPayment {
  id: string;
  invoice_id: string;
  amount: number;
  payment_method: string;
  payment_date: string;
  transaction_id: string | null;
  notes: string | null;
  created_at: string;
}

export interface OttoLineItem {
  id: string;
  invoice_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  line_total: number;
  sort_order: number;
}

export interface OttoBusiness {
  id: string;
  user_id: string;
  name: string;
  owner_name: string;
  email: string | null;
  phone: string | null;
  default_tax_rate: number;
  stripe_account_id: string | null;
  stripe_onboarding_complete: boolean;
}
