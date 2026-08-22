import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageSpinner } from '@/components/ui/Spinner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Users, BookOpen, CalendarCheck, TrendingUp } from 'lucide-react';

export default function SchoolDashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['school-dashboard'],
    queryFn: () => api.get('/school/dashboard').then(r => r.data),
  });

  if (isLoading) return <PageSpinner />;

  const summary = data?.data ?? data ?? {};
  const stats = [
    { label: 'Total Students', value: summary.total_students ?? 0, icon: Users, color: 'text-blue-600' },
    { label: 'Total Teachers', value: summary.total_teachers ?? 0, icon: Users, color: 'text-emerald-600' },
    { label: 'Active Courses', value: summary.active_courses ?? 0, icon: BookOpen, color: 'text-purple-600' },
    { label: 'Attendance Today', value: summary.attendance_today ?? '—', icon: CalendarCheck, color: 'text-amber-600' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="School Dashboard"
        description="Overview of your school's key metrics"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'School Dashboard' }]}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(s => (
          <Card key={s.label}>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className={`rounded-lg bg-slate-100 p-2.5`}>
                  <s.icon className={`h-5 w-5 ${s.color}`} />
                </div>
                <div>
                  <p className="text-sm text-slate-500">{s.label}</p>
                  <p className="text-2xl font-bold text-slate-900">{s.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {summary.recent_activity && (
        <Card>
          <CardHeader><CardTitle>Recent Activity</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-slate-500">{summary.recent_activity}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
