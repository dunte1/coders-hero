import { useState } from 'react';
import { useBudgets, useCreateBudget, useUpdateBudget, useDeleteBudget } from '@/hooks/useFinance';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageSpinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import { Progress } from '@/components/ui/Progress';
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
import { Plus, Pencil, Trash2, Landmark } from 'lucide-react';
import type { Budget, BudgetInput } from '@/types/finance';

const emptyForm: BudgetInput = {
  category: '',
  allocated_amount: 0,
  fiscal_year: new Date().getFullYear(),
  period: 'Annual',
};

const formatKsh = (v: number | string | undefined) =>
  'KSh ' + Number(v ?? 0).toLocaleString();

export default function BudgetsPage() {
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Budget | null>(null);
  const [form, setForm] = useState<BudgetInput>(emptyForm);

  const { data, isLoading } = useBudgets({ page });
  const createBudget = useCreateBudget();
  const updateBudget = useUpdateBudget();
  const deleteBudget = useDeleteBudget();

  const budgets = data?.results || [];

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (budget: Budget) => {
    setEditing(budget);
    setForm({
      category: budget.category,
      allocated_amount: Number(budget.allocated_amount),
      fiscal_year: budget.fiscal_year,
      period: budget.period,
    });
    setDialogOpen(true);
  };

  const submit = () => {
    if (editing) {
      updateBudget.mutate({ id: editing.id, data: form }, { onSuccess: () => setDialogOpen(false) });
    } else {
      createBudget.mutate(form, { onSuccess: () => setDialogOpen(false) });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Budgets"
        description="Allocations by category and fiscal year"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Finance', href: '/finance' }, { label: 'Budgets' }]}
        actions={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4 mr-1" /> New Budget
          </Button>
        }
      />

      {isLoading ? (
        <PageSpinner />
      ) : budgets.length === 0 ? (
        <EmptyState icon={Landmark} title="No budgets found" description="Create a budget to track spending by category." />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {budgets.map((budget) => {
              const spent = Number(budget.spent_amount);
              const allocated = Number(budget.allocated_amount);
              const utilization = allocated > 0 ? Math.min(100, Math.round((spent / allocated) * 100)) : 0;

              return (
                <Card key={budget.id}>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                        <Landmark className="h-5 w-5" />
                      </div>
                      <div className="flex gap-1">
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => openEdit(budget)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" className="h-8 w-8 text-red-600 hover:bg-red-50" onClick={() => deleteBudget.mutate(budget.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <h3 className="mt-3 font-semibold text-slate-900">{budget.category}</h3>
                    <p className="text-xs text-slate-500">FY {budget.fiscal_year}{budget.period ? ` · ${budget.period}` : ''}</p>
                    <div className="mt-3 flex items-center justify-between text-sm">
                      <span className="text-slate-500">Spent {formatKsh(spent)}</span>
                      <span className="font-semibold text-slate-900">of {formatKsh(allocated)}</span>
                    </div>
                    <Progress value={utilization} className="mt-2" />
                    <p className="mt-2 text-xs text-slate-500">{utilization}% utilized</p>
                  </CardContent>
                </Card>
              );
            })}
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
            <DialogTitle>{editing ? 'Edit Budget' : 'New Budget'}</DialogTitle>
            <DialogDescription>Set an annual allocation for a spending category.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Category</Label>
              <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="e.g. Utilities" />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label>Allocated Amount (KSh)</Label>
                <Input type="number" min={0} step="0.01" value={form.allocated_amount} onChange={(e) => setForm({ ...form, allocated_amount: Number(e.target.value) })} />
              </div>
              <div>
                <Label>Fiscal Year</Label>
                <Input type="number" min={2000} max={2100} value={form.fiscal_year} onChange={(e) => setForm({ ...form, fiscal_year: Number(e.target.value) })} />
              </div>
            </div>
            <div>
              <Label>Period</Label>
              <Input value={form.period ?? ''} onChange={(e) => setForm({ ...form, period: e.target.value || null })} placeholder="e.g. Annual" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={submit} loading={createBudget.isPending || updateBudget.isPending}>
              {editing ? 'Save Changes' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>
    </div>
  );
}
