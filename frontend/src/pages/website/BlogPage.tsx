import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, ArrowRight } from 'lucide-react';
import { websiteApi } from '@/lib/websiteApi';
import { usePageMeta, formatSiteTitle } from '@/hooks/usePageMeta';
import { useCachedSiteName } from '@/hooks/useCachedSiteSettings';
import { usePageView } from '@/hooks/usePageView';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { PageBanner } from '@/components/website/PageBanner';
import { BlogCard } from '@/components/website/BlogCard';
import { Spinner } from '@/components/ui/Spinner';
import { cn } from '@/lib/utils';

export default function BlogPage() {
  const siteName = useCachedSiteName();
  usePageMeta({
    title: formatSiteTitle('Blog', siteName),
    description: 'Read the latest articles about coding education, robotics, STEM learning, and technology tips for kids and parents.',
  });
  usePageView();

  const [page, setPage] = useState(1);
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  useEffect(() => {
    setPage(1);
  }, [category, search]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['website', 'blog', category, search, page],
    queryFn: () =>
      websiteApi.blog.list({
        category: category || undefined,
        search: search || undefined,
        page,
        per_page: 9,
      }),
    placeholderData: (previous) => previous,
  });

  const categories = Array.from(
    new Set((data?.data ?? []).map((post) => post.category).filter((c): c is string => !!c))
  );

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput.trim());
  };

  const scrollRef = useScrollReveal();

  return (
    <div ref={scrollRef}>
      <PageBanner
        badge="Blog"
        title="Tips, news & inspiration"
        subtitle="Guides and stories from the Coder's Hero classroom."
      >
        <form onSubmit={submitSearch} className="mt-8 flex max-w-md items-center gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search articles..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
            />
          </div>
          <button
            type="submit"
            className="h-11 rounded-xl bg-brand-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
          >
            Search
          </button>
        </form>
      </PageBanner>

      <section className="bg-slate-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {categories.length > 0 ? (
            <div className="flex flex-wrap justify-center gap-2">
              <button
                type="button"
                onClick={() => setCategory('')}
                className={cn(
                  'rounded-full px-4 py-2 text-sm font-semibold transition-colors',
                  category === ''
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'border border-slate-200 bg-white text-slate-600 hover:text-brand-700'
                )}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={cn(
                    'rounded-full px-4 py-2 text-sm font-semibold transition-colors',
                    category === cat
                      ? 'bg-brand-600 text-white shadow-sm'
                      : 'border border-slate-200 bg-white text-slate-600 hover:text-brand-700'
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          ) : null}

          <div className="mt-10">
            {isLoading ? (
              <div className="flex justify-center py-20">
                <Spinner />
              </div>
            ) : isError || !data ? (
              <p className="py-20 text-center text-slate-500">
                We couldn't load the blog. Please try again later.
              </p>
            ) : data.data.length === 0 ? (
              <p className="py-20 text-center text-slate-500">
                No articles found{search ? ' for your search' : ' yet'}.
              </p>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 stagger-children">
                {data.data.map((post) => (
                  <BlogCard key={post.id} post={post} />
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

      {/* CTA */}
      <section className="bg-brand-600 py-16">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl font-bold text-white">Want Your Child to Love Tech?</h2>
          <p className="mt-3 text-brand-100">Start their coding journey today with a free trial class.</p>
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
