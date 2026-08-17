import { Link } from 'react-router-dom';
import { ArrowRight, Clock, Eye } from 'lucide-react';
import type { BlogPost } from '@/types/website';
import { formatDate } from '@/lib/utils';

export function BlogCard({ post }: { post: BlogPost }) {
  return (
    <Link
      to={`/blog/${post.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
    >
      {post.cover_url ? (
        <div className="relative aspect-[16/9] overflow-hidden bg-slate-100">
          <img
            src={post.cover_url}
            alt={post.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {post.category ? (
            <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-slate-800 backdrop-blur">
              {post.category}
            </span>
          ) : null}
        </div>
      ) : (
        <div className="flex aspect-[16/9] items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
          <span className="text-sm font-medium text-slate-400">No image</span>
        </div>
      )}

      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
          {post.published_at ? <span>{formatDate(post.published_at)}</span> : null}
          {post.reading_minutes ? (
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {post.reading_minutes} min read
            </span>
          ) : null}
          {post.views ? (
            <span className="inline-flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" />
              {post.views}
            </span>
          ) : null}
        </div>
        <h3 className="mt-2 font-display text-base font-bold leading-snug text-slate-900 group-hover:text-brand-700">
          {post.title}
        </h3>
        {post.excerpt ? (
          <p className="mt-2 line-clamp-2 flex-1 text-sm text-slate-600">{post.excerpt}</p>
        ) : null}
        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
          {post.author?.name ? (
            <span className="text-xs font-medium text-slate-500">By {post.author.name}</span>
          ) : (
            <span />
          )}
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 group-hover:text-brand-700">
            Read
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
