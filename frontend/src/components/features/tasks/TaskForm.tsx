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
import type { Task } from '@/types';

const taskSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  status: z.enum(['pending', 'in_progress', 'review', 'completed']),
  due_date: z.string().optional(),
  assignee_id: z.string().optional(),
  project_id: z.string().optional(),
});

type TaskFormValues = z.infer<typeof taskSchema>;

interface TaskFormProps {
  task?: Task;
  users?: { id: number; first_name: string; last_name: string }[];
  projects?: { id: number; name: string }[];
  onSubmit: (data: TaskFormValues) => void;
  isLoading?: boolean;
}

export function TaskForm({ task, users = [], projects = [], onSubmit, isLoading }: TaskFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: task?.title || '',
      description: task?.description || '',
      priority: task?.priority || 'medium',
      status: task?.status || 'pending',
      due_date: task?.due_date ? task.due_date.split('T')[0] : '',
      assignee_id: task?.assignee?.id?.toString() || '',
      project_id: task?.project?.id?.toString() || '',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Task Title"
        placeholder="What needs to be done?"
        error={errors.title?.message}
        {...register('title')}
      />

      <Textarea
        label="Description (optional)"
        placeholder="Add more details about this task"
        rows={3}
        {...register('description')}
      />

      <div className="grid grid-cols-2 gap-4">
        <SelectRoot
          value={watch('priority')}
          onValueChange={(value: 'low' | 'medium' | 'high' | 'urgent') =>
            setValue('priority', value)
          }
        >
          <SelectTrigger label="Priority">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
          </SelectContent>
        </SelectRoot>

        <SelectRoot
          value={watch('status')}
          onValueChange={(value: 'pending' | 'in_progress' | 'review' | 'completed') =>
            setValue('status', value)
          }
        >
          <SelectTrigger label="Status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="review">Review</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </SelectRoot>
      </div>

      <Input
        label="Due Date (optional)"
        type="date"
        {...register('due_date')}
      />

      {users.length > 0 && (
        <SelectRoot
          value={watch('assignee_id') || undefined}
          onValueChange={(value) => setValue('assignee_id', value)}
        >
          <SelectTrigger label="Assignee (optional)">
            <SelectValue placeholder="Unassigned" />
          </SelectTrigger>
          <SelectContent>
            {users.map((u) => (
              <SelectItem key={u.id} value={u.id.toString()}>
                {u.first_name} {u.last_name}
              </SelectItem>
            ))}
          </SelectContent>
        </SelectRoot>
      )}

      {projects.length > 0 && (
        <SelectRoot
          value={watch('project_id') || undefined}
          onValueChange={(value) => setValue('project_id', value)}
        >
          <SelectTrigger label="Project (optional)">
            <SelectValue placeholder="No project" />
          </SelectTrigger>
          <SelectContent>
            {projects.map((p) => (
              <SelectItem key={p.id} value={p.id.toString()}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </SelectRoot>
      )}

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="submit" loading={isLoading}>
          {task ? 'Update Task' : 'Create Task'}
        </Button>
      </div>
    </form>
  );
}
