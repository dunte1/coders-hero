import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { websiteApi } from '@/lib/websiteApi';
import { usePageMeta, formatSiteTitle } from '@/hooks/usePageMeta';
import { useCachedSiteName } from '@/hooks/useCachedSiteSettings';
import { usePageView } from '@/hooks/usePageView';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { PageBanner } from '@/components/website/PageBanner';
import { TestimonialCard } from '@/components/website/TestimonialCard';
import { Spinner } from '@/components/ui/Spinner';

export default function TestimonialsPage() {
  const siteName = useCachedSiteName();
  usePageMeta({
    title: formatSiteTitle('Testimonials', siteName),
    description: 'Hear what parents and students say about their experience at Coder\'s Hero coding and robotics classes.',
  });
  usePageView();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['website', 'testimonials'],
    queryFn: websiteApi.testimonials.list,
  });

  const scrollRef = useScrollReveal();

  return (
    <div ref={scrollRef}>
      <PageBanner
        badge="Testimonials"
        title="Loved by parents, loved by kids"
        subtitle="Hear what families say about their experience at Coder's Hero."
      />
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <Spinner />
            </div>
          ) : isError || !data ? (
            <p className="py-20 text-center text-slate-500">
              We couldn't load the testimonials. Please try again later.
            </p>
          ) : data.length === 0 ? (
            <p className="py-20 text-center text-slate-500">No testimonials yet.</p>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 stagger-children">
              {data.map((testimonial) => (
                <TestimonialCard key={testimonial.id} testimonial={testimonial} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-brand-600 py-16">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl font-bold text-white">Ready to Start Learning?</h2>
          <p className="mt-3 text-brand-100">Join hundreds of students already learning with Coder's Hero.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <Link to="/free-trial" className="inline-flex h-12 items-center rounded-xl bg-white px-8 text-sm font-semibold text-brand-600 hover:bg-brand-50 transition-colors">
              Book a Free Trial
            </Link>
            <Link to="/contact" className="inline-flex h-12 items-center gap-2 rounded-xl border-2 border-white px-8 text-sm font-semibold text-white hover:bg-white/10 transition-colors">
              Contact Us<ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
