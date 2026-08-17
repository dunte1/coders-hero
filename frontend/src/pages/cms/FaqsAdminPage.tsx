import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { ChevronDown, ChevronUp, Pencil, Plus, Trash2 } from 'lucide-react';
import { cmsApi, getErrorMessage } from '@/lib/cmsApi';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageSpinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Switch } from '@/components/ui/Switch';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import {
  SelectRoot,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/Select';
import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/Dialog';
import { ConfirmDelete } from '@/components/cms/ConfirmDelete';
import type { Faq, FaqInput } from '@/types/cms';

const FAQ_CATEGORIES = ['general', 'programs', 'pricing', 'enrollment', 'safety'] as const;

const faqSchema = z.object({
  question: z.string().min(1, 'Question is required'),
  answer: z.string().min(1, 'Answer is required'),
  category: z.string(),
  sort_order: z.string().optional(),
  is_active: z.boolean(),
});

type FaqFormValues = z.infer<typeof faqSchema>;

interface FaqFormDialogProps {
  open: boolean;
  faq: Faq | null;
  onClose: () => void;
  onSubmit: (id: number | undefined, data: FaqInput) => void;
  isSaving: boolean;
}

function FaqFormDialog({ open, faq, onClose, onSubmit, isSaving }: FaqFormDialogProps) {
  const { register, handleSubmit, setValue, watch, reset, formState } = useForm<FaqFormValues>({
    resolver: zodResolver(faqSchema),
    defaultValues: {
      question: '',
      answer: '',
      category: 'general',
      sort_order: '',
      is_active: true,
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        question: faq?.question || '',
        answer: faq?.answer || '',
        category: faq?.category || 'general',
        sort_order: faq?.sort_order != null ? String(faq.sort_order) : '',
        is_active: faq?.is_active ?? true,
      });
    }
  }, [open, faq, reset]);

  const onFormSubmit = (values: FaqFormValues) => {
    onSubmit(faq?.id, {
      question: values.question,
      answer: values.answer,
      category: values.category || undefined,
      sort_order: values.sort_order ? parseInt(values.sort_order, 10) : undefined,
      is_active: values.is_active,
    });
  };

  return (
    <DialogRoot open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto max-w-xl">
        <DialogHeader>
          <DialogTitle>{faq ? 'Edit FAQ' : 'New FAQ'}</DialogTitle>
          <DialogDescription>
            FAQ items appear on the FAQ section of the website.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <Input
            label="Question"
            placeholder="e.g. What ages are your programs for?"
            error={formState.errors.question?.message}
            {...register('question')}
          />
          <Textarea
            label="Answer"
            rows={4}
            placeholder="Answer to the question..."
            error={formState.errors.answer?.message}
            {...register('answer')}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SelectRoot
              value={watch('category')}
              onValueChange={(value) => setValue('category', value)}
            >
              <SelectTrigger label="Category">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {FAQ_CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </SelectRoot>
            <Input label="Sort Order" type="number" min="0" {...register('sort_order')} />
          </div>
          <div className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
            <p className="text-sm font-medium text-slate-700">Active</p>
            <Switch checked={watch('is_active')} onCheckedChange={(v) => setValue('is_active', v)} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={isSaving}>
              {faq ? 'Save Changes' : 'Create FAQ'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </DialogRoot>
  );
}

export default function FaqsAdminPage() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Faq | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['cms', 'faqs'],
    queryFn: cmsApi.faqs.get,
  });

  const saveFaq = useMutation({
    mutationFn: ({ id, data }: { id?: number; data: FaqInput }) =>
      id ? cmsApi.faqs.update(id, data) : cmsApi.faqs.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms', 'faqs'] });
      toast.success('FAQ saved successfully');
      setDialogOpen(false);
      setEditing(null);
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const reorderFaqs = useMutation({
    mutationFn: (faqs: { id: number; sort_order: number }[]) => cmsApi.faqs.reorder(faqs),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms', 'faqs'] });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const toggleActive = useMutation({
    mutationFn: ({ id, is_active }: { id: number; is_active: boolean }) =>
      cmsApi.faqs.update(id, { is_active }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms', 'faqs'] });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const deleteFaq = useMutation({
    mutationFn: (id: number) => cmsApi.faqs.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms', 'faqs'] });
      toast.success('FAQ deleted');
      setDeleteId(null);
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const move = (index: number, direction: -1 | 1) => {
    if (!data) return;
    const target = index + direction;
    if (target < 0 || target >= data.length) return;
    const next = [...data];
    const [item] = next.splice(index, 1);
    next.splice(target, 0, item);
    reorderFaqs.mutate(
      next.map((faq, i) => ({ id: faq.id, sort_order: faq.sort_order !== i + 1 ? i + 1 : faq.sort_order }))
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="FAQs"
        description="Manage frequently asked questions shown on the website"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'FAQs' }]}
        actions={
          <Button
            onClick={() => {
              setEditing(null);
              setDialogOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            New FAQ
          </Button>
        }
      />

      {isLoading ? (
        <PageSpinner />
      ) : !data || data.length === 0 ? (
        <EmptyState
          title="No FAQs found"
          description="Add your first FAQ to get started."
        />
      ) : (
        <div className="space-y-3">
          {data.map((faq, index) => (
            <Card key={faq.id} className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-slate-900">{faq.question}</p>
                    {faq.category && (
                      <Badge variant="secondary">
                        {faq.category.charAt(0).toUpperCase() + faq.category.slice(1)}
                      </Badge>
                    )}
                  </div>
                  <p className="mt-1 max-w-2xl text-sm text-slate-600 line-clamp-2">{faq.answer}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <div className="flex flex-col mr-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      disabled={index === 0}
                      onClick={() => move(index, -1)}
                    >
                      <ChevronUp className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      disabled={index === data.length - 1}
                      onClick={() => move(index, 1)}
                    >
                      <ChevronDown className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <Switch
                    checked={faq.is_active}
                    onCheckedChange={(checked) =>
                      toggleActive.mutate({ id: faq.id, is_active: checked })
                    }
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditing(faq);
                      setDialogOpen(true);
                    }}
                  >
                    <Pencil className="mr-1 h-3.5 w-3.5" />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-500"
                    onClick={() => setDeleteId(faq.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <FaqFormDialog
        open={dialogOpen}
        faq={editing}
        onClose={() => {
          setDialogOpen(false);
          setEditing(null);
        }}
        onSubmit={(id, data) => saveFaq.mutate({ id, data })}
        isSaving={saveFaq.isPending}
      />

      <ConfirmDelete
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Delete FAQ"
        description="Are you sure you want to delete this FAQ? This action cannot be undone."
        loading={deleteFaq.isPending}
        onConfirm={() => {
          if (deleteId) deleteFaq.mutate(deleteId);
        }}
      />
    </div>
  );
}
