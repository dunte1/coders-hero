import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pin, Lock, MessageSquare } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { DialogRoot, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/Dialog';
import { DataTable } from '@/components/ui/DataTable';
import { formatRelativeDate } from '@/lib/utils';
import { EmptyState } from '@/components/ui/EmptyState';
import { SelectRoot, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/Select';
import { useForumThreads, useCreateThread } from '@/hooks/useLms';
import { useCourses } from '@/hooks/useCourses';
import type { ForumThread } from '@/types/lms';
import type { Column } from '@/components/ui/DataTable';

export default function LmsForumPage() {
  const urlCourseId = Number(new URLSearchParams(window.location.search).get('course_id') ?? 0);
  const { data: coursesData } = useCourses({ per_page: 100 });
  const courses = coursesData?.results ?? [];
  const [selectedCourseId, setSelectedCourseId] = useState<number>(urlCourseId);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const { data, isLoading } = useForumThreads(selectedCourseId, { page, search });
  const createThread = useCreateThread(selectedCourseId);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: '', content: '' });

  const threads = data?.results ?? [];

  const handleCreate = () => {
    createThread.mutate(form, {
      onSuccess: () => {
        setOpen(false);
        setForm({ title: '', content: '' });
      },
    });
  };

  const columns: Column<ForumThread>[] = [
    {
      key: 'title',
      header: 'Thread',
      render: (t) => (
        <div className="flex items-center gap-2">
          {t.is_pinned && <Pin className="h-4 w-4 text-brand-600" />}
          {t.is_locked && <Lock className="h-4 w-4 text-slate-400" />}
          <Link to={`/lms/forum/threads/${t.id}`} className="font-medium text-slate-900 hover:text-brand-600">
            {t.title}
          </Link>
        </div>
      ),
    },
    { key: 'user', header: 'Author', render: (t) => t.user?.name ?? 'Unknown' },
    { key: 'posts_count', header: 'Replies', render: (t) => t.posts_count ?? 0 },
    { key: 'views', header: 'Views', render: (t) => t.views },
    {
      key: 'created_at',
      header: 'Posted',
      render: (t) => formatRelativeDate(t.created_at),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Discussion Forum"
        description="Ask questions and discuss course topics."
        actions={
          <DialogRoot open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="mr-2 h-4 w-4" />New Thread</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Start a Thread</DialogTitle>
                <DialogDescription>Share a question or discussion topic.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                <Textarea label="Content" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={5} />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={handleCreate} loading={createThread.isPending} disabled={!form.title}>Post</Button>
              </DialogFooter>
            </DialogContent>
          </DialogRoot>
        }
      />

      {!selectedCourseId && courses.length > 0 && (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <MessageSquare className="h-10 w-10 text-slate-300" />
            <p className="text-sm text-slate-500">Select a course to view its discussion forum.</p>
            <SelectRoot value={String(selectedCourseId)} onValueChange={(v) => { setSelectedCourseId(Number(v)); setPage(1); }}>
              <SelectTrigger className="w-72"><SelectValue placeholder="Choose a course" /></SelectTrigger>
              <SelectContent>
                {courses.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>{c.title}</SelectItem>
                ))}
              </SelectContent>
            </SelectRoot>
          </CardContent>
        </Card>
      )}

      {selectedCourseId > 0 && (
      <Card>
        <CardHeader>
          <CardTitle>Threads</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={threads}
            totalCount={data?.meta.total ?? 0}
            page={page}
            onPageChange={setPage}
            loading={isLoading}
            searchPlaceholder="Search threads..."
            onSearch={(q) => { setSearch(q); setPage(1); }}
          />
        </CardContent>
      </Card>
      )}
    </div>
  );
}
