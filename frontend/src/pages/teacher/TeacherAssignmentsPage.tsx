import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Send, XCircle } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { SelectRoot, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/Select';
import { DialogRoot, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/Dialog';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatDate } from '@/lib/utils';
import {
  useTeacherAssignments,
  useTeacherClasses,
  useCreateAssignment,
  usePublishAssignment,
  useCloseAssignment,
  useDeleteAssignment,
} from '@/hooks/useTeacher';
import type { Assignment, AssignmentInput } from '@/types/teacher';
import type { Column } from '@/components/ui/DataTable';

export default function TeacherAssignmentsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [classId, setClassId] = useState('');
  const { data, isLoading } = useTeacherAssignments({ page, search, status: status || undefined, class_id: classId ? Number(classId) : undefined });
  const { data: classesData } = useTeacherClasses({ per_page: 100 });
  const createAssignment = useCreateAssignment();
  const publishAssignment = usePublishAssignment();
  const closeAssignment = useCloseAssignment();
  const deleteAssignment = useDeleteAssignment();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<AssignmentInput>({ title: '', description: '', max_score: 100, status: 'draft', type: 'homework' });

  const assignments = data?.results ?? [];

  const handleCreate = () => {
    createAssignment.mutate(
      { ...form, class_id: form.class_id ?? null, course_id: null, due_at: form.due_at || null, max_score: form.max_score ?? 100 },
      { onSuccess: () => { setOpen(false); setForm({ title: '', description: '', max_score: 100, status: 'draft', type: 'homework' }); } }
    );
  };

  const columns: Column<Assignment>[] = [
    {
      key: 'title',
      header: 'Title',
      render: (a) => (
        <div>
          <Link to={`/teacher/assignments/${a.id}`} className="font-medium text-slate-900 hover:text-brand-600">
            {a.title}
          </Link>
          <p className="text-xs text-slate-500">{a.school_class?.name ?? 'No class'}</p>
        </div>
      ),
    },
    { key: 'type', header: 'Type', render: (a) => a.type ? <StatusBadge status={a.type} /> : '—' },
    {
      key: 'due_at',
      header: 'Due',
      render: (a) => (a.due_at ? formatDate(a.due_at) : '—'),
    },
    {
      key: 'max_score',
      header: 'Score',
      render: (a) => `${a.max_score} pts`,
    },
    {
      key: 'submissions_count',
      header: 'Submissions',
      render: (a) => a.submissions_count ?? 0,
    },
    { key: 'status', header: 'Status', render: (a) => <StatusBadge status={a.status} /> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Assignments"
        description="Create and manage assignments, then grade submissions."
        actions={
          <DialogRoot open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="mr-2 h-4 w-4" />New Assignment</Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl">
              <DialogHeader>
                <DialogTitle>Create Assignment</DialogTitle>
                <DialogDescription>Set up a new assignment for your class.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                <Textarea label="Description" value={form.description ?? ''} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                <div className="grid grid-cols-2 gap-4">
                  <SelectRoot value={form.class_id ? String(form.class_id) : ''} onValueChange={(v) => setForm({ ...form, class_id: v ? Number(v) : null })}>
                    <SelectTrigger label="Class"><SelectValue placeholder="Select class" /></SelectTrigger>
                    <SelectContent>
                      {(classesData?.results ?? []).map((c) => (
                        <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </SelectRoot>
                  <SelectRoot value={form.type ?? 'homework'} onValueChange={(v) => setForm({ ...form, type: v })}>
                    <SelectTrigger label="Type"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {['homework', 'project', 'classwork', 'quiz'].map((t) => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </SelectRoot>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Max Score" type="number" value={form.max_score ?? ''} onChange={(e) => setForm({ ...form, max_score: Number(e.target.value) })} />
                  <Input label="Due Date" type="datetime-local" value={form.due_at ?? ''} onChange={(e) => setForm({ ...form, due_at: e.target.value || null })} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={handleCreate} loading={createAssignment.isPending} disabled={!form.title}>Create</Button>
              </DialogFooter>
            </DialogContent>
          </DialogRoot>
        }
      />

      <Card>
        <CardContent className="pt-6">
          <DataTable
            columns={columns}
            data={assignments}
            totalCount={data?.meta.total ?? 0}
            page={page}
            onPageChange={setPage}
            loading={isLoading}
            searchable
            searchPlaceholder="Search assignments..."
            onSearch={(q) => { setSearch(q); setPage(1); }}
            filters={
              <div className="flex items-center gap-2">
                <SelectRoot value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
                  <SelectTrigger className="w-36"><SelectValue placeholder="Status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </SelectRoot>
                <SelectRoot value={classId} onValueChange={(v) => { setClassId(v); setPage(1); }}>
                  <SelectTrigger className="w-40"><SelectValue placeholder="Class" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All classes</SelectItem>
                    {(classesData?.results ?? []).map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </SelectRoot>
              </div>
            }
            rowActions={(a) => (
              <>
                {a.status === 'draft' && (
                  <Button size="sm" variant="success" onClick={() => publishAssignment.mutate(a.id)}>
                    <Send className="mr-1 h-3 w-3" />Publish
                  </Button>
                )}
                {a.status === 'published' && (
                  <Button size="sm" variant="warning" onClick={() => closeAssignment.mutate(a.id)}>
                    <XCircle className="mr-1 h-3 w-3" />Close
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => deleteAssignment.mutate(a.id)}
                >
                  Delete
                </Button>
              </>
            )}
          />
        </CardContent>
      </Card>
    </div>
  );
}
