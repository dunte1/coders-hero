import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { DialogRoot, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/Dialog';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { getInitials } from '@/lib/utils';
import {
  useTeacherExam,
  useGradeExamResults,
  useDeleteExam,
} from '@/hooks/useTeacher';
import type { ExamResult, ExamResultEntry } from '@/types/teacher';
import type { Column } from '@/components/ui/DataTable';

export default function TeacherExamDetailPage() {
  const { id } = useParams<{ id: string }>();
  const examId = Number(id);
  const { data, isLoading } = useTeacherExam(examId);
  const gradeExamResults = useGradeExamResults(examId);
  const deleteExam = useDeleteExam();
  const [editing, setEditing] = useState(false);
  const [rows, setRows] = useState<ExamResultEntry[]>([]);

  const exam = data?.exam;
  const summary = data?.summary;
  const results = exam?.results ?? [];

  const startEditing = () => {
    setRows(
      results.map((r) => ({
        student_id: r.student?.id ?? 0,
        marks_obtained: r.marks_obtained,
        status: r.status,
        remarks: r.remarks,
      }))
    );
    setEditing(true);
  };

  const handleSave = () => {
    gradeExamResults.mutate(rows, {
      onSuccess: () => setEditing(false),
    });
  };

  const columns: Column<ExamResult>[] = [
    {
      key: 'student',
      header: 'Student',
      render: (r) => (
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-xs font-medium text-brand-700">
            {r.student ? getInitials(r.student.first_name, r.student.last_name) : '?'}
          </div>
          <span className="font-medium text-slate-900">{r.student?.full_name ?? 'Unknown'}</span>
        </div>
      ),
    },
    { key: 'marks_obtained', header: 'Marks', render: (r) => (r.marks_obtained ?? '—') },
    { key: 'percentage', header: '%', render: (r) => (r.percentage != null ? `${r.percentage}%` : '—') },
    { key: 'grade', header: 'Grade', render: (r) => r.grade ?? '—' },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
  ];

  if (isLoading) return <Spinner />;
  if (!exam) return <EmptyState title="Exam not found" />;

  return (
    <div className="space-y-6">
      <PageHeader
        title={exam.title}
        description={exam.description || `${exam.type ?? 'Exam'} · ${exam.total_marks} marks`}
        breadcrumbs={[{ label: 'Exams', href: '/teacher/exams' }, { label: exam.title }]}
        actions={
          <>
            <Button variant="outline" size="sm" onClick={startEditing} disabled={results.length === 0}>
              Grade Results
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                if (confirm('Delete this exam and its results?')) {
                  deleteExam.mutate(examId, { onSuccess: () => (window.location.href = '/teacher/exams') });
                }
              }}
            >
              Delete
            </Button>
          </>
        }
      />

      <Link to="/teacher/exams" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-brand-600">
        <ArrowLeft className="h-4 w-4" />Back to exams
      </Link>

      {summary && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <SummaryStat label="Total Students" value={summary.total_students} />
          <SummaryStat label="Graded" value={summary.graded} />
          <SummaryStat label="Absent" value={summary.absent} />
          <SummaryStat label="Average" value={summary.average ? `${summary.average}%` : '—'} />
          <SummaryStat label="Highest" value={summary.highest ?? '—'} />
          <SummaryStat label="Lowest" value={summary.lowest ?? '—'} />
          <SummaryStat label="Passed" value={summary.passed} />
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Results</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={results} loading={false} searchable={false} emptyTitle="No results yet" />
        </CardContent>
      </Card>

      <DialogRoot open={editing} onOpenChange={setEditing}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Grade Results</DialogTitle>
            <DialogDescription>Enter marks for each student. Leave empty to mark absent.</DialogDescription>
          </DialogHeader>
          <div className="max-h-96 overflow-y-auto space-y-2">
            {rows.map((row, idx) => (
              <div key={row.student_id} className="flex items-center gap-3 rounded-lg border border-slate-200 p-3">
                <span className="flex-1 text-sm font-medium text-slate-900">
                  {results.find((r) => r.student?.id === row.student_id)?.student?.full_name ?? `Student ${row.student_id}`}
                </span>
                <Input
                  type="number"
                  placeholder="Marks"
                  className="w-24"
                  value={row.marks_obtained ?? ''}
                  onChange={(e) => {
                    const val = e.target.value === '' ? null : Number(e.target.value);
                    setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, marks_obtained: val, status: val === null ? 'absent' : 'attempted' } : r)));
                  }}
                />
                <select
                  value={row.status ?? 'attempted'}
                  onChange={(e) => setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, status: e.target.value as ExamResultEntry['status'] } : r)))}
                  className="h-10 rounded-lg border border-slate-300 bg-white px-2 py-2 text-sm focus:border-brand-500 focus:outline-none"
                >
                  <option value="attempted">Attempted</option>
                  <option value="absent">Absent</option>
                  <option value="graded">Graded</option>
                </select>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
            <Button onClick={handleSave} loading={gradeExamResults.isPending}>Save Results</Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>
    </div>
  );
}

function SummaryStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-sm text-slate-500">{label}</p>
    </div>
  );
}
