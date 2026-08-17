import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { websiteApi } from '@/lib/websiteApi';
import { usePageMeta, formatSiteTitle } from '@/hooks/usePageMeta';
import { useCachedSiteName } from '@/hooks/useCachedSiteSettings';
import { usePageView } from '@/hooks/usePageView';
import { PageBanner } from '@/components/website/PageBanner';
import { ServiceCard } from '@/components/website/ServiceCard';
import { Spinner } from '@/components/ui/Spinner';

export default function ServicesPage() {
  const siteName = useCachedSiteName();
  usePageMeta({ title: formatSiteTitle('Services', siteName) });
  usePageView();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['website', 'services'],
    queryFn: websiteApi.services.list,
  });

  return (
    <>
      <PageBanner
        badge="Our services"
        title="Everything young innovators need"
        subtitle="From first block-based steps to advanced robotics and game development, we offer a complete learning ecosystem for kids aged 5 to 17."
      />
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <Spinner />
            </div>
          ) : isError || !data ? (
            <p className="py-20 text-center text-slate-500">
              We couldn't load the services. Please try again later.
            </p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {data.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          )}
        </div>
      </section>
      <section className="bg-slate-50 py-16">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl font-bold text-slate-900">
            Ready to see these in action?
          </h2>
          <p className="mt-3 text-slate-600">
            Browse our structured programs to find the perfect track for your child.
          </p>
          <Link
            to="/programs"
            className="mt-6 inline-flex h-11 items-center rounded-xl bg-brand-600 px-6 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
          >
            Explore Programs
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
