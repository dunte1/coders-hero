import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import {
  SelectRoot,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/Select';
import { Plus, Trash2 } from 'lucide-react';

const questionSchema = z.object({
  question: z.string().min(5, 'Question is required'),
  question_type: z.enum(['multiple_choice', 'true_false', 'short_answer']),
  options: z.array(z.string()).optional(),
  correct_answer: z.string().min(1, 'Answer is required'),
  points: z.string().min(1, 'Points required'),
});

const quizSchema = z.object({
  title: z.string().min(3, 'Title is required'),
  description: z.string().optional(),
  course_id: z.string().min(1, 'Course is required'),
  time_limit_minutes: z.string().min(1, 'Time limit required'),
  passing_score: z.string().min(1, 'Passing score required'),
  max_attempts: z.string().min(1, 'Max attempts required'),
  questions: z.array(questionSchema).min(1, 'At least one question required'),
});

type QuizFormValues = z.infer<typeof quizSchema>;

interface QuizFormProps {
  courses: { id: number; title: string }[];
  onSubmit: (data: QuizFormValues) => void;
  isLoading?: boolean;
}

export function QuizForm({ courses, onSubmit, isLoading }: QuizFormProps) {
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<QuizFormValues>({
    resolver: zodResolver(quizSchema),
    defaultValues: {
      title: '',
      description: '',
      course_id: '',
      time_limit_minutes: '30',
      passing_score: '70',
      max_attempts: '3',
      questions: [
        {
          question: '',
          question_type: 'multiple_choice',
          options: ['', '', '', ''],
          correct_answer: '',
          points: '10',
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'questions',
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <Input
          label="Quiz Title"
          placeholder="e.g. Chapter 1 Assessment"
          error={errors.title?.message}
          {...register('title')}
        />

        <Textarea
          label="Description (optional)"
          placeholder="Quiz instructions or description"
          rows={2}
          {...register('description')}
        />

        <SelectRoot
          value={watch('course_id')}
          onValueChange={(value) => setValue('course_id', value)}
        >
          <SelectTrigger label="Course" error={errors.course_id?.message}>
            <SelectValue placeholder="Select course" />
          </SelectTrigger>
          <SelectContent>
            {courses.map((c) => (
              <SelectItem key={c.id} value={c.id.toString()}>
                {c.title}
              </SelectItem>
            ))}
          </SelectContent>
        </SelectRoot>

        <div className="grid grid-cols-3 gap-4">
          <Input
            label="Time Limit (min)"
            type="number"
            min="1"
            {...register('time_limit_minutes')}
          />
          <Input
            label="Passing Score (%)"
            type="number"
            min="0"
            max="100"
            {...register('passing_score')}
          />
          <Input
            label="Max Attempts"
            type="number"
            min="1"
            {...register('max_attempts')}
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Questions</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              append({
                question: '',
                question_type: 'multiple_choice',
                options: ['', '', '', ''],
                correct_answer: '',
                points: '10',
              })
            }
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Question
          </Button>
        </div>

        {fields.map((field, index) => (
          <Card key={field.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Question {index + 1}</CardTitle>
                {fields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-500"
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                placeholder="Enter your question"
                rows={2}
                {...register(`questions.${index}.question`)}
              />

              <div className="grid grid-cols-2 gap-3">
                <SelectRoot
                  value={watch(`questions.${index}.question_type`)}
                  onValueChange={(value: 'multiple_choice' | 'true_false' | 'short_answer') =>
                    setValue(`questions.${index}.question_type`, value)
                  }
                >
                  <SelectTrigger label="Type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                    <SelectItem value="true_false">True / False</SelectItem>
                    <SelectItem value="short_answer">Short Answer</SelectItem>
                  </SelectContent>
                </SelectRoot>

                <Input
                  label="Points"
                  type="number"
                  min="1"
                  {...register(`questions.${index}.points`)}
                />
              </div>

              {watch(`questions.${index}.question_type`) === 'multiple_choice' && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-slate-600">Options</p>
                  {[0, 1, 2, 3].map((optIdx) => (
                    <Input
                      key={optIdx}
                      placeholder={`Option ${optIdx + 1}`}
                      {...register(`questions.${index}.options.${optIdx}`)}
                    />
                  ))}
                </div>
              )}

              <Input
                label="Correct Answer"
                placeholder={
                  watch(`questions.${index}.question_type`) === 'true_false'
                    ? 'true or false'
                    : 'Enter the correct answer'
                }
                {...register(`questions.${index}.correct_answer`)}
              />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="submit" loading={isLoading}>
          Create Quiz
        </Button>
      </div>
    </form>
  );
}
