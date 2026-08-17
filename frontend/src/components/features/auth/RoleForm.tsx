import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import type { Role, RoleCreate } from '@/types';

const roleSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .regex(/^[a-z][a-z0-9_]*$/, 'Use lowercase letters, numbers and underscores only'),
  display_name: z.string().min(2, 'Display name is required'),
  description: z.string().optional(),
});

type RoleFormValues = z.infer<typeof roleSchema>;

interface RoleFormProps {
  role?: Role | null;
  onSubmit: (data: RoleCreate) => void;
  isLoading?: boolean;
  submitLabel?: string;
}

export function RoleForm({ role, onSubmit, isLoading, submitLabel }: RoleFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RoleFormValues>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      name: role?.name || '',
      display_name: role?.display_name || '',
      description: role?.description || '',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Role Name"
        placeholder="content_manager"
        disabled={!!role}
        error={errors.name?.message}
        {...register('name')}
      />
      <p className="-mt-3 text-xs text-slate-500">
        Unique identifier used by the system. Use lowercase snake_case.
      </p>
      <Input
        label="Display Name"
        placeholder="Content Manager"
        error={errors.display_name?.message}
        {...register('display_name')}
      />
      <Textarea
        label="Description (optional)"
        placeholder="What is this role responsible for?"
        rows={3}
        error={errors.description?.message}
        {...register('description')}
      />
      <div className="flex justify-end gap-3 pt-2">
        <Button type="submit" loading={isLoading}>
          {submitLabel || (role ? 'Update Role' : 'Create Role')}
        </Button>
      </div>
    </form>
  );
}
