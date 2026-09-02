import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { popupsApi, getErrorMessage, type PopupInput } from '@/lib/popupsApi';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageSpinner } from '@/components/ui/Spinner';
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
import { ImageInput } from '@/components/cms/ImageInput';
import type { Popup } from '@/lib/popupsApi';

const popupSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  body: z.string().optional(),
  image: z.string().optional(),
  button_text: z.string().optional(),
  button_url: z.string().optional(),
  type: z.enum(['advert', 'seasonal_greeting']),
  animation_style: z.string(),
  overlay_style: z.string(),
  start_date: z.string().optional().nullable(),
  end_date: z.string().optional().nullable(),
  frequency: z.enum(['every_visit', 'once_per_session', 'once_per_day', 'once_ever']),
  active: z.boolean(),
  sort_order: z.string().optional(),
});

type PopupFormValues = z.infer<typeof popupSchema>;

interface PopupFormProps {
  popup?: Popup;
  isEdit: boolean;
  onSubmit: (data: PopupInput) => void;
  isSaving: boolean;
}

function PopupForm({ popup, isEdit, onSubmit, isSaving }: PopupFormProps) {
  const methods = useForm<PopupFormValues>({
    resolver: zodResolver(popupSchema),
    defaultValues: {
      title: '',
      body: '',
      image: '',
      button_text: '',
      button_url: '',
      type: 'advert',
      animation_style: 'fade',
      overlay_style: 'dark',
      start_date: '',
      end_date: '',
      frequency: 'once_per_session',
      active: true,
      sort_order: '',
    },
  });

  const { register, handleSubmit, watch, setValue, reset } = methods;

  useEffect(() => {
    if (popup) {
      reset({
        title: popup.title,
        body: popup.body || '',
        image: popup.image_url || '',
        button_text: popup.button_text || '',
        button_url: popup.button_url || '',
        type: popup.type,
        animation_style: popup.animation_style,
        overlay_style: popup.overlay_style,
        start_date: popup.start_date || '',
        end_date: popup.end_date || '',
        frequency: popup.frequency,
        active: popup.active,
        sort_order: popup.sort_order != null ? String(popup.sort_order) : '',
      });
    }
  }, [popup, reset]);

  const onFormSubmit = (values: PopupFormValues) => {
    const payload: PopupInput = {
      title: values.title,
      body: values.body || undefined,
      image: values.image || undefined,
      button_text: values.button_text || undefined,
      button_url: values.button_url || undefined,
      type: values.type,
      animation_style: values.animation_style,
      overlay_style: values.overlay_style,
      start_date: values.start_date || null,
      end_date: values.end_date || null,
      frequency: values.frequency,
      active: values.active,
      sort_order: values.sort_order ? parseInt(values.sort_order, 10) : undefined,
    };
    onSubmit(payload);
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
        <Input
          label="Title"
          placeholder="e.g. Free Trial Class Available!"
          error={methods.formState.errors.title?.message}
          {...register('title')}
        />

        <Textarea
          label="Body"
          rows={3}
          placeholder="Popup description text"
          {...register('body')}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Button Text"
            placeholder="e.g. Book Free Trial"
            {...register('button_text')}
          />
          <Input
            label="Button URL"
            placeholder="e.g. /free-trial"
            {...register('button_url')}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <SelectRoot
            value={watch('type')}
            onValueChange={(value: PopupFormValues['type']) => setValue('type', value)}
          >
            <SelectTrigger label="Type">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="advert">Advert</SelectItem>
              <SelectItem value="seasonal_greeting">Seasonal Greeting</SelectItem>
            </SelectContent>
          </SelectRoot>

          <SelectRoot
            value={watch('animation_style')}
            onValueChange={(value) => setValue('animation_style', value)}
          >
            <SelectTrigger label="Animation Style">
              <SelectValue placeholder="Animation" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fade">Fade</SelectItem>
              <SelectItem value="slide_up">Slide Up</SelectItem>
              <SelectItem value="bounce">Bounce</SelectItem>
              <SelectItem value="zoom">Zoom</SelectItem>
            </SelectContent>
          </SelectRoot>

          <SelectRoot
            value={watch('overlay_style')}
            onValueChange={(value) => setValue('overlay_style', value)}
          >
            <SelectTrigger label="Overlay Style">
              <SelectValue placeholder="Overlay" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dark">Dark</SelectItem>
              <SelectItem value="light">Light</SelectItem>
              <SelectItem value="blur">Blur</SelectItem>
              <SelectItem value="none">None</SelectItem>
            </SelectContent>
          </SelectRoot>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <SelectRoot
            value={watch('frequency')}
            onValueChange={(value: PopupFormValues['frequency']) => setValue('frequency', value)}
          >
            <SelectTrigger label="Frequency">
              <SelectValue placeholder="Frequency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="every_visit">Every Visit</SelectItem>
              <SelectItem value="once_per_session">Once Per Session</SelectItem>
              <SelectItem value="once_per_day">Once Per Day</SelectItem>
              <SelectItem value="once_ever">Once Ever</SelectItem>
            </SelectContent>
          </SelectRoot>

          <Input
            label="Start Date"
            type="date"
            {...register('start_date')}
          />
          <Input
            label="End Date"
            type="date"
            {...register('end_date')}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
            <p className="text-sm font-medium text-slate-700">Active</p>
            <Switch checked={watch('active')} onCheckedChange={(v) => setValue('active', v)} />
          </div>
          <Input
            label="Sort Order"
            type="number"
            min="0"
            placeholder="0"
            {...register('sort_order')}
          />
        </div>

        <ImageInput
          label="Image"
          value={watch('image')}
          onChange={(value) => setValue('image', value)}
        />

        <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-4">
          <Button type="submit" loading={isSaving}>
            {isEdit ? 'Save Changes' : 'Create Popup'}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}

export default function PopupEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEdit = !!id;
  const popupId = id ? parseInt(id, 10) : null;

  const { data: popup, isLoading } = useQuery({
    queryKey: ['cms', 'popup', popupId],
    queryFn: () => popupsApi.get(popupId as number),
    enabled: !!popupId,
  });

  const createMutation = useMutation({
    mutationFn: (data: PopupInput) => popupsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms', 'popups'] });
      toast.success('Popup created successfully');
      navigate('/cms/popups');
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: PopupInput }) => popupsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms', 'popups'] });
      queryClient.invalidateQueries({ queryKey: ['cms', 'popup', popupId] });
      toast.success('Popup updated successfully');
      navigate('/cms/popups');
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  if (isEdit && isLoading) return <PageSpinner />;
  if (isEdit && !popup) {
    return <div className="py-12 text-center text-slate-500">Popup not found</div>;
  }

  const handleSubmit = (data: PopupInput) => {
    if (isEdit && popupId) {
      updateMutation.mutate({ id: popupId, data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        title={isEdit ? 'Edit Popup' : 'New Popup'}
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Popups', href: '/cms/popups' },
          { label: isEdit ? 'Edit' : 'New' },
        ]}
      />
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <PopupForm
          key={popupId || 'new'}
          popup={popup}
          isEdit={isEdit}
          onSubmit={handleSubmit}
          isSaving={createMutation.isPending || updateMutation.isPending}
        />
      </div>
    </div>
  );
}
