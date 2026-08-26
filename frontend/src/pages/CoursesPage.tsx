import { useState, useMemo } from 'react';
import { useCourses } from '@/hooks/useCourses';
import { useDebounce } from '@/hooks/useDebounce';
import { CourseCard } from '@/components/features/courses/CourseCard';
import { CourseFilter } from '@/components/features/courses/CourseFilter';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageSpinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { useNavigate } from 'react-router-dom';
import { Grid3X3, List } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { SearchInput } from '@/components/ui/SearchInput';
import { categoriesApi } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';

export default function CoursesPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [level, setLevel] = useState('all');
  const [category, setCategory] = useState('all');
  const [status, setStatus] = useState('all');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const debouncedSearch = useDebounce(search);

  const params = useMemo(() => {
    const p: Record<string, string | number | boolean> = {};
    if (debouncedSearch) p.search = debouncedSearch;
    if (level !== 'all') p.level = level;
    if (category !== 'all') p.category = category;
    if (status !== 'all') {
      if (status === 'published') p.is_published = true;
      if (status === 'draft') p.is_published = false;
    }
    return p;
  }, [debouncedSearch, level, category, status]);

  const { data, isLoading, isError } = useCourses(params);
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesApi.getCategories,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Courses"
        description="Browse and manage courses"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Courses' }]}
        actions={
          <Button onClick={() => navigate('/courses/create')}>Create Course</Button>
        }
      />

      <div className="flex items-center gap-3">
        <SearchInput
          placeholder="Search courses..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onClear={() => setSearch('')}
          className="max-w-sm"
        />
        <CourseFilter
          level={level}
          category={category}
          status={status}
          categories={categories || []}
          onLevelChange={setLevel}
          onCategoryChange={setCategory}
          onStatusChange={setStatus}
        />
        <div className="ml-auto flex items-center gap-1">
          <Button
            variant={view === 'grid' ? 'secondary' : 'ghost'}
            size="icon"
            onClick={() => setView('grid')}
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={view === 'list' ? 'secondary' : 'ghost'}
            size="icon"
            onClick={() => setView('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {isLoading ? (
        <PageSpinner />
      ) : isError ? (
        <EmptyState
          title="Could not load courses"
          description="Please try again later."
        />
      ) : !data?.results || data.results.length === 0 ? (
        <EmptyState
          title="No courses found"
          description="Try adjusting your search or filters"
        />
      ) : view === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {data.results.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {data.results.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
}
