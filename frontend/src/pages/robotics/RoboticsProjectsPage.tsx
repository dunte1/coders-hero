import { useState } from 'react';
import { Plus, FolderKanban, Send, CheckCircle2, XCircle } from 'lucide-react';
import {
  useRoboticsProjects,
  useRoboticsProject,
  useCreateProject,
  useSubmitProject,
  useReviewProjectSubmission,
  useRoboticsTeams,
} from '@/hooks/useRobotics';
import { useAuth } from '@/hooks/useAuth';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageSpinner } from '@/components/ui/Spinner';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import {
  DialogRoot,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/Dialog';
import {
  SelectRoot,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/Select';
import {
  PROJECT_CATEGORIES,
  PROJECT_STATUSES,
  formatDate,
  isRoboticsStaff,
} from '@/lib/roboticsUtils';
import type { RoboticsProject, RoboticsProjectSubmission } from '@/types/robotics';

export default function RoboticsProjectsPage() {
  const { user } = useAuth();
  const isStaff = isRoboticsStaff(user?.role?.name);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [category, setCategory] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [detailId, setDetailId] = useState<number | null>(null);

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'class',
    team_id: '',
    deadline: '',
  });
  const [submission, setSubmission] = useState({ title: '', description: '', repo_url: '', demo_url: '' });
  const [review, setReview] = useState({ score: '', feedback: '' });

  const { data, isLoading } = useRoboticsProjects({
    search: search || undefined,
    status: status || undefined,
    category: category || undefined,
  });
  const { data: project } = useRoboticsProject(detailId ?? 0);
  const { data: teams } = useRoboticsTeams();
  const createProject = useCreateProject();
  const submitProject = useSubmitProject();
  const reviewSubmission = useReviewProjectSubmission();

  const handleCreate = () => {
    createProject.mutate(
      {
        title: form.title,
        description: form.description || null,
        category: form.category as 'class' | 'competition' | 'personal',
        team_id: form.team_id ? Number(form.team_id) : null,
        deadline: form.deadline || null,
      },
      {
        onSuccess: () => {
          setCreateOpen(false);
          setForm({ title: '', description: '', category: 'class', team_id: '', deadline: '' });
        },
      }
    );
  };

  const handleSubmit = () => {
    if (!detailId) return;
    submitProject.mutate(
      { id: detailId, data: submission },
      {
        onSuccess: () => setSubmission({ title: '', description: '', repo_url: '', demo_url: '' }),
      }
    );
  };

  const handleReview = (submissionId: number, approved: boolean) => {
    if (!detailId) return;
    reviewSubmission.mutate({
      projectId: detailId,
      submissionId,
      data: {
        status: approved ? 'approved' : 'rejected',
        score: review.score ? Number(review.score) : null,
        feedback: review.feedback || null,
      },
    });
  };

  const columns: Column<RoboticsProject>[] = [
    {
      key: 'title',
      header: 'Project',
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
            <FolderKanban className="h-4 w-4" />
          </div>
          <div>
            <p className="font-medium text-slate-900">{item.title}</p>
            <p className="text-xs text-slate-500">
              {item.team?.name ?? item.student?.full_name ?? 'No owner'} · {item.submissions_count ?? 0} submission(s)
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      render: (item) => <span className="capitalize text-slate-600">{item.category}</span>,
    },
    {
      key: 'deadline',
      header: 'Deadline',
      render: (item) => <span className="text-slate-600">{formatDate(item.deadline)}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => <StatusBadge status={item.status} />,
    },
  ];

  if (isLoading) return <PageSpinner />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Robotics Projects"
        description="Class, competition and personal robotics projects"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Robotics Lab', href: '/robotics/dashboard' }, { label: 'Projects' }]}
        actions={
          <DialogRoot open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" /> New Project
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>New Project</DialogTitle>
                <DialogDescription>Create a robotics project.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4">
                <Input label="Title *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                <div>
                  <Textarea className="mt-1.5" label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <SelectRoot value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                    <SelectTrigger label="Category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PROJECT_CATEGORIES.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </SelectRoot>
                  <SelectRoot value={form.team_id} onValueChange={(v) => setForm({ ...form, team_id: v })}>
                    <SelectTrigger label="Team (optional)">
                      <SelectValue placeholder="No team" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No team</SelectItem>
                      {(teams?.results ?? []).map((t) => (
                        <SelectItem key={t.id} value={String(t.id)}>
                          {t.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </SelectRoot>
                </div>
                <Input label="Deadline" type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button onClick={handleCreate} disabled={!form.title || createProject.isPending}>
                  {createProject.isPending ? 'Creating...' : 'Create Project'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </DialogRoot>
        }
      />

      <DataTable
        columns={columns}
        data={data?.results ?? []}
        totalCount={data?.meta.total ?? 0}
        page={page}
        pageSize={data?.meta.per_page ?? 10}
        onPageChange={setPage}
        searchPlaceholder="Search projects..."
        onSearch={(q) => {
          setSearch(q);
          setPage(1);
        }}
        onRowClick={(item) => setDetailId(item.id)}
        rowActions={(item) => (
          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setDetailId(item.id); }}>
            Submissions
          </Button>
        )}
        filters={
          <>
            <SelectRoot value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All statuses</SelectItem>
                {PROJECT_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s.replace(/_/g, ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </SelectRoot>
            <SelectRoot value={category} onValueChange={(v) => { setCategory(v); setPage(1); }}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All categories</SelectItem>
                {PROJECT_CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </SelectRoot>
          </>
        }
      />

      <DialogRoot open={detailId !== null} onOpenChange={(o) => { if (!o) setDetailId(null); }}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{project?.title ?? 'Project'}</DialogTitle>
            <DialogDescription>
              {project?.category} · {formatDate(project?.deadline)} · <StatusBadge status={project?.status ?? ''} />
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="rounded-lg border border-slate-100 p-4">
              <p className="text-sm font-medium text-slate-700">Submit new version</p>
              <div className="mt-3 grid gap-3">
                <Input placeholder="Submission title" value={submission.title} onChange={(e) => setSubmission({ ...submission, title: e.target.value })} />
                <Input placeholder="Repository URL" value={submission.repo_url} onChange={(e) => setSubmission({ ...submission, repo_url: e.target.value })} />
                <Input placeholder="Demo URL" value={submission.demo_url} onChange={(e) => setSubmission({ ...submission, demo_url: e.target.value })} />
                <Textarea placeholder="What changed in this version?" value={submission.description} onChange={(e) => setSubmission({ ...submission, description: e.target.value })} rows={2} />
                <Button onClick={handleSubmit} disabled={submitProject.isPending}>
                  <Send className="h-4 w-4 mr-2" /> {submitProject.isPending ? 'Submitting...' : 'Submit Version'}
                </Button>
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-slate-700">Submissions</p>
              {(project?.submissions?.length ?? 0) === 0 ? (
                <p className="text-sm text-slate-500">No submissions yet.</p>
              ) : (
                <ul className="space-y-3">
                  {project?.submissions?.map((s: RoboticsProjectSubmission) => (
                    <li key={s.id} className="rounded-lg border border-slate-100 p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-slate-900">{s.title ?? 'Untitled submission'}</p>
                          <p className="text-xs text-slate-500">
                            {formatDate(s.submitted_at)} · {s.submitted_by?.name ?? 'Unknown'}
                            {s.repo_url && ` · repo: ${s.repo_url}`}
                            {s.demo_url && ` · demo: ${s.demo_url}`}
                          </p>
                        </div>
                        <StatusBadge status={s.status} />
                      </div>
                      {s.description && <p className="mt-2 text-sm text-slate-600">{s.description}</p>}
                      {s.score !== null && s.score !== undefined && (
                        <p className="mt-2 text-sm text-slate-600">Score: {s.score}</p>
                      )}
                      {isStaff && s.status !== 'approved' && s.status !== 'rejected' && (
                        <div className="mt-3 flex items-center gap-2 border-t border-slate-100 pt-3">
                          <Input
                            type="number"
                            min={0}
                            max={100}
                            placeholder="Score (0-100)"
                            className="w-32"
                            value={review.score}
                            onChange={(e) => setReview({ ...review, score: e.target.value })}
                          />
                          <Input
                            placeholder="Feedback"
                            className="flex-1"
                            value={review.feedback}
                            onChange={(e) => setReview({ ...review, feedback: e.target.value })}
                          />
                          <Button variant="outline" size="sm" onClick={() => handleReview(s.id, false)}>
                            <XCircle className="h-4 w-4 mr-1" /> Reject
                          </Button>
                          <Button size="sm" onClick={() => handleReview(s.id, true)}>
                            <CheckCircle2 className="h-4 w-4 mr-1" /> Approve
                          </Button>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>
    </div>
  );
}
