import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/ui/PageHeader';
import { StudentForm } from '@/components/students/StudentForm';
import { useCreateStudent } from '@/hooks/useStudents';
import type { StudentInput } from '@/types/students';

export default function StudentCreatePage() {
  const navigate = useNavigate();
  const createMutation = useCreateStudent();

  const handleSubmit = (data: StudentInput) => {
    createMutation.mutate(data, {
      onSuccess: (student) => navigate(`/students/${student.id}`),
    });
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        title="New Student"
        description="Create a student record. A unique student ID and QR code are generated automatically."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Students', href: '/students' },
          { label: 'New' },
        ]}
      />
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <StudentForm isEdit={false} isSaving={createMutation.isPending} onSubmit={handleSubmit} />
      </div>
    </div>
  );
}
