import { useState } from 'react';
import { Plus } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { SelectRoot, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/Select';
import { DialogRoot, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/Dialog';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { getInitials } from '@/lib/utils';
import {
  useTeacherClasses,
  useGradebookEntries,
  useCreateGradebookEntry,
  useClassGradeSummary,
} from '@/hooks/useTeacher';
import type { GradebookEntry, GradebookEntryInput } from '@/types/teacher';
import type { Column } from '@/components/ui/DataTable';

const components = ['assignment', 'exam', 'quiz', 'participation', 'homework', 'project', 'final'];

export default function TeacherGradebookPage() {
  const { data: classesData } = useTeacherClasses({ per_page: 100 });
  const [classId, setClassId] = useState('');
  const [component, setComponent] = useState('');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<GradebookEntryInput>({ student_id: 0, component: 'assignment', title: '', score: 0, max_score: 100 });

  const cid = classId ? Number(classId) : 0;
  const { data, isLoading } = useGradebookEntries(cid, { component: component || undefined });
  const createEntry = useCreateGradebookEntry(cid);
  const { data: summary } = useClassGradeSummary(cid);

  const entries = data?.results ?? [];
  const classStudents = summary?.students ?? [];

  const columns: Column<GradebookEntry>[] = [
    {
      key: 'student',
      header: 'Student',
      render: (e) => (
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-xs font-medium text-brand-700">
            {e.student ? getInitials(e.student.first_name, e.student.last_name) : '?'}
          </div>
          <span className="font-medium text-slate-900">{e.student?.full_name ?? 'Unknown'}</span>
        </div>
      ),
    },
    { key: 'component', header: 'Component', render: (e) => <StatusBadge status={e.component} /> },
    { key: 'title', header: 'Title', render: (e) => e.title },
    { key: 'score', header: 'Score', render: (e) => `${e.score}/${e.max_score}` },
    { key: 'percentage', header: '%', render: (e) => (e.percentage != null ? `${e.percentage}%` : '—') },
  ];

  const handleCreate = () => {
    createEntry.mutate(form, {
      onSuccess: () => {
        setOpen(false);
        setForm({ student_id: 0, component: 'assignment', title: '', score: 0, max_score: 100 });
      },
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gradebook"
        description="Record and review student grades by component."
        actions={
          <DialogRoot open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" disabled={!classId}><Plus className="mr-2 h-4 w-4" />Add Entry</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Grade Entry</DialogTitle>
                <DialogDescription>Add a grade for a student in this class.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <SelectRoot value={form.student_id ? String(form.student_id) : ''} onValueChange={(v) => setForm({ ...form, student_id: Number(v) })}>
                  <SelectTrigger label="Student"><SelectValue placeholder="Select student" /></SelectTrigger>
                  <SelectContent>
                    {classStudents.map((s) => (
                      <SelectItem key={s.student_id} value={String(s.student_id)}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </SelectRoot>
                <SelectRoot value={form.component} onValueChange={(v) => setForm({ ...form, component: v as GradebookEntryInput['component'] })}>
                  <SelectTrigger label="Component"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {components.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </SelectRoot>
                <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Week 5 Quiz" />
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Score" type="number" value={form.score} onChange={(e) => setForm({ ...form, score: Number(e.target.value) })} />
                  <Input label="Max Score" type="number" value={form.max_score} onChange={(e) => setForm({ ...form, max_score: Number(e.target.value) })} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={handleCreate} loading={createEntry.isPending} disabled={!form.title || !form.student_id}>Add</Button>
              </DialogFooter>
            </DialogContent>
          </DialogRoot>
        }
      />

      <div className="flex items-center gap-3">
        <SelectRoot value={classId} onValueChange={(v) => { setClassId(v); }}>
          <SelectTrigger label="Class" className="w-64"><SelectValue placeholder="Select a class" /></SelectTrigger>
          <SelectContent>
            {(classesData?.results ?? []).map((c) => (
              <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </SelectRoot>
        <SelectRoot value={component} onValueChange={setComponent}>
          <SelectTrigger label="Component" className="w-44"><SelectValue placeholder="All components" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="">All</SelectItem>
            {components.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </SelectRoot>
      </div>

      {summary && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          <SummaryStat label="Students" value={summary.students.length} />
          <SummaryStat label="Average" value={summary.average ? `${summary.average}%` : '—'} />
          <SummaryStat label="Highest" value={summary.highest ?? '—'} />
          <SummaryStat label="Lowest" value={summary.lowest ?? '—'} />
          <SummaryStat label="Passed" value={summary.passed_count} />
        </div>
      )}

      {summary && classStudents.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <h3 className="mb-4 text-sm font-semibold text-slate-900">Class Summary</h3>
            <DataTable
              columns={[
                { key: 'name', header: 'Student', render: (s) => <span className="font-medium text-slate-900">{s.name}</span> },
                { key: 'student_code', header: 'Code', render: (s) => s.student_code },
                { key: 'entries_count', header: 'Entries', render: (s) => s.entries_count },
                { key: 'overall_percentage', header: 'Overall %', render: (s) => (s.overall_percentage != null ? `${s.overall_percentage}%` : '—') },
                { key: 'letter_grade', header: 'Grade', render: (s) => <StatusBadge status={s.letter_grade} /> },
              ]}
              data={classStudents}
              searchable={false}
              emptyTitle="No students"
            />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="pt-6">
          <DataTable
            columns={columns}
            data={entries}
            totalCount={data?.meta.total ?? 0}
            loading={isLoading}
            searchable={false}
            emptyTitle={classId ? 'No grade entries' : 'Select a class to view entries'}
          />
        </CardContent>
      </Card>
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
