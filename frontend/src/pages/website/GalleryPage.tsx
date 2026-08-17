import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { X } from 'lucide-react';
import { websiteApi } from '@/lib/websiteApi';
import { usePageMeta, formatSiteTitle } from '@/hooks/usePageMeta';
import { useCachedSiteName } from '@/hooks/useCachedSiteSettings';
import { usePageView } from '@/hooks/usePageView';
import { PageBanner } from '@/components/website/PageBanner';
import { Spinner } from '@/components/ui/Spinner';
import { cn } from '@/lib/utils';

export default function GalleryPage() {
  const siteName = useCachedSiteName();
  usePageMeta({ title: formatSiteTitle('Gallery', siteName) });
  usePageView();

  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [lightbox, setLightbox] = useState<{ src: string; title: string } | null>(null);

  useEffect(() => {
    setPage(1);
  }, [category]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['website', 'gallery', category, page],
    queryFn: () => websiteApi.gallery.list({ category: category || undefined, page, per_page: 12 }),
    placeholderData: (previous) => previous,
  });

  const categories = Array.from(
    new Set((data?.data ?? []).map((item) => item.category).filter((c): c is string => !!c))
  );

  return (
    <>
      <PageBanner
        badge="Gallery"
        title="Inside our classroom"
        subtitle="A peek at the fun, focus and friendships that make Coder's Hero special."
      />

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
                We couldn't load the gallery. Please try again later.
              </p>
            ) : data.data.length === 0 ? (
              <p className="py-20 text-center text-slate-500">No photos in this category yet.</p>
            ) : (
              <div className="columns-2 gap-4 space-y-4 lg:columns-3">
                {data.data.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() =>
                      item.image_url && setLightbox({ src: item.image_url, title: item.title })
                    }
                    className="group relative block w-full overflow-hidden rounded-2xl"
                  >
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.title}
                        loading="lazy"
                        className="w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex aspect-square items-center justify-center bg-slate-200">
                        <span className="text-sm text-slate-400">{item.title}</span>
                      </div>
                    )}
                    <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 via-transparent to-transparent p-4 opacity-0 transition-opacity group-hover:opacity-100">
                      <p className="text-left text-sm font-medium text-white">{item.title}</p>
                    </div>
                  </button>
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

      {lightbox ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            type="button"
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
            aria-label="Close"
          >
            <X className="h-6 w-6" />
          </button>
          <figure className="max-h-full" onClick={(e) => e.stopPropagation()}>
            <img
              src={lightbox.src}
              alt={lightbox.title}
              className="max-h-[80vh] rounded-2xl object-contain"
            />
            <figcaption className="mt-3 text-center text-sm text-white">{lightbox.title}</figcaption>
          </figure>
        </div>
      ) : null}
    </>
  );
}
