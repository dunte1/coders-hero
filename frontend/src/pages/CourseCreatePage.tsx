import { useNavigate } from 'react-router-dom';
import { useCreateCourse } from '@/hooks/useCourses';
import { useQuery } from '@tanstack/react-query';
import { categoriesApi } from '@/lib/api';
import { CourseForm } from '@/components/features/courses/CourseForm';
import { PageHeader } from '@/components/ui/PageHeader';
import type { CourseCreate } from '@/types';

export default function CourseCreatePage() {
  const navigate = useNavigate();
  const createCourse = useCreateCourse();
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesApi.getCategories,
  });

  const handleSubmit = (data: CourseCreate) => {
    createCourse.mutate(data, {
      onSuccess: () => navigate('/courses'),
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader
        title="Create Course"
        description="Add a new course to the platform"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Courses', href: '/courses' },
          { label: 'Create' },
        ]}
      />
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <CourseForm
          categories={categories || []}
          onSubmit={handleSubmit}
          isLoading={createCourse.isPending}
        />
      </div>
    </div>
  );
}
