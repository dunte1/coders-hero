import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  FormProvider,
  useFieldArray,
  useForm,
  useFormContext,
  type Path,
} from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Plus, Trash2 } from 'lucide-react';
import { cmsApi, getErrorMessage } from '@/lib/cmsApi';
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
import type { ProgramDetail, ProgramInput } from '@/types/cms';

const numberOrEmpty = () =>
  z
    .string()
    .optional()
    .refine((v) => !v || !isNaN(Number(v)), { message: 'Must be a number' });

const programSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  tagline: z.string().optional(),
  description: z.string().min(1, 'Description is required'),
  long_description: z.string().optional(),
  category: z.enum(['coding', 'robotics', 'stem']),
  level: z.string().optional(),
  age_group: z.string().optional(),
  duration_weeks: numberOrEmpty(),
  sessions_per_week: numberOrEmpty(),
  price: numberOrEmpty(),
  price_suffix: z.string().optional(),
  image: z.string().optional(),
  is_featured: z.boolean(),
  is_active: z.boolean(),
  sort_order: numberOrEmpty(),
  meta_title: z.string().optional(),
  meta_description: z.string().optional(),
  curriculum: z.array(
    z.object({
      title: z.string().min(1, 'Phase title is required'),
      description: z.string(),
      topics: z.array(z.string()),
    })
  ),
  outcomes: z.array(z.string()),
});

type ProgramFormValues = z.infer<typeof programSchema>;

