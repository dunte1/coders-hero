import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { financeApi, getErrorMessage } from '@/lib/financeApi';
import type {
  BudgetInput,
  ExpenseInput,
  FeeStructureInput,
  InvoiceInput,
  MpesaStkPushInput,
  RecordPaymentInput,
} from '@/types/finance';

// Summary / reports
export function useFinanceSummary() {
  return useQuery({ queryKey: ['finance', 'summary'], queryFn: () => financeApi.summary() });
}

export function useFinanceCollections(params?: { page?: number; from?: string; to?: string; method?: string; search?: string }) {
  return useQuery({ queryKey: ['finance', 'collections', params], queryFn: () => financeApi.collections(params) });
}

export function useOutstandingBalances(params?: { page?: number; grade?: string; search?: string }) {
  return useQuery({ queryKey: ['finance', 'outstanding', params], queryFn: () => financeApi.outstanding(params) });
}

export function useExpensesByCategory(fiscalYear?: number) {
  return useQuery({
    queryKey: ['finance', 'expenses-by-category', fiscalYear ?? 'current'],
    queryFn: () => financeApi.expensesByCategory(fiscalYear),
  });
}

export function useFinanceTransactions(params?: { page?: number }) {
  return useQuery({ queryKey: ['finance', 'transactions', params], queryFn: () => financeApi.transactions(params) });
}

export function useMyOutstanding() {
  return useQuery({ queryKey: ['finance', 'my-outstanding'], queryFn: () => financeApi.myOutstanding() });
}

export function useMyInvoices() {
  return useQuery({ queryKey: ['finance', 'my-invoices'], queryFn: () => financeApi.myInvoices() });
}

// Fee structures
export function useFeeStructures(params?: { page?: number; per_page?: number; fee_type?: string; is_active?: string; search?: string }) {
  return useQuery({ queryKey: ['finance', 'fee-structures', params], queryFn: () => financeApi.feeStructures(params) });
}

export function useCreateFeeStructure() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: FeeStructureInput) => financeApi.createFeeStructure(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'fee-structures'] });
      toast.success('Fee structure created');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useUpdateFeeStructure() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<FeeStructureInput> }) => financeApi.updateFeeStructure(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'fee-structures'] });
      toast.success('Fee structure updated');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useDeleteFeeStructure() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => financeApi.deleteFeeStructure(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'fee-structures'] });
      toast.success('Fee structure deleted');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

// Invoices
export function useInvoices(params?: { page?: number; status?: string; student_id?: number; search?: string }) {
  return useQuery({ queryKey: ['finance', 'invoices', params], queryFn: () => financeApi.invoices(params) });
}

export function useInvoice(id: number) {
  return useQuery({ queryKey: ['finance', 'invoices', 'item', id], queryFn: () => financeApi.invoice(id), enabled: !!id });
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: InvoiceInput) => financeApi.createInvoice(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'invoices'] });
      queryClient.invalidateQueries({ queryKey: ['finance', 'summary'] });
      toast.success('Invoice created');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useUpdateInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<InvoiceInput> }) => financeApi.updateInvoice(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'invoices'] });
      toast.success('Invoice updated');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useDeleteInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => financeApi.deleteInvoice(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'invoices'] });
      toast.success('Invoice deleted');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useGenerateInvoices() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { fee_structure_id: number; grade_level?: string | null }) => financeApi.generateInvoices(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'invoices'] });
      queryClient.invalidateQueries({ queryKey: ['finance', 'summary'] });
      toast.success(`${data.created} invoice(s) generated`);
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useIssueInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => financeApi.issueInvoice(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'invoices'] });
      toast.success('Invoice issued');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useVoidInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => financeApi.voidInvoice(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'invoices'] });
      queryClient.invalidateQueries({ queryKey: ['finance', 'summary'] });
      toast.success('Invoice voided');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useRecordPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: RecordPaymentInput }) => financeApi.recordPayment(id, data),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'invoices', 'item', id] });
      queryClient.invalidateQueries({ queryKey: ['finance', 'invoices'] });
      queryClient.invalidateQueries({ queryKey: ['finance', 'payments'] });
      queryClient.invalidateQueries({ queryKey: ['finance', 'summary'] });
      toast.success('Payment recorded');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

// Payments
export function usePayments(params?: { page?: number; method?: string; from?: string; to?: string; search?: string }) {
  return useQuery({ queryKey: ['finance', 'payments', params], queryFn: () => financeApi.payments(params) });
}

export function usePayment(id: number) {
  return useQuery({ queryKey: ['finance', 'payments', 'item', id], queryFn: () => financeApi.payment(id), enabled: !!id });
}

export function useReversePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => financeApi.reversePayment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'payments'] });
      queryClient.invalidateQueries({ queryKey: ['finance', 'invoices'] });
      queryClient.invalidateQueries({ queryKey: ['finance', 'summary'] });
      toast.success('Payment reversed');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

// Expenses
export function useExpenses(params?: { page?: number; category?: string; from?: string; to?: string; search?: string }) {
  return useQuery({ queryKey: ['finance', 'expenses', params], queryFn: () => financeApi.expenses(params) });
}

export function useCreateExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ExpenseInput) => financeApi.createExpense(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'expenses'] });
      queryClient.invalidateQueries({ queryKey: ['finance', 'summary'] });
      toast.success('Expense recorded');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useUpdateExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<ExpenseInput> }) => financeApi.updateExpense(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'expenses'] });
      toast.success('Expense updated');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useDeleteExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => financeApi.deleteExpense(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'expenses'] });
      toast.success('Expense deleted');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

// Budgets
export function useBudgets(params?: { page?: number; fiscal_year?: number }) {
  return useQuery({ queryKey: ['finance', 'budgets', params], queryFn: () => financeApi.budgets(params) });
}

export function useCreateBudget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: BudgetInput) => financeApi.createBudget(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'budgets'] });
      queryClient.invalidateQueries({ queryKey: ['finance', 'summary'] });
      toast.success('Budget created');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useUpdateBudget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<BudgetInput> }) => financeApi.updateBudget(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'budgets'] });
      toast.success('Budget updated');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useDeleteBudget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => financeApi.deleteBudget(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'budgets'] });
      toast.success('Budget deleted');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

// M-Pesa
export function useStkPush() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: MpesaStkPushInput) => financeApi.stkPush(data),
    onSuccess: (txn) => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'mpesa'] });
      toast.success(`STK push sent. Check ${txn.phone_number ?? 'your phone'} for the prompt.`);
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useMpesaTransactions(params?: { page?: number; status?: string; search?: string }) {
  return useQuery({ queryKey: ['finance', 'mpesa', params], queryFn: () => financeApi.mpesaTransactions(params) });
}

export function useMpesaTransaction(id: number) {
  return useQuery({ queryKey: ['finance', 'mpesa', 'item', id], queryFn: () => financeApi.mpesaTransaction(id), enabled: !!id });
}

// Stripe
export function useStripeCheckout() {
  return useMutation({
    mutationFn: (invoiceId: number) => financeApi.stripeCheckout(invoiceId),
    onSuccess: (result) => {
      window.location.href = result.url;
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useStripeStatus(sessionId: string | null) {
  return useQuery({
    queryKey: ['finance', 'stripe-status', sessionId],
    queryFn: () => financeApi.stripeStatus(sessionId!),
    enabled: !!sessionId,
  });
}
