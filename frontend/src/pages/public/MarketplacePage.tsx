import { useQuery } from '@tanstack/react-query';
import { ExternalLink, Code2 } from 'lucide-react';
import api from '@/lib/axios';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageSpinner } from '@/components/ui/Spinner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';

interface PublicProject {
  id: number;
  title: string;
  description?: string | null;
  technologies?: string[];
  author?: { id: number; first_name?: string; last_name?: string; name?: string } | null;
}

export default function MarketplacePage() {
  const { data, isLoading } = useQuery({
    queryKey: ['public-projects'],
    queryFn: () => api.get('/public/projects').then(r => r.data),
  });

  if (isLoading) return <PageSpinner />;

  const projects: any[] = Array.isArray(data) ? data : (data?.results ?? []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Marketplace"
        description="Explore student projects shared with the community"
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Marketplace' }]}
      />

      {projects.length === 0 ? (
        <Card>
          <CardContent>
            <EmptyState
              icon={Code2}
              title="No projects published yet"
              description="Check back soon â€” students are building amazing things!"
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
                    <Code2 className="h-4 w-4 text-brand-600" />
                  </div>
                  <span>{project.title}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {project.description && (
                  <p className="text-sm text-slate-500 line-clamp-3">{project.description}</p>
                )}
                {project.technologies && project.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {project.technologies.map((tech: any) => (
                      <Badge key={tech} variant="secondary" className="text-xs">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                )}
                {project.author && (
                  <p className="text-xs text-slate-400">
                    By {project.author.name ?? ([project.author.first_name, project.author.last_name].filter(Boolean).join(' ') || 'Anonymous')}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
