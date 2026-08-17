import { useQuery } from '@tanstack/react-query';
import { websiteApi } from '@/lib/websiteApi';
import { usePageMeta, formatSiteTitle } from '@/hooks/usePageMeta';
import { useCachedSiteName } from '@/hooks/useCachedSiteSettings';
import { usePageView } from '@/hooks/usePageView';
import { PageBanner } from '@/components/website/PageBanner';
import { TestimonialCard } from '@/components/website/TestimonialCard';
import { Spinner } from '@/components/ui/Spinner';

export default function TestimonialsPage() {
  const siteName = useCachedSiteName();
  usePageMeta({ title: formatSiteTitle('Testimonials', siteName) });
  usePageView();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['website', 'testimonials'],
    queryFn: websiteApi.testimonials.list,
  });

  return (
    <>
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
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {data.map((testimonial) => (
                <TestimonialCard key={testimonial.id} testimonial={testimonial} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
