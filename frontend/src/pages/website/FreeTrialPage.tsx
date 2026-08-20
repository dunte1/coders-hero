import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';
import { websiteApi } from '@/lib/websiteApi';
import { usePageMeta, formatSiteTitle } from '@/hooks/usePageMeta';
import { useCachedSiteName } from '@/hooks/useCachedSiteSettings';
import { usePageView } from '@/hooks/usePageView';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { PageBanner } from '@/components/website/PageBanner';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

const freeTrialSchema = z.object({
  parent_name: z.string().min(2, 'Name is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  email: z.string().email('Valid email is required').optional().or(z.literal('')),
  child_name: z.string().min(2, "Child's name is required"),
  grade: z.string().min(1, 'Grade is required'),
});

type FreeTrialFormValues = z.infer<typeof freeTrialSchema>;

const grades = [
  'Kindergarten', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5',
  'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12',
];

export default function FreeTrialPage() {
  const siteName = useCachedSiteName();
  usePageMeta({ title: formatSiteTitle('Book a Free Trial', siteName) });
  usePageView();
  const scrollRef = useScrollReveal();
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FreeTrialFormValues>({
    resolver: zodResolver(freeTrialSchema),
    defaultValues: { parent_name: '', phone: '', email: '', child_name: '', grade: '' },
  });

  const mutation = useMutation({
    mutationFn: (data: FreeTrialFormValues) =>
      websiteApi.contact.submit({
        name: data.parent_name,
        email: data.email || '',
        phone: data.phone,
        subject: `Free Trial Booking - ${data.child_name} (${data.grade})`,
        message: `Free trial booking request for ${data.child_name}, ${data.grade}. Parent: ${data.parent_name}, Phone: ${data.phone}${data.email ? `, Email: ${data.email}` : ''}`,
      }),
    onSuccess: () => setSubmitted(true),
  });

  if (submitted) {
    return (
      <>
        <PageBanner
          badge="Free Trial"
          title="Booking Received!"
          subtitle="Thank you for booking a free trial class."
        />
        <section className="bg-white py-16">
          <div className="mx-auto max-w-2xl px-4 text-center sm:px-6 lg:px-8">
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8">
              <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600 mb-4" />
              <h2 className="text-2xl font-bold text-slate-900 mb-2">You're Almost There!</h2>
              <p className="text-slate-600 mb-6">
                We've received your free trial booking. Our team will contact you within 24 hours
                to schedule your child's first coding class.
              </p>
              <p className="text-sm text-slate-500">
                For immediate assistance, call us at +254 793 474 747
              </p>
            </div>
          </div>
        </section>
      </>
    );
  }

  return (
    <div ref={scrollRef}>
      <PageBanner
        badge="Free Trial"
        title="Book a Free Trial Class"
        subtitle="Let your child experience coding and robotics — completely free. No commitment required."
      />

      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2">
            {/* Form */}
            <div className="reveal">
              <form
                onSubmit={handleSubmit((values) => mutation.mutate(values))}
                className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
              >
                <h2 className="font-display text-2xl font-bold text-slate-900">
                  Book Your Free Class
                </h2>
                <p className="text-sm text-slate-500">
                  Fill in the details below and we'll get back to you within 24 hours.
                </p>

                <Input
                  label="Your Name"
                  placeholder="Full name"
                  error={errors.parent_name?.message}
                  {...register('parent_name')}
                />

                <div className="grid gap-5 sm:grid-cols-2">
                  <Input
                    label="Phone Number"
                    type="tel"
                    placeholder="+254 7XX XXX XXX"
                    error={errors.phone?.message}
                    {...register('phone')}
                  />
                  <Input
                    label="Email (optional)"
                    type="email"
                    placeholder="you@example.com"
                    error={errors.email?.message}
                    {...register('email')}
                  />
                </div>

                <Input
                  label="Child's Name"
                  placeholder="Child's full name"
                  error={errors.child_name?.message}
                  {...register('child_name')}
                />

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Grade / Class</label>
                  <select
                    {...register('grade')}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  >
                    <option value="">Select grade</option>
                    {grades.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                  {errors.grade && <p className="mt-1 text-sm text-red-600">{errors.grade.message}</p>}
                </div>

                <Button type="submit" size="lg" loading={mutation.isPending} className="w-full">
                  Book Free Trial<ArrowRight className="ml-2 h-4 w-4" />
                </Button>

                {mutation.isError && (
                  <p className="text-sm text-red-600">Something went wrong. Please try again or call us.</p>
                )}
              </form>
            </div>

            {/* Benefits */}
            <div className="reveal reveal-delay-2">
              <h2 className="font-display text-2xl font-bold text-slate-900 mb-6">
                Why Try a Free Class?
              </h2>
              <div className="space-y-6">
                {[
                  { title: 'No Commitment', description: 'Try before you decide. No payment required.' },
                  { title: 'Expert Instructors', description: 'Learn from trained professionals who love teaching kids.' },
                  { title: 'Hands-On Learning', description: 'Your child will code and build something in the first class.' },
                  { title: 'All Equipment Provided', description: 'We provide laptops and materials during the trial.' },
                  { title: 'Personalized Assessment', description: 'Get a skill level assessment and learning recommendation.' },
                ].map((benefit) => (
                  <div key={benefit.title} className="flex items-start gap-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-600">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">{benefit.title}</h3>
                      <p className="text-sm text-slate-600">{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
