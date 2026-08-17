import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { StatsCard } from '@/components/ui/StatsCard';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Progress } from '@/components/ui/Progress';
import { BookOpen, Users, ClipboardList, CheckCheck } from 'lucide-react';
import { useTeacherAnalytics } from '@/hooks/useTeacher';

const gradeColors: Record<string, string> = {
  A: 'bg-emerald-500',
  B: 'bg-green-400',
  C: 'bg-amber-400',
  D: 'bg-orange-400',
  F: 'bg-red-500',
  ungraded: 'bg-slate-300',
};

export default function TeacherAnalyticsPage() {
  const { data, isLoading, isError } = useTeacherAnalytics();

  if (isLoading) return <Spinner />;
  if (isError || !data) {
    return <EmptyState title="Could not load analytics" description="Please try again later." />;
  }

  const { overview, attendance_trend, grade_distribution, class_performance } = data;

  const maxGrade = Math.max(...Object.values(grade_distribution), 1);
  const maxTrend = Math.max(...attendance_trend.map((t) => t.rate), 100);

  return (
    <div className="space-y-6">
      <PageHeader title="Analytics" description="Performance insights across your classes." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatsCard icon={BookOpen} title="Classes" value={overview.classes_count} />
        <StatsCard icon={Users} title="Students" value={overview.students_count} />
        <StatsCard icon={ClipboardList} title="Assignments" value={overview.assignments_count} />
        <StatsCard icon={CheckCheck} title="Graded" value={`${overview.graded_submissions}/${overview.submissions}`} />
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-2xl font-bold text-slate-900">{overview.completion_rate}%</p>
          <p className="text-sm text-slate-500">Completion rate</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Grade Distribution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(grade_distribution).map(([grade, count]) => (
              <div key={grade} className="flex items-center gap-3">
                <span className="w-16 text-sm font-medium text-slate-600">
                  {grade === 'ungraded' ? 'Ungraded' : `Grade ${grade}`}
                </span>
                <div className="flex-1">
                  <Progress
                    value={(count / maxGrade) * 100}
                    indicatorClassName={gradeColors[grade] ?? 'bg-brand-600'}
                  />
                </div>
                <span className="w-8 text-right text-sm text-slate-600">{count}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Attendance Trend (30 days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-48 items-end gap-1">
              {attendance_trend.map((t) => (
                <div key={t.date} className="group relative flex-1">
                  <div
                    className="rounded-t bg-brand-500 hover:bg-brand-600 transition-all"
                    style={{ height: `${(t.rate / maxTrend) * 100}%`, minHeight: 4 }}
                    title={`${t.date}: ${t.rate}%`}
                  />
                </div>
              ))}
            </div>
            <div className="mt-2 flex justify-between text-[10px] text-slate-400">
              <span>{attendance_trend[0]?.date ?? ''}</span>
              <span>{attendance_trend[attendance_trend.length - 1]?.date ?? ''}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Class Performance</CardTitle>
          </CardHeader>
          <CardContent>
            {class_performance.length === 0 ? (
              <EmptyState title="No class data" description="Add gradebook entries to see performance." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Class</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Students</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Average</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Entries</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {class_performance.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 text-sm font-medium text-slate-900">{c.name}</td>
                        <td className="px-4 py-3 text-right text-sm text-slate-700">{c.students_count}</td>
                        <td className="px-4 py-3 text-right text-sm text-slate-700">{c.average != null ? `${c.average}%` : '—'}</td>
                        <td className="px-4 py-3 text-right text-sm text-slate-700">{c.entries_count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