function PhaseTopics({ phaseIndex }: { phaseIndex: number }) {
  const { register, watch, setValue } = useFormContext<ProgramFormValues>();
  const topicsPath = `curriculum.${phaseIndex}.topics` as Path<ProgramFormValues>;
  const topics = (watch(topicsPath) as string[]) || [];

  const addTopic = () => setValue(topicsPath, [...topics, '']);
  const removeTopic = (index: number) =>
    setValue(topicsPath, topics.filter((_, i) => i !== index));

  return (
    <div className="space-y-2">
      {topics.map((_, i) => (
        <div key={i} className="flex items-center gap-2">
          <Input
            placeholder="Topic"
            className="flex-1"
            {...register(`curriculum.${phaseIndex}.topics.${i}` as Path<ProgramFormValues>)}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-red-500"
            onClick={() => removeTopic(i)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={addTopic}>
        <Plus className="mr-1 h-3.5 w-3.5" />
        Add topic
      </Button>
    </div>
  );
}

interface ProgramFormProps {
  program?: ProgramDetail;
  isEdit: boolean;
  onSubmit: (data: ProgramInput) => void;
  isSaving: boolean;
}

function ProgramForm({ program, isEdit, onSubmit, isSaving }: ProgramFormProps) {
  const methods = useForm<ProgramFormValues>({
    resolver: zodResolver(programSchema),
    defaultValues: {
      name: '',
      tagline: '',
      description: '',
      long_description: '',
      category: 'coding',
      level: '',
      age_group: '',
      duration_weeks: '',
      sessions_per_week: '',
      price: '',
      price_suffix: '',
      image: '',
      is_featured: false,
      is_active: true,
      sort_order: '',
      meta_title: '',
      meta_description: '',
      curriculum: [],
      outcomes: [],
    },
  });

  const { control, register, handleSubmit, watch, setValue, reset } = methods;

  useEffect(() => {
    if (program) {
      reset({
        name: program.name,
        tagline: program.tagline || '',
        description: program.description,
        long_description: program.long_description || '',
        category: program.category,
        level: program.level || '',
        age_group: program.age_group || '',
        duration_weeks: program.duration_weeks != null ? String(program.duration_weeks) : '',
        sessions_per_week: program.sessions_per_week != null ? String(program.sessions_per_week) : '',
        price: program.price != null ? String(program.price) : '',
        price_suffix: program.price_suffix || '',
        image: program.image_url || '',
        is_featured: program.is_featured,
        is_active: program.is_active,
        sort_order: program.sort_order != null ? String(program.sort_order) : '',
        meta_title: typeof program.meta?.meta_title === 'string' ? program.meta.meta_title : '',
        meta_description:
          typeof program.meta?.meta_description === 'string' ? program.meta.meta_description : '',
        curriculum: (program.curriculum || []).map((phase) => ({
          title: phase.title,
          description: phase.description || '',
          topics: phase.topics || [],
        })),
        outcomes: program.outcomes || [],
      });
    }
  }, [program, reset]);

  const {
    fields: phaseFields,
    append: appendPhase,
    remove: removePhase,
  } = useFieldArray({ control, name: 'curriculum' });

  const outcomes = (watch('outcomes') as string[]) || [];
  const addOutcome = () => setValue('outcomes', [...outcomes, '']);
  const removeOutcome = (index: number) =>
    setValue('outcomes', outcomes.filter((_, i) => i !== index));

  const onFormSubmit = (values: ProgramFormValues) => {
    const meta: Record<string, unknown> = {};
    if (values.meta_title) meta.meta_title = values.meta_title;
    if (values.meta_description) meta.meta_description = values.meta_description;

    const payload: ProgramInput = {
      name: values.name,
      tagline: values.tagline || undefined,
      description: values.description,
      long_description: values.long_description || undefined,
      category: values.category,
      level: values.level || undefined,
      age_group: values.age_group || undefined,
      duration_weeks: values.duration_weeks ? parseInt(values.duration_weeks, 10) : undefined,
      sessions_per_week: values.sessions_per_week ? parseInt(values.sessions_per_week, 10) : undefined,
      price: values.price !== '' ? Number(values.price) : undefined,
      price_suffix: values.price_suffix || undefined,
      image: values.image || undefined,
      curriculum: values.curriculum.map((phase) => ({
        title: phase.title,
        description: phase.description || '',
        topics: (phase.topics || []).filter((t) => t.trim() !== ''),
      })),
      outcomes: values.outcomes.filter((o) => o.trim() !== ''),
      is_featured: values.is_featured,
      is_active: values.is_active,
      sort_order: values.sort_order ? parseInt(values.sort_order, 10) : undefined,
      meta: Object.keys(meta).length > 0 ? meta : undefined,
    };
    onSubmit(payload);
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Name"
            placeholder="e.g. Scratch Coding Adventures"
            error={methods.formState.errors.name?.message}
            {...register('name')}
          />
          <Input label="Tagline" placeholder="A short punchy line" {...register('tagline')} />
        </div>

        <Textarea
          label="Description"
          rows={3}
          placeholder="Short description shown on cards"
          error={methods.formState.errors.description?.message}
          {...register('description')}
        />

        <Textarea
          label="Long Description"
          rows={6}
          placeholder="Full description. Separate paragraphs with a blank line."
          {...register('long_description')}
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <SelectRoot
            value={watch('category')}
            onValueChange={(value: ProgramFormValues['category']) => setValue('category', value)}
          >
            <SelectTrigger label="Category">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="coding">Coding</SelectItem>
              <SelectItem value="robotics">Robotics</SelectItem>
              <SelectItem value="stem">STEM</SelectItem>
            </SelectContent>
          </SelectRoot>

          <SelectRoot
            value={watch('level') || ''}
            onValueChange={(value) => setValue('level', value)}
          >
            <SelectTrigger label="Level">
              <SelectValue placeholder="Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
              <SelectItem value="expert">Expert</SelectItem>
            </SelectContent>
          </SelectRoot>

          <Input label="Age Group" placeholder="e.g. 6 - 9 years" {...register('age_group')} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="Duration (weeks)"
            type="number"
            min="1"
            error={methods.formState.errors.duration_weeks?.message}
            {...register('duration_weeks')}
          />
          <Input
            label="Sessions per Week"
            type="number"
            min="1"
            error={methods.formState.errors.sessions_per_week?.message}
            {...register('sessions_per_week')}
          />
          <Input
            label="Sort Order"
            type="number"
            min="0"
            error={methods.formState.errors.sort_order?.message}
            {...register('sort_order')}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Price"
            type="number"
            min="0"
            step="0.01"
            error={methods.formState.errors.price?.message}
            {...register('price')}
          />
          <Input label="Price Suffix" placeholder="e.g. / term" {...register('price_suffix')} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
            <p className="text-sm font-medium text-slate-700">Featured</p>
            <Switch checked={watch('is_featured')} onCheckedChange={(v) => setValue('is_featured', v)} />
          </div>
          <div className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
            <p className="text-sm font-medium text-slate-700">Active</p>
            <Switch checked={watch('is_active')} onCheckedChange={(v) => setValue('is_active', v)} />
          </div>
        </div>

        <ImageInput
          label="Image"
          value={watch('image')}
          onChange={(value) => setValue('image', value)}
        />

        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-900">Curriculum Phases</h3>
          {phaseFields.map((phase, index) => (
            <div key={phase.id} className="space-y-3 rounded-lg border border-slate-200 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-700">Phase {index + 1}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-red-500"
                  onClick={() => removePhase(index)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
              <Input
                placeholder="Phase title"
                {...register(`curriculum.${index}.title` as Path<ProgramFormValues>)}
              />
              <Textarea
                rows={2}
                placeholder="Phase description"
                {...register(`curriculum.${index}.description` as Path<ProgramFormValues>)}
              />
              <PhaseTopics phaseIndex={index} />
            </div>
          ))}
          <Button type="button" variant="outline" onClick={() => appendPhase({ title: '', description: '', topics: [] })}>
            <Plus className="mr-1 h-3.5 w-3.5" />
            Add Phase
          </Button>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-900">Learning Outcomes</h3>
          {outcomes.map((_, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                placeholder="Outcome"
                className="flex-1"
                {...register(`outcomes.${index}` as Path<ProgramFormValues>)}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-red-500"
                onClick={() => removeOutcome(index)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={addOutcome}>
            <Plus className="mr-1 h-3.5 w-3.5" />
            Add Outcome
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Meta Title"
            placeholder="SEO title"
            error={methods.formState.errors.meta_title?.message}
            {...register('meta_title')}
          />
          <Textarea
            label="Meta Description"
            rows={2}
            placeholder="SEO description"
            {...register('meta_description')}
          />
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-4">
          <Button type="submit" loading={isSaving}>
            {isEdit ? 'Save Changes' : 'Create Program'}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}

export default function ProgramEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEdit = !!id;
  const programId = id ? parseInt(id, 10) : null;

  const { data: program, isLoading } = useQuery({
    queryKey: ['cms', 'program', programId],
    queryFn: () => cmsApi.programs.get(programId as number),
    enabled: !!programId,
  });

  const createMutation = useMutation({
    mutationFn: (data: ProgramInput) => cmsApi.programs.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms', 'programs'] });
      toast.success('Program created successfully');
      navigate('/cms/programs');
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: ProgramInput }) => cmsApi.programs.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms', 'programs'] });
      queryClient.invalidateQueries({ queryKey: ['cms', 'program', programId] });
      toast.success('Program updated successfully');
      navigate('/cms/programs');
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  if (isEdit && isLoading) return <PageSpinner />;
  if (isEdit && !program) {
    return <div className="py-12 text-center text-slate-500">Program not found</div>;
  }

  const handleSubmit = (data: ProgramInput) => {
    if (isEdit && programId) {
      updateMutation.mutate({ id: programId, data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        title={isEdit ? 'Edit Program' : 'New Program'}
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Programs', href: '/cms/programs' },
          { label: isEdit ? 'Edit' : 'New' },
        ]}
      />
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <ProgramForm
          key={programId || 'new'}
          program={program}
          isEdit={isEdit}
          onSubmit={handleSubmit}
          isSaving={createMutation.isPending || updateMutation.isPending}
        />
      </div>
    </div>
  );
}
