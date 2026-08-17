import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatDate } from '@/lib/utils';
import { useTeacherClass } from '@/hooks/useTeacher';
import { teacherApi } from '@/lib/teacherApi';
import { useQuery } from '@tanstack/react-query';

export default function TeacherStudentReportPage() {
  const { classId, studentId } = useParams<{ classId: string; studentId: string }>();
  const cid = Number(classId);
  const sid = Number(studentId);
  const { data: classData } = useTeacherClass(cid);

  const { data: report, isLoading } = useQuery({
    queryKey: ['teacher', 'reports', 'class', cid, 'student', sid],
    queryFn: () => teacherApi.studentReport(cid, sid),
    enabled: !!cid && !!sid,
  });

  if (isLoading) return <Spinner />;
  if (!report) return <EmptyState title="Report not found" />;

  return (
    <div className="space-y-6">
      <PageHeader
        title={report.student.full_name}
        description={classData?.name ?? report.class.name}
        breadcrumbs={[
          { label: 'Reports', href: '/teacher/reports' },
          { label: report.class.name, href: `/teacher/reports/classes/${cid}` },
          { label: report.student.full_name },
        ]}
      />

      <Link to={`/teacher/reports/classes/${cid}`} className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-brand-600">
        <ArrowLeft className="h-4 w-4" />Back to class report
      </Link>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Attendance Rate" value={`${report.attendance.rate}%`} />
        <Stat label="Present" value={report.attendance.present} />
        <Stat label="Late" value={report.attendance.late} />
        <Stat label="Absent" value={report.attendance.absent} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Assignments</CardTitle>
          </CardHeader>
          <CardContent>
            {report.assignments.length === 0 ? (
              <EmptyState title="No assignments" />
            ) : (
              <div className="divide-y divide-slate-100">
                {report.assignments.map((a, i) => (
                  <div key={i} className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{a.title}</p>
                      <p className="text-xs text-slate-500">
                        {a.type ?? 'Assignment'} · Due {a.due_at ? formatDate(a.due_at) : '—'} · Max {a.max_score}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-slate-900">
                        {a.score != null ? `${a.score}/${a.max_score}` : '—'}
                      </p>
                      <StatusBadge status={a.is_late ? 'late' : a.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Exams</CardTitle>
          </CardHeader>
          <CardContent>
            {report.exams.length === 0 ? (
              <EmptyState title="No exams" />
            ) : (
              <div className="divide-y divide-slate-100">
                {report.exams.map((e, i) => (
                  <div key={i} className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{e.title}</p>
                      <p className="text-xs text-slate-500">
                        {e.type ?? 'Exam'} · {e.scheduled_at ? formatDate(e.scheduled_at) : '—'} · Total {e.total_marks}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-slate-900">
                        {e.marks_obtained != null ? `${e.marks_obtained}/${e.total_marks} (${e.percentage}%)` : '—'}
                      </p>
                      <StatusBadge status={e.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-sm text-slate-500">{label}</p>
    </div>
  );
}
