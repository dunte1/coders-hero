import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { websiteApi, isProgramCategory } from '@/lib/websiteApi';
import { usePageMeta, formatSiteTitle } from '@/hooks/usePageMeta';
import { useCachedSiteName } from '@/hooks/useCachedSiteSettings';
import { usePageView } from '@/hooks/usePageView';
import { PageBanner } from '@/components/website/PageBanner';
import { ProgramCard } from '@/components/website/ProgramCard';
import { Spinner } from '@/components/ui/Spinner';
import { cn } from '@/lib/utils';

const filters = [
  { key: '', label: 'All' },
  { key: 'coding', label: 'Coding' },
  { key: 'robotics', label: 'Robotics' },
  { key: 'stem', label: 'STEM' },
];

export default function ProgramsPage() {
  const siteName = useCachedSiteName();
  usePageMeta({ title: formatSiteTitle('Programs', siteName) });
  usePageView();

  const [searchParams, setSearchParams] = useSearchParams();
  const category = searchParams.get('category') ?? '';
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [category]);

  const activeCategory = isProgramCategory(category) ? category : '';
  const { data, isLoading, isError } = useQuery({
    queryKey: ['website', 'programs', activeCategory, page],
    queryFn: () =>
      websiteApi.programs.list({
        category: activeCategory || undefined,
        page,
        per_page: 9,
      }),
    placeholderData: (previous) => previous,
  });

  const setCategory = (key: string) => {
    if (key) {
      setSearchParams({ category: key }, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }
  };

  return (
    <>
      <PageBanner
        badge="Programs"
        title="Find your child's next adventure"
        subtitle="Structured, progressive tracks in coding, robotics and STEM — every program is hands-on, project-based and taught by expert instructors."
      />
      <section className="bg-slate-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-2">
            {filters.map((filter) => (
              <button
                key={filter.key}
                type="button"
                onClick={() => setCategory(filter.key)}
                className={cn(
                  'rounded-full px-4 py-2 text-sm font-semibold transition-colors',
                  activeCategory === filter.key
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'border border-slate-200 bg-white text-slate-600 hover:border-brand-300 hover:text-brand-700'
                )}
              >
                {filter.label}
              </button>
            ))}
          </div>

          <div className="mt-10">
            {isLoading ? (
              <div className="flex justify-center py-20">
                <Spinner />
              </div>
            ) : isError || !data ? (
              <p className="py-20 text-center text-slate-500">
                We couldn't load the programs. Please try again later.
              </p>
            ) : data.data.length === 0 ? (
              <p className="py-20 text-center text-slate-500">
                No programs found in this category yet.
              </p>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {data.data.map((program) => (
                  <ProgramCard key={program.id} program={program} />
                ))}
              </div>
            )}
          </div>

          {data && data.meta.last_page > 1 ? (
            <div className="mt-12 flex items-center justify-center gap-3">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-sm text-slate-500">
                Page {data.meta.current_page} of {data.meta.last_page}
              </span>
              <button
                type="button"
                disabled={page >= data.meta.last_page}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          ) : null}
        </div>
      </section>
      <section className="bg-white py-14">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl font-bold text-slate-900">
            Not sure which track fits?
          </h2>
          <p className="mt-3 text-slate-600">
            Talk to us and we'll help you pick the perfect program for your child's age and interests.
          </p>
          <a
            href="/contact"
            className="mt-6 inline-flex h-11 items-center rounded-xl bg-brand-600 px-6 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
          >
            Book a Free Trial
          </a>
        </div>
      </section>
    </>
  );
}
