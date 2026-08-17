import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { SelectRoot, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/Select';
import { DialogRoot, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/Dialog';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatDate, truncate } from '@/lib/utils';
import { useLessonNotes, useCreateLessonNote, useDeleteLessonNote, useTeacherClasses } from '@/hooks/useTeacher';
import type { LessonNote, LessonNoteInput } from '@/types/teacher';

export default function TeacherLessonNotesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [classId, setClassId] = useState('');
  const { data, isLoading } = useLessonNotes({ page, search, class_id: classId ? Number(classId) : undefined });
  const { data: classesData } = useTeacherClasses({ per_page: 100 });
  const createNote = useCreateLessonNote();
  const deleteNote = useDeleteLessonNote();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<LessonNoteInput>({ title: '', content: '', note_date: new Date().toISOString().slice(0, 10) });

  const notes = data?.results ?? [];

  const handleCreate = () => {
    createNote.mutate(
      { ...form, class_id: form.class_id ?? null, lesson_id: null },
      { onSuccess: () => { setOpen(false); setForm({ title: '', content: '', note_date: new Date().toISOString().slice(0, 10) }); } }
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Lesson Notes"
        description="Record notes and lesson summaries."
        actions={
          <DialogRoot open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="mr-2 h-4 w-4" />New Note</Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl">
              <DialogHeader>
                <DialogTitle>Create Lesson Note</DialogTitle>
                <DialogDescription>Save a note for your records.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                <Textarea label="Content" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={6} />
                <div className="grid grid-cols-2 gap-4">
                  <SelectRoot value={form.class_id ? String(form.class_id) : ''} onValueChange={(v) => setForm({ ...form, class_id: v ? Number(v) : null })}>
                    <SelectTrigger label="Class"><SelectValue placeholder="Optional class" /></SelectTrigger>
                    <SelectContent>
                      {(classesData?.results ?? []).map((c) => (
                        <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </SelectRoot>
                  <Input label="Date" type="date" value={form.note_date ?? ''} onChange={(e) => setForm({ ...form, note_date: e.target.value })} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={handleCreate} loading={createNote.isPending} disabled={!form.title}>Create</Button>
              </DialogFooter>
            </DialogContent>
          </DialogRoot>
        }
      />

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle>Notes</CardTitle>
          <div className="flex items-center gap-3">
            <Input placeholder="Search notes..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="w-56" />
            <SelectRoot value={classId} onValueChange={(v) => { setClassId(v); setPage(1); }}>
              <SelectTrigger className="w-40"><SelectValue placeholder="All classes" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">All classes</SelectItem>
                {(classesData?.results ?? []).map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </SelectRoot>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Spinner />
          ) : notes.length === 0 ? (
            <EmptyState title="No notes yet" description="Create your first lesson note." />
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {notes.map((n) => (
                <NoteCard key={n.id} note={n} onDelete={() => deleteNote.mutate(n.id)} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function NoteCard({ note, onDelete }: { note: LessonNote; onDelete: () => void }) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-semibold text-slate-900">{note.title}</h3>
            <p className="text-xs text-slate-500">{formatDate(note.note_date)}</p>
          </div>
          <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={onDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        {note.school_class && (
          <div className="mt-2">
            <StatusBadge status={note.school_class.name} />
          </div>
        )}
        <p className="mt-3 text-sm text-slate-600">{truncate(note.content, 180)}</p>
        {note.lesson && (
          <p className="mt-2 text-xs text-slate-400">Lesson: {note.lesson.title}</p>
        )}
      </CardContent>
    </Card>
  );
}
