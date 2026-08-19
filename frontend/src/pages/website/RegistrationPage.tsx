import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { CheckCircle, Send } from 'lucide-react';
import { websiteApi } from '@/lib/websiteApi';
import { usePageMeta, formatSiteTitle } from '@/hooks/usePageMeta';
import { useCachedSiteName } from '@/hooks/useCachedSiteSettings';
import { usePageView } from '@/hooks/usePageView';
import { PageBanner } from '@/components/website/PageBanner';
import { toast } from 'sonner';

interface FormData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  gender: string;
  grade: string;
  parent_name: string;
  parent_phone: string;
  parent_email: string;
  address: string;
  notes: string;
}

const initialFormData: FormData = {
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  date_of_birth: '',
  gender: '',
  grade: '',
  parent_name: '',
  parent_phone: '',
  parent_email: '',
  address: '',
  notes: '',
};

export default function RegistrationPage() {
  const siteName = useCachedSiteName();
  usePageMeta({ title: formatSiteTitle('Online Registration', siteName) });
  usePageView();

  const [form, setForm] = useState<FormData>(initialFormData);
  const [submitted, setSubmitted] = useState(false);

  const mutation = useMutation({
    mutationFn: (data: FormData) => websiteApi.admissions.submit(data as unknown as Record<string, unknown>),
    onSuccess: () => {
      setSubmitted(true);
      toast.success('Application submitted successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to submit application');
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(form);
  };

  if (submitted) {
    return (
      <>
        <PageBanner
          badge="Registration"
          title="Application Submitted"
          subtitle="Thank you for applying to Coder's Hero!"
        />
        <section className="bg-white py-16">
          <div className="mx-auto max-w-2xl px-4 text-center sm:px-6 lg:px-8">
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8">
              <CheckCircle className="mx-auto h-12 w-12 text-emerald-600 mb-4" />
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Application Received!</h2>
              <p className="text-slate-600 mb-6">
                Your admission application has been submitted successfully. Our team will review
                your application and contact you within 2-3 business days.
              </p>
              <p className="text-sm text-slate-500">
                Please keep a copy of this confirmation for your records.
              </p>
            </div>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <PageBanner
        badge="Registration"
        title="Online Registration"
        subtitle="Apply to join Coder's Hero. Fill out the form below and our team will review your application."
      />
      <section className="bg-white py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Student Information */}
            <div className="rounded-2xl border border-slate-100 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Student Information</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">First Name *</label>
                  <input
                    type="text"
                    name="first_name"
                    value={form.first_name}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Last Name *</label>
                  <input
                    type="text"
                    name="last_name"
                    value={form.last_name}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Phone *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Date of Birth *</label>
                  <input
                    type="date"
                    name="date_of_birth"
                    value={form.date_of_birth}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Gender *</label>
                  <select
                    name="gender"
                    value={form.gender}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Grade/Level *</label>
                  <select
                    name="grade"
                    value={form.grade}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  >
                    <option value="">Select grade</option>
                    <option value="Pre-Primary">Pre-Primary (Ages 3-5)</option>
                    <option value="Primary 1-3">Primary 1-3 (Ages 6-8)</option>
                    <option value="Primary 4-6">Primary 4-6 (Ages 9-11)</option>
                    <option value="Junior Secondary">Junior Secondary (Ages 12-14)</option>
                    <option value="Senior Secondary">Senior Secondary (Ages 15-17)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Parent/Guardian Information */}
            <div className="rounded-2xl border border-slate-100 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Parent/Guardian Information</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Parent Name *</label>
                  <input
                    type="text"
                    name="parent_name"
                    value={form.parent_name}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Parent Phone *</label>
                  <input
                    type="tel"
                    name="parent_phone"
                    value={form.parent_phone}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Parent Email</label>
                  <input
                    type="email"
                    name="parent_email"
                    value={form.parent_email}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="rounded-2xl border border-slate-100 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Additional Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                  <input
                    type="text"
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Additional Notes</label>
                  <textarea
                    name="notes"
                    value={form.notes}
                    onChange={handleChange}
                    rows={3}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                    placeholder="Any special requirements or questions..."
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-4">
              <button
                type="submit"
                disabled={mutation.isPending}
                className="inline-flex h-11 items-center rounded-xl bg-brand-600 px-6 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-50"
              >
                {mutation.isPending ? (
                  'Submitting...'
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Submit Application
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </section>
    </>
  );
}
