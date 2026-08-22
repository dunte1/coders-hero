import { FolderCode, Star } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageSpinner } from '@/components/ui/Spinner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { useParentProjects } from '@/hooks/useParentPortal';

interface ProjectItem {
  id: number;
  title: string;
  status?: string;
  score?: number | null;
  is_published?: boolean;
  description?: string | null;
}

const statusVariant: Record<string, 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning'> = {
  draft: 'outline',
  in_progress: 'warning',
  completed: 'success',
  published: 'default',
};

export default function ParentProjectsPage() {
  const { data, isLoading } = useParentProjects(); const d: any = data;;

  if (isLoading) return <PageSpinner />;

  const projects: any[] = Array.isArray(d) ? data : (d?.results ?? []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Projects"
        description="Your child's project work and achievements"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Parent Portal', href: '/parent' }, { label: 'Projects' }]}
      />

      {projects.length === 0 ? (
        <Card>
          <CardContent>
            <EmptyState
              icon={FolderCode}
              title="No projects found"
              description="Your child has not created any projects yet."
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project: any) => (
            <Card key={project.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50">
                    <FolderCode className="h-4 w-4 text-brand-600" />
                  </div>
                  <span>{project.title}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  {project.status && (
                    <Badge variant={statusVariant[project.status] ?? 'secondary'}>
                      {project.status}
                    </Badge>
                  )}
                  {project.is_published && (
                    <Badge variant="success">Published</Badge>
                  )}
                </div>
                {typeof project.score === 'number' && (
                  <div className="flex items-center gap-1 text-sm text-amber-600">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <span className="font-medium">{project.score}</span>
                  </div>
                )}
                {project.description && (
                  <p className="text-sm text-slate-500 line-clamp-2">{project.description}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
