import { useParams, useNavigate } from 'react-router-dom';
import { useProject, useUpdateProject } from '@/hooks/useProjects';
import { ProjectForm } from '@/components/features/projects/ProjectForm';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageSpinner } from '@/components/ui/Spinner';
import { Card, CardContent } from '@/components/ui/Card';
import type { ProjectCreate } from '@/types';

export default function ProjectEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: project, isLoading } = useProject(parseInt(id || '0'));
  const updateProject = useUpdateProject();

  if (isLoading) return <PageSpinner />;
  if (!project) return <div className="text-center py-12">Project not found</div>;

  const handleSubmit = (data: ProjectCreate) => {
    updateProject.mutate({ id: project.id, data }, { onSuccess: () => navigate(`/projects/${project.id}`) });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader
        title="Edit Project"
        breadcrumbs={[{ label: 'Projects', href: '/projects' }, { label: 'Edit' }]}
      />
      <Card>
        <CardContent className="p-6">
          <ProjectForm project={project} onSubmit={handleSubmit} isLoading={updateProject.isPending} />
        </CardContent>
      </Card>
    </div>
  );
}
