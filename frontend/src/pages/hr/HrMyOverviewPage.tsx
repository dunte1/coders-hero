import { useNavigate } from 'react-router-dom';
import { useMyHrSummary } from '@/hooks/useHr';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageSpinner } from '@/components/ui/Spinner';
import { StatsCard } from '@/components/ui/StatsCard';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/Progress';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { CalendarDays, Wallet, ClipboardList, FileText, ArrowRight } from 'lucide-react';

const formatKsh = (v: number | string | undefined) =>
  'KSh ' + Number(v ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const sections = [
  { label: 'My Leave', href: '/my/hr/leaves', icon: CalendarDays, desc: 'Request leave and check your balance' },
  { label: 'My Payslips', href: '/my/hr/payslips', icon: Wallet, desc: 'View salary slips' },
  { label: 'My Attendance', href: '/my/hr/attendance', icon: ClipboardList, desc: 'Review your attendance record' },
  { label: 'My Documents', href: '/my/hr/documents', icon: FileText, desc: 'Upload and download documents' },
];

export default function HrMyOverviewPage() {
  const navigate = useNavigate();
  const { data: summary, isLoading } = useMyHrSummary();

  if (isLoading) return <PageSpinner />;

  const used = summary?.annual_leave_used ?? 0;
  const remaining = summary?.annual_leave_remaining ?? 0;
  const total = used + remaining;
  const progress = total > 0 ? (used / total) * 100 : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="My HR"
        description="Leave, payslips, attendance and documents"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'My HR' }]}
      />

      <div className="flex items-center gap-2">
        <StatusBadge status={summary?.status ?? 'active'} />
        <p className="text-sm text-slate-500">
          {summary?.pending_leave_requests ?? 0} pending leave request(s) · {summary?.approved_leave_days ?? 0} approved days
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard icon={CalendarDays} title="Annual Leave Used" value={summary?.annual_leave_used ?? 0} />
        <StatsCard icon={CalendarDays} title="Leave Remaining" value={remaining} />
        <StatsCard icon={ClipboardList} title="Present This Month" value={summary?.attendance_this_month?.present ?? 0} />
        <StatsCard icon={Wallet} title="Latest Net Pay" value={formatKsh(summary?.latest_payslip?.net_amount)} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <h3 className="font-semibold text-slate-900">Annual leave usage</h3>
            <p className="mt-1 text-3xl font-bold text-slate-900">
              {used} / {total}
            </p>
            <Progress value={progress} className="mt-3" />
            <p className="mt-2 text-sm text-slate-500">{remaining} day(s) remaining</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <h3 className="font-semibold text-slate-900">Attendance this month</h3>
            <div className="mt-3 space-y-2 text-sm">
              <p className="flex justify-between"><span className="text-slate-500">Present</span><span className="font-medium">{summary?.attendance_this_month?.present ?? 0}</span></p>
              <p className="flex justify-between"><span className="text-slate-500">Late</span><span className="font-medium">{summary?.attendance_this_month?.late ?? 0}</span></p>
              <p className="flex justify-between"><span className="text-slate-500">Absent</span><span className="font-medium">{summary?.attendance_this_month?.absent ?? 0}</span></p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <h3 className="font-semibold text-slate-900">Latest payslip</h3>
            {summary?.latest_payslip ? (
              <div className="mt-3 space-y-2">
                <p className="text-sm text-slate-500">
                  {summary.latest_payslip.month} · <span className="font-mono">{summary.latest_payslip.payroll_no}</span>
                </p>
                <p className="text-xl font-bold text-slate-900">{formatKsh(summary.latest_payslip.net_amount)}</p>
                <StatusBadge status={summary.latest_payslip.status} />
              </div>
            ) : (
              <p className="mt-2 text-sm text-slate-500">No payslip yet.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {sections.map(({ label, href, icon: Icon, desc }) => (
          <Card key={href} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate(href)}>
            <CardContent className="p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                <Icon className="h-5 w-5" />
              </div>
              <h4 className="mt-3 font-semibold text-slate-900">{label}</h4>
              <p className="mt-1 text-sm text-slate-500">{desc}</p>
              <Button variant="ghost" size="sm" className="mt-3 px-0 text-brand-600 hover:bg-transparent">
                Open <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
