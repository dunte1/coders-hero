import api from '@/lib/axios';
import type { Page, PaginationMeta } from '@/types/cms';
import type {
  Budget,
  BudgetInput,
  CollectionsRow,
  Expense,
  ExpenseByCategory,
  ExpenseInput,
  FeeStructure,
  FeeStructureInput,
  FinanceSummary,
  Invoice,
  InvoiceInput,
  MpesaStkPushInput,
  MpesaTransaction,
  OutstandingRow,
  OutstandingSummary,
  Payment,
  RecordPaymentInput,
  TransactionRow,
} from '@/types/finance';

const unwrap = <T>(res: { data: { data: T } }): T => res.data.data;

const unwrapPage = <T>(res: { data: { data: T[]; meta: PaginationMeta } }): Page<T> => ({
  results: res.data.data,
  meta: res.data.meta,
});

async function downloadPdf(url: string): Promise<void> {
  const res = await api.get<Blob>(url, { responseType: 'blob' });
  const disposition = res.headers['content-disposition'] ?? '';
  const match = disposition.match(/filename="?([^"]+)"?/);
  const filename = match ? match[1] : url.split('/').pop() ?? 'document.pdf';
  const blobUrl = window.URL.createObjectURL(res.data);
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(blobUrl);
}

export const financeApi = {
  // Summary / reports
  summary: () => api.get<{ data: FinanceSummary }>('/finance/summary').then(unwrap<FinanceSummary>),

  collections: (params?: { page?: number; per_page?: number; from?: string; to?: string; method?: string; search?: string }) =>
    api.get<{ data: CollectionsRow[]; meta: PaginationMeta }>('/finance/collections', { params }).then(unwrapPage<CollectionsRow>),

  outstanding: (params?: { page?: number; per_page?: number; grade?: string; search?: string }) =>
    api.get<{ data: OutstandingRow[]; meta: PaginationMeta }>('/finance/outstanding', { params }).then(unwrapPage<OutstandingRow>),

  expensesByCategory: (fiscalYear?: number) =>
    api.get<{ data: ExpenseByCategory[] }>('/finance/expenses-by-category', { params: fiscalYear ? { fiscal_year: fiscalYear } : undefined }).then(unwrap<ExpenseByCategory[]>),

  transactions: (params?: { page?: number; per_page?: number }) =>
    api.get<{ data: TransactionRow[]; meta: PaginationMeta }>('/finance/transactions', { params }).then(unwrapPage<TransactionRow>),

  myOutstanding: () =>
    api.get<{ data: OutstandingSummary[] }>('/my-outstanding').then(unwrap<OutstandingSummary[]>),

  myInvoices: () =>
    api.get<{ data: Invoice[] }>('/invoices/mine').then(unwrap<Invoice[]>),

  // Fee structures
  feeStructures: (params?: { page?: number; per_page?: number; fee_type?: string; is_active?: string; search?: string }) =>
    api.get<{ data: FeeStructure[]; meta: PaginationMeta }>('/finance/fee-structures', { params }).then(unwrapPage<FeeStructure>),

  feeStructure: (id: number) =>
    api.get<{ data: FeeStructure }>(`/finance/fee-structures/${id}`).then(unwrap<FeeStructure>),

  createFeeStructure: (data: FeeStructureInput) =>
    api.post<{ data: FeeStructure }>('/finance/fee-structures', data).then(unwrap<FeeStructure>),

  updateFeeStructure: (id: number, data: Partial<FeeStructureInput>) =>
    api.put<{ data: FeeStructure }>(`/finance/fee-structures/${id}`, data).then(unwrap<FeeStructure>),

  deleteFeeStructure: (id: number) =>
    api.delete<{ data: null }>(`/finance/fee-structures/${id}`).then(() => undefined),

  // Invoices
  invoices: (params?: { page?: number; per_page?: number; student_id?: number; status?: string; term?: string; search?: string }) =>
    api.get<{ data: Invoice[]; meta: PaginationMeta }>('/finance/invoices', { params }).then(unwrapPage<Invoice>),

  invoice: (id: number) =>
    api.get<{ data: Invoice }>(`/finance/invoices/${id}`).then(unwrap<Invoice>),

  invoicePdf: (id: number) => downloadPdf(`/finance/invoices/${id}/pdf`),

  paymentPdf: (id: number) => downloadPdf(`/finance/payments/${id}/pdf`),

  createInvoice: (data: InvoiceInput) =>
    api.post<{ data: Invoice }>('/finance/invoices', data).then(unwrap<Invoice>),

  updateInvoice: (id: number, data: Partial<InvoiceInput>) =>
    api.put<{ data: Invoice }>(`/finance/invoices/${id}`, data).then(unwrap<Invoice>),

  deleteInvoice: (id: number) =>
    api.delete<{ data: null }>(`/finance/invoices/${id}`).then(() => undefined),

  generateInvoices: (data: { fee_structure_id: number; grade_level?: string | null }) =>
    api.post<{ data: { created: number } }>('/finance/invoices/generate', data).then(unwrap<{ created: number }>),

  issueInvoice: (id: number) =>
    api.put<{ data: Invoice }>(`/finance/invoices/${id}/issue`).then(unwrap<Invoice>),

  voidInvoice: (id: number) =>
    api.put<{ data: Invoice }>(`/finance/invoices/${id}/void`).then(unwrap<Invoice>),

  recordPayment: (id: number, data: RecordPaymentInput) =>
    api.post<{ data: Payment }>(`/finance/invoices/${id}/pay`, data).then(unwrap<Payment>),

  // Payments / receipts
  payments: (params?: { page?: number; per_page?: number; method?: string; from?: string; to?: string; search?: string; invoice_id?: number }) =>
    api.get<{ data: Payment[]; meta: PaginationMeta }>('/finance/payments', { params }).then(unwrapPage<Payment>),

  payment: (id: number) =>
    api.get<{ data: Payment }>(`/finance/payments/${id}`).then(unwrap<Payment>),

  reversePayment: (id: number) =>
    api.put<{ data: null }>(`/finance/payments/${id}/reverse`).then(() => undefined),

  // Expenses
  expenses: (params?: { page?: number; per_page?: number; category?: string; from?: string; to?: string; search?: string }) =>
    api.get<{ data: Expense[]; meta: PaginationMeta }>('/finance/expenses', { params }).then(unwrapPage<Expense>),

  expense: (id: number) =>
    api.get<{ data: Expense }>(`/finance/expenses/${id}`).then(unwrap<Expense>),

  createExpense: (data: ExpenseInput) =>
    api.post<{ data: Expense }>('/finance/expenses', data).then(unwrap<Expense>),

  updateExpense: (id: number, data: Partial<ExpenseInput>) =>
    api.put<{ data: Expense }>(`/finance/expenses/${id}`, data).then(unwrap<Expense>),

  deleteExpense: (id: number) =>
    api.delete<{ data: null }>(`/finance/expenses/${id}`).then(() => undefined),

  // Budgets
  budgets: (params?: { page?: number; per_page?: number; fiscal_year?: number }) =>
    api.get<{ data: Budget[]; meta: PaginationMeta }>('/finance/budgets', { params }).then(unwrapPage<Budget>),

  budget: (id: number) =>
    api.get<{ data: Budget }>(`/finance/budgets/${id}`).then(unwrap<Budget>),

  createBudget: (data: BudgetInput) =>
    api.post<{ data: Budget }>('/finance/budgets', data).then(unwrap<Budget>),

  updateBudget: (id: number, data: Partial<BudgetInput>) =>
    api.put<{ data: Budget }>(`/finance/budgets/${id}`, data).then(unwrap<Budget>),

  deleteBudget: (id: number) =>
    api.delete<{ data: null }>(`/finance/budgets/${id}`).then(() => undefined),

  // M-Pesa
  stkPush: (data: MpesaStkPushInput) =>
    api.post<{ data: MpesaTransaction }>('/mpesa/stk-push', data).then(unwrap<MpesaTransaction>),

  mpesaTransactions: (params?: { page?: number; per_page?: number; status?: string; search?: string }) =>
    api.get<{ data: MpesaTransaction[]; meta: PaginationMeta }>('/finance/mpesa/transactions', { params }).then(unwrapPage<MpesaTransaction>),

  mpesaTransaction: (id: number) =>
    api.get<{ data: MpesaTransaction }>(`/finance/mpesa/transactions/${id}`).then(unwrap<MpesaTransaction>),
};

export { getErrorMessage } from '@/lib/studentsApi';
