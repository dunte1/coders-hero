import { useMutation, useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CheckCircle2, Clock, Mail, MapPin, Phone, MessageCircle } from 'lucide-react';
import { websiteApi } from '@/lib/websiteApi';
import { usePageMeta, formatSiteTitle } from '@/hooks/usePageMeta';
import { useCachedSiteName } from '@/hooks/useCachedSiteSettings';
import { usePageView } from '@/hooks/usePageView';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { getSetting } from '@/types/website';
import { PageBanner } from '@/components/website/PageBanner';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';

const contactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
  phone: z.string().optional(),
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(10, 'Message should be at least 10 characters'),
});

type ContactFormValues = z.infer<typeof contactSchema>;

export default function ContactPage() {
  const siteName = useCachedSiteName();
  usePageMeta({
    title: formatSiteTitle('Contact', siteName),
    description: 'Get in touch with Coder\'s Hero. Questions about our coding and robotics programs? Send us a message or call us.',
  });
  usePageView();

  const { data } = useQuery({ queryKey: ['website', 'site'], queryFn: websiteApi.site.get });
  const settings = data?.settings;

  const phone = getSetting(settings, 'general.phone');
  const email = getSetting(settings, 'general.email');
  const address = getSetting(settings, 'general.address');
  const hours = getSetting(settings, 'general.hours');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: '', email: '', phone: '', subject: '', message: '' },
  });

  const submitMutation = useMutation({
    mutationFn: (values: ContactFormValues) =>
      websiteApi.contact.submit({
        name: values.name,
        email: values.email,
        phone: values.phone || undefined,
        subject: values.subject,
        message: values.message,
      }),
    onSuccess: () => reset(),
  });

  const contactDetails = [
    phone ? { icon: Phone, label: 'Call us', value: phone, href: `tel:${phone.replace(/[^+\d]/g, '')}` } : null,
    email ? { icon: Mail, label: 'Email us', value: email, href: `mailto:${email}` } : null,
    address ? { icon: MapPin, label: 'Visit us', value: address } : null,
    hours ? { icon: Clock, label: 'Opening hours', value: hours } : null,
  ].filter((item) => item !== null);

  const scrollRef = useScrollReveal();

  return (
    <div ref={scrollRef}>
      <PageBanner
        badge="Contact"
        title="Let's talk about your child's future"
        subtitle="Questions about programs, pricing or schedules? Send us a message and we'll get back to you within one business day."
      />

      <section className="bg-white py-16">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-5 lg:px-8">
          <div className="lg:col-span-3">
            {submitMutation.isSuccess ? (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center">
                <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
                <h2 className="mt-4 font-display text-2xl font-bold text-emerald-900">
                  Message sent!
                </h2>
                <p className="mt-2 text-emerald-800">
                  Thank you! Your message has been sent. We will get back to you soon.
                </p>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit((values) => submitMutation.mutate(values))}
                className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
              >
                <div className="grid gap-5 sm:grid-cols-2">
                  <Input
                    label="Your name"
                    placeholder="Full name"
                    error={errors.name?.message}
                    {...register('name')}
                  />
                  <Input
                    label="Email"
                    type="email"
                    placeholder="you@example.com"
                    error={errors.email?.message}
                    {...register('email')}
                  />
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Input
                    label="Phone (optional)"
                    placeholder="+1 555 123 4567"
                    error={errors.phone?.message}
                    {...register('phone')}
                  />
                  <Input
                    label="Subject"
                    placeholder="e.g. Program enquiry"
                    error={errors.subject?.message}
                    {...register('subject')}
                  />
                </div>
                <Textarea
                  label="Message"
                  rows={5}
                  placeholder="Tell us about your child's age and what you're interested in."
                  error={errors.message?.message}
                  {...register('message')}
                />
                <Button type="submit" size="lg" loading={submitMutation.isPending}>
                  Send Message
                </Button>
                {submitMutation.isError ? (
                  <p className="text-sm text-red-600">
                    Something went wrong sending your message. Please try again.
                  </p>
                ) : null}
              </form>
            )}
          </div>

          <div className="space-y-4 lg:col-span-2">
            {/* WhatsApp Button */}
            <a
              href="https://wa.me/254793474747?text=Hi%20Coder's%20Hero%2C%20I'm%20interested%20in%20your%20programs"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-2xl border border-green-200 bg-green-50 p-5 transition-colors hover:bg-green-100"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-500 text-white">
                <MessageCircle className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-green-700">Chat with us</p>
                <p className="mt-0.5 text-sm font-medium text-green-900">Message on WhatsApp</p>
              </div>
            </a>
            {contactDetails.map(
              (item) =>
                item && (
                  <div
                    key={item.label}
                    className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-5"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white">
                      <item.icon className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        {item.label}
                      </p>
                      {'href' in item && item.href ? (
                        <a
                          href={item.href}
                          className="mt-1 block text-sm font-medium text-slate-800 hover:text-brand-700"
                        >
                          {item.value}
                        </a>
                      ) : (
                        <p className="mt-1 text-sm font-medium text-slate-800">{item.value}</p>
                      )}
                    </div>
                  </div>
                )
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
