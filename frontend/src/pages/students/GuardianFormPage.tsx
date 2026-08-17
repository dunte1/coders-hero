import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageSpinner } from '@/components/ui/Spinner';
import { GuardianForm } from '@/components/students/GuardianForm';
import { useGuardian, useCreateGuardian, useUpdateGuardian } from '@/hooks/useGuardians';
import type { GuardianInput } from '@/types/students';

export default function GuardianFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;
  const guardianId = id ? parseInt(id, 10) : null;

  const { data: guardian, isLoading } = useGuardian(guardianId as number);
  const createMutation = useCreateGuardian();
  const updateMutation = useUpdateGuardian();

  if (isEdit && isLoading) return <PageSpinner />;
  if (isEdit && !guardian) return <div className="py-12 text-center text-slate-500">Guardian not found</div>;

  const handleSubmit = (data: GuardianInput) => {
    if (isEdit && guardianId) {
      updateMutation.mutate(
        { id: guardianId, data },
        { onSuccess: () => navigate('/guardians') }
      );
    } else {
      createMutation.mutate(data, { onSuccess: () => navigate('/guardians') });
    }
  };

  const title = isEdit ? `Edit ${guardian?.full_name}` : 'New Guardian';

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        title={title}
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Guardians', href: '/guardians' },
          { label: isEdit ? 'Edit' : 'New' },
        ]}
      />
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <GuardianForm
          key={guardianId || 'new'}
          guardian={guardian}
          isEdit={isEdit}
          isSaving={createMutation.isPending || updateMutation.isPending}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}
