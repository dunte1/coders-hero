import { cn } from '@/lib/utils';

interface SectionHeadingProps {
  badge?: string | null;
  title?: string | null;
  subtitle?: string | null;
  align?: 'center' | 'left';
  className?: string;
}

export function SectionHeading({
  badge,
  title,
  subtitle,
  align = 'center',
  className,
}: SectionHeadingProps) {
  if (!badge && !title && !subtitle) return null;

  return (
    <div
      className={cn(
        'max-w-2xl',
        align === 'center' ? 'mx-auto text-center' : 'text-left',
        className
      )}
    >
      {badge ? (
        <span className="inline-block rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-700 ring-1 ring-brand-200">
          {badge}
        </span>
      ) : null}
      {title ? (
        <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          {title}
        </h2>
      ) : null}
      {subtitle ? (
        <p className={cn('mt-4 text-base text-slate-600 sm:text-lg', align === 'center' && 'mx-auto')}>
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}
