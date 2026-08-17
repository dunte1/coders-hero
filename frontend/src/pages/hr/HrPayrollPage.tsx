import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHrPayrolls, useRunPayroll } from '@/hooks/useHr';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageSpinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { StatusBadge } from '@/components/ui/StatusBadge';
import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/Dialog';
import { Wallet, Plus, ChevronRight } from 'lucide-react';

const formatKsh = (v: number | string | undefined) =>
  'KSh ' + Number(v ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function currentMonth(): string {
  return new Date().toISOString().slice(0, 7);
}

export default function HrPayrollPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [runOpen, setRunOpen] = useState(false);
  const [month, setMonth] = useState(currentMonth());

  const { data, isLoading } = useHrPayrolls({ page, per_page: 15 });
  const runPayroll = useRunPayroll();

  const payrolls = data?.results || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payroll"
        description="Run, process and pay monthly salaries"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'HR', href: '/hr' }, { label: 'Payroll' }]}
        actions={
          <Button onClick={() => setRunOpen(true)}>
            <Plus className="mr-1 h-4 w-4" /> Run Payroll
          </Button>
        }
      />

      {isLoading ? (
        <PageSpinner />
      ) : payrolls.length === 0 ? (
        <EmptyState icon={Wallet} title="No payrolls yet" description="Run your first payroll to generate payslips." />
      ) : (
        <>
          <Card>
            <CardContent className="p-2">
              <div className="divide-y divide-slate-100">
                {payrolls.map((payroll) => (
                  <button
                    key={payroll.id}
                    type="button"
                    onClick={() => navigate(`/hr/payrolls/${payroll.id}`)}
                    className="flex w-full flex-wrap items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                      <Wallet className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-mono text-sm font-semibold text-slate-900">{payroll.payroll_no}</p>
                      <p className="text-xs text-slate-500">{payroll.month}</p>
                    </div>
                    <div className="text-right text-sm">
                      <p className="font-medium text-slate-900">{formatKsh(payroll.net_total)}</p>
                      <p className="text-xs text-slate-500">{payroll.employees_count ?? 0} employee(s)</p>
                    </div>
                    <StatusBadge status={payroll.status} />
                    <ChevronRight className="h-4 w-4 text-slate-300" />
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
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

      <DialogRoot open={runOpen} onOpenChange={setRunOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Run Payroll</DialogTitle>
            <DialogDescription>
              Generate payslips for all active employees for the selected month.
            </DialogDescription>
          </DialogHeader>
          <div>
            <Label>Month</Label>
            <Input type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRunOpen(false)}>Cancel</Button>
            <Button
              onClick={() => runPayroll.mutate(month, { onSuccess: () => setRunOpen(false) })}
              loading={runPayroll.isPending}
            >
              Generate Payroll
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>
    </div>
  );
}
