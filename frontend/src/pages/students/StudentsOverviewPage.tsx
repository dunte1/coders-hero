import { useNavigate } from 'react-router-dom';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  Award,
  CalendarPlus,
  ClipboardCheck,
  Plus,
  RefreshCw,
  UserCheck,
  UserRound,
  Users,
  UsersRound,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatsCard } from '@/components/ui/StatsCard';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { PageSpinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { useStudentOverview } from '@/hooks/useStudents';
import { StudentStatusBadge } from '@/components/students/SisBadges';

const STATUS_COLORS: Record<string, string> = {
  pending: '#f59e0b',
  active: '#10b981',
  suspended: '#f97316',
  withdrawn: '#94a3b8',
  transferred: '#6366f1',
  graduated: '#0ea5e9',
};

function capitalize(status: string): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export default function StudentsOverviewPage() {
  const navigate = useNavigate();
  const { data, isLoading } = useStudentOverview();

  if (isLoading || !data) return <PageSpinner />;

  const statusData = data.status_breakdown.map((s) => ({ ...s, label: capitalize(s.status) }));
  const gradeData = data.grade_breakdown.map((g) => ({ ...g, label: g.grade || 'Unassigned' }));
  const attendance = data.today_attendance;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Student Dashboard"
        description="Overview of student enrollment and today's attendance"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Students' }]}
        actions={
          <>
            <Button variant="outline" onClick={() => navigate('/students')}>
              <Users className="mr-2 h-4 w-4" />
              View All Students
            </Button>
            <Button onClick={() => navigate('/students/create')}>
              <Plus className="mr-2 h-4 w-4" />
              New Student
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatsCard icon={UsersRound} title="Total Students" value={data.total_students} />
        <StatsCard icon={UserCheck} title="Active" value={data.active_students} />
        <StatsCard icon={ClipboardCheck} title="Pending" value={data.pending_students} />
        <StatsCard icon={Award} title="Graduated" value={data.graduated_students} />
        <StatsCard icon={RefreshCw} title="Transferred" value={data.transferred_students} />
        <StatsCard icon={CalendarPlus} title="Admitted This Month" value={data.admitted_this_month} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Students by Status</CardTitle>
            <CardDescription>Distribution across all student statuses</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {statusData.map((entry) => (
                    <Cell key={entry.status} fill={STATUS_COLORS[entry.status] || '#6366f1'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Today's Attendance</CardTitle>
            <CardDescription>Records captured for today</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: 'Present', value: attendance.present, dot: 'bg-emerald-500' },
              { label: 'Late', value: attendance.late, dot: 'bg-amber-500' },
              { label: 'Absent', value: attendance.absent, dot: 'bg-red-500' },
              { label: 'Excused', value: attendance.excused, dot: 'bg-slate-400' },
            ].map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3"
              >
                <span className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <span className={`h-2.5 w-2.5 rounded-full ${row.dot}`} />
                  {row.label}
                </span>
                <span className="text-lg font-bold text-slate-900">{row.value}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Students by Grade</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={gradeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Enrollment Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.status_breakdown.map((row) => (
              <div key={row.status} className="flex items-center justify-between">
                <StudentStatusBadge status={row.status as 'active'} />
                <span className="font-medium text-slate-900">{row.count}</span>
              </div>
            ))}
            {data.status_breakdown.length === 0 && (
              <p className="py-8 text-center text-sm text-slate-500">No students yet.</p>
            )}
            <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
              <span className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <UserRound className="h-4 w-4 text-slate-400" />
                Gender split
              </span>
              <span className="text-sm text-slate-600">
                {data.gender_breakdown.map((g) => `${g.gender}: ${g.count}`).join(' · ') || '—'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
