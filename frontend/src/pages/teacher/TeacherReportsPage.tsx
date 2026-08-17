import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, BarChart3 } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { SelectRoot, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/Select';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { useTeacherClasses, useClassReport, useTeacherReportSummary } from '@/hooks/useTeacher';
import type { ClassReportRow } from '@/types/teacher';
import type { Column } from '@/components/ui/DataTable';

export default function TeacherReportsPage() {
  const { data: classesData } = useTeacherClasses({ per_page: 100 });
  const { data: summary } = useTeacherReportSummary();
  const [classId, setClassId] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const cid = classId ? Number(classId) : 0;
  const { data: report, isLoading } = useClassReport(cid, {
    from: from || undefined,
    to: to || undefined,
  });

  const rows = report?.rows ?? [];

  const columns: Column<ClassReportRow>[] = [
    {
      key: 'student',
      header: 'Student',
      render: (r) => (
        <Link to={`/teacher/reports/classes/${cid}/students/${r.student.id}`} className="font-medium text-slate-900 hover:text-brand-600">
          {r.student.full_name}
        </Link>
      ),
    },
    { key: 'attendance_rate', header: 'Attendance', render: (r) => `${r.attendance_rate}%` },
    { key: 'attendance_present', header: 'Present', render: (r) => r.attendance_present },
    { key: 'attendance_absent', header: 'Absent', render: (r) => r.attendance_absent },
    { key: 'attendance_late', header: 'Late', render: (r) => r.attendance_late },
    {
      key: 'grade_percentage',
      header: 'Grade',
      render: (r) =>
        r.grade_percentage != null ? (
          <StatusBadge status={r.grade_percentage >= 70 ? 'A' : r.grade_percentage >= 60 ? 'B' : r.grade_percentage >= 50 ? 'C' : 'F'} />
        ) : (
          '—'
        ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Reports" description="Attendance and grade reports for your classes." />

      {summary && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <SummaryStat icon={BarChart3} label="Classes" value={summary.classes_count} />
          <SummaryStat icon={BarChart3} label="Students" value={summary.students_count} />
          <SummaryStat icon={BarChart3} label="Attendance Rate" value={`${summary.attendance_rate}%`} />
          <SummaryStat icon={BarChart3} label="Overdue Assignments" value={summary.overdue_assignments} />
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Class Report</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-end gap-3">
            <SelectRoot value={classId} onValueChange={setClassId}>
              <SelectTrigger label="Class" className="w-64"><SelectValue placeholder="Select a class" /></SelectTrigger>
              <SelectContent>
                {(classesData?.results ?? []).map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </SelectRoot>
            <Input label="From" type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="w-40" />
            <Input label="To" type="date" value={to} onChange={(e) => setTo(e.target.value)} className="w-40" />
          </div>

          {isLoading ? (
            <Spinner />
          ) : !classId ? (
            <EmptyState title="Select a class" description="Choose a class to view its report." />
          ) : rows.length === 0 ? (
            <EmptyState title="No data" description="No report data for this class in the selected range." />
          ) : (
            <DataTable
              columns={columns}
              data={rows}
              searchable={false}
              emptyTitle="No data"
              rowActions={(r) => (
                <Link to={`/teacher/reports/classes/${cid}/students/${r.student.id}`}>
                  <Button size="sm" variant="outline">
                    <FileText className="mr-1 h-3 w-3" />Detail
                  </Button>
                </Link>
              )}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function SummaryStat({ icon: Icon, label, value }: { icon: typeof BarChart3; label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50">
          <Icon className="h-5 w-5 text-brand-600" />
        </div>
        <div>
          <p className="text-xl font-bold text-slate-900">{value}</p>
          <p className="text-xs text-slate-500">{label}</p>
        </div>
      </div>
    </div>
  );
}
