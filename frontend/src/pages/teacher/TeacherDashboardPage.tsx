import { Link } from 'react-router-dom';
import {
  Users,
  BookOpen,
  CheckCheck,
  ClipboardList,
  CalendarDays,
  ListChecks,
  UserCheck,
  AlertTriangle,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatsCard } from '@/components/ui/StatsCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { PageSpinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { useTeacherDashboard } from '@/hooks/useTeacher';
import { useAuth } from '@/hooks/useAuth';
import { formatDate } from '@/lib/utils';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function TeacherDashboardPage() {
  const { data, isLoading, isError } = useTeacherDashboard();
  const { user } = useAuth();

  if (isLoading) return <PageSpinner />;
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
      {/* Personalized Greeting */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{getGreeting()}, {user?.first_name || 'Teacher'}!</h1>
          <p className="text-sm text-slate-500">Here's what's happening with your classes today.</p>
        </div>
        <div className="flex gap-2">
          {data.today_class_id && (
            <Link to={`/teacher/classes/${data.today_class_id}/attendance`}>
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                <UserCheck className="mr-2 h-4 w-4" />Mark Attendance
              </Button>
            </Link>
          )}
          <Link to="/teacher/classes">
            <Button variant="outline" size="sm">
              Manage Classes
            </Button>
          </Link>
        </div>
      </div>

      {/* Ungraded Submissions Alert */}
      {data.ungraded_submissions > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
          <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600" />
          <div className="flex-1">
            <span className="text-sm font-medium text-amber-900">{data.ungraded_submissions} submission{data.ungraded_submissions !== 1 ? 's' : ''} need grading</span>
          </div>
          <Link to="/teacher/assignments" className="text-sm font-medium text-amber-700 hover:text-amber-800">
            View All →
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard icon={BookOpen} title="Classes" value={data.classes_count} />
        <StatsCard icon={Users} title="Students" value={data.students_count} />
        <StatsCard icon={CheckCheck} title="Present Today" value={data.today_present} />
        <StatsCard icon={ClipboardList} title="Ungraded Submissions" value={data.ungraded_submissions} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Upcoming Assignments</CardTitle>
            <Link to="/teacher/assignments" className="text-sm text-brand-600 hover:text-brand-700">View All →</Link>
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
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Upcoming Exams</CardTitle>
            <Link to="/teacher/exams" className="text-sm text-brand-600 hover:text-brand-700">View All →</Link>
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
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Upcoming Events</CardTitle>
            <Link to="/calendar" className="text-sm text-brand-600 hover:text-brand-700">View All →</Link>
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
