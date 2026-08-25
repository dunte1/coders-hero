import { BookOpen, Download, Users, Calendar, GraduationCap, FileText } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageSpinner } from '@/components/ui/Spinner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatDate } from '@/lib/utils';
import { useMyClasses, useMyLessonMaterials } from '@/hooks/useMyClasses';

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
  const { data: materials, isLoading: materialsLoading } = useMyLessonMaterials();

  if (isLoading) return <PageSpinner />;

  const classes = (data?.results as ClassItem[]) ?? (Array.isArray(data) ? data : []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Classes"
        description="View your enrolled classes, schedules and lesson materials"
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

      {/* Lesson notes & downloadable materials */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-4 w-4 text-brand-600" />
            Lesson Notes &amp; Materials
          </CardTitle>
        </CardHeader>
        <CardContent>
          {materialsLoading ? (
            <PageSpinner />
          ) : !materials || materials.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No materials yet"
              description="Notes and files shared by your teachers will appear here."
            />
          ) : (
            <div className="space-y-3">
              {materials.map((m) => (
                <div key={m.id} className="rounded-lg border border-slate-200 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-slate-900">{m.title}</p>
                      <p className="text-xs text-slate-500">
                        {[m.class?.name, m.teacher?.name, m.note_date ? formatDate(m.note_date) : null]
                          .filter(Boolean)
                          .join(' · ')}
                      </p>
                    </div>
                  </div>
                  {m.content && <p className="mt-2 line-clamp-2 text-sm text-slate-600">{m.content}</p>}
                  {(m.attachments?.length ?? 0) > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {m.attachments.map((a, i) => (
                        <a
                          key={`${m.id}-${i}`}
                          href={a.url ?? '#'}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-md border border-brand-200 bg-brand-50 px-2.5 py-1.5 text-xs font-medium text-brand-700 hover:bg-brand-100"
                        >
                          <Download className="h-3.5 w-3.5" />
                          {a.name ?? 'download'}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
