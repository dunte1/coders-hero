import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Play } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { SelectRoot, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/Select';
import { DialogRoot, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/Dialog';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatRelativeDate } from '@/lib/utils';
import { useCourseRatings, useRatingSummary, useRateCourse, useMarkLessonCompleted } from '@/hooks/useLms';
import { useQuery } from '@tanstack/react-query';
import { lmsApi } from '@/lib/lmsApi';
import type { CourseRating } from '@/types/lms';

export default function LmsCoursePlayerPage() {
  const { id } = useParams<{ id: string }>();
  const courseId = Number(id);
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');
  const [rateOpen, setRateOpen] = useState(false);
  const { data: ratingsData, isLoading: ratingsLoading } = useCourseRatings(courseId);
  const { data: summary } = useRatingSummary(courseId);
  const rateCourse = useRateCourse(courseId);
  const markCompleted = useMarkLessonCompleted(courseId);

  const { data: lessons } = useQuery({
    queryKey: ['courses', courseId, 'lessons'],
    queryFn: () => lmsApi.videoProgressForCourse(courseId),
    enabled: !!courseId,
  });

  const ratings = ratingsData?.results ?? [];

  const handleRate = () => {
    rateCourse.mutate(
      { rating, review: review || undefined },
      { onSuccess: () => { setRateOpen(false); setReview(''); } }
    );
  };

  const handleComplete = (lessonId: number) => {
    markCompleted.mutate(lessonId);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Course Player"
        description="Watch lessons and track your progress."
        breadcrumbs={[{ label: 'My Courses', href: '/my-courses' }, { label: 'Course' }]}
        actions={
          <Button variant="outline" size="sm" onClick={() => setRateOpen(true)}>
            Rate this course
          </Button>
        }
      />

      <Link to="/my-courses" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-brand-600">
        <ArrowLeft className="h-4 w-4" />Back to my courses
      </Link>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Lessons</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(lessons ?? []).length === 0 ? (
              <EmptyState title="No progress yet" description="Your completed lessons will appear here." />
            ) : (
              (lessons ?? []).map((p) => (
                <div key={p.lesson_id} className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-full ${p.completed ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                      {p.completed ? <CheckCircle2 className="h-5 w-5" /> : <Play className="h-4 w-4" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">Lesson {p.lesson_id}</p>
                      <p className="text-xs text-slate-500">
                        {p.completed ? 'Completed' : `${p.progress}% watched`}
                      </p>
                    </div>
                  </div>
                  {!p.completed && (
                    <Button size="sm" variant="outline" onClick={() => handleComplete(p.lesson_id)}>
                      Mark complete
                    </Button>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ratings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {summary && (
              <div className="rounded-lg bg-slate-50 p-4 text-center">
                <p className="text-3xl font-bold text-slate-900">{summary.average.toFixed(1)}</p>
                <p className="text-sm text-slate-500">{summary.count} rating{summary.count === 1 ? '' : 's'}</p>
              </div>
            )}
            <div className="space-y-3">
              {ratingsLoading ? (
                <Spinner />
              ) : ratings.length === 0 ? (
                <EmptyState title="No ratings yet" description="Be the first to rate this course." />
              ) : (
                ratings.map((r: CourseRating) => (
                  <div key={r.id} className="rounded-lg border border-slate-200 p-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-slate-900">{r.user?.name ?? 'Unknown'}</p>
                      <div className="text-sm text-amber-500">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</div>
                    </div>
                    {r.review && <p className="mt-1 text-sm text-slate-600">{r.review}</p>}
                    <p className="mt-1 text-xs text-slate-400">{formatRelativeDate(r.created_at)}</p>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <DialogRoot open={rateOpen} onOpenChange={setRateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rate Course</DialogTitle>
            <DialogDescription>Share your feedback.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <SelectRoot value={String(rating)} onValueChange={(v) => setRating(Number(v))}>
              <SelectTrigger label="Rating"><SelectValue /></SelectTrigger>
              <SelectContent>
                {[5, 4, 3, 2, 1].map((n) => (
                  <SelectItem key={n} value={String(n)}>{'★'.repeat(n)}{'☆'.repeat(5 - n)} ({n})</SelectItem>
                ))}
              </SelectContent>
            </SelectRoot>
            <Textarea label="Review (optional)" value={review} onChange={(e) => setReview(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRateOpen(false)}>Cancel</Button>
            <Button onClick={handleRate} loading={rateCourse.isPending}>Submit Rating</Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>
    </div>
  );
}
