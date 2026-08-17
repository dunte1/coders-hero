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
import { useStudentMedical, useSaveMedicalRecord } from '@/hooks/useStudents';
import { PageSpinner } from '@/components/ui/Spinner';
import type { MedicalRecordInput } from '@/types/students';

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'unknown'];

const medicalSchema = z.object({
  blood_type: z.string(),
  height_cm: z.string(),
  weight_kg: z.string(),
  allergies: z.string(),
  conditions: z.string(),
  medications: z.string(),
  dietary_restrictions: z.string(),
  doctor_name: z.string(),
  doctor_phone: z.string(),
  insurance_provider: z.string(),
  insurance_policy_number: z.string(),
  emergency_contact_name: z.string(),
  emergency_contact_phone: z.string(),
  emergency_contact_relation: z.string(),
  notes: z.string(),
});

type MedicalFormValues = z.infer<typeof medicalSchema>;

function toList(value: string): string[] | undefined {
  const items = value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
  return items.length > 0 ? items : undefined;
}

function fromList(value: string[] | null | undefined): string {
  return (value || []).join(', ');
}

function toPayload(values: MedicalFormValues): MedicalRecordInput {
  return {
    blood_type: values.blood_type || undefined,
    height_cm: values.height_cm ? Number(values.height_cm) : undefined,
    weight_kg: values.weight_kg ? Number(values.weight_kg) : undefined,
    allergies: toList(values.allergies),
    conditions: toList(values.conditions),
    medications: toList(values.medications),
    dietary_restrictions: toList(values.dietary_restrictions),
    doctor_name: values.doctor_name || undefined,
    doctor_phone: values.doctor_phone || undefined,
    insurance_provider: values.insurance_provider || undefined,
    insurance_policy_number: values.insurance_policy_number || undefined,
    emergency_contact_name: values.emergency_contact_name || undefined,
    emergency_contact_phone: values.emergency_contact_phone || undefined,
    emergency_contact_relation: values.emergency_contact_relation || undefined,
    notes: values.notes || undefined,
  };
}

export function MedicalTab({ studentId }: { studentId: number }) {
  const { data: medical, isLoading } = useStudentMedical(studentId);
  const saveMutation = useSaveMedicalRecord();

  const methods = useForm<MedicalFormValues>({
    resolver: zodResolver(medicalSchema),
    defaultValues: {
      blood_type: '',
      height_cm: '',
      weight_kg: '',
      allergies: '',
      conditions: '',
      medications: '',
      dietary_restrictions: '',
      doctor_name: '',
      doctor_phone: '',
      insurance_provider: '',
      insurance_policy_number: '',
      emergency_contact_name: '',
      emergency_contact_phone: '',
      emergency_contact_relation: '',
      notes: '',
    },
  });

  const { register, handleSubmit, setValue, watch, reset } = methods;

  useEffect(() => {
    if (medical) {
      reset({
        blood_type: medical.blood_type || '',
        height_cm: medical.height_cm != null ? String(medical.height_cm) : '',
        weight_kg: medical.weight_kg != null ? String(medical.weight_kg) : '',
        allergies: fromList(medical.allergies),
        conditions: fromList(medical.conditions),
        medications: fromList(medical.medications),
        dietary_restrictions: fromList(medical.dietary_restrictions),
        doctor_name: medical.doctor_name || '',
        doctor_phone: medical.doctor_phone || '',
        insurance_provider: medical.insurance_provider || '',
        insurance_policy_number: medical.insurance_policy_number || '',
        emergency_contact_name: medical.emergency_contact_name || '',
        emergency_contact_phone: medical.emergency_contact_phone || '',
        emergency_contact_relation: medical.emergency_contact_relation || '',
        notes: medical.notes || '',
      });
    }
  }, [medical, reset]);

  const onFormSubmit = (values: MedicalFormValues) => {
    saveMutation.mutate({ studentId, data: toPayload(values) });
  };

  if (isLoading) return <PageSpinner />;

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <SelectRoot
            value={watch('blood_type')}
            onValueChange={(value) => setValue('blood_type', value)}
          >
            <SelectTrigger label="Blood Type">
              <SelectValue placeholder="Blood type" />
            </SelectTrigger>
            <SelectContent>
              {BLOOD_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </SelectRoot>

          <Input label="Height (cm)" type="number" min="0" max="300" {...register('height_cm')} />
          <Input label="Weight (kg)" type="number" min="0" max="500" {...register('weight_kg')} />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Allergies" placeholder="Comma separated, e.g. peanuts, dust" {...register('allergies')} />
          <Input label="Conditions" placeholder="Comma separated, e.g. asthma" {...register('conditions')} />
          <Input label="Medications" placeholder="Comma separated" {...register('medications')} />
          <Input
            label="Dietary Restrictions"
            placeholder="Comma separated, e.g. vegetarian"
            {...register('dietary_restrictions')}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Doctor Name" placeholder="Primary care physician" {...register('doctor_name')} />
          <Input label="Doctor Phone" placeholder="Contact number" {...register('doctor_phone')} />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Insurance Provider" {...register('insurance_provider')} />
          <Input label="Insurance Policy Number" {...register('insurance_policy_number')} />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Input label="Emergency Contact Name" {...register('emergency_contact_name')} />
          <Input label="Emergency Contact Phone" {...register('emergency_contact_phone')} />
          <Input label="Relation to Student" {...register('emergency_contact_relation')} />
        </div>

        <Textarea label="Notes" rows={3} placeholder="Additional medical notes" {...register('notes')} />

        <div className="flex items-center justify-end border-t border-slate-200 pt-4">
          <Button type="submit" loading={saveMutation.isPending}>
            Save Medical Record
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
