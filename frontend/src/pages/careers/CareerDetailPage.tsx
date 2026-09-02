import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { MapPin, Briefcase, Clock, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { careersApi } from '@/lib/careersApi';
import { PageBanner } from '@/components/website/PageBanner';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import type { JobListing, JobEmploymentType } from '@/types/careers';

const EMPLOYMENT_LABELS: Record<JobEmploymentType, string> = {
  full_time: 'Full Time',
  part_time: 'Part Time',
  contract: 'Contract',
  internship: 'Internship',
};

const applySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional(),
  cover_letter: z.string().optional(),
  portfolio_url: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
});

type ApplyFormValues = z.infer<typeof applySchema>;

export default function CareerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const jobId = parseInt(id!, 10);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const { data: job, isLoading } = useQuery<JobListing>({
    queryKey: ['public-job', jobId],
    queryFn: () => careersApi.publicJobs.get(jobId),
    enabled: !!jobId,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ApplyFormValues>({
    resolver: zodResolver(applySchema),
  });

  const applyMutation = useMutation({
    mutationFn: (formData: FormData) => careersApi.publicJobs.apply(jobId, formData),
    onSuccess: () => {
      toast.success('Application submitted successfully!');
      setSubmitted(true);
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to submit application');
    },
  });

  const onApplySubmit = (data: ApplyFormValues) => {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('email', data.email);
    if (data.phone) formData.append('phone', data.phone);
    if (data.cover_letter) formData.append('cover_letter', data.cover_letter);
    if (data.portfolio_url) formData.append('portfolio_url', data.portfolio_url);
    if (resumeFile) formData.append('resume', resumeFile);

    applyMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <>
        <PageBanner title="Job Details" />
        <div className="mx-auto max-w-4xl px-4 py-12">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-64 rounded bg-slate-200" />
            <div className="h-4 w-32 rounded bg-slate-200" />
            <div className="h-48 rounded bg-slate-200" />
          </div>
        </div>
      </>
    );
  }

  if (!job) {
    return (
      <>
        <PageBanner title="Job Not Found" />
        <div className="mx-auto max-w-4xl px-4 py-12 text-center">
          <p className="text-slate-500">This job listing could not be found.</p>
        </div>
      </>
    );
  }

  if (submitted) {
    return (
      <>
        <PageBanner title="Application Submitted" />
        <div className="mx-auto max-w-4xl px-4 py-12 text-center">
          <CheckCircle2 className="mx-auto mb-4 h-16 w-16 text-emerald-500" />
          <h2 className="text-2xl font-bold text-slate-900">Thank you for applying!</h2>
          <p className="mt-2 text-slate-600">
            Your application for <strong>{job.title}</strong> has been received.
            Our team will review it and get back to you soon.
          </p>
        </div>
      </>
    );
  }

  return (
    <>
      <PageBanner title={job.title} subtitle={job.department || undefined} />

      <div className="mx-auto max-w-4xl px-4 py-12">
        <a href="/careers" className="mb-6 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700">
          <ArrowLeft className="h-4 w-4" />
          Back to Careers
        </a>

        {/* Job Details */}
        <div className="mb-8 rounded-xl border border-slate-200 bg-white p-6">
          <div className="flex flex-wrap gap-3 text-sm text-slate-500">
            {job.department && (
              <span className="flex items-center gap-1">
                <Briefcase className="h-3.5 w-3.5" />
                {job.department}
              </span>
            )}
            {job.location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {job.location}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {EMPLOYMENT_LABELS[job.employment_type]}
            </span>
          </div>

          <div className="prose prose-slate mt-6 max-w-none">
            <h3 className="text-lg font-semibold text-slate-900">Description</h3>
            <div className="whitespace-pre-line text-slate-600">{job.description}</div>

            {job.requirements && (
              <>
                <h3 className="mt-6 text-lg font-semibold text-slate-900">Requirements</h3>
                <div className="whitespace-pre-line text-slate-600">{job.requirements}</div>
              </>
            )}
          </div>
        </div>

        {/* Application Form */}
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h3 className="mb-6 text-xl font-bold text-slate-900">Apply for this Position</h3>

          <form onSubmit={handleSubmit(onApplySubmit)} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="Full Name"
                placeholder="John Doe"
                error={errors.name?.message}
                {...register('name')}
              />
              <Input
                label="Email Address"
                type="email"
                placeholder="you@example.com"
                error={errors.email?.message}
                {...register('email')}
              />
            </div>
            <Input
              label="Phone (optional)"
              type="tel"
              placeholder="+254 700 000000"
              {...register('phone')}
            />
            <Input
              label="Portfolio URL (optional)"
              type="url"
              placeholder="https://yourportfolio.com"
              error={errors.portfolio_url?.message}
              {...register('portfolio_url')}
            />
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Resume (PDF, DOC, DOCX)
              </label>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => setResumeFile(e.target.files?.[0] ?? null)}
                className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-brand-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-brand-700 hover:file:bg-brand-100"
              />
            </div>
            <Textarea
              label="Cover Letter (optional)"
              rows={4}
              placeholder="Tell us why you'd be a great fit..."
              {...register('cover_letter')}
            />

            <Button
              type="submit"
              className="w-full sm:w-auto"
              loading={applyMutation.isPending}
            >
              Submit Application
            </Button>
          </form>
        </div>
      </div>
    </>
  );
}
