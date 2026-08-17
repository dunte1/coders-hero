import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMyPayslip } from '@/hooks/useHr';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageSpinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Wallet, ChevronLeft, Download } from 'lucide-react';
import { hrApi } from '@/lib/hrApi';
import { getErrorMessage } from '@/lib/studentsApi';
import { toast } from 'sonner';

const formatKsh = (v: number | string | undefined) =>
  'KSh ' + Number(v ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function Breakdown({ title, data }: { title: string; data: Record<string, number> | null | undefined }) {
  const entries = Object.entries(data ?? {});
  if (entries.length === 0) return null;
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-slate-100">
          {entries.map(([key, value]) => (
            <div key={key} className="flex items-center justify-between px-4 py-2.5 text-sm">
              <span className="text-slate-600">{key.replace(/_/g, ' ')}</span>
              <span className="font-medium text-slate-900">{formatKsh(value)}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function HrMyPayslipDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const payslipId = Number(id);

  const { data: payslip, isLoading } = useMyPayslip(payslipId);
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await hrApi.myPayslipPdf(payslipId);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDownloading(false);
    }
  };

  if (isLoading) return <PageSpinner />;

  if (!payslip) {
    return (
      <EmptyState
        title="Payslip not found"
        action={{ label: 'Back to payslips', onClick: () => navigate('/my/hr/payslips') }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={payslip.payroll?.payroll_no ?? `Payslip #${payslip.id}`}
        description={`Salary slip for ${payslip.payroll?.month ?? 'the month'}`}
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'My HR', href: '/my/hr' },
          { label: 'Payslips', href: '/my/hr/payslips' },
          { label: payslip.payroll?.payroll_no ?? `Payslip #${payslip.id}` },
        ]}
        actions={
          <>
            <Button variant="outline" loading={downloading} onClick={handleDownload}>
              <Download className="mr-1 h-4 w-4" /> Download PDF
            </Button>
            <StatusBadge status={payslip.status} />
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-slate-500">Gross Pay</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{formatKsh(payslip.gross_amount)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-slate-500">Deductions</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{formatKsh(payslip.deductions_amount)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-slate-500">Net Pay</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{formatKsh(payslip.net_amount)}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Breakdown title="Allowances" data={payslip.allowances_breakdown} />
        <Breakdown title="Deductions breakdown" data={payslip.deductions_breakdown} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Details</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-100">
            <div className="flex items-center justify-between px-4 py-2.5 text-sm">
              <span className="text-slate-600">Payroll</span>
              <span className="font-medium text-slate-900">{payslip.payroll?.payroll_no ?? '—'}</span>
            </div>
            <div className="flex items-center justify-between px-4 py-2.5 text-sm">
              <span className="text-slate-600">Month</span>
              <span className="font-medium text-slate-900">{payslip.payroll?.month ?? '—'}</span>
            </div>
            <div className="flex items-center justify-between px-4 py-2.5 text-sm">
              <span className="text-slate-600">Payment method</span>
              <span className="font-medium text-slate-900">
                {payslip.payment_method ? payslip.payment_method.replace(/_/g, ' ') : '—'}
              </span>
            </div>
            <div className="flex items-center justify-between px-4 py-2.5 text-sm">
              <span className="text-slate-600">Paid at</span>
              <span className="font-medium text-slate-900">
                {payslip.paid_at ? new Date(payslip.paid_at).toLocaleDateString() : '—'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button variant="outline" onClick={() => navigate('/my/hr/payslips')}>
        <ChevronLeft className="mr-1 h-4 w-4" /> Back to Payslips
      </Button>
    </div>
  );
}
