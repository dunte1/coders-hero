import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageSpinner } from '@/components/ui/Spinner';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { useMyProjects, useDeleteStudentProject, usePublishStudentProject, useUnpublishStudentProject } from '@/hooks/useMyProjects';
import { FolderKanban, Plus, Pencil, Trash2, Eye, Globe, Lock, ExternalLink, Hash } from 'lucide-react';
import type { StudentProject } from '@/types';

const statusVariant: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  planning: 'outline',
  in_progress: 'default',
  completed: 'secondary',
  archived: 'destructive',
};

export default function StudentProjectsPage() {
  const navigate = useNavigate();
  const { data, isLoading } = useMyProjects();
  const deleteMutation = useDeleteStudentProject();
  const publishMutation = usePublishStudentProject();
  const unpublishMutation = useUnpublishStudentProject();
  const [deletingId, setDeletingId] = useState<number | null>(null);

  if (isLoading) return <PageSpinner />;

  const projects = data?.results ?? [];

  const handleDelete = (id: number) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    setDeletingId(id);
    deleteMutation.mutate(id, { onSettled: () => setDeletingId(null) });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Projects"
        description="Manage your projects"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'My Projects' }]}
        actions={
          <Button onClick={() => navigate('/student/projects/create')} className="gap-2">
            <Plus className="h-4 w-4" /> New Project
          </Button>
        }
      />

      {projects.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="No projects yet"
          description="Create your first project to showcase your work."
          action={{ label: 'Create Project', onClick: () => navigate('/student/projects/create') }}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project: StudentProject) => (
            <Card key={project.id} className="flex flex-col">
              <CardContent className="pt-6 flex-1 flex flex-col">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-slate-900 line-clamp-2">{project.title}</h3>
                  <div className="flex items-center gap-1 shrink-0">
                    {project.version_number != null && project.version_number > 0 && (
                      <Badge variant="secondary" className="gap-1">
                        <Hash className="h-3 w-3" /> v{project.version_number}
                      </Badge>
                    )}
                    <Badge variant={statusVariant[project.status] ?? 'outline'}>
                      {project.status.replace('_', ' ')}
                    </Badge>
                    {project.is_published && (
                      <Badge variant="default" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                        <Globe className="h-3 w-3 mr-1" /> Published
                      </Badge>
                    )}
                  </div>
                </div>

                {project.description && (
                  <p className="text-sm text-slate-500 line-clamp-2 mb-3">{project.description}</p>
                )}

                {project.technologies && project.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {project.technologies.map((tech) => (
                      <Badge key={tech} variant="outline" className="text-xs">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-2 text-xs text-slate-400 mb-3">
                  {project.media && project.media.length > 0 && (
                    <span>{project.media.length} media</span>
                  )}
                  {project.final_score != null && (
                    <span>Score: {project.final_score}</span>
                  )}
                </div>

                <div className="mt-auto flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/student/projects/${project.id}`)}
                    className="gap-1"
                  >
                    <Eye className="h-3.5 w-3.5" /> View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/student/projects/${project.id}/edit`)}
                    className="gap-1"
                  >
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </Button>
                  {project.repo_url && (
                    <a href={project.repo_url} target="_blank" rel="noopener noreferrer">
                      <Button variant="ghost" size="sm" className="gap-1 px-2">
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Button>
                    </a>
                  )}
                  {project.is_published ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => unpublishMutation.mutate(project.id)}
                      disabled={unpublishMutation.isPending}
                      className="gap-1 px-2"
                    >
                      <Lock className="h-3.5 w-3.5" />
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => publishMutation.mutate(project.id)}
                      disabled={publishMutation.isPending}
                      className="gap-1 px-2"
                    >
                      <Globe className="h-3.5 w-3.5" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(project.id)}
                    disabled={deletingId === project.id}
                    className="gap-1 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
