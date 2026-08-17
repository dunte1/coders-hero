import { useState } from 'react';
import { useForm, useFieldArray, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2, FileText, Pencil } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { PageSpinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { ConfirmDelete } from '@/components/cms/ConfirmDelete';
import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/Dialog';
import { Badge } from '@/components/ui/Badge';
import {
  useStudentReportCards,
  useCreateReportCard,
  useUpdateReportCard,
  useDeleteReportCard,
} from '@/hooks/useStudents';
import { formatDate } from '@/lib/utils';
import type { ReportCard, ReportCardInput } from '@/types/portal';

const itemSchema = z.object({
  subject: z.string().min(1, 'Subject is required'),
  score: z.string().optional(),
  grade: z.string().optional(),
  teacher_comment: z.string().optional(),
});

const reportCardSchema = z.object({
  term: z.string().min(1, 'Term is required'),
  academic_year: z.string().min(1, 'Academic year is required'),
  issued_at: z.string().min(1, 'Issue date is required'),
  overall_grade: z.string().optional(),
  average_score: z.string().optional(),
  teacher_notes: z.string().optional(),
  items: z.array(itemSchema).min(1, 'Add at least one subject'),
});

type ReportCardFormValues = z.infer<typeof reportCardSchema>;

function emptyItem() {
  return { subject: '', score: '', grade: '', teacher_comment: '' };
}

function ReportCardFormDialog({ studentId, onClose }: { studentId: number; onClose: () => void }) {
  const createMutation = useCreateReportCard();

  const methods = useForm<ReportCardFormValues>({
    resolver: zodResolver(reportCardSchema),
    defaultValues: {
      term: '',
      academic_year: String(new Date().getFullYear()),
      issued_at: new Date().toISOString().slice(0, 10),
      overall_grade: '',
      average_score: '',
      teacher_notes: '',
      items: [emptyItem()],
    },
  });

  const { register, handleSubmit, control } = methods;
  const { fields, append, remove } = useFieldArray({ control, name: 'items' });

  const onSubmit = (values: ReportCardFormValues) => {
    const data: ReportCardInput = {
      term: values.term,
      academic_year: values.academic_year,
      issued_at: values.issued_at,
      overall_grade: values.overall_grade || null,
      average_score: values.average_score ? Number(values.average_score) : null,
      teacher_notes: values.teacher_notes || null,
      items: values.items.map((item) => ({
        subject: item.subject,
        score: item.score ? Number(item.score) : null,
        grade: item.grade || null,
        teacher_comment: item.teacher_comment || null,
      })),
    };
    createMutation.mutate(
      { studentId, data },
      {
        onSuccess: () => onClose(),
      }
    );
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Input label="Term" placeholder="e.g. Term 1" error={methods.formState.errors.term?.message} {...register('term')} />
          <Input label="Academic Year" placeholder="e.g. 2025/2026" error={methods.formState.errors.academic_year?.message} {...register('academic_year')} />
          <Input label="Issue Date" type="date" error={methods.formState.errors.issued_at?.message} {...register('issued_at')} />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Overall Grade" placeholder="e.g. A" {...register('overall_grade')} />
          <Input label="Average Score (%)" type="number" min="0" max="100" {...register('average_score')} />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-700">Subjects</p>
            <Button type="button" variant="outline" size="sm" onClick={() => append(emptyItem())}>
              <Plus className="mr-1 h-4 w-4" />
              Add Subject
            </Button>
          </div>
          {methods.formState.errors.items?.message && (
            <p className="text-xs text-red-500">{methods.formState.errors.items.message}</p>
          )}
          {fields.map((field, index) => (
            <div key={field.id} className="rounded-lg border border-slate-200 p-3">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                <Input
                  label="Subject"
                  placeholder="e.g. Mathematics"
                  error={methods.formState.errors.items?.[index]?.subject?.message}
                  {...register(`items.${index}.subject`)}
                />
                <Input
                  label="Score"
                  type="number"
                  min="0"
                  max="100"
                  placeholder="0-100"
                  {...register(`items.${index}.score`)}
                />
                <Input label="Grade" placeholder="e.g. A" {...register(`items.${index}.grade`)} />
                <div className="flex items-end gap-2">
                  <Input
                    label="Comment"
                    placeholder="Teacher comment"
                    {...register(`items.${index}.teacher_comment`)}
                  />
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 shrink-0 text-red-500"
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <Textarea label="Teacher Notes (optional)" rows={2} {...register('teacher_notes')} />

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={createMutation.isPending}>
            Create Report Card
          </Button>
        </DialogFooter>
      </form>
    </FormProvider>
  );
}

function EditReportCardDialog({ card, onClose }: { card: ReportCard; onClose: () => void }) {
  const updateMutation = useUpdateReportCard();

  const methods = useForm<{ term: string; academic_year: string; issued_at: string; overall_grade: string; average_score: string; teacher_notes: string }>({
    resolver: zodResolver(
      z.object({
        term: z.string().min(1, 'Term is required'),
        academic_year: z.string().min(1, 'Academic year is required'),
        issued_at: z.string().min(1, 'Issue date is required'),
        overall_grade: z.string().optional(),
        average_score: z.string().optional(),
        teacher_notes: z.string().optional(),
      })
    ),
    defaultValues: {
      term: card.term,
      academic_year: card.academic_year,
      issued_at: (card.issued_at || '').slice(0, 10),
      overall_grade: card.overall_grade || '',
      average_score: card.average_score != null ? String(Number(card.average_score)) : '',
      teacher_notes: card.teacher_notes || '',
    },
  });

  const onSubmit = (values: { term: string; academic_year: string; issued_at: string; overall_grade: string; average_score: string; teacher_notes: string }) => {
    updateMutation.mutate(
      {
        reportCardId: card.id,
        data: {
          term: values.term,
          academic_year: values.academic_year,
          issued_at: values.issued_at,
          overall_grade: values.overall_grade || null,
          average_score: values.average_score ? Number(values.average_score) : null,
          teacher_notes: values.teacher_notes || null,
        },
      },
      { onSuccess: () => onClose() }
    );
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Input label="Term" {...methods.register('term')} error={methods.formState.errors.term?.message} />
          <Input label="Academic Year" {...methods.register('academic_year')} error={methods.formState.errors.academic_year?.message} />
          <Input label="Issue Date" type="date" {...methods.register('issued_at')} error={methods.formState.errors.issued_at?.message} />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Overall Grade" {...methods.register('overall_grade')} />
          <Input label="Average Score (%)" type="number" min="0" max="100" {...methods.register('average_score')} />
        </div>
        <Textarea label="Teacher Notes (optional)" rows={2} {...methods.register('teacher_notes')} />
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={updateMutation.isPending}>
            Save Changes
          </Button>
        </DialogFooter>
      </form>
    </FormProvider>
  );
}

export function ReportCardsTab({ studentId }: { studentId: number }) {
  const { data, isLoading } = useStudentReportCards(studentId);
  const deleteMutation = useDeleteReportCard();
  const [createOpen, setCreateOpen] = useState(false);
  const [editCard, setEditCard] = useState<ReportCard | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  if (isLoading) return <PageSpinner />;

  const cards = data || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-700">
          {cards.length} report card{cards.length === 1 ? '' : 's'}
        </p>
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <Plus className="mr-1 h-4 w-4" />
          New Report Card
        </Button>
      </div>

      {cards.length === 0 ? (
        <Card>
          <CardContent>
            <EmptyState
              icon={FileText}
              title="No report cards"
              description="Create a report card to share results with parents."
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {cards.map((card) => (
            <Card key={card.id}>
              <CardHeader>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-base">
                      {card.term} — {card.academic_year}
                    </CardTitle>
                    <p className="text-xs text-slate-500">
                      Issued {formatDate(card.issued_at)} · {card.items_count} subjects
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {card.average_score != null && (
                      <Badge variant="secondary">Avg {Number(card.average_score)}</Badge>
                    )}
                    {card.overall_grade && <Badge>Grade {card.overall_grade}</Badge>}
                    <Button variant="ghost" size="sm" onClick={() => setEditCard(card)}>
                      <Pencil className="mr-1 h-3.5 w-3.5" />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500"
                      onClick={() => setDeleteId(card.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                        <th className="py-2 pr-4">Subject</th>
                        <th className="py-2 pr-4">Score</th>
                        <th className="py-2 pr-4">Grade</th>
                        <th className="py-2">Comment</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {card.items.map((item) => (
                        <tr key={item.id}>
                          <td className="py-2 pr-4 font-medium text-slate-900">{item.subject}</td>
                          <td className="py-2 pr-4 text-slate-700">{item.score != null ? item.score : '—'}</td>
                          <td className="py-2 pr-4 text-slate-700">{item.grade || '—'}</td>
                          <td className="py-2 text-slate-500">{item.teacher_comment || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {card.teacher_notes && (
                  <p className="mt-3 rounded-lg bg-amber-50 p-3 text-xs text-amber-800">
                    <span className="font-semibold">Notes: </span>
                    {card.teacher_notes}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <DialogRoot open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>New Report Card</DialogTitle>
            <DialogDescription>Create a report card with subject results.</DialogDescription>
          </DialogHeader>
          <ReportCardFormDialog studentId={studentId} onClose={() => setCreateOpen(false)} />
        </DialogContent>
      </DialogRoot>

      <DialogRoot open={!!editCard} onOpenChange={(open) => !open && setEditCard(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Report Card</DialogTitle>
            <DialogDescription>Update report card details.</DialogDescription>
          </DialogHeader>
          {editCard && <EditReportCardDialog card={editCard} onClose={() => setEditCard(null)} />}
        </DialogContent>
      </DialogRoot>

      <ConfirmDelete
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Delete Report Card"
        description="Are you sure you want to delete this report card? This action cannot be undone."
        loading={deleteMutation.isPending}
        onConfirm={() => {
          if (deleteId) deleteMutation.mutate(deleteId);
        }}
      />
    </div>
  );
}
