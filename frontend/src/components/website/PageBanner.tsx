import type { ReactNode } from 'react';

interface PageBannerProps {
  title: string;
  subtitle?: string | null;
  badge?: string | null;
  children?: ReactNode;
}

export function PageBanner({ title, subtitle, badge, children }: PageBannerProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-brand-50 via-indigo-50/60 to-white">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          {badge ? (
            <span className="hero-fade-up inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-700">
              {badge}
            </span>
          ) : null}
          <h1 className="hero-fade-up hero-fade-up-delay-1 mt-3 font-display text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            {title}
          </h1>
          {subtitle ? (
            <p className="hero-fade-up hero-fade-up-delay-2 mt-4 text-lg leading-relaxed text-slate-600">{subtitle}</p>
          ) : null}
          {children ? (
            <div className="hero-fade-up hero-fade-up-delay-3">{children}</div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
