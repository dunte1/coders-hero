import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { cmsApi, getErrorMessage } from '@/lib/cmsApi';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageSpinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { SearchInput } from '@/components/ui/SearchInput';
import { Pagination } from '@/components/ui/Pagination';
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
import { ImageInput } from '@/components/cms/ImageInput';
import { ConfirmDelete } from '@/components/cms/ConfirmDelete';
import type { GalleryItem, GalleryItemInput } from '@/types/cms';

const GALLERY_CATEGORIES = ['Robotics', 'Coding', 'STEM', 'Events'];

const gallerySchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  category: z.string().optional(),
  image: z.string().min(1, 'An image is required'),
  is_active: z.boolean(),
});

type GalleryFormValues = z.infer<typeof gallerySchema>;

interface GalleryFormDialogProps {
  open: boolean;
  item: GalleryItem | null;
  onClose: () => void;
  onSubmit: (id: number | undefined, data: GalleryItemInput) => void;
  isSaving: boolean;
}

function GalleryFormDialog({ open, item, onClose, onSubmit, isSaving }: GalleryFormDialogProps) {
  const { register, handleSubmit, setValue, watch, reset, formState } = useForm<GalleryFormValues>({
    resolver: zodResolver(gallerySchema),
    defaultValues: {
      title: '',
      description: '',
      category: '',
      image: '',
      is_active: true,
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        title: item?.title || '',
        description: item?.description || '',
        category: item?.category || '',
        image: item?.image_url || '',
        is_active: item?.is_active ?? true,
      });
    }
  }, [open, item, reset]);

  const onFormSubmit = (values: GalleryFormValues) => {
    onSubmit(item?.id, {
      title: values.title,
      description: values.description || undefined,
      category: values.category || undefined,
      image: values.image || undefined,
      is_active: values.is_active,
    });
  };

  return (
    <DialogRoot open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto max-w-xl">
        <DialogHeader>
          <DialogTitle>{item ? 'Edit Photo' : 'Add Photo'}</DialogTitle>
          <DialogDescription>
            Photos are displayed in the website gallery.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <ImageInput
            label="Image"
            value={watch('image')}
            onChange={(value) => setValue('image', value)}
          />
          {formState.errors.image?.message && (
            <p className="-mt-2 text-xs text-red-500">{formState.errors.image.message}</p>
          )}
          <Input
            label="Title"
            placeholder="e.g. Robotics Showcase Battle"
            error={formState.errors.title?.message}
            {...register('title')}
          />
          <Textarea
            label="Description"
            rows={2}
            placeholder="Short description"
            {...register('description')}
          />
          <SelectRoot
            value={watch('category') || ''}
            onValueChange={(value) => setValue('category', value)}
          >
            <SelectTrigger label="Category">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Robotics">Robotics</SelectItem>
              <SelectItem value="Coding">Coding</SelectItem>
              <SelectItem value="STEM">STEM</SelectItem>
              <SelectItem value="Events">Events</SelectItem>
            </SelectContent>
          </SelectRoot>
          <div className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
            <div>
              <p className="text-sm font-medium text-slate-700">Active</p>
              <p className="text-xs text-slate-500">Show this photo on the website</p>
            </div>
            <Switch checked={watch('is_active')} onCheckedChange={(v) => setValue('is_active', v)} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={isSaving}>
              {item ? 'Save Changes' : 'Add Photo'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </DialogRoot>
  );
}

export default function GalleryAdminPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<GalleryItem | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const params = useMemo(
    () => ({
      page,
      per_page: 20,
      category: category !== 'all' ? category : undefined,
    }),
    [page, category]
  );

  const { data, isLoading } = useQuery({
    queryKey: ['cms', 'gallery', params],
    queryFn: () => cmsApi.gallery.list(params),
  });

  const filtered = (data?.results || []).filter((item) => {
    const haystack = `${item.title} ${item.description || ''}`.toLowerCase();
    return haystack.includes(search.toLowerCase());
  });

  const saveItem = useMutation({
    mutationFn: ({ id, data }: { id?: number; data: GalleryItemInput }) =>
      id ? cmsApi.gallery.update(id, data) : cmsApi.gallery.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms', 'gallery'] });
      toast.success('Photo saved successfully');
      setDialogOpen(false);
      setEditing(null);
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const deleteItem = useMutation({
    mutationFn: (id: number) => cmsApi.gallery.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms', 'gallery'] });
      toast.success('Photo deleted');
      setDeleteId(null);
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gallery"
        description="Manage photos displayed on the website"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Gallery' }]}
        actions={
          <Button
            onClick={() => {
              setEditing(null);
              setDialogOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Photo
          </Button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchInput
          placeholder="Search photos..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onClear={() => setSearch('')}
          className="max-w-sm"
        />
        <SelectRoot
          value={category}
          onValueChange={(value) => {
            setCategory(value);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {GALLERY_CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </SelectRoot>
      </div>

      {isLoading ? (
        <PageSpinner />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No photos found"
          description="Try adjusting your search or filters, or add a new photo."
          action={{ label: 'Add Photo', onClick: () => setDialogOpen(true) }}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((item) => (
            <Card key={item.id} className="group overflow-hidden">
              <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-slate-400">
                    No image
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-white"
                    onClick={() => {
                      setEditing(item);
                      setDialogOpen(true);
                    }}
                  >
                    <Pencil className="mr-1 h-3.5 w-3.5" />
                    Edit
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => setDeleteId(item.id)}>
                    <Trash2 className="mr-1 h-3.5 w-3.5" />
                    Delete
                  </Button>
                </div>
                {!item.is_active && (
                  <Badge className="absolute left-2 top-2 bg-amber-100 text-amber-700">
                    Inactive
                  </Badge>
                )}
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-medium text-slate-900">{item.title}</p>
                  {item.category && <Badge variant="secondary">{item.category}</Badge>}
                </div>
                {item.description && (
                  <p className="mt-1 truncate text-xs text-slate-500">{item.description}</p>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {data && data.meta.last_page > 1 && (
        <Pagination
          currentPage={page}
          totalPages={data.meta.last_page}
          onPageChange={setPage}
          totalCount={data.meta.total}
          pageSize={data.meta.per_page}
        />
      )}

      <GalleryFormDialog
        open={dialogOpen}
        item={editing}
        onClose={() => {
          setDialogOpen(false);
          setEditing(null);
        }}
        onSubmit={(id, data) => saveItem.mutate({ id, data })}
        isSaving={saveItem.isPending}
      />

      <ConfirmDelete
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Delete Photo"
        description="Are you sure you want to delete this photo? This action cannot be undone."
        loading={deleteItem.isPending}
        onConfirm={() => {
          if (deleteId) deleteItem.mutate(deleteId);
        }}
      />
    </div>
  );
}
