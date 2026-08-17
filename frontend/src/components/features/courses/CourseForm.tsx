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
import type { Course, CourseCreate } from '@/types';

const courseSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  short_description: z.string().optional(),
  category_id: z.string().min(1, 'Please select a category'),
  level: z.enum(['beginner', 'intermediate', 'advanced']),
  price: z.string().min(0, 'Price must be 0 or greater'),
});

type CourseFormValues = z.infer<typeof courseSchema>;

interface CourseFormProps {
  course?: Course;
  categories: { id: number; name: string }[];
  onSubmit: (data: CourseCreate) => void;
  isLoading?: boolean;
}

export function CourseForm({ course, categories, onSubmit, isLoading }: CourseFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CourseFormValues>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      title: course?.title || '',
      description: course?.description || '',
      short_description: course?.short_description || '',
      category_id: course?.category?.id?.toString() || '',
      level: course?.level || 'beginner',
      price: course?.price?.toString() || '0',
    },
  });

  const selectedLevel = watch('level');

  const onFormSubmit = (data: CourseFormValues) => {
    onSubmit({
      ...data,
      category_id: parseInt(data.category_id),
      price: parseFloat(data.price),
    });
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      <Input
        label="Course Title"
        placeholder="e.g. Complete Web Development Bootcamp"
        error={errors.title?.message}
        {...register('title')}
      />

      <Textarea
        label="Description"
        placeholder="Describe the course content, learning outcomes, and prerequisites..."
        rows={6}
        error={errors.description?.message}
        {...register('description')}
      />

      <Textarea
        label="Short Description (optional)"
        placeholder="A brief summary of the course"
        rows={2}
        {...register('short_description')}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <SelectRoot
          value={watch('category_id')}
          onValueChange={(value) => setValue('category_id', value)}
        >
          <SelectTrigger label="Category" error={errors.category_id?.message}>
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id.toString()}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </SelectRoot>

        <SelectRoot
          value={selectedLevel}
          onValueChange={(value: 'beginner' | 'intermediate' | 'advanced') =>
            setValue('level', value)
          }
        >
          <SelectTrigger label="Level">
            <SelectValue placeholder="Select level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="beginner">Beginner</SelectItem>
            <SelectItem value="intermediate">Intermediate</SelectItem>
            <SelectItem value="advanced">Advanced</SelectItem>
          </SelectContent>
        </SelectRoot>
      </div>

      <Input
        label="Price (USD)"
        type="number"
        min="0"
        step="0.01"
        placeholder="0.00"
        error={errors.price?.message}
        {...register('price')}
      />

      <div className="flex items-center justify-end gap-3 pt-4 border-t">
        <Button type="submit" loading={isLoading}>
          {course ? 'Update Course' : 'Create Course'}
        </Button>
      </div>
    </form>
  );
}
