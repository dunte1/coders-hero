import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjects } from '@/hooks/useProjects';
import { ProjectCard } from '@/components/features/projects/ProjectCard';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageSpinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';

export default function ProjectsPage() {
  const navigate = useNavigate();
  const [page] = useState(1);
  const { data, isLoading } = useProjects({ page, page_size: 12 });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Projects"
        description="Manage team projects"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Projects' }]}
        actions={
          <Button onClick={() => navigate('/projects/create')}>Create Project</Button>
        }
      />

      {isLoading ? (
        <PageSpinner />
      ) : !data?.results || data.results.length === 0 ? (
        <EmptyState
          title="No projects yet"
          description="Create your first project to get started"
          action={{ label: 'Create Project', onClick: () => navigate('/projects/create') }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {data.results.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
