import { useState } from 'react';
import {
  useHrReviews,
  useHrEmployees,
  useCreateReview,
  useUpdateReview,
  useDeleteReview,
} from '@/hooks/useHr';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageSpinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import { SearchInput } from '@/components/ui/SearchInput';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import { StatusBadge } from '@/components/ui/StatusBadge';
import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/Dialog';
import {
  SelectRoot,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/Select';
import { Plus, Pencil, Trash2, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PerformanceReview, PerformanceReviewInput } from '@/types/hr';

const emptyForm: PerformanceReviewInput = {
  employee_id: undefined,
  review_period: null,
  review_date: new Date().toISOString().slice(0, 10),
  rating: null,
  goals: null,
  achievements: null,
  areas_to_improve: null,
  feedback: null,
  status: 'draft',
};

export default function HrReviewsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<PerformanceReview | null>(null);
  const [form, setForm] = useState<PerformanceReviewInput>(emptyForm);

  const { data, isLoading } = useHrReviews({ page, per_page: 15, search: search || undefined });
  const { data: employeesData } = useHrEmployees({ per_page: 200 });
  const createReview = useCreateReview();
  const updateReview = useUpdateReview();
  const deleteReview = useDeleteReview();

  const employees = employeesData?.results || [];
  const reviews = data?.results || [];

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm });
    setDialogOpen(true);
  };

  const openEdit = (review: PerformanceReview) => {
    setEditing(review);
    setForm({
      employee_id: review.employee_id,
      review_period: review.review_period,
      review_date: review.review_date.slice(0, 10),
      rating: review.rating,
      goals: review.goals,
      achievements: review.achievements,
      areas_to_improve: review.areas_to_improve,
      feedback: review.feedback,
      status: review.status,
    });
    setDialogOpen(true);
  };

  const submit = () => {
    if (!form.employee_id) return;
    const payload: PerformanceReviewInput = {
      ...form,
      review_period: form.review_period || null,
      rating: form.rating,
      goals: form.goals || null,
      achievements: form.achievements || null,
      areas_to_improve: form.areas_to_improve || null,
      feedback: form.feedback || null,
    };
    if (editing) {
      updateReview.mutate({ id: editing.id, data: payload }, { onSuccess: () => setDialogOpen(false) });
    } else {
      createReview.mutate(payload, { onSuccess: () => setDialogOpen(false) });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Performance Reviews"
        description="Reviews, ratings and employee feedback"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'HR', href: '/hr' }, { label: 'Performance' }]}
        actions={
          <Button onClick={openCreate}>
            <Plus className="mr-1 h-4 w-4" /> New Review
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <SearchInput
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search by employee..."
          className="w-full sm:w-64"
        />
      </div>

      {isLoading ? (
        <PageSpinner />
      ) : reviews.length === 0 ? (
        <EmptyState icon={Star} title="No reviews" description="Performance reviews will appear here." />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {reviews.map((review) => (
              <Card key={review.id}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-slate-900">{review.employee?.user?.name ?? 'Unknown employee'}</p>
                      <p className="text-sm text-slate-500">
                        {review.review_period ?? 'General'} · {review.review_date}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Star
                          key={n}
                          className={cn('h-4 w-4', n <= (review.rating ?? 0) ? 'fill-amber-400 text-amber-400' : 'text-slate-200')}
                        />
                      ))}
                    </div>
                  </div>
                  {review.feedback && <p className="mt-3 line-clamp-3 text-sm text-slate-500">{review.feedback}</p>}
                  <div className="mt-3 flex items-center justify-between">
                    <StatusBadge status={review.status} />
                    <div className="flex gap-1">
                      <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => openEdit(review)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 text-red-600 hover:bg-red-50"
                        onClick={() => deleteReview.mutate(review.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {data?.meta && data.meta.last_page > 1 && (
            <Pagination
              currentPage={data.meta.current_page}
              totalPages={data.meta.last_page}
              onPageChange={setPage}
              totalCount={data.meta.total}
              pageSize={data.meta.per_page}
            />
          )}
        </>
      )}

      <DialogRoot open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Review' : 'New Performance Review'}</DialogTitle>
            <DialogDescription>Record a performance review for an employee.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Employee</Label>
              <SelectRoot
                value={form.employee_id ? String(form.employee_id) : undefined}
                onValueChange={(v) => setForm({ ...form, employee_id: Number(v) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((e) => (
                    <SelectItem key={e.id} value={String(e.id)}>
                      {e.user?.name ?? e.employee_id} ({e.employee_id})
                    </SelectItem>
                  ))}
                </SelectContent>
              </SelectRoot>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Review date</Label>
                <Input
                  type="date"
                  value={form.review_date}
                  onChange={(e) => setForm({ ...form, review_date: e.target.value })}
                />
              </div>
              <div>
                <Label>Review period</Label>
                <Input
                  value={form.review_period ?? ''}
                  onChange={(e) => setForm({ ...form, review_period: e.target.value || null })}
                  placeholder="e.g. Q3 2026"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Rating (1-5)</Label>
                <SelectRoot
                  value={form.rating != null ? String(form.rating) : undefined}
                  onValueChange={(v) => setForm({ ...form, rating: v ? Number(v) : null })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="No rating" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <SelectItem key={n} value={String(n)}>
                        {n} star{n > 1 ? 's' : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </SelectRoot>
              </div>
              <div>
                <Label>Status</Label>
                <SelectRoot
                  value={form.status}
                  onValueChange={(v) => setForm({ ...form, status: v as PerformanceReviewInput['status'] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {['draft', 'submitted', 'acknowledged'].map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </SelectRoot>
              </div>
            </div>
            <div>
              <Label>Achievements</Label>
              <Textarea
                value={form.achievements ?? ''}
                onChange={(e) => setForm({ ...form, achievements: e.target.value || null })}
                rows={2}
              />
            </div>
            <div>
              <Label>Areas to improve</Label>
              <Textarea
                value={form.areas_to_improve ?? ''}
                onChange={(e) => setForm({ ...form, areas_to_improve: e.target.value || null })}
                rows={2}
              />
            </div>
            <div>
              <Label>Goals</Label>
              <Textarea
                value={form.goals ?? ''}
                onChange={(e) => setForm({ ...form, goals: e.target.value || null })}
                rows={2}
              />
            </div>
            <div>
              <Label>Feedback</Label>
              <Textarea
                value={form.feedback ?? ''}
                onChange={(e) => setForm({ ...form, feedback: e.target.value || null })}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={submit} loading={createReview.isPending || updateReview.isPending} disabled={!form.employee_id}>
              {editing ? 'Save Changes' : 'Create Review'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>
    </div>
  );
}
