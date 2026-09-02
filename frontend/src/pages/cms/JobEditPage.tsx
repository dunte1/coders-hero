import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { careersApi } from '@/lib/careersApi';
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
import type { JobEmploymentType, JobStatus } from '@/types/careers';

const jobSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  department: z.string().optional(),
  location: z.string().optional(),
  employment_type: z.enum(['full_time', 'part_time', 'contract', 'internship']),
  description: z.string().min(1, 'Description is required'),
  requirements: z.string().optional(),
  status: z.enum(['draft', 'published', 'closed']),
  is_featured: z.boolean(),
});

type JobFormValues = z.infer<typeof jobSchema>;

export default function JobEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEdit = !!id;
  const jobId = isEdit ? parseInt(id, 10) : null;

  const { data: job, isLoading: loadingJob } = useQuery({
    queryKey: ['cms', 'job', jobId],
    queryFn: () => careersApi.jobs.get(jobId!),
    enabled: !!jobId,
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<JobFormValues>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      title: '',
      department: '',
      location: '',
      employment_type: 'full_time',
      description: '',
      requirements: '',
      status: 'draft',
      is_featured: false,
    },
  });

  useEffect(() => {
    if (job) {
      reset({
        title: job.title,
        department: job.department || '',
        location: job.location || '',
        employment_type: job.employment_type,
        description: job.description,
        requirements: job.requirements || '',
        status: job.status,
        is_featured: job.is_featured,
      });
    }
  }, [job, reset]);

  const createMutation = useMutation({
    mutationFn: (data: JobFormValues) => careersApi.jobs.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms', 'jobs'] });
      toast.success('Job listing created');
      navigate('/cms/jobs');
    },
    onError: () => toast.error('Failed to create'),
  });

  const updateMutation = useMutation({
    mutationFn: (data: JobFormValues) => careersApi.jobs.update(jobId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms', 'jobs'] });
      queryClient.invalidateQueries({ queryKey: ['cms', 'job', jobId] });
      toast.success('Job listing updated');
      navigate('/cms/jobs');
    },
    onError: () => toast.error('Failed to update'),
  });

  if (isEdit && loadingJob) return <PageSpinner />;
  if (isEdit && !job) {
    return <div className="py-12 text-center text-slate-500">Job listing not found</div>;
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        title={isEdit ? 'Edit Job Listing' : 'New Job Listing'}
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Job Listings', href: '/cms/jobs' },
          { label: isEdit ? 'Edit' : 'New' },
        ]}
      />

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <form onSubmit={handleSubmit((data) => isEdit ? updateMutation.mutate(data) : createMutation.mutate(data))} className="space-y-6">
          <Input
            label="Title"
            placeholder="e.g. Senior React Developer"
            error={errors.title?.message}
            {...register('title')}
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Department"
              placeholder="e.g. Engineering"
              {...register('department')}
            />
            <Input
              label="Location"
              placeholder="e.g. Nairobi, Kenya"
              {...register('location')}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <SelectRoot
              value={watch('employment_type')}
              onValueChange={(v) => setValue('employment_type', v as JobEmploymentType)}
            >
              <SelectTrigger label="Employment Type">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="full_time">Full Time</SelectItem>
                <SelectItem value="part_time">Part Time</SelectItem>
                <SelectItem value="contract">Contract</SelectItem>
                <SelectItem value="internship">Internship</SelectItem>
              </SelectContent>
            </SelectRoot>

            <SelectRoot
              value={watch('status')}
              onValueChange={(v) => setValue('status', v as JobStatus)}
            >
              <SelectTrigger label="Status">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </SelectRoot>
          </div>

          <Textarea
            label="Description"
            rows={6}
            placeholder="Job description..."
            error={errors.description?.message}
            {...register('description')}
          />

          <Textarea
            label="Requirements"
            rows={4}
            placeholder="Required qualifications and skills..."
            {...register('requirements')}
          />

          <div className="flex items-center gap-3">
            <Switch
              checked={watch('is_featured')}
              onCheckedChange={(v) => setValue('is_featured', v)}
            />
            <span className="text-sm font-medium text-slate-700">Featured</span>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-4">
            <Button type="submit" loading={createMutation.isPending || updateMutation.isPending}>
              {isEdit ? 'Save Changes' : 'Create Job Listing'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
