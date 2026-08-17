import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { ChevronUp, ChevronDown, Pencil, Plus, Trash2 } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cmsApi, getErrorMessage } from '@/lib/cmsApi';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageSpinner } from '@/components/ui/Spinner';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Switch } from '@/components/ui/Switch';
import { Badge } from '@/components/ui/Badge';
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
import { cn } from '@/lib/utils';
import type { Service, ServiceInput } from '@/types/cms';

const serviceSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  short_description: z.string().min(1, 'Short description is required'),
  icon: z.string().optional(),
  featuresText: z.string().optional(),
  image: z.string().optional(),
  is_active: z.boolean(),
  sort_order: z.string().optional(),
});

type ServiceFormValues = z.infer<typeof serviceSchema>;

const ICON_SUGGESTIONS = ['Code2', 'Bot', 'Cpu', 'Rocket', 'Wrench', 'CircuitBoard', 'Laptop', 'Brain'];

function ServiceIcon({ name, className }: { name?: string | null; className?: string }) {
  const Icon = (LucideIcons as unknown as Record<string, LucideIcon>)[name || ''] || LucideIcons.Code2;
  return <Icon className={className} />;
}

interface ServiceFormDialogProps {
  open: boolean;
  service: Service | null;
  onClose: () => void;
  onSubmit: (id: number | undefined, data: ServiceInput) => void;
  isSaving: boolean;
}

function ServiceFormDialog({ open, service, onClose, onSubmit, isSaving }: ServiceFormDialogProps) {
  const { register, handleSubmit, setValue, watch, reset, formState } = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: '',
      short_description: '',
      icon: '',
      featuresText: '',
      image: '',
      is_active: true,
      sort_order: '',
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        name: service?.name || '',
        short_description: service?.short_description || '',
        icon: service?.icon || '',
        featuresText: (service?.features || []).join('\n'),
        image: service?.image_url || '',
        is_active: service?.is_active ?? true,
        sort_order: service?.sort_order != null ? String(service.sort_order) : '',
      });
    }
  }, [open, service, reset]);

  const onFormSubmit = (values: ServiceFormValues) => {
    const features = values.featuresText
      ? values.featuresText
          .split('\n')
          .map((f) => f.trim())
          .filter(Boolean)
      : [];
    onSubmit(service?.id, {
      name: values.name,
      short_description: values.short_description,
      icon: values.icon || undefined,
      image: values.image || undefined,
      features,
      is_active: values.is_active,
      sort_order: values.sort_order ? parseInt(values.sort_order, 10) : undefined,
    });
  };

  return (
    <DialogRoot open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto max-w-xl">
        <DialogHeader>
          <DialogTitle>{service ? 'Edit Service' : 'New Service'}</DialogTitle>
          <DialogDescription>
            Services are shown on the website services section.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <Input
            label="Name"
            placeholder="e.g. Coding Classes"
            error={formState.errors.name?.message}
            {...register('name')}
          />
          <Textarea
            label="Short Description"
            rows={2}
            placeholder="Brief description shown on the card"
            error={formState.errors.short_description?.message}
            {...register('short_description')}
          />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Icon</label>
            <div className="flex flex-wrap items-center gap-2">
              <Input
                placeholder="lucide icon name, e.g. Code2"
                className="max-w-[220px]"
                {...register('icon')}
              />
              {ICON_SUGGESTIONS.map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => setValue('icon', name)}
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:border-brand-500 hover:text-brand-600 transition-colors',
                    watch('icon') === name && 'border-brand-500 text-brand-600 bg-brand-50'
                  )}
                >
                  <ServiceIcon name={name} className="h-4 w-4" />
                </button>
              ))}
            </div>
          </div>
          <Textarea
            label="Features (one per line)"
            rows={4}
            placeholder={'Beginner friendly\nSmall class sizes\n...'}
            {...register('featuresText')}
          />
          {watch('featuresText') ? (
            <div className="flex flex-wrap gap-1.5">
              {(watch('featuresText') || '')
                .split('\n')
                .map((f) => f.trim())
                .filter(Boolean)
                .map((f, i) => (
                  <Badge key={`${f}-${i}`} variant="secondary">
                    {f}
                  </Badge>
                ))}
            </div>
          ) : null}
          <ImageInput
            label="Image"
            value={watch('image')}
            onChange={(value) => setValue('image', value)}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Sort Order" type="number" min="0" {...register('sort_order')} />
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
              {service ? 'Save Changes' : 'Create Service'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </DialogRoot>
  );
}

