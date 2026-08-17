import { useParams, useNavigate } from 'react-router-dom';
import { useCourse, useUpdateCourse } from '@/hooks/useCourses';
import { useQuery } from '@tanstack/react-query';
import { categoriesApi } from '@/lib/api';
import { CourseForm } from '@/components/features/courses/CourseForm';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageSpinner } from '@/components/ui/Spinner';
import type { CourseCreate } from '@/types';

export default function CourseEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: course, isLoading } = useCourse(parseInt(id || '0'));
  const updateCourse = useUpdateCourse();
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesApi.getCategories,
  });

  if (isLoading) return <PageSpinner />;
  if (!course) return <div className="text-center py-12 text-slate-500">Course not found</div>;

  const handleSubmit = (data: CourseCreate) => {
    updateCourse.mutate(
      { id: course.id, data },
      { onSuccess: () => navigate(`/courses/${course.id}`) }
    );
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader
        title="Edit Course"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Courses', href: '/courses' },
          { label: course.title, href: `/courses/${course.id}` },
          { label: 'Edit' },
        ]}
      />
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <CourseForm
          course={course}
          categories={categories || []}
          onSubmit={handleSubmit}
          isLoading={updateCourse.isPending}
        />
      </div>
    </div>
  );
}
