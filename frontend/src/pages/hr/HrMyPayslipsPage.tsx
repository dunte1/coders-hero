import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMyPayslips } from '@/hooks/useHr';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageSpinner } from '@/components/ui/Spinner';
import { Card, CardContent } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Wallet, ChevronRight } from 'lucide-react';

const formatKsh = (v: number | string | undefined) =>
  'KSh ' + Number(v ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function HrMyPayslipsPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);

  const { data, isLoading } = useMyPayslips({ page, per_page: 15 });

  const payslips = data?.results || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Payslips"
        description="Your salary slips"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'My HR', href: '/my/hr' }, { label: 'Payslips' }]}
      />

      {isLoading ? (
        <PageSpinner />
      ) : payslips.length === 0 ? (
        <EmptyState icon={Wallet} title="No payslips yet" description="Generated payslips will appear here." />
      ) : (
        <>
          <Card>
            <CardContent className="p-2">
              <div className="divide-y divide-slate-100">
                {payslips.map((payslip) => (
                  <button
                    key={payslip.id}
                    type="button"
                    onClick={() => navigate(`/my/hr/payslips/${payslip.id}`)}
                    className="flex w-full flex-wrap items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                      <Wallet className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-mono text-sm font-semibold text-slate-900">
                        {payslip.payroll?.payroll_no ?? `Payslip #${payslip.id}`}
                      </p>
                      <p className="text-xs text-slate-500">{payslip.payroll?.month}</p>
                    </div>
                    <div className="text-right text-sm">
                      <p className="font-medium text-slate-900">{formatKsh(payslip.net_amount)}</p>
                      <p className="text-xs text-slate-500">Net pay</p>
                    </div>
                    <StatusBadge status={payslip.status} />
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
    </div>
  );
}
