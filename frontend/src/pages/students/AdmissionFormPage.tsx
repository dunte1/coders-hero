import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import {
  SelectRoot,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageSpinner } from '@/components/ui/Spinner';
import { useAdmission, useCreateAdmission, useUpdateAdmission } from '@/hooks/useAdmissions';
import { ADMISSION_STATUSES } from '@/components/students/SisBadges';
import type { Gender } from '@/types/students';

const genderSchema = z.enum(['male', 'female', 'other']);

const admissionSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  date_of_birth: z.string(),
  gender: genderSchema.or(z.literal('')),
  guardian_name: z.string(),
  guardian_phone: z.string(),
  guardian_email: z.string().refine((v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), {
    message: 'Enter a valid email address',
  }),
  program_of_interest: z.string(),
  grade: z.string(),
  preferred_branch: z.string(),
  status: z.enum(['new', 'in_review', 'approved', 'admitted', 'rejected']),
  notes: z.string(),
});

type AdmissionFormValues = z.infer<typeof admissionSchema>;

const GENDERS: { value: Gender; label: string }[] = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
];

export default function AdmissionFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;
  const admissionId = id ? parseInt(id, 10) : null;

  const { data: admission, isLoading } = useAdmission(admissionId as number);
  const createMutation = useCreateAdmission();
  const updateMutation = useUpdateAdmission();

  const methods = useForm<AdmissionFormValues>({
    resolver: zodResolver(admissionSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      date_of_birth: '',
      gender: '',
      guardian_name: '',
      guardian_phone: '',
      guardian_email: '',
      program_of_interest: '',
      grade: '',
      preferred_branch: '',
      status: 'new',
      notes: '',
    },
  });

  const { register, handleSubmit, setValue, watch, reset } = methods;

  useEffect(() => {
    if (admission) {
      reset({
        first_name: admission.first_name,
        last_name: admission.last_name,
        date_of_birth: admission.date_of_birth ? admission.date_of_birth.slice(0, 10) : '',
        gender: admission.gender || '',
        guardian_name: admission.guardian_name || '',
        guardian_phone: admission.guardian_phone || '',
        guardian_email: admission.guardian_email || '',
        program_of_interest: admission.program_of_interest || '',
        grade: admission.grade || '',
        preferred_branch: admission.preferred_branch || '',
        status: admission.status,
        notes: admission.notes || '',
      });
    }
  }, [admission, reset]);

  if (isEdit && isLoading) return <PageSpinner />;
  if (isEdit && !admission) return <div className="py-12 text-center text-slate-500">Application not found</div>;

  const onFormSubmit = (values: AdmissionFormValues) => {
    const payload = {
      first_name: values.first_name,
      last_name: values.last_name,
      date_of_birth: values.date_of_birth || null,
      gender: values.gender || null,
      guardian_name: values.guardian_name || undefined,
      guardian_phone: values.guardian_phone || undefined,
      guardian_email: values.guardian_email || undefined,
      program_of_interest: values.program_of_interest || undefined,
      grade: values.grade || null,
      preferred_branch: values.preferred_branch || undefined,
      status: values.status,
      notes: values.notes || undefined,
    };

    if (isEdit && admissionId) {
      updateMutation.mutate(
        { id: admissionId, data: payload },
        { onSuccess: () => navigate('/admissions') }
      );
    } else {
      createMutation.mutate(payload, { onSuccess: () => navigate('/admissions') });
    }
  };

  const title = isEdit ? 'Edit Application' : 'New Application';

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        title={title}
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Admissions', href: '/admissions' },
          { label: isEdit ? 'Edit' : 'New' },
        ]}
      />
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="First Name"
                placeholder="e.g. Liam"
                error={methods.formState.errors.first_name?.message}
                {...register('first_name')}
              />
              <Input
                label="Last Name"
                placeholder="e.g. Carter"
                error={methods.formState.errors.last_name?.message}
                {...register('last_name')}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <SelectRoot
                value={watch('gender')}
                onValueChange={(value: AdmissionFormValues['gender']) => setValue('gender', value)}
              >
                <SelectTrigger label="Gender">
                  <SelectValue placeholder="Gender" />
                </SelectTrigger>
                <SelectContent>
                  {GENDERS.map((g) => (
                    <SelectItem key={g.value} value={g.value}>
                      {g.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </SelectRoot>

              <Input label="Date of Birth" type="date" max={new Date().toISOString().slice(0, 10)} {...register('date_of_birth')} />

              <SelectRoot
                value={watch('status')}
                onValueChange={(value: AdmissionFormValues['status']) => setValue('status', value)}
              >
                <SelectTrigger label="Status">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {ADMISSION_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </SelectRoot>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Input label="Grade" placeholder="e.g. Grade 5" {...register('grade')} />
              <Input label="Preferred Branch" placeholder="e.g. Main Campus" {...register('preferred_branch')} />
              <Input label="Program of Interest" placeholder="e.g. Robotics" {...register('program_of_interest')} />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Input label="Guardian Name" placeholder="Parent or guardian" {...register('guardian_name')} />
              <Input label="Guardian Phone" placeholder="Contact number" {...register('guardian_phone')} />
              <Input
                label="Guardian Email"
                type="email"
                placeholder="guardian@example.com"
                error={methods.formState.errors.guardian_email?.message}
                {...register('guardian_email')}
              />
            </div>

            <Textarea label="Notes" rows={3} placeholder="Additional application notes" {...register('notes')} />

            <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-4">
              <Button type="submit" loading={createMutation.isPending || updateMutation.isPending}>
                {isEdit ? 'Save Changes' : 'Create Application'}
              </Button>
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  );
}
