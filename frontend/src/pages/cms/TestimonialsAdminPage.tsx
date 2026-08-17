import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Pencil, Plus, Star, Trash2 } from 'lucide-react';
import { cmsApi, getErrorMessage } from '@/lib/cmsApi';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageSpinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Switch } from '@/components/ui/Switch';
import { Badge } from '@/components/ui/Badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar';
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
import { ImageInput } from '@/components/cms/ImageInput';
import { ConfirmDelete } from '@/components/cms/ConfirmDelete';
import { cn, getInitials } from '@/lib/utils';
import type { Testimonial, TestimonialInput } from '@/types/cms';

const testimonialSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  role: z.string().optional(),
  avatar: z.string().optional(),
  content: z.string().min(1, 'Content is required'),
  rating: z.string(),
  is_featured: z.boolean(),
  sort_order: z.string().optional(),
  is_active: z.boolean(),
});

type TestimonialFormValues = z.infer<typeof testimonialSchema>;

function Stars({ rating, className }: { rating: number | null; className?: string }) {
  return (
    <div className={cn('flex gap-0.5', className)}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={cn(
            'h-3.5 w-3.5',
            n <= (rating || 0) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
          )}
        />
      ))}
    </div>
  );
}

interface TestimonialFormDialogProps {
  open: boolean;
  testimonial: Testimonial | null;
  onClose: () => void;
  onSubmit: (id: number | undefined, data: TestimonialInput) => void;
  isSaving: boolean;
}

function TestimonialFormDialog({
  open,
  testimonial,
  onClose,
  onSubmit,
  isSaving,
}: TestimonialFormDialogProps) {
  const { register, handleSubmit, setValue, watch, reset, formState } = useForm<TestimonialFormValues>({
    resolver: zodResolver(testimonialSchema),
    defaultValues: {
      name: '',
      role: '',
      avatar: '',
      content: '',
      rating: '5',
      is_featured: false,
      sort_order: '',
      is_active: true,
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        name: testimonial?.name || '',
        role: testimonial?.role || '',
        avatar: testimonial?.avatar_url || '',
        content: testimonial?.content || '',
        rating: testimonial?.rating != null ? String(testimonial.rating) : '5',
        is_featured: testimonial?.is_featured ?? false,
        sort_order: testimonial?.sort_order != null ? String(testimonial.sort_order) : '',
        is_active: testimonial?.is_active ?? true,
      });
    }
  }, [open, testimonial, reset]);

  const onFormSubmit = (values: TestimonialFormValues) => {
    onSubmit(testimonial?.id, {
      name: values.name,
      role: values.role || undefined,
      avatar: values.avatar || undefined,
      content: values.content,
      rating: parseInt(values.rating, 10),
      is_featured: values.is_featured,
      sort_order: values.sort_order ? parseInt(values.sort_order, 10) : undefined,
      is_active: values.is_active,
    });
  };

  return (
    <DialogRoot open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto max-w-xl">
        <DialogHeader>
          <DialogTitle>{testimonial ? 'Edit Testimonial' : 'New Testimonial'}</DialogTitle>
          <DialogDescription>
            Testimonials are shown on the website landing page.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Name"
              placeholder="e.g. Sarah M."
              error={formState.errors.name?.message}
              {...register('name')}
            />
            <Input label="Role" placeholder="e.g. Parent of a student" {...register('role')} />
          </div>
          <ImageInput
            label="Avatar"
            value={watch('avatar')}
            onChange={(value) => setValue('avatar', value)}
            aspect="aspect-square"
            className="max-w-[200px]"
          />
          <Textarea
            label="Content"
            rows={4}
            placeholder="What did they say?"
            error={formState.errors.content?.message}
            {...register('content')}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SelectRoot
              value={watch('rating')}
              onValueChange={(value) => setValue('rating', value)}
            >
              <SelectTrigger label="Rating">
                <SelectValue placeholder="Rating" />
              </SelectTrigger>
              <SelectContent>
                {[5, 4, 3, 2, 1].map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n} {n === 1 ? 'star' : 'stars'}
                  </SelectItem>
                ))}
              </SelectContent>
            </SelectRoot>
            <Input label="Sort Order" type="number" min="0" {...register('sort_order')} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
              <div>
                <p className="text-sm font-medium text-slate-700">Featured</p>
                <p className="text-xs text-slate-500">Highlighted on the homepage</p>
              </div>
              <Switch checked={watch('is_featured')} onCheckedChange={(v) => setValue('is_featured', v)} />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
              <p className="text-sm font-medium text-slate-700">Active</p>
              <Switch checked={watch('is_active')} onCheckedChange={(v) => setValue('is_active', v)} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={isSaving}>
              {testimonial ? 'Save Changes' : 'Create Testimonial'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </DialogRoot>
  );
}

