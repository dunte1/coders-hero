import { useMyCourses } from '@/hooks/useEnrollments';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageSpinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { CourseCard } from '@/components/features/courses/CourseCard';
import { useNavigate } from 'react-router-dom';

export default function MyCoursesPage() {
  const navigate = useNavigate();
  const { data, isLoading } = useMyCourses();

  const enrollments = data?.results || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Courses"
        description="Continue learning"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'My Courses' }]}
      />

      {isLoading ? (
        <PageSpinner />
      ) : enrollments.length === 0 ? (
        <EmptyState
          title="No courses enrolled"
          description="Browse our catalog to find your next course"
          action={{ label: 'Browse Courses', onClick: () => navigate('/courses') }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {enrollments.map((enrollment) => (
            <CourseCard
              key={enrollment.id}
              course={enrollment.course}
              progress={enrollment.progress}
            />
          ))}
        </div>
      )}
    </div>
  );
}
