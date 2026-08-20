import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Calendar, Clock, Eye, Tag } from 'lucide-react';
import { websiteApi } from '@/lib/websiteApi';
import { usePageMeta, formatSiteTitle } from '@/hooks/usePageMeta';
import { useCachedSiteName } from '@/hooks/useCachedSiteSettings';
import { usePageView } from '@/hooks/usePageView';
import { BlogCard } from '@/components/website/BlogCard';
import { Spinner } from '@/components/ui/Spinner';
import { formatDate } from '@/lib/utils';

export default function BlogDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  usePageView(`/blog/${slug ?? ''}`);

  const { data: post, isLoading, isError } = useQuery({
    queryKey: ['website', 'blog', slug],
    queryFn: () => websiteApi.blog.get(slug as string),
    enabled: !!slug,
  });

  const { data: related } = useQuery({
    queryKey: ['website', 'blog', slug, 'related'],
    queryFn: () => websiteApi.blog.related(slug as string),
    enabled: !!slug,
  });

  const siteName = useCachedSiteName();

  usePageMeta({
    title: post?.meta_title || (post ? formatSiteTitle(post.title, siteName) : formatSiteTitle('Blog', siteName)),
    description: post?.meta_description || post?.excerpt || undefined,
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (isError || !post) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="font-display text-3xl font-bold text-slate-900">Post not found</h1>
        <p className="mt-3 text-slate-600">The article you're looking for doesn't exist.</p>
        <Link
          to="/blog"
          className="mt-6 inline-flex h-11 items-center rounded-xl bg-brand-600 px-6 text-sm font-semibold text-white hover:bg-brand-700"
        >
          Back to Blog
        </Link>
      </div>
    );
  }

  return (
    <>
      <section className="bg-white py-12">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <Link
            to="/blog"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-brand-700"
          >
            <ArrowLeft className="h-4 w-4" />
            All articles
          </Link>

          <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500">
            {post.category ? (
              <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
                {post.category}
              </span>
            ) : null}
            {post.published_at ? (
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {formatDate(post.published_at)}
              </span>
            ) : null}
            {post.reading_minutes ? (
              <span className="inline-flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {post.reading_minutes} min read
              </span>
            ) : null}
            <span className="inline-flex items-center gap-1">
              <Eye className="h-4 w-4" />
              {post.views} views
            </span>
          </div>

          <h1 className="mt-4 font-display text-3xl font-bold leading-tight tracking-tight text-slate-900 sm:text-4xl">
            {post.title}
          </h1>

          {post.author?.name ? (
            <div className="mt-5 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
                {post.author.name.charAt(0)}
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-900">{post.author.name}</p>
                <p className="text-xs text-slate-500">Author</p>
              </div>
            </div>
          ) : null}
        </div>
      </section>

      {post.cover_url ? (
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <img
            src={post.cover_url}
            alt={post.title}
            className="aspect-[21/9] w-full rounded-3xl border border-slate-200 object-cover"
          />
        </div>
      ) : null}

      <section className="bg-white py-12">
        <div className="mx-auto max-w-3xl space-y-5 px-4 sm:px-6 lg:px-8">
          {post.content.split(/\n\s*\n/).filter((p) => p.trim()).map((paragraph, index) => (
            <p key={index} className="text-base leading-relaxed text-slate-700">
              {paragraph}
            </p>
          ))}

          {post.tags.length > 0 ? (
            <div className="mt-8 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-6">
              <Tag className="h-4 w-4 text-slate-400" />
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600"
                >
                  {tag}
                </span>
              ))}
            </div>
          ) : null}

          <div className="mt-8 rounded-2xl bg-gradient-to-br from-slate-900 via-brand-900 to-slate-800 p-8 text-center">
            <h2 className="font-display text-2xl font-bold text-white">
              Want your child to love tech?
            </h2>
            <p className="mt-2 text-brand-100">
              Try a free class and see what they can create.
            </p>
            <Link
              to="/contact"
              className="mt-5 inline-flex h-11 items-center rounded-xl bg-white px-6 text-sm font-semibold text-brand-700 transition-colors hover:bg-brand-50"
            >
              Book a Free Trial
            </Link>
          </div>
        </div>
      </section>

      {related && related.length > 0 ? (
        <section className="bg-slate-50 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-center font-display text-3xl font-bold text-slate-900">
              You might also like
            </h2>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {related.map((relatedPost) => (
                <BlogCard key={relatedPost.id} post={relatedPost} />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
