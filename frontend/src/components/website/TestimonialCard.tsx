import { Quote, Star } from 'lucide-react';
import type { Testimonial } from '@/types/website';

export function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  const rating = testimonial.rating ?? 5;

  return (
    <figure className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`h-4 w-4 ${i < rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`}
            />
          ))}
        </div>
        <Quote className="h-6 w-6 text-brand-100" />
      </div>
      <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-slate-700">
        “{testimonial.content}”
      </blockquote>
      <figcaption className="mt-5 flex items-center gap-3 border-t border-slate-100 pt-4">
        {testimonial.avatar_url ? (
          <img
            src={testimonial.avatar_url}
            alt={testimonial.name}
            className="h-10 w-10 rounded-full object-cover"
          />
        ) : (
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
            {testimonial.name.charAt(0)}
          </span>
        )}
        <div>
          <p className="text-sm font-semibold text-slate-900">{testimonial.name}</p>
          {testimonial.role ? (
            <p className="text-xs text-slate-500">{testimonial.role}</p>
          ) : null}
        </div>
      </figcaption>
    </figure>
  );
}
