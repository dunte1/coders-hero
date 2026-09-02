import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjects } from '@/hooks/useProjects';
import { useDebounce } from '@/hooks/useDebounce';
import { ProjectCard } from '@/components/features/projects/ProjectCard';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageSpinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { SearchInput } from '@/components/ui/SearchInput';
import { Pagination } from '@/components/ui/Pagination';

const PAGE_SIZE = 12;

export default function ProjectsPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const debouncedSearch = useDebounce(search);

  const params = useMemo(() => {
    const p: Record<string, string | number | boolean> = { page, page_size: PAGE_SIZE };
    if (debouncedSearch) p.search = debouncedSearch;
    if (status !== 'all') p.status = status;
    return p;
  }, [page, debouncedSearch, status]);

  const { data, isLoading, isError } = useProjects(params);

  const projects = data?.results || [];
  const totalPages = data ? Math.ceil(data.count / PAGE_SIZE) : 0;

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

      <div className="flex flex-wrap items-center gap-3">
        <SearchInput
          placeholder="Search projects..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          onClear={() => {
            setSearch('');
            setPage(1);
          }}
          className="w-full sm:w-72"
        />
        <div className="flex items-center gap-1">
          {['all', 'planning', 'active', 'on_hold', 'completed', 'archived'].map((s) => (
            <Button
              key={s}
              variant={status === s ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => {
                setStatus(s);
                setPage(1);
              }}
            >
              {s.replace(/_/g, ' ')}
            </Button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <PageSpinner />
      ) : isError ? (
        <EmptyState title="Could not load projects" description="Please try again later." />
      ) : projects.length === 0 ? (
        <EmptyState
          title="No projects found"
          description="Try adjusting your search or filters, or create a new project"
          action={{ label: 'Create Project', onClick: () => navigate('/projects/create') }}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
          {totalPages > 1 && (
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
              totalCount={data?.count}
              pageSize={PAGE_SIZE}
            />
          )}
        </>
      )}
    </div>
  );
}
