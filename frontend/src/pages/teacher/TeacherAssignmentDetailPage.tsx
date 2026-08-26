import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { DialogRoot, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/Dialog';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { getInitials, formatDateTime } from '@/lib/utils';
import { useAssignmentSubmissions, useGradeSubmission, useUpdateAssignment, useDeleteAssignment } from '@/hooks/useTeacher';
import type { AssignmentSubmission, AssignmentInput } from '@/types/teacher';
import type { Column } from '@/components/ui/DataTable';

export default function TeacherAssignmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const assignmentId = Number(id);
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState<AssignmentInput>({ title: '', description: '', max_score: 100 });
  const { data, isLoading } = useAssignmentSubmissions(assignmentId, { page, status: status || undefined });
  const gradeSubmission = useGradeSubmission(assignmentId);
  const updateAssignment = useUpdateAssignment(assignmentId);
  const deleteAssignment = useDeleteAssignment();
  const [grading, setGrading] = useState<AssignmentSubmission | null>(null);
  const [gradeScore, setGradeScore] = useState('');
  const [gradeFeedback, setGradeFeedback] = useState('');

  const submissions = data?.results ?? [];

  const openGrading = (s: AssignmentSubmission) => {
    setGrading(s);
    setGradeScore(s.score ? String(s.score) : '');
    setGradeFeedback(s.feedback ?? '');
  };

  const handleGrade = () => {
    if (!grading) return;
    gradeSubmission.mutate(
      { submissionId: grading.id, data: { score: Number(gradeScore), feedback: gradeFeedback || undefined } },
      { onSuccess: () => setGrading(null) }
    );
  };

  const columns: Column<AssignmentSubmission>[] = [
    {
      key: 'student',
      header: 'Student',
      render: (s) => (
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-xs font-medium text-brand-700">
            {s.student ? getInitials(s.student.first_name, s.student.last_name) : '?'}
          </div>
          <span className="font-medium text-slate-900">{s.student?.full_name ?? 'Unknown'}</span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (s) => <StatusBadge status={s.status} />,
    },
    {
      key: 'is_late',
      header: 'Late',
      render: (s) => (s.is_late ? <StatusBadge status="late" /> : '—'),
    },
    {
      key: 'score',
      header: 'Score',
      render: (s) => (s.score !== null ? s.score : '—'),
    },
    {
      key: 'submitted_at',
      header: 'Submitted',
      render: (s) => formatDateTime(s.submitted_at),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Assignment #${assignmentId}`}
        description="Review and grade student submissions."
        breadcrumbs={[{ label: 'Assignments', href: '/teacher/assignments' }, { label: `#${assignmentId}` }]}
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>Edit</Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                if (confirm('Delete this assignment and its submissions?')) {
                  deleteAssignment.mutate(assignmentId, { onSuccess: () => navigate('/teacher/assignments') });
                }
              }}
            >
              Delete
            </Button>
          </>
        }
      />

      <Link to="/teacher/assignments" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-brand-600">
        <ArrowLeft className="h-4 w-4" />Back to assignments
      </Link>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle>Submissions</CardTitle>
          <div className="flex items-center gap-2">
            <SelectFilter value={status} onChange={setStatus} />
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={submissions}
            totalCount={data?.meta.total ?? 0}
            page={page}
            onPageChange={setPage}
            loading={isLoading}
            searchable={false}
            rowActions={(s) => (
              <Button size="sm" variant="outline" onClick={() => openGrading(s)}>
                {s.score !== null ? 'Regrade' : 'Grade'}
              </Button>
            )}
          />
        </CardContent>
      </Card>

      <DialogRoot open={!!grading} onOpenChange={(o) => !o && setGrading(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Grade Submission</DialogTitle>
            <DialogDescription>
              {grading?.student?.full_name ?? 'Student'}
              {grading?.file_path ? ` · ${grading.file_name ?? 'attachment'}` : ''}
            </DialogDescription>
          </DialogHeader>
          {grading?.content && (
            <div className="rounded-lg bg-slate-50 p-3 text-sm text-slate-700 max-h-40 overflow-y-auto">
              {grading.content}
            </div>
          )}
          <div className="space-y-4">
            <Input label="Score" type="number" value={gradeScore} onChange={(e) => setGradeScore(e.target.value)} placeholder="0" />
            <Textarea label="Feedback" value={gradeFeedback} onChange={(e) => setGradeFeedback(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGrading(null)}>Cancel</Button>
            <Button onClick={handleGrade} loading={gradeSubmission.isPending} disabled={gradeScore === ''}>
              Save Grade
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>

      <DialogRoot open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Assignment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input label="Title" value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} />
            <Textarea label="Description" value={editForm.description ?? ''} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} />
            <Input label="Max Score" type="number" value={editForm.max_score ?? ''} onChange={(e) => setEditForm({ ...editForm, max_score: Number(e.target.value) })} />
            <Input label="Due Date" type="datetime-local" value={editForm.due_at ?? ''} onChange={(e) => setEditForm({ ...editForm, due_at: e.target.value || null })} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={() => updateAssignment.mutate(editForm, { onSuccess: () => setEditOpen(false) })} loading={updateAssignment.isPending}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>
    </div>
  );
}

function SelectFilter({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-10 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
    >
      <option value="">All statuses</option>
      <option value="submitted">Submitted</option>
      <option value="graded">Graded</option>
      <option value="late">Late</option>
      <option value="returned">Returned</option>
    </select>
  );
}
