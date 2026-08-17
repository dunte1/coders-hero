import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Switch } from '@/components/ui/Switch';
import {
  SelectRoot,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/Select';
import type { Announcement } from '@/types';

const announcementSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  content: z.string().min(10, 'Content must be at least 10 characters'),
  priority: z.enum(['low', 'normal', 'high', 'urgent']),
  target_audience: z.enum(['all', 'students', 'employees', 'instructors']),
  is_pinned: z.boolean(),
});

type AnnouncementFormValues = z.infer<typeof announcementSchema>;

interface AnnouncementFormProps {
  announcement?: Announcement;
  onSubmit: (data: AnnouncementFormValues) => void;
  isLoading?: boolean;
}

export function AnnouncementForm({
  announcement,
  onSubmit,
  isLoading,
}: AnnouncementFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AnnouncementFormValues>({
    resolver: zodResolver(announcementSchema),
    defaultValues: {
      title: announcement?.title || '',
      content: announcement?.content || '',
      priority: announcement?.priority || 'normal',
      target_audience: announcement?.target_audience || 'all',
      is_pinned: announcement?.is_pinned || false,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Title"
        placeholder="Announcement title"
        error={errors.title?.message}
        {...register('title')}
      />

      <Textarea
        label="Content"
        placeholder="Write your announcement here..."
        rows={6}
        error={errors.content?.message}
        {...register('content')}
      />

      <div className="grid grid-cols-2 gap-4">
        <SelectRoot
          value={watch('priority')}
          onValueChange={(value: 'low' | 'normal' | 'high' | 'urgent') =>
            setValue('priority', value)
          }
        >
          <SelectTrigger label="Priority">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="normal">Normal</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
          </SelectContent>
        </SelectRoot>

        <SelectRoot
          value={watch('target_audience')}
          onValueChange={(value: 'all' | 'students' | 'employees' | 'instructors') =>
            setValue('target_audience', value)
          }
        >
          <SelectTrigger label="Target Audience">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Everyone</SelectItem>
            <SelectItem value="students">Students</SelectItem>
            <SelectItem value="employees">Employees</SelectItem>
            <SelectItem value="instructors">Instructors</SelectItem>
          </SelectContent>
        </SelectRoot>
      </div>

      <div className="flex items-center gap-3">
        <Switch
          checked={watch('is_pinned')}
          onCheckedChange={(checked) => setValue('is_pinned', checked)}
        />
        <label className="text-sm font-medium text-slate-700">Pin this announcement</label>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="submit" loading={isLoading}>
          {announcement ? 'Update' : 'Publish'} Announcement
        </Button>
      </div>
    </form>
  );
}
