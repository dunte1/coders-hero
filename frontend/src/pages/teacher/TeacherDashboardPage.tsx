import { Link } from 'react-router-dom';
import {
  Users,
  BookOpen,
  CheckCheck,
  ClipboardList,
  CalendarDays,
  ListChecks,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatsCard } from '@/components/ui/StatsCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { useTeacherDashboard } from '@/hooks/useTeacher';
import { formatDate } from '@/lib/utils';

export default function TeacherDashboardPage() {
  const { data, isLoading, isError } = useTeacherDashboard();

  if (isLoading) return <Spinner />;
  if (isError || !data) {
    return (
      <EmptyState
        title="Could not load dashboard"
        description="Please try refreshing the page."
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Teacher Dashboard"
        description="Overview of your classes, attendance and pending work."
        actions={
          <Link to="/teacher/classes">
            <Button variant="outline" size="sm">
              Manage Classes
            </Button>
          </Link>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard icon={BookOpen} title="Classes" value={data.classes_count} />
        <StatsCard icon={Users} title="Students" value={data.students_count} />
        <StatsCard icon={CheckCheck} title="Present Today" value={data.today_present} />
        <StatsCard icon={ClipboardList} title="Ungraded Submissions" value={data.ungraded_submissions} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Assignments</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.upcoming_assignments.length === 0 ? (
              <EmptyState title="No upcoming assignments" description="Nothing due soon." />
            ) : (
              data.upcoming_assignments.slice(0, 5).map((a) => (
                <div key={a.id} className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{a.title}</p>
                    <p className="text-xs text-slate-500">
                      {a.school_class?.name ?? 'No class'} &middot; Due {a.due_at ? formatDate(a.due_at) : '—'}
                    </p>
                  </div>
                  <StatusBadge status={a.status} />
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Today's Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div className="rounded-lg bg-emerald-50 p-4 text-center">
                <p className="text-2xl font-bold text-emerald-700">{data.today_present}</p>
                <p className="text-xs text-emerald-600">Present</p>
              </div>
              <div className="rounded-lg bg-red-50 p-4 text-center">
                <p className="text-2xl font-bold text-red-700">{data.today_absent}</p>
                <p className="text-xs text-red-600">Absent</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-4 text-center">
                <p className="text-2xl font-bold text-slate-700">{data.today_unmarked}</p>
                <p className="text-xs text-slate-600">Unmarked</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Exams</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.upcoming_exams.length === 0 ? (
              <EmptyState title="No upcoming exams" description="Nothing scheduled soon." />
            ) : (
              data.upcoming_exams.slice(0, 5).map((e) => (
                <div key={e.id} className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{e.title}</p>
                    <p className="text-xs text-slate-500">
                      {e.school_class?.name ?? 'No class'} &middot; {e.scheduled_at ? formatDate(e.scheduled_at) : '—'}
                    </p>
                  </div>
                  <StatusBadge status={e.status} />
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.upcoming_events.length === 0 ? (
              <EmptyState title="No upcoming events" description="Nothing on your calendar." />
            ) : (
              data.upcoming_events.slice(0, 5).map((ev) => (
                <div key={ev.id} className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
                  <div className="flex items-center gap-3">
                    <CalendarDays className="h-4 w-4 text-slate-400" />
                    <div>
                      <p className="text-sm font-medium text-slate-900">{ev.title}</p>
                      <p className="text-xs text-slate-500">{formatDate(ev.starts_at)}</p>
                    </div>
                  </div>
                  <ListChecks className="h-4 w-4 text-slate-300" />
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