export default function TestimonialsAdminPage() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['cms', 'testimonials'],
    queryFn: cmsApi.testimonials.get,
  });

  const saveTestimonial = useMutation({
    mutationFn: ({ id, data }: { id?: number; data: TestimonialInput }) =>
      id ? cmsApi.testimonials.update(id, data) : cmsApi.testimonials.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms', 'testimonials'] });
      toast.success('Testimonial saved successfully');
      setDialogOpen(false);
      setEditing(null);
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const toggleFeatured = useMutation({
    mutationFn: ({ id, is_featured }: { id: number; is_featured: boolean }) =>
      cmsApi.testimonials.update(id, { is_featured }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms', 'testimonials'] });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const toggleActive = useMutation({
    mutationFn: ({ id, is_active }: { id: number; is_active: boolean }) =>
      cmsApi.testimonials.update(id, { is_active }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms', 'testimonials'] });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const deleteTestimonial = useMutation({
    mutationFn: (id: number) => cmsApi.testimonials.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms', 'testimonials'] });
      toast.success('Testimonial deleted');
      setDeleteId(null);
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Testimonials"
        description="Manage testimonials shown on the website"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Testimonials' }]}
        actions={
          <Button
            onClick={() => {
              setEditing(null);
              setDialogOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            New Testimonial
          </Button>
        }
      />

      {isLoading ? (
        <PageSpinner />
      ) : !data || data.length === 0 ? (
        <EmptyState
          title="No testimonials found"
          description="Add your first testimonial to get started."
        />
      ) : (
        <div className="space-y-3">
          {data.map((item) => (
            <Card key={item.id} className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 min-w-0">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={item.avatar_url || undefined} />
                    <AvatarFallback>{getInitials(item.name, ' ')}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-slate-900">{item.name}</p>
                      {item.is_featured && (
                        <Badge variant="default">Featured</Badge>
                      )}
                    </div>
                    {item.role && <p className="text-xs text-slate-500">{item.role}</p>}
                    <Stars rating={item.rating} className="mt-1" />
                    <p className="mt-2 max-w-2xl text-sm text-slate-600 line-clamp-2">
                      {item.content}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => toggleFeatured.mutate({ id: item.id, is_featured: !item.is_featured })}
                  >
                    <Star
                      className={cn(
                        'h-4 w-4',
                        item.is_featured ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                      )}
                    />
                  </Button>
                  <Switch
                    checked={item.is_active}
                    onCheckedChange={(checked) =>
                      toggleActive.mutate({ id: item.id, is_active: checked })
                    }
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditing(item);
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
                    onClick={() => setDeleteId(item.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <TestimonialFormDialog
        open={dialogOpen}
        testimonial={editing}
        onClose={() => {
          setDialogOpen(false);
          setEditing(null);
        }}
        onSubmit={(id, data) => saveTestimonial.mutate({ id, data })}
        isSaving={saveTestimonial.isPending}
      />

      <ConfirmDelete
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Delete Testimonial"
        description="Are you sure you want to delete this testimonial? This action cannot be undone."
        loading={deleteTestimonial.isPending}
        onConfirm={() => {
          if (deleteId) deleteTestimonial.mutate(deleteId);
        }}
      />
    </div>
  );
}
