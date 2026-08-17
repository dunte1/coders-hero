import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import {
  SelectRoot,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/Select';
import type { Permission, PermissionCreate } from '@/types';

const permissionSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .regex(/^[a-z][a-z0-9_.]*$/, 'Use lowercase letters, numbers, dots and underscores only'),
  display_name: z.string().min(2, 'Display name is required'),
  description: z.string().optional(),
  group: z.string().optional(),
});

type PermissionFormValues = z.infer<typeof permissionSchema>;

interface PermissionFormProps {
  permission?: Permission | null;
  groups: string[];
  onSubmit: (data: PermissionCreate) => void;
  isLoading?: boolean;
  submitLabel?: string;
}

export function PermissionForm({
  permission,
  groups,
  onSubmit,
  isLoading,
  submitLabel,
}: PermissionFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PermissionFormValues>({
    resolver: zodResolver(permissionSchema),
    defaultValues: {
      name: permission?.name || '',
      display_name: permission?.display_name || '',
      description: permission?.description || '',
      group: permission?.group || '',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Permission Name"
        placeholder="course.publish"
        disabled={!!permission}
        error={errors.name?.message}
        {...register('name')}
      />
      <p className="-mt-3 text-xs text-slate-500">
        Machine identifier, e.g. <code>course.publish</code>. Use lowercase and dots.
      </p>
      <Input
        label="Display Name"
        placeholder="Publish Courses"
        error={errors.display_name?.message}
        {...register('display_name')}
      />
      <Textarea
        label="Description (optional)"
        placeholder="What does this permission allow?"
        rows={3}
        error={errors.description?.message}
        {...register('description')}
      />
      <SelectRoot
        value={watch('group') || undefined}
        onValueChange={(value) => setValue('group', value)}
      >
        <SelectTrigger label="Group (optional)" error={errors.group?.message}>
          <SelectValue placeholder="Select a group" />
        </SelectTrigger>
        <SelectContent>
          {groups.map((group) => (
            <SelectItem key={group} value={group}>
              {group}
            </SelectItem>
          ))}
        </SelectContent>
      </SelectRoot>
      <div className="flex justify-end gap-3 pt-2">
        <Button type="submit" loading={isLoading}>
          {submitLabel || (permission ? 'Update Permission' : 'Create Permission')}
        </Button>
      </div>
    </form>
  );
}
