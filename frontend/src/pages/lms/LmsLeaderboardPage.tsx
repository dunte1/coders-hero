import { useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Trophy, Medal, ArrowRight } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { SelectRoot, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/Select';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { useCodingLeaderboardForCourse } from '@/hooks/useLms';
import { useMyCourses } from '@/hooks/useEnrollments';
import type { Enrollment } from '@/types';
import { formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';

const rankStyles: Record<number, string> = {
  1: 'bg-amber-100 text-amber-700',
  2: 'bg-slate-200 text-slate-700',
  3: 'bg-orange-100 text-orange-700',
};

export default function LmsLeaderboardPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { data: myCoursesData, isLoading: coursesLoading } = useMyCourses();
  const myCourses = useMemo(() => ((myCoursesData as any)?.results ?? []) as Enrollment[], [myCoursesData]);

  const selectedId = searchParams.get('courseId');
  const courseId = Number(selectedId) || myCourses[0]?.course?.id || 0;

  const { data, isLoading } = useCodingLeaderboardForCourse(courseId);

  const selectedCourse = myCourses.find((e) => e.course?.id === courseId);
  const groups = useMemo(() => Object.entries(data?.leaderboard ?? {}), [data]);

  if (coursesLoading) return <Spinner />;

  if (myCourses.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Coding Leaderboard"
          description="See how students rank on coding exercises."
          breadcrumbs={[{ label: 'Learning', href: '/lms/coding-exercises' }, { label: 'Leaderboard' }]}
        />
        <EmptyState
          icon={Trophy}
          title="No courses yet"
          description="Enroll in a course to see the coding leaderboard."
          action={{ label: 'Browse courses', onClick: () => navigate('/courses') }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Coding Leaderboard"
        description="Top scores on coding exercises, per course."
        breadcrumbs={[{ label: 'Learning', href: '/lms/coding-exercises' }, { label: 'Leaderboard' }]}
        actions={
          <SelectRoot
            value={courseId ? String(courseId) : undefined}
            onValueChange={(v) => setSearchParams({ courseId: v })}
          >
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Select course" />
            </SelectTrigger>
            <SelectContent>
              {myCourses.map((enrollment) => (
                <SelectItem key={enrollment.course.id} value={String(enrollment.course.id)}>
                  {enrollment.course.title}
                </SelectItem>
              ))}
            </SelectContent>
          </SelectRoot>
        }
      />

      {isLoading ? (
        <Spinner />
      ) : !data || groups.length === 0 ? (
        <EmptyState
          icon={Trophy}
          title="No submissions yet"
          description="When students solve exercises with a perfect score, they appear here."
        />
      ) : (
        <>
          <Card>
            <CardContent className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Course</p>
                <p className="text-lg font-semibold text-slate-900">
                  {selectedCourse?.course.title ?? `Course #${courseId}`}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-500">Exercises with solutions</p>
                <p className="text-lg font-semibold text-slate-900">{groups.length}</p>
              </div>
            </CardContent>
          </Card>

          {groups.map(([exerciseId, group]) => (
            <Card key={exerciseId}>
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <div className="flex items-center gap-2">
                  <CardTitle>{group.exercise_title}</CardTitle>
                  <Badge variant="secondary">{group.solved_count} solved</Badge>
                </div>
                <Link
                  to={`/lms/coding-exercises/${exerciseId}`}
                  className="inline-flex items-center gap-1 text-sm text-brand-600 hover:text-brand-700"
                >
                  Open exercise <ArrowRight className="h-3 w-3" />
                </Link>
              </CardHeader>
              <CardContent>
                {group.users.length === 0 ? (
                  <p className="text-sm text-slate-500">No perfect submissions yet.</p>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {group.users.map((entry, index) => (
                      <div key={entry.user_id} className="flex items-center gap-3 py-2.5">
                        <span
                          className={cn(
                            'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                            rankStyles[index + 1] ?? 'bg-slate-100 text-slate-600'
                          )}
                        >
                          {index < 3 ? <Medal className="h-3.5 w-3.5" /> : index + 1}
                        </span>
                        <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-900">
                          {entry.user_name}
                        </span>
                        <span className="text-sm text-slate-500">{formatDate(entry.submitted_at)}</span>
                        <Badge variant="success">{entry.score}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </>
      )}
    </div>
  );
}
