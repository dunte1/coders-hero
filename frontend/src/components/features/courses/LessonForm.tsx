import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Switch } from '@/components/ui/Switch';
import type { Lesson, LessonCreate } from '@/types';

const lessonSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  description: z.string().optional(),
  content: z.string().min(10, 'Content must be at least 10 characters'),
  video_url: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  duration_minutes: z.string().min(1, 'Duration is required'),
  is_free: z.boolean(),
});

type LessonFormValues = z.infer<typeof lessonSchema>;

interface LessonFormProps {
  lesson?: Lesson;
  onSubmit: (data: LessonCreate) => void;
  isLoading?: boolean;
}

export function LessonForm({ lesson, onSubmit, isLoading }: LessonFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<LessonFormValues>({
    resolver: zodResolver(lessonSchema),
    defaultValues: {
      title: lesson?.title || '',
      description: lesson?.description || '',
      content: lesson?.content || '',
      video_url: lesson?.video_url || '',
      duration_minutes: lesson?.duration_minutes?.toString() || '15',
      is_free: lesson?.is_free || false,
    },
  });

  const isFree = watch('is_free');

  const onFormSubmit = (data: LessonFormValues) => {
    onSubmit({
      ...data,
      duration_minutes: parseInt(data.duration_minutes),
    });
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
      <Input
        label="Lesson Title"
        placeholder="e.g. Introduction to Variables"
        error={errors.title?.message}
        {...register('title')}
      />

      <Textarea
        label="Description (optional)"
        placeholder="Brief description of this lesson"
        rows={2}
        {...register('description')}
      />

      <Textarea
        label="Content"
        placeholder="Write the lesson content here..."
        rows={8}
        error={errors.content?.message}
        {...register('content')}
      />

      <Input
        label="Video URL (optional)"
        type="url"
        placeholder="https://..."
        error={errors.video_url?.message}
        {...register('video_url')}
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Duration (minutes)"
          type="number"
          min="1"
          error={errors.duration_minutes?.message}
          {...register('duration_minutes')}
        />

        <div className="flex items-end pb-2">
          <label className="flex items-center gap-3 cursor-pointer">
            <Switch
              checked={isFree}
              onCheckedChange={(checked) => setValue('is_free', checked)}
            />
            <span className="text-sm font-medium text-slate-700">Free lesson</span>
          </label>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="submit" loading={isLoading}>
          {lesson ? 'Update Lesson' : 'Create Lesson'}
        </Button>
      </div>
    </form>
  );
}
