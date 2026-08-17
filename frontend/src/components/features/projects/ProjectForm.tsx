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
import type { Project, ProjectCreate } from '@/types';

const projectSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  status: z.enum(['planning', 'active', 'on_hold', 'completed', 'archived']),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  budget: z.string().optional(),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

interface ProjectFormProps {
  project?: Project;
  onSubmit: (data: ProjectCreate) => void;
  isLoading?: boolean;
}

export function ProjectForm({ project, onSubmit, isLoading }: ProjectFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: project?.name || '',
      description: project?.description || '',
      status: project?.status || 'planning',
      start_date: project?.start_date ? project.start_date.split('T')[0] : '',
      end_date: project?.end_date ? project.end_date.split('T')[0] : '',
      budget: project?.budget?.toString() || '',
    },
  });

  const onFormSubmit = (data: ProjectFormValues) => {
    onSubmit({
      ...data,
      budget: data.budget ? parseFloat(data.budget) : undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
      <Input
        label="Project Name"
        placeholder="e.g. Website Redesign"
        error={errors.name?.message}
        {...register('name')}
      />

      <Textarea
        label="Description"
        placeholder="Describe the project scope and objectives..."
        rows={4}
        error={errors.description?.message}
        {...register('description')}
      />

      <SelectRoot
        value={watch('status')}
        onValueChange={(value: 'planning' | 'active' | 'on_hold' | 'completed' | 'archived') =>
          setValue('status', value)
        }
      >
        <SelectTrigger label="Status">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="planning">Planning</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="on_hold">On Hold</SelectItem>
          <SelectItem value="completed">Completed</SelectItem>
          <SelectItem value="archived">Archived</SelectItem>
        </SelectContent>
      </SelectRoot>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Start Date" type="date" {...register('start_date')} />
        <Input label="End Date" type="date" {...register('end_date')} />
      </div>

      <Input
        label="Budget (USD, optional)"
        type="number"
        min="0"
        step="0.01"
        placeholder="0.00"
        {...register('budget')}
      />

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="submit" loading={isLoading}>
          {project ? 'Update Project' : 'Create Project'}
        </Button>
      </div>
    </form>
  );
}
