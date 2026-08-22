import { BookOpen, Users, Calendar, GraduationCap } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageSpinner } from '@/components/ui/Spinner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { useMyClasses } from '@/hooks/useMyClasses';

interface ClassItem {
  id: number;
  name: string;
  course?: { id: number; title: string } | null;
  teacher?: { id: number; name: string } | null;
  schedule?: string | null;
  student_count?: number;
}

export default function StudentClassesPage() {
  const { data, isLoading } = useMyClasses();

  if (isLoading) return <PageSpinner />;

  const classes = (data?.results as ClassItem[]) ?? (Array.isArray(data) ? data : []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Classes"
        description="View your enrolled classes and schedules"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Classes' }]}
      />

      {classes.length === 0 ? (
        <Card>
          <CardContent>
            <EmptyState
              icon={BookOpen}
              title="No classes yet"
              description="You are not enrolled in any classes yet."
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {classes.map((cls) => (
            <Card key={cls.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50">
                    <GraduationCap className="h-4 w-4 text-brand-600" />
                  </div>
                  <span>{cls.name}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {cls.course && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <BookOpen className="h-4 w-4 text-slate-400" />
                    <span>{cls.course.title}</span>
                  </div>
                )}
                {cls.teacher && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Users className="h-4 w-4 text-slate-400" />
                    <span>{cls.teacher.name}</span>
                  </div>
                )}
                {cls.schedule && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    <span>{cls.schedule}</span>
                  </div>
                )}
                {typeof cls.student_count === 'number' && (
                  <Badge variant="secondary">
                    {cls.student_count} student{cls.student_count !== 1 ? 's' : ''}
                  </Badge>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
