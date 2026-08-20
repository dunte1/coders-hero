import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { websiteApi } from '@/lib/websiteApi';
import { usePageMeta, formatSiteTitle } from '@/hooks/usePageMeta';
import { useCachedSiteName } from '@/hooks/useCachedSiteSettings';
import { usePageView } from '@/hooks/usePageView';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { PageBanner } from '@/components/website/PageBanner';
import { FaqAccordion } from '@/components/website/FaqAccordion';
import { Spinner } from '@/components/ui/Spinner';

export default function FaqPage() {
  const siteName = useCachedSiteName();
  usePageMeta({
    title: formatSiteTitle('FAQs', siteName),
    description: 'Frequently asked questions about Coder\'s Hero coding and robotics programs for children. Find answers about enrollment, pricing, and more.',
  });
  usePageView();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['website', 'faqs'],
    queryFn: websiteApi.faqs.list,
  });

  const scrollRef = useScrollReveal();

  return (
    <div ref={scrollRef}>
      <PageBanner
        badge="FAQs"
        title="Frequently asked questions"
        subtitle="Quick answers to the questions we hear most. Can't find what you're looking for? Just ask the chat bubble or contact us."
      />
      <section className="bg-white py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <Spinner />
            </div>
          ) : isError || !data ? (
            <p className="py-20 text-center text-slate-500">
              We couldn't load the FAQs. Please try again later.
            </p>
          ) : data.length === 0 ? (
            <p className="py-20 text-center text-slate-500">No FAQs yet.</p>
          ) : (
            <FaqAccordion faqs={data} />
          )}
        </div>
      </section>
      <section className="bg-slate-50 py-14">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="font-display text-2xl font-bold text-slate-900">
            Still have questions?
          </h2>
          <p className="mt-3 text-slate-600">
            Send us a message and we'll get back to you within one business day.
          </p>
          <Link
            to="/contact"
            className="mt-6 inline-flex h-11 items-center rounded-xl bg-brand-600 px-6 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
          >
            Contact Us
          </Link>
        </div>
      </section>
    </div>
  );
}
