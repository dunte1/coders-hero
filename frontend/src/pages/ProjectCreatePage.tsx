import { useNavigate } from 'react-router-dom';
import { useCreateProject } from '@/hooks/useProjects';
import { ProjectForm } from '@/components/features/projects/ProjectForm';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent } from '@/components/ui/Card';
import type { ProjectCreate } from '@/types';

export default function ProjectCreatePage() {
  const navigate = useNavigate();
  const createProject = useCreateProject();

  const handleSubmit = (data: ProjectCreate) => {
    createProject.mutate(data, { onSuccess: () => navigate('/projects') });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader
        title="Create Project"
        breadcrumbs={[{ label: 'Projects', href: '/projects' }, { label: 'Create' }]}
      />
      <Card>
        <CardContent className="p-6">
          <ProjectForm onSubmit={handleSubmit} isLoading={createProject.isPending} />
        </CardContent>
      </Card>
    </div>
  );
}
