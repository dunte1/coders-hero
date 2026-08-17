import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Trash2 } from 'lucide-react';
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
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { PageSpinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { ConfirmDelete } from '@/components/cms/ConfirmDelete';
import { Badge } from '@/components/ui/Badge';
import { useStudentTimeline, useAddTimelineEntry, useDeleteTimelineEntry } from '@/hooks/useStudents';
import { TIMELINE_EVENT_TYPES } from '@/components/students/SisBadges';
import { formatDate } from '@/lib/utils';
import { useState } from 'react';

const timelineSchema = z.object({
  event_type: z.string().min(1, 'Event type is required'),
  title: z.string().min(1, 'Title is required'),
  description: z.string(),
  occurred_on: z.string(),
});

type TimelineFormValues = z.infer<typeof timelineSchema>;

export function TimelineTab({ studentId }: { studentId: number }) {
  const { data, isLoading } = useStudentTimeline(studentId);
  const addMutation = useAddTimelineEntry();
  const deleteMutation = useDeleteTimelineEntry();
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const methods = useForm<TimelineFormValues>({
    resolver: zodResolver(timelineSchema),
    defaultValues: {
      event_type: 'note',
      title: '',
      description: '',
      occurred_on: new Date().toISOString().slice(0, 10),
    },
  });

  const { register, handleSubmit, setValue, watch, reset } = methods;

  const onFormSubmit = (values: TimelineFormValues) => {
    addMutation.mutate(
      {
        studentId,
        data: {
          event_type: values.event_type,
          title: values.title,
          description: values.description || undefined,
          occurred_on: values.occurred_on || undefined,
        },
      },
      {
        onSuccess: () => reset({ event_type: 'note', title: '', description: '', occurred_on: new Date().toISOString().slice(0, 10) }),
      }
    );
  };

  if (isLoading) return <PageSpinner />;

  const entries = data?.results || [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Add Timeline Entry</CardTitle>
        </CardHeader>
        <CardContent>
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <SelectRoot
                  value={watch('event_type')}
                  onValueChange={(value) => setValue('event_type', value)}
                >
                  <SelectTrigger label="Event Type">
                    <SelectValue placeholder="Event type" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIMELINE_EVENT_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </SelectRoot>
                <Input
                  label="Title"
                  placeholder="e.g. Won regional robotics competition"
                  error={methods.formState.errors.title?.message}
                  {...register('title')}
                />
                <Input label="Date" type="date" {...register('occurred_on')} />
              </div>
              <Textarea
                label="Description"
                rows={2}
                placeholder="Optional details"
                {...register('description')}
              />
              <div className="flex justify-end">
                <Button type="submit" loading={addMutation.isPending}>
                  Add Entry
                </Button>
              </div>
            </form>
          </FormProvider>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Timeline ({entries.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {entries.length === 0 ? (
            <EmptyState title="No timeline entries" description="Student activity will appear here." />
          ) : (
            <div className="relative space-y-6 border-l border-slate-200 pl-5">
              {entries.map((entry) => (
                <div key={entry.id} className="relative">
                  <span className="absolute -left-[27px] top-1.5 h-3 w-3 rounded-full border-2 border-brand-500 bg-white" />
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-medium text-slate-900">{entry.title}</p>
                        <Badge variant="secondary">{entry.event_type}</Badge>
                      </div>
                      {entry.description && (
                        <p className="mt-1 text-sm text-slate-500">{entry.description}</p>
                      )}
                      <p className="mt-1 text-xs text-slate-400">
                        {entry.occurred_on ? formatDate(entry.occurred_on) : formatDate(entry.created_at)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0 text-red-500"
                      onClick={() => setDeleteId(entry.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmDelete
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Delete Timeline Entry"
        description="Are you sure you want to delete this timeline entry? This action cannot be undone."
        loading={deleteMutation.isPending}
        onConfirm={() => {
          if (deleteId) deleteMutation.mutate(deleteId);
        }}
      />
    </div>
  );
}
