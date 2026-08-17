import { useEffect } from 'react';
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
import { useAllGuardians } from '@/hooks/useGuardians';
import { useStudentGrades, useStudentBranches } from '@/hooks/useStudents';
import { STUDENT_STATUSES } from '@/components/students/SisBadges';
import type { Gender, Student, StudentInput } from '@/types/students';

const genderSchema = z.enum(['male', 'female', 'other']);

const studentSchema = z.object({
  guardian_id: z.string(),
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  gender: genderSchema.or(z.literal('')),
  date_of_birth: z.string(),
  grade: z.string(),
  branch: z.string(),
  admission_date: z.string(),
  status: z.enum(['pending', 'active', 'suspended', 'withdrawn', 'transferred', 'graduated']),
  medical_notes: z.string(),
});

type StudentFormValues = z.infer<typeof studentSchema>;

const GENDERS: { value: Gender; label: string }[] = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
];

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function toStudentInput(values: StudentFormValues): StudentInput {
  return {
    guardian_id: values.guardian_id ? Number(values.guardian_id) : null,
    first_name: values.first_name,
    last_name: values.last_name,
    gender: values.gender || null,
    date_of_birth: values.date_of_birth || null,
    grade: values.grade || null,
    branch: values.branch || null,
    admission_date: values.admission_date || null,
    status: values.status,
    medical_notes: values.medical_notes || null,
  };
}

interface StudentFormProps {
  student?: Student;
  isEdit: boolean;
  isSaving: boolean;
  onSubmit: (data: StudentInput) => void;
}

export function StudentForm({ student, isEdit, isSaving, onSubmit }: StudentFormProps) {
  const { data: guardians } = useAllGuardians();
  const { data: grades } = useStudentGrades();
  const { data: branches } = useStudentBranches();

  const methods = useForm<StudentFormValues>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      guardian_id: '',
      first_name: '',
      last_name: '',
      gender: '',
      date_of_birth: '',
      grade: '',
      branch: '',
      admission_date: today(),
      status: 'pending',
      medical_notes: '',
    },
  });

  const { register, handleSubmit, setValue, watch, reset } = methods;

  useEffect(() => {
    if (student) {
      reset({
        guardian_id: student.guardian_id ? String(student.guardian_id) : '',
        first_name: student.first_name,
        last_name: student.last_name,
        gender: student.gender || '',
        date_of_birth: student.date_of_birth ? student.date_of_birth.slice(0, 10) : '',
        grade: student.grade || '',
        branch: student.branch || '',
        admission_date: student.admission_date ? student.admission_date.slice(0, 10) : today(),
        status: student.status,
        medical_notes: student.medical_notes || '',
      });
    }
  }, [student, reset]);

  const onFormSubmit = (values: StudentFormValues) => onSubmit(toStudentInput(values));

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="First Name"
            placeholder="e.g. Emma"
            error={methods.formState.errors.first_name?.message}
            {...register('first_name')}
          />
          <Input
            label="Last Name"
            placeholder="e.g. Johnson"
            error={methods.formState.errors.last_name?.message}
            {...register('last_name')}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <SelectRoot
            value={watch('gender')}
            onValueChange={(value: StudentFormValues['gender']) => setValue('gender', value)}
          >
            <SelectTrigger label="Gender">
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              {GENDERS.map((g) => (
                <SelectItem key={g.value} value={g.value}>
                  {g.label}
                </SelectItem>
              ))}
            </SelectContent>
          </SelectRoot>

          <Input
            label="Date of Birth"
            type="date"
            max={today()}
            {...register('date_of_birth')}
          />

          <Input label="Admission Date" type="date" {...register('admission_date')} />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">Grade</label>
            <Input list="student-grades" placeholder="e.g. Grade 3" {...register('grade')} />
            <datalist id="student-grades">
              {(grades || []).map((grade) => (
                <option key={grade} value={grade} />
              ))}
            </datalist>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">Branch</label>
            <Input list="student-branches" placeholder="e.g. Main Campus" {...register('branch')} />
            <datalist id="student-branches">
              {(branches || []).map((branch) => (
                <option key={branch} value={branch} />
              ))}
            </datalist>
          </div>

          <SelectRoot
            value={watch('status')}
            onValueChange={(value: StudentFormValues['status']) => setValue('status', value)}
          >
            <SelectTrigger label="Status">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {STUDENT_STATUSES.map((status) => (
                <SelectItem key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </SelectRoot>
        </div>

        <SelectRoot
          value={watch('guardian_id')}
          onValueChange={(value) => setValue('guardian_id', value)}
        >
          <SelectTrigger label="Guardian">
            <SelectValue placeholder="Select guardian (optional)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No guardian</SelectItem>
            {guardians?.map((g) => (
              <SelectItem key={g.id} value={String(g.id)}>
                {g.full_name}
              </SelectItem>
            ))}
          </SelectContent>
        </SelectRoot>

        <Textarea
          label="Medical Notes"
          rows={3}
          placeholder="Any health notes or conditions to keep on the student profile"
          {...register('medical_notes')}
        />

        <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-4">
          <Button type="submit" loading={isSaving}>
            {isEdit ? 'Save Changes' : 'Create Student'}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