export default function ServicesAdminPage() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['cms', 'services'],
    queryFn: cmsApi.services.get,
  });

  const saveService = useMutation({
    mutationFn: ({ id, data }: { id?: number; data: ServiceInput }) =>
      id ? cmsApi.services.update(id, data) : cmsApi.services.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms', 'services'] });
      toast.success('Service saved successfully');
      setDialogOpen(false);
      setEditing(null);
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const toggleActive = useMutation({
    mutationFn: ({ id, is_active }: { id: number; is_active: boolean }) =>
      cmsApi.services.update(id, { is_active }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms', 'services'] });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const reorder = useMutation({
    mutationFn: (services: Service[]) =>
      cmsApi.services.reorder(services.map((s, i) => ({ id: s.id, sort_order: i }))),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms', 'services'] });
      toast.success('Services reordered');
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const deleteService = useMutation({
    mutationFn: (id: number) => cmsApi.services.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms', 'services'] });
      toast.success('Service deleted');
      setDeleteId(null);
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const move = (index: number, direction: -1 | 1) => {
    const list = data || [];
    const target = index + direction;
    if (target < 0 || target >= list.length) return;
    const next = [...list];
    [next[index], next[target]] = [next[target], next[index]];
    reorder.mutate(next);
  };

  const columns: Column<Service>[] = [
    {
      key: 'name',
      header: 'Service',
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50">
            <ServiceIcon name={item.icon} className="h-4 w-4 text-brand-600" />
          </div>
          <div>
            <p className="font-medium text-slate-900">{item.name}</p>
            <p className="max-w-[320px] truncate text-xs text-slate-500">
              {item.short_description || '—'}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'features',
      header: 'Features',
      render: (item) => (
        <div className="flex flex-wrap gap-1">
          {(item.features || []).slice(0, 3).map((f) => (
            <Badge key={f} variant="secondary">
              {f}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      key: 'sort_order',
      header: 'Order',
      render: (item) => <span className="text-sm text-slate-500">{item.sort_order}</span>,
    },
    {
      key: 'is_active',
      header: 'Active',
      render: (item) => (
        <Switch
          checked={item.is_active}
          onCheckedChange={(checked) => toggleActive.mutate({ id: item.id, is_active: checked })}
        />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Services"
        description="Manage the services shown on the website"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Services' }]}
        actions={
          <Button
            onClick={() => {
              setEditing(null);
              setDialogOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            New Service
          </Button>
        }
      />

      {isLoading ? (
        <PageSpinner />
      ) : (
        <DataTable
          columns={columns}
          data={data || []}
          searchable={false}
          emptyTitle="No services found"
          emptyDescription="Create your first service to get started."
          rowActions={(item) => {
            const index = (data || []).indexOf(item);
            return (
            <div className="flex items-center gap-0.5">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                disabled={index <= 0}
                onClick={() => move(index, -1)}
              >
                <ChevronUp className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                disabled={index >= (data?.length || 0) - 1}
                onClick={() => move(index, 1)}
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => {
                  setEditing(item);
                  setDialogOpen(true);
                }}
              >
                <Pencil className="h-3.5 w-3.5" />
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
            );
          }}
        />
      )}

      <ServiceFormDialog
        open={dialogOpen}
        service={editing}
        onClose={() => {
          setDialogOpen(false);
          setEditing(null);
        }}
        onSubmit={(id, data) => saveService.mutate({ id, data })}
        isSaving={saveService.isPending}
      />

      <ConfirmDelete
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Delete Service"
        description="Are you sure you want to delete this service? This action cannot be undone."
        loading={deleteService.isPending}
        onConfirm={() => {
          if (deleteId) deleteService.mutate(deleteId);
        }}
      />
    </div>
  );
}
