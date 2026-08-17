import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
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
  useTeacherExams,
  useTeacherClasses,
  useCreateExam,
  useDeleteExam,
} from '@/hooks/useTeacher';
import type { Exam, ExamInput } from '@/types/teacher';
import type { Column } from '@/components/ui/DataTable';

export default function TeacherExamsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [classId, setClassId] = useState('');
  const { data, isLoading } = useTeacherExams({ page, search, status: status || undefined, class_id: classId ? Number(classId) : undefined });
  const { data: classesData } = useTeacherClasses({ per_page: 100 });
  const createExam = useCreateExam();
  const deleteExam = useDeleteExam();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<ExamInput>({ title: '', description: '', type: 'written', total_marks: 100, passing_marks: 50, status: 'draft' });

  const exams = data?.results ?? [];

  const handleCreate = () => {
    createExam.mutate(
      { ...form, class_id: form.class_id ?? null, course_id: null, scheduled_at: form.scheduled_at || null, duration_minutes: form.duration_minutes ?? 60 },
      { onSuccess: () => { setOpen(false); setForm({ title: '', description: '', type: 'written', total_marks: 100, passing_marks: 50, status: 'draft' }); } }
    );
  };

  const columns: Column<Exam>[] = [
    {
      key: 'title',
      header: 'Title',
      render: (e) => (
        <div>
          <Link to={`/teacher/exams/${e.id}`} className="font-medium text-slate-900 hover:text-brand-600">
            {e.title}
          </Link>
          <p className="text-xs text-slate-500">{e.school_class?.name ?? 'No class'}</p>
        </div>
      ),
    },
    { key: 'type', header: 'Type', render: (e) => e.type ? <StatusBadge status={e.type} /> : '—' },
    { key: 'scheduled_at', header: 'Scheduled', render: (e) => (e.scheduled_at ? formatDate(e.scheduled_at) : '—') },
    { key: 'total_marks', header: 'Marks', render: (e) => `${e.total_marks}` },
    { key: 'results_count', header: 'Results', render: (e) => e.results_count ?? 0 },
    { key: 'status', header: 'Status', render: (e) => <StatusBadge status={e.status} /> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Exams"
        description="Schedule exams and grade results."
        actions={
          <DialogRoot open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="mr-2 h-4 w-4" />New Exam</Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl">
              <DialogHeader>
                <DialogTitle>Create Exam</DialogTitle>
                <DialogDescription>Schedule a new exam for your class.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                <Textarea label="Description" value={form.description ?? ''} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <SelectRoot value={form.class_id ? String(form.class_id) : ''} onValueChange={(v) => setForm({ ...form, class_id: v ? Number(v) : null })}>
                    <SelectTrigger label="Class"><SelectValue placeholder="Select class" /></SelectTrigger>
                    <SelectContent>
                      {(classesData?.results ?? []).map((c) => (
                        <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </SelectRoot>
                  <SelectRoot value={form.type ?? 'written'} onValueChange={(v) => setForm({ ...form, type: v })}>
                    <SelectTrigger label="Type"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {['written', 'practical', 'oral', 'midterm', 'final'].map((t) => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </SelectRoot>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Input label="Scheduled" type="datetime-local" value={form.scheduled_at ?? ''} onChange={(e) => setForm({ ...form, scheduled_at: e.target.value || null })} />
                  <Input label="Duration (min)" type="number" value={form.duration_minutes ?? ''} onChange={(e) => setForm({ ...form, duration_minutes: Number(e.target.value) })} />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Input label="Total Marks" type="number" value={form.total_marks ?? ''} onChange={(e) => setForm({ ...form, total_marks: Number(e.target.value) })} />
                  <Input label="Passing Marks" type="number" value={form.passing_marks ?? ''} onChange={(e) => setForm({ ...form, passing_marks: Number(e.target.value) })} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={handleCreate} loading={createExam.isPending} disabled={!form.title}>Create</Button>
              </DialogFooter>
            </DialogContent>
          </DialogRoot>
        }
      />

      <Card>
        <CardContent className="pt-6">
          <DataTable
            columns={columns}
            data={exams}
            totalCount={data?.meta.total ?? 0}
            page={page}
            onPageChange={setPage}
            loading={isLoading}
            searchPlaceholder="Search exams..."
            onSearch={(q) => { setSearch(q); setPage(1); }}
            filters={
              <div className="flex items-center gap-2">
                <SelectRoot value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
                  <SelectTrigger className="w-36"><SelectValue placeholder="Status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
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
            rowActions={(e) => (
              <Button
                size="sm"
                variant="ghost"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => deleteExam.mutate(e.id)}
              >
                Delete
              </Button>
            )}
          />
        </CardContent>
      </Card>
    </div>
  );
}
