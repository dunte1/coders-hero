import { BookOpen, Calendar } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageSpinner } from '@/components/ui/Spinner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { useParentCourses } from '@/hooks/useParentPortal';
import { formatDate } from '@/lib/utils';

interface CourseItem {
  id: number;
  title: string;
  category?: string | null;
  difficulty?: string | null;
  enrolled_at?: string | null;
  description?: string | null;
}

const difficultyVariant: Record<string, 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning'> = {
  beginner: 'success',
  intermediate: 'warning',
  advanced: 'destructive',
};

export default function ParentCoursesPage() {
  const { data, isLoading } = useParentCourses(); const d: any = data;;

  if (isLoading) return <PageSpinner />;

  const courses: any[] = Array.isArray(d) ? data : (d?.results ?? []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Courses"
        description="Courses your child is enrolled in"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Parent Portal', href: '/parent' }, { label: 'Courses' }]}
      />

      {courses.length === 0 ? (
        <Card>
          <CardContent>
            <EmptyState
              icon={BookOpen}
              title="No courses found"
              description="Your child is not enrolled in any courses."
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course: any) => (
            <Card key={course.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50">
                    <BookOpen className="h-4 w-4 text-brand-600" />
                  </div>
                  <span>{course.title}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {course.category && (
                  <Badge variant="secondary">{course.category}</Badge>
                )}
                {course.difficulty && (
                  <Badge variant={difficultyVariant[course.difficulty] ?? 'secondary'}>
                    {course.difficulty}
                  </Badge>
                )}
                {course.enrolled_at && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    <span>Enrolled: {formatDate(course.enrolled_at)}</span>
                  </div>
                )}
                {course.description && (
                  <p className="text-sm text-slate-500 line-clamp-2">{course.description}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
