import { useParams, useNavigate } from 'react-router-dom';
import { useProject } from '@/hooks/useProjects';
import { ProjectDetail } from '@/components/features/projects/ProjectDetail';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageSpinner } from '@/components/ui/Spinner';

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: project, isLoading } = useProject(parseInt(id || '0'));

  if (isLoading) return <PageSpinner />;
  if (!project) return <div className="text-center py-12 text-slate-500">Project not found</div>;

  return (
    <div className="space-y-6">
      <PageHeader
        title={project.name}
        breadcrumbs={[
          { label: 'Projects', href: '/projects' },
          { label: project.name },
        ]}
      />
      <ProjectDetail
        project={project}
        onTaskClick={(taskId) => navigate(`/tasks/${taskId}`)}
      />
    </div>
  );
}
