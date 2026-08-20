import { useParams } from 'react-router-dom';
import { useCourse } from '@/hooks/useCourses';
import { useEnroll } from '@/hooks/useEnrollments';
import { useAuth } from '@/hooks/useAuth';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageSpinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar';
import { LessonList } from '@/components/features/courses/LessonList';
import { formatCurrency, getInitials } from '@/lib/utils';
import { Clock, Users, Star, Play, BookOpen } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';

export default function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { data: course, isLoading } = useCourse(parseInt(id || '0'));
  const enrollMutation = useEnroll();

  if (isLoading) return <PageSpinner />;
  if (!course) return (
    <div className="flex flex-col items-center justify-center py-20">
      <EmptyState
        icon={BookOpen}
        title="Course not found"
        description="The course you're looking for doesn't exist or has been removed."
      />
    </div>
  );

  const isStudent = user?.role?.name?.toLowerCase() === 'student';

  return (
    <div className="space-y-6">
      <PageHeader
        title={course.title}
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Courses', href: '/courses' },
          { label: course.title },
        ]}
        actions={
          <div className="flex gap-2">
            {!course.enrolled && isStudent && (
              <Button onClick={() => enrollMutation.mutate(course.id)} loading={enrollMutation.isPending}>
                Enroll Now
              </Button>
            )}
            {course.enrolled && course.progress !== undefined && (
              <Badge variant="success">Enrolled - {course.progress}%</Badge>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <div className="aspect-video bg-gradient-to-br from-brand-100 to-brand-200 rounded-t-xl flex items-center justify-center">
              {course.thumbnail ? (
                <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover rounded-t-xl" />
              ) : (
                <Play className="h-16 w-16 text-brand-600/30" />
              )}
            </div>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="secondary">{course.level}</Badge>
                <Badge variant="outline">{course.category?.name}</Badge>
                {course.is_published ? <Badge variant="success">Published</Badge> : <Badge>Draft</Badge>}
              </div>
              <p className="text-slate-600 whitespace-pre-wrap">{course.description}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Lessons ({course.lessons?.length || 0})</CardTitle>
            </CardHeader>
            <CardContent>
              {course.lessons && course.lessons.length > 0 ? (
                <LessonList lessons={course.lessons} />
              ) : (
                <EmptyState
                  icon={BookOpen}
                  title="No lessons yet"
                  description="This course doesn't have any lessons yet."
                />
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="text-3xl font-bold text-slate-900">
                {course.price > 0 ? formatCurrency(course.price) : 'Free'}
              </div>
              {course.enrolled && course.progress !== undefined && (
                <div>
                  <div className="flex items-center justify-between mb-1 text-sm">
                    <span className="text-slate-500">Progress</span>
                    <span className="font-medium">{course.progress}%</span>
                  </div>
                  <Progress value={course.progress} />
                </div>
              )}
              <div className="space-y-3 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-slate-400" />
                  {course.lessons?.length || 0} lessons
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-slate-400" />
                  {course.enrollment_count} students enrolled
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                  {course.average_rating.toFixed(1)} rating
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={course.instructor?.avatar} />
                  <AvatarFallback>
                    {getInitials(course.instructor?.name || 'Instructor')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {course.instructor?.name}
                  </p>
                  <p className="text-xs text-slate-500">Instructor</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
