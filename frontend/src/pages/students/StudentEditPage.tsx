import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageSpinner } from '@/components/ui/Spinner';
import { StudentForm } from '@/components/students/StudentForm';
import { useStudent, useUpdateStudent } from '@/hooks/useStudents';
import type { StudentInput } from '@/types/students';

export default function StudentEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const studentId = id ? parseInt(id, 10) : null;

  const { data: student, isLoading } = useStudent(studentId as number);
  const updateMutation = useUpdateStudent();

  if (!studentId) return null;
  if (isLoading) return <PageSpinner />;
  if (!student) return <div className="py-12 text-center text-slate-500">Student not found</div>;

  const handleSubmit = (data: StudentInput) => {
    updateMutation.mutate(
      { id: studentId, data },
      { onSuccess: () => navigate(`/students/${studentId}`) }
    );
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        title={`Edit ${student.full_name}`}
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Students', href: '/students' },
          { label: student.full_name, href: `/students/${studentId}` },
          { label: 'Edit' },
        ]}
      />
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <StudentForm
          key={student.id}
          student={student}
          isEdit
          isSaving={updateMutation.isPending}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}
