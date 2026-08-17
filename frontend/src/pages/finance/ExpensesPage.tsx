import { useState } from 'react';
import { useExpenses, useCreateExpense, useUpdateExpense, useDeleteExpense } from '@/hooks/useFinance';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageSpinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { SearchInput } from '@/components/ui/SearchInput';
import { Pagination } from '@/components/ui/Pagination';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/Dialog';
import { Plus, Pencil, Trash2, Receipt } from 'lucide-react';
import type { Expense, ExpenseInput } from '@/types/finance';

const emptyForm: ExpenseInput = {
  title: '',
  category: '',
  amount: 0,
  expense_date: new Date().toISOString().slice(0, 10),
  receipt_ref: null,
  notes: null,
};

export default function ExpensesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [form, setForm] = useState<ExpenseInput>(emptyForm);

  const { data, isLoading } = useExpenses({ page, search: search || undefined });
  const createExpense = useCreateExpense();
  const updateExpense = useUpdateExpense();
  const deleteExpense = useDeleteExpense();

  const expenses = data?.results || [];

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (expense: Expense) => {
    setEditing(expense);
    setForm({
      title: expense.title,
      category: expense.category,
      amount: Number(expense.amount),
      expense_date: expense.expense_date?.slice(0, 10) ?? new Date().toISOString().slice(0, 10),
      receipt_ref: expense.receipt_ref,
      notes: expense.notes,
    });
    setDialogOpen(true);
  };

  const submit = () => {
    const payload: ExpenseInput = {
      ...form,
      receipt_ref: form.receipt_ref || null,
      notes: form.notes || null,
    };
    if (editing) {
      updateExpense.mutate({ id: editing.id, data: payload }, { onSuccess: () => setDialogOpen(false) });
    } else {
      createExpense.mutate(payload, { onSuccess: () => setDialogOpen(false) });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Expenses"
        description="School expenditure records"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Finance', href: '/finance' }, { label: 'Expenses' }]}
        actions={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4 mr-1" /> Record Expense
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <SearchInput value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search expenses..." className="w-full sm:w-64" />
      </div>

      {isLoading ? (
        <PageSpinner />
      ) : expenses.length === 0 ? (
        <EmptyState icon={Receipt} title="No expenses recorded" description="Recorded expenses will appear here." />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {expenses.map((expense) => (
              <Card key={expense.id}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                      <Receipt className="h-5 w-5" />
                    </div>
                    <div className="flex gap-1">
                      <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => openEdit(expense)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" className="h-8 w-8 text-red-600 hover:bg-red-50" onClick={() => deleteExpense.mutate(expense.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <h3 className="mt-3 font-semibold text-slate-900">{expense.title}</h3>
                  <p className="mt-1 text-sm text-slate-500">{expense.category}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-lg font-bold text-slate-900">KSh {Number(expense.amount).toLocaleString()}</span>
                    <span className="text-xs text-slate-500">{expense.expense_date}</span>
                  </div>
                  {expense.receipt_ref && <p className="mt-1 text-xs text-slate-400">{expense.receipt_ref}</p>}
                </CardContent>
              </Card>
            ))}
          </div>
          {data?.meta && data.meta.last_page > 1 && (
            <Pagination
              currentPage={data.meta.current_page}
              totalPages={data.meta.last_page}
              onPageChange={setPage}
              totalCount={data.meta.total}
              pageSize={data.meta.per_page}
            />
          )}
        </>
      )}

      <DialogRoot open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Expense' : 'Record Expense'}</DialogTitle>
            <DialogDescription>Capture a school expense against a category.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Electricity bill" />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label>Category</Label>
                <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="e.g. Utilities" />
              </div>
              <div>
                <Label>Amount (KSh)</Label>
                <Input type="number" min={0} step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label>Date</Label>
                <Input type="date" value={form.expense_date} onChange={(e) => setForm({ ...form, expense_date: e.target.value })} />
              </div>
              <div>
                <Label>Receipt Ref</Label>
                <Input value={form.receipt_ref ?? ''} onChange={(e) => setForm({ ...form, receipt_ref: e.target.value || null })} />
              </div>
            </div>
            <div>
              <Label>Notes</Label>
              <Input value={form.notes ?? ''} onChange={(e) => setForm({ ...form, notes: e.target.value || null })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={submit} loading={createExpense.isPending || updateExpense.isPending}>
              {editing ? 'Save Changes' : 'Record'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>
    </div>
  );
}
