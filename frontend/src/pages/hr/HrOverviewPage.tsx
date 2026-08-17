import { useNavigate } from 'react-router-dom';
import { useHrSummary } from '@/hooks/useHr';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageSpinner } from '@/components/ui/Spinner';
import { StatsCard } from '@/components/ui/StatsCard';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/Progress';
import { StatusBadge } from '@/components/ui/StatusBadge';
import {
  Users,
  UserCheck,
  CalendarDays,
  FileText,
  ClipboardList,
  Wallet,
  Star,
  ArrowRight,
} from 'lucide-react';

const formatKsh = (v: number | string | undefined) =>
  'KSh ' + Number(v ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const sections = [
  { label: 'Employees', href: '/hr/employees', icon: Users, desc: 'Directory, profiles and HR records' },
  { label: 'Contracts', href: '/hr/contracts', icon: FileText, desc: 'Terms, types and employment status' },
  { label: 'Leave', href: '/hr/leaves', icon: CalendarDays, desc: 'Requests and approvals' },
  { label: 'Attendance', href: '/hr/attendance', icon: ClipboardList, desc: 'Daily staff attendance register' },
  { label: 'Payroll', href: '/hr/payrolls', icon: Wallet, desc: 'Run, process and pay salaries' },
  { label: 'Performance', href: '/hr/reviews', icon: Star, desc: 'Reviews, ratings and feedback' },
  { label: 'Documents', href: '/hr/documents', icon: FileText, desc: 'Contracts, IDs and certificates' },
  { label: 'Reports', href: '/hr/reports', icon: Star, desc: 'Headcount, leave, attendance, payroll' },
];

export default function HrOverviewPage() {
  const navigate = useNavigate();
  const { data: summary, isLoading } = useHrSummary();

  if (isLoading) return <PageSpinner />;

  const att = summary?.attendance_today;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Human Resources"
        description="Employees, contracts, leave, attendance and payroll"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'HR' }]}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard icon={Users} title="Total Employees" value={summary?.total_employees ?? 0} />
        <StatsCard icon={UserCheck} title="Active Employees" value={summary?.active_employees ?? 0} />
        <StatsCard icon={CalendarDays} title="On Leave" value={summary?.on_leave_employees ?? 0} />
        <StatsCard icon={ClipboardList} title="Pending Leave" value={summary?.pending_leave_requests ?? 0} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <h3 className="font-semibold text-slate-900">Attendance today</h3>
            <p className="mt-1 text-3xl font-bold text-slate-900">{summary?.recorded_today ?? 0}</p>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Present</span>
                <span className="font-medium text-slate-900">{att?.present ?? 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Late</span>
                <span className="font-medium text-slate-900">{att?.late ?? 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Absent</span>
                <span className="font-medium text-slate-900">{att?.absent ?? 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Half day / Leave</span>
                <span className="font-medium text-slate-900">{(att?.half_day ?? 0) + (att?.leave ?? 0)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <h3 className="font-semibold text-slate-900">Current month payroll</h3>
            {summary?.current_payroll ? (
              <div className="mt-3 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm text-slate-900">{summary.current_payroll.payroll_no}</span>
                  <StatusBadge status={summary.current_payroll.status} />
                </div>
                <p className="text-sm text-slate-500">{summary.current_payroll.month}</p>
                <p className="text-2xl font-bold text-slate-900">{formatKsh(summary.current_payroll.net_total)}</p>
                <p className="text-sm text-slate-500">{summary.current_payroll.employees} employee(s)</p>
              </div>
            ) : (
              <p className="mt-2 text-sm text-slate-500">No payroll has been run for this month yet.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <h3 className="font-semibold text-slate-900">Headcount overview</h3>
            <p className="mt-1 text-3xl font-bold text-slate-900">{summary?.active_employees ?? 0}</p>
            <Progress
              value={summary && summary.total_employees ? ((summary.active_employees ?? 0) / summary.total_employees) * 100 : 0}
              className="mt-3"
            />
            <div className="mt-3 space-y-1 text-sm text-slate-500">
              <p>{summary?.departments ?? 0} departments · {summary?.active_contracts ?? 0} active contracts</p>
              <p>Avg review rating: {summary?.average_review_rating ?? 0}/5 · {summary?.approved_leave_this_month ?? 0} leave approvals this month</p>
            </div>
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
