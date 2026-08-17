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
import { Switch } from '@/components/ui/Switch';
import { Button } from '@/components/ui/Button';
import type { Guardian, GuardianInput } from '@/types/students';

const guardianSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  relationship: z.enum(['parent', 'guardian', 'relative', 'other']),
  phone: z.string(),
  email: z.string().refine((v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), {
    message: 'Enter a valid email address',
  }),
  address: z.string(),
  occupation: z.string(),
  is_primary: z.boolean(),
  notes: z.string(),
});

type GuardianFormValues = z.infer<typeof guardianSchema>;

function toGuardianInput(values: GuardianFormValues): GuardianInput {
  return {
    first_name: values.first_name,
    last_name: values.last_name,
    relationship: values.relationship,
    phone: values.phone || undefined,
    email: values.email || undefined,
    address: values.address || undefined,
    occupation: values.occupation || undefined,
    is_primary: values.is_primary,
    notes: values.notes || undefined,
  };
}

interface GuardianFormProps {
  guardian?: Guardian;
  isEdit: boolean;
  isSaving: boolean;
  onSubmit: (data: GuardianInput) => void;
}

export function GuardianForm({ guardian, isEdit, isSaving, onSubmit }: GuardianFormProps) {
  const methods = useForm<GuardianFormValues>({
    resolver: zodResolver(guardianSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      relationship: 'parent',
      phone: '',
      email: '',
      address: '',
      occupation: '',
      is_primary: true,
      notes: '',
    },
  });

  const { register, handleSubmit, setValue, watch, reset } = methods;

  useEffect(() => {
    if (guardian) {
      reset({
        first_name: guardian.first_name,
        last_name: guardian.last_name,
        relationship: guardian.relationship,
        phone: guardian.phone || '',
        email: guardian.email || '',
        address: guardian.address || '',
        occupation: guardian.occupation || '',
        is_primary: guardian.is_primary,
        notes: guardian.notes || '',
      });
    }
  }, [guardian, reset]);

  const onFormSubmit = (values: GuardianFormValues) => onSubmit(toGuardianInput(values));

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="First Name"
            placeholder="e.g. Sarah"
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

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <SelectRoot
            value={watch('relationship')}
            onValueChange={(value: GuardianFormValues['relationship']) => setValue('relationship', value)}
          >
            <SelectTrigger label="Relationship">
              <SelectValue placeholder="Relationship" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="parent">Parent</SelectItem>
              <SelectItem value="guardian">Guardian</SelectItem>
              <SelectItem value="relative">Relative</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </SelectRoot>

          <Input
            label="Phone"
            placeholder="e.g. +1 555 000 1234"
            error={methods.formState.errors.phone?.message}
            {...register('phone')}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Email"
            type="email"
            placeholder="e.g. sarah@example.com"
            error={methods.formState.errors.email?.message}
            {...register('email')}
          />
          <Input label="Occupation" placeholder="e.g. Engineer" {...register('occupation')} />
        </div>

        <Textarea
          label="Address"
          rows={2}
          placeholder="Home address"
          {...register('address')}
        />

        <Textarea
          label="Notes"
          rows={2}
          placeholder="Any additional notes"
          {...register('notes')}
        />

        <div className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
          <p className="text-sm font-medium text-slate-700">Primary contact</p>
          <Switch checked={watch('is_primary')} onCheckedChange={(v) => setValue('is_primary', v)} />
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-4">
          <Button type="submit" loading={isSaving}>
            {isEdit ? 'Save Changes' : 'Create Guardian'}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
