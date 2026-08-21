import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle2, Play, ChevronDown, ChevronRight, FileText, Video, ClipboardCheck, PenTool } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
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

const typeIcons: Record<string, typeof Video> = {
  video: Video,
  text: FileText,
  quiz: ClipboardCheck,
  assignment: PenTool,
};

interface LessonProgress {
  lesson_id: number;
  title?: string;
  content?: string;
  type?: string;
  module_name?: string;
  video_url?: string;
  thumbnail?: string;
  completed: boolean;
  progress: number;
}

export default function LmsCoursePlayerPage() {
  const { id } = useParams<{ id: string }>();
  const courseId = Number(id);
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');
  const [rateOpen, setRateOpen] = useState(false);
  const [selectedLessonId, setSelectedLessonId] = useState<number | null>(null);
  const [openModules, setOpenModules] = useState<Record<string, boolean>>({});
  const { data: ratingsData, isLoading: ratingsLoading } = useCourseRatings(courseId);
  const { data: summary } = useRatingSummary(courseId);
  const rateCourse = useRateCourse(courseId);
  const markCompleted = useMarkLessonCompleted(courseId);

  const { data: progress, isLoading: progressLoading } = useQuery({
    queryKey: ['courses', courseId, 'video-progress'],
    queryFn: () => lmsApi.videoProgressForCourse(courseId),
    enabled: !!courseId,
  });

  const { data: lessonsData, isLoading: lessonsLoading } = useQuery({
    queryKey: ['courses', courseId, 'lessons-detail'],
    queryFn: () => lmsApi.courseLessons(courseId),
    enabled: !!courseId,
  });

  const lessons: LessonProgress[] = (progress ?? []).map((p: any) => {
    const lessonInfo = lessonsData?.find((l: any) => l.id === p.lesson_id);
    return {
      ...p,
      title: lessonInfo?.title ?? `Lesson ${p.lesson_id}`,
      content: lessonInfo?.content ?? '',
      type: lessonInfo?.type ?? 'video',
      module_name: lessonInfo?.module_name ?? lessonInfo?.module?.title ?? 'General',
    };
  });

  const groupedLessons: Record<string, LessonProgress[]> = {};
  lessons.forEach((l) => {
    const mod = l.module_name ?? 'General';
    if (!groupedLessons[mod]) groupedLessons[mod] = [];
    groupedLessons[mod].push(l);
  });

  const selectedLesson = lessons.find((l) => l.lesson_id === selectedLessonId);
  const ratings = ratingsData?.results ?? [];

  const toggleModule = (name: string) => {
    setOpenModules((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const handleRate = () => {
    rateCourse.mutate(
      { rating, review: review || undefined },
      { onSuccess: () => { setRateOpen(false); setReview(''); } }
    );
  };

  const handleComplete = (lessonId: number) => {
    markCompleted.mutate(lessonId);
  };

  // Find prev/next lessons
  const currentLessonIndex = selectedLesson ? lessons.findIndex((l) => l.lesson_id === selectedLesson.lesson_id) : -1;
  const prevLesson = currentLessonIndex > 0 ? lessons[currentLessonIndex - 1] : null;
  const nextLesson = currentLessonIndex >= 0 && currentLessonIndex < lessons.length - 1 ? lessons[currentLessonIndex + 1] : null;

  const completedCount = lessons.filter((l) => l.completed).length;
  const totalCount = lessons.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Course Player"
        description={`${completedCount}/${totalCount} lessons completed (${progressPercent}%)`}
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
        <div className="space-y-4 lg:col-span-2">
          {selectedLesson ? (
            <Card>
              <CardContent className="p-6">
                <div className="mb-4 flex items-center gap-2">
                  {(() => { const Icon = typeIcons[selectedLesson.type ?? 'video'] ?? Video; return <Icon className="h-5 w-5 text-brand-600" />; })()}
                  <h2 className="text-xl font-bold text-slate-900">{selectedLesson.title}</h2>
                </div>
                {/* Video Player for video lessons */}
                {selectedLesson.type === 'video' && selectedLesson.video_url && (
                  <div className="aspect-video rounded-xl overflow-hidden mb-4 bg-slate-900">
                    <video
                      controls
                      className="w-full h-full"
                      src={selectedLesson.video_url}
                      poster={selectedLesson.thumbnail}
                    >
                      Your browser does not support the video tag.
                    </video>
                  </div>
                )}

                {selectedLesson.content ? (
                  <div className="prose prose-sm max-w-none text-slate-700">
                    <ReactMarkdown>{selectedLesson.content}</ReactMarkdown>
                  </div>
                ) : (
                  <p className="text-slate-500 italic">No content available for this lesson.</p>
                )}

                {/* Lesson Navigation */}
                <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
                  {prevLesson ? (
                    <Button variant="outline" onClick={() => setSelectedLessonId(prevLesson.lesson_id)}>
                      <ArrowLeft className="mr-2 h-4 w-4" />Previous
                    </Button>
                  ) : <div />}
                  <div className="flex gap-3">
                    {!selectedLesson.completed && (
                      <Button onClick={() => handleComplete(selectedLesson.lesson_id)} loading={markCompleted.isPending}>
                        <CheckCircle2 className="mr-2 h-4 w-4" />Mark as Complete
                      </Button>
                    )}
                    {selectedLesson.completed && (
                      <span className="inline-flex items-center gap-1 text-sm text-emerald-600 font-medium">
                        <CheckCircle2 className="h-4 w-4" />Completed
                      </span>
                    )}
                    {nextLesson ? (
                      <Button onClick={() => setSelectedLessonId(nextLesson.lesson_id)}>
                        Next<ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    ) : null}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Play className="mx-auto h-12 w-12 text-slate-300 mb-4" />
                <p className="text-lg font-medium text-slate-900">Select a lesson to begin</p>
                <p className="text-sm text-slate-500 mt-1">Choose a lesson from the sidebar to view its content.</p>
              </CardContent>
            </Card>
          )}
        </div>

        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Course Content</CardTitle>
            <div className="mt-2 h-2 w-full rounded-full bg-slate-100">
              <div className="h-2 rounded-full bg-brand-600 transition-all" style={{ width: `${progressPercent}%` }} />
            </div>
          </CardHeader>
          <CardContent className="space-y-1 max-h-[600px] overflow-y-auto">
            {progressLoading || lessonsLoading ? (
              <Spinner />
            ) : lessons.length === 0 ? (
              <EmptyState title="No lessons" description="This course has no lessons yet." />
            ) : (
              Object.entries(groupedLessons).map(([moduleName, moduleLessons]) => (
                <div key={moduleName}>
                  <button
                    onClick={() => toggleModule(moduleName)}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    {openModules[moduleName] !== false ? <ChevronDown className="h-4 w-4 shrink-0" /> : <ChevronRight className="h-4 w-4 shrink-0" />}
                    <span className="truncate">{moduleName}</span>
                    <span className="ml-auto text-xs text-slate-400">{moduleLessons.filter((l) => l.completed).length}/{moduleLessons.length}</span>
                  </button>
                  {openModules[moduleName] !== false && (
                    <div className="ml-4 space-y-0.5">
                      {moduleLessons.map((l) => {
                        const Icon = typeIcons[l.type ?? 'video'] ?? Video;
                        const isSelected = l.lesson_id === selectedLessonId;
                        return (
                          <button
                            key={l.lesson_id}
                            onClick={() => setSelectedLessonId(l.lesson_id)}
                            className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                              isSelected ? 'bg-brand-50 text-brand-700 font-medium' : 'text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            <Icon className="h-4 w-4 shrink-0" />
                            <span className="truncate flex-1">{l.title}</span>
                            {l.completed && <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-base">Ratings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {summary && (
              <div className="rounded-lg bg-slate-50 p-4 text-center">
                <p className="text-3xl font-bold text-slate-900">{summary.average.toFixed(1)}</p>
                <p className="text-sm text-slate-500">{summary.count} rating{summary.count === 1 ? '' : 's'}</p>
              </div>
            )}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
