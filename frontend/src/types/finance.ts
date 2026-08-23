export type FeeType = 'tuition' | 'lunch' | 'transport' | 'exam' | 'uniform' | 'activity' | 'other';

export type PaymentMethod = 'cash' | 'card' | 'bank_transfer' | 'online' | 'mpesa';

export type InvoiceStatus = 'draft' | 'issued' | 'partial' | 'paid' | 'overdue' | 'void';

export type MpesaStatus = 'pending' | 'completed' | 'failed';

export interface FeeStructure {
  id: number;
  name: string;
  fee_type: FeeType;
  amount: number | string;
  term: string | null;
  grade_level: string | null;
  description: string | null;
  is_active: boolean;
  created_by_user_id: string | null;
  created_by?: { id: string; name: string } | null;
  invoices_count?: number;
  created_at?: string;
}

export interface FeeStructureInput {
  name: string;
  fee_type: FeeType;
  amount: number;
  term?: string | null;
  grade_level?: string | null;
  description?: string | null;
  is_active?: boolean;
}

export interface InvoiceItem {
  id: number;
  invoice_id: number;
  description: string;
  amount: number | string;
  qty: number;
  total: number | string;
}

export interface InvoiceItemInput {
  description: string;
  amount: number;
  qty?: number;
}

export interface Invoice {
  id: number;
  invoice_no: string;
  student_id: number;
  fee_structure_id: number | null;
  term: string | null;
  description: string | null;
  amount: number | string;
  paid_amount: number | string;
  balance: number | string;
  is_overdue: boolean;
  status: InvoiceStatus;
  due_date: string | null;
  issued_at: string | null;
  created_by_user_id: string | null;
  created_by?: { id: string; name: string } | null;
  student?: { id: number; student_id: string; full_name: string; grade: string | null } | null;
  fee_structure?: { id: number; name: string } | null;
  items?: InvoiceItem[] | null;
  items_count?: number;
  payments?: Payment[] | null;
  created_at?: string;
}

export interface InvoiceInput {
  student_id: number;
  fee_structure_id?: number | null;
  term?: string | null;
  description?: string | null;
  amount?: number | null;
  due_date?: string | null;
  status?: 'draft' | 'issued';
  items?: InvoiceItemInput[];
}

export interface Payment {
  id: number;
  fee_id: number | null;
  invoice_id: number | null;
  receipt_no: string;
  amount: number | string;
  method: PaymentMethod;
  reference: string | null;
  paid_at: string;
  paid_by_user_id: string | null;
  paid_by?: { id: string; name: string } | null;
  invoice?: { id: number; invoice_no: string; student?: { full_name: string; student_id: string } | null } | null;
  fee?: { id: number; label: string; student?: { full_name: string } | null } | null;
  mpesa_transaction?: { id: number; mpesa_receipt_number: string | null; status: string } | null;
  created_at?: string;
}

export interface RecordPaymentInput {
  amount: number;
  method: PaymentMethod;
  reference?: string | null;
  paid_at?: string | null;
}

export interface Expense {
  id: number;
  title: string;
  category: string;
  amount: number | string;
  expense_date: string;
  receipt_ref: string | null;
  notes: string | null;
  approval_status?: 'pending' | 'approved' | 'rejected';
  approved_by?: { id: string; name: string } | null;
  approved_at?: string | null;
  rejection_reason?: string | null;
  recorded_by_user_id: string | null;
  recorded_by?: { id: string; name: string } | null;
  created_at?: string;
}

export interface ExpenseInput {
  title: string;
  category: string;
  amount: number;
  expense_date: string;
  receipt_ref?: string | null;
  notes?: string | null;
}

export interface Budget {
  id: number;
  category: string;
  allocated_amount: number | string;
  spent_amount: number | string;
  remaining_amount: number | string;
  fiscal_year: number;
  period: string | null;
  created_at?: string;
}

export interface BudgetInput {
  category: string;
  allocated_amount: number;
  fiscal_year: number;
  period?: string | null;
}

export interface FinanceSummary {
  total_invoiced: number;
  total_collected: number;
  outstanding: number;
  collections_rate: number;
  total_expenses: number;
  budget_allocated: number;
  budget_spent: number;
  budget_utilization: number;
  invoice_counts: Partial<Record<InvoiceStatus, number>>;
}

export interface OutstandingRow {
  student: { id: number; student_id: string; full_name: string; grade: string | null };
  open_invoices: number;
  invoiced: number;
  paid: number;
  balance: number;
}

export interface OutstandingSummary {
  student_id: number;
  student_code: string | null;
  full_name: string | null;
  grade: string | null;
  open_invoices: number;
  invoiced: number;
  paid: number;
  balance: number;
}

export interface CollectionsRow {
  id: number;
  receipt_no: string;
  amount: number | string;
  method: PaymentMethod;
  reference: string | null;
  paid_at: string;
  student: string | null;
  invoice_no: string | null;
}

export interface ExpenseByCategory {
  category: string;
  allocated: number;
  spent: number;
  remaining: number;
  utilization: number;
}

export interface TransactionRow {
  id: number;
  type: 'payment' | 'expense';
  date: string | null;
  reference: string | null;
  amount: number;
  direction: 'in' | 'out';
  method: PaymentMethod | null;
  description: string | null;
}

export interface MpesaTransaction {
  id: number;
  merchant_request_id: string;
  checkout_request_id: string;
  result_code: number | null;
  result_desc: string | null;
  amount: number | string;
  mpesa_receipt_number: string | null;
  phone_number: string | null;
  transaction_date: string | null;
  fee_id: number | null;
  invoice_id: number | null;
  payment_id: number | null;
  user_id: string | null;
  status: MpesaStatus;
  reconciled_at: string | null;
  invoice?: { id: number; invoice_no: string; student?: { full_name: string } | null } | null;
  fee?: { id: number; label: string; student?: { full_name: string } | null } | null;
  payment?: { id: number; receipt_no: string } | null;
  created_at?: string;
}

export interface MpesaStkPushInput {
  invoice_id?: number | null;
  fee_id?: number | null;
  phone: string;
}
