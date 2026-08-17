import { useParams, useNavigate } from 'react-router-dom';
import {
  useHrPayroll,
  useProcessPayroll,
  useMarkPayrollPaid,
  useCancelPayroll,
} from '@/hooks/useHr';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageSpinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Wallet, PlayCircle, CheckCircle2, Ban, ChevronLeft } from 'lucide-react';

const formatKsh = (v: number | string | undefined) =>
  'KSh ' + Number(v ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function HrPayrollDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const payrollId = Number(id);

  const { data: payroll, isLoading } = useHrPayroll(payrollId);
  const processPayroll = useProcessPayroll();
  const markPaid = useMarkPayrollPaid();
  const cancelPayroll = useCancelPayroll();

  if (isLoading) return <PageSpinner />;

  if (!payroll) {
    return (
      <EmptyState
        title="Payroll not found"
        action={{ label: 'Back to payroll', onClick: () => navigate('/hr/payrolls') }}
      />
    );
  }

  const payslips = payroll.payslips || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title={payroll.payroll_no}
        description={`Payroll for ${payroll.month}`}
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'HR', href: '/hr' },
          { label: 'Payroll', href: '/hr/payrolls' },
          { label: payroll.payroll_no },
        ]}
        actions={
          <>
            {payroll.status === 'draft' && (
              <>
                <Button variant="outline" onClick={() => cancelPayroll.mutate(payrollId)}>
                  <Ban className="mr-1 h-4 w-4" /> Cancel
                </Button>
                <Button onClick={() => processPayroll.mutate(payrollId)}>
                  <PlayCircle className="mr-1 h-4 w-4" /> Process Payroll
                </Button>
              </>
            )}
            {(payroll.status === 'draft' || payroll.status === 'processed') && (
              <Button variant="success" onClick={() => markPaid.mutate({ id: payrollId })}>
                <CheckCircle2 className="mr-1 h-4 w-4" /> Mark Paid
              </Button>
            )}
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-slate-500">Gross</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{formatKsh(payroll.gross_total)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-slate-500">Deductions</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{formatKsh(payroll.deductions_total)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-slate-500">Net</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{formatKsh(payroll.net_total)}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-base">Payslips ({payslips.length})</CardTitle>
          <StatusBadge status={payroll.status} />
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400">
                  <th className="px-4 py-3">Employee</th>
                  <th className="px-4 py-3">Gross</th>
                  <th className="px-4 py-3">Deductions</th>
                  <th className="px-4 py-3">Net</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payslips.map((payslip) => (
                  <tr key={payslip.id}>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-900">
                        {payslip.employee?.user?.name ?? 'Unknown employee'}
                      </p>
                      <p className="text-xs text-slate-500">{payslip.employee?.employee_id}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{formatKsh(payslip.gross_amount)}</td>
                    <td className="px-4 py-3 text-slate-700">{formatKsh(payslip.deductions_amount)}</td>
                    <td className="px-4 py-3 font-medium text-slate-900">{formatKsh(payslip.net_amount)}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={payslip.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Button variant="outline" onClick={() => navigate('/hr/payrolls')}>
        <ChevronLeft className="mr-1 h-4 w-4" /> Back to Payroll
      </Button>
    </div>
  );
}
