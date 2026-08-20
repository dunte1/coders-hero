import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  ArrowRight,
  Award,
  Calendar,
  Check,
  Clock,
  Layers,
  Users,
} from 'lucide-react';
import { websiteApi, categoryLabels } from '@/lib/websiteApi';
import { usePageMeta, formatSiteTitle } from '@/hooks/usePageMeta';
import { useCachedSiteName } from '@/hooks/useCachedSiteSettings';
import { usePageView } from '@/hooks/usePageView';
import { Spinner } from '@/components/ui/Spinner';

function renderParagraphs(text: string | null | undefined) {
  if (!text) return null;
  return text
    .split(/\n\s*\n/)
    .filter((p) => p.trim())
    .map((paragraph, index) => (
      <p key={index} className="text-base leading-relaxed text-slate-600">
        {paragraph}
      </p>
    ));
}

export default function ProgramDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  usePageView(`/programs/${slug ?? ''}`);

  const { data: program, isLoading, isError } = useQuery({
    queryKey: ['website', 'program', slug],
    queryFn: () => websiteApi.programs.get(slug as string),
    enabled: !!slug,
  });

  const siteName = useCachedSiteName();

  usePageMeta({
    title: program ? formatSiteTitle(program.name, siteName) : formatSiteTitle('Program', siteName),
    description: program?.description ?? undefined,
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (isError || !program) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="font-display text-3xl font-bold text-slate-900">Program not found</h1>
        <p className="mt-3 text-slate-600">
          The program you're looking for doesn't exist or is no longer available.
        </p>
        <Link
          to="/programs"
          className="mt-6 inline-flex h-11 items-center rounded-xl bg-brand-600 px-6 text-sm font-semibold text-white hover:bg-brand-700"
        >
          Browse Programs
        </Link>
      </div>
    );
  }

  const metaChips = [
    program.age_group ? { icon: Users, label: `Ages ${program.age_group}` } : null,
    program.duration_weeks ? { icon: Calendar, label: `${program.duration_weeks} weeks` } : null,
    program.sessions_per_week
      ? { icon: Clock, label: `${program.sessions_per_week} sessions/week` }
      : null,
    program.level ? { icon: Layers, label: program.level } : null,
  ].filter((chip) => chip !== null);

  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50 via-brand-100/40 to-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <Link
            to="/programs"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-brand-700"
          >
            <ArrowLeft className="h-4 w-4" />
            All programs
          </Link>

          <div className="mt-6 grid items-center gap-10 lg:grid-cols-2">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-700">
                {categoryLabels[program.category] ?? program.category}
                {program.is_featured ? (
                  <span className="rounded-full bg-amber-400 px-2 py-0.5 text-xs font-bold text-amber-950">
                    Featured
                  </span>
                ) : null}
              </span>
              <h1 className="mt-4 font-display text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
                {program.name}
              </h1>
              {program.tagline ? (
                <p className="mt-3 text-lg font-medium text-brand-600">{program.tagline}</p>
              ) : null}
              <p className="mt-4 text-base leading-relaxed text-slate-600">{program.description}</p>

              <div className="mt-6 flex flex-wrap gap-3">
                {metaChips.map(
                  (chip) =>
                    chip && (
                      <span
                        key={chip.label}
                        className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600"
                      >
                        <chip.icon className="h-4 w-4 text-brand-600" />
                        {chip.label}
                      </span>
                    )
                )}
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                {program.price != null ? (
                  <p className="font-display text-4xl font-bold text-slate-900">
                    ${program.price}
                    {program.price_suffix ? (
                      <span className="ml-1 text-base font-medium text-slate-500">
                        {program.price_suffix}
                      </span>
                    ) : null}
                  </p>
                ) : null}
                <Link
                  to="/contact"
                  className="inline-flex h-12 items-center rounded-xl bg-brand-600 px-7 text-base font-semibold text-white shadow-lg shadow-brand-600/20 transition-colors hover:bg-brand-700"
                >
                  Enroll Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </div>
            </div>

            {program.image_url ? (
              <img
                src={program.image_url}
                alt={program.name}
                className="aspect-[4/3] w-full rounded-3xl border border-white object-cover shadow-xl"
              />
            ) : (
              <div className="flex aspect-[4/3] w-full items-center justify-center rounded-3xl bg-gradient-to-br from-slate-900 via-brand-900 to-slate-800">
                <span className="font-display text-2xl font-bold text-brand-400">{program.name}</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {renderParagraphs(program.long_description) ? (
        <section className="bg-white py-16">
          <div className="mx-auto max-w-3xl space-y-5 px-4 sm:px-6 lg:px-8">
            <h2 className="font-display text-2xl font-bold text-slate-900">About this program</h2>
            {renderParagraphs(program.long_description)}
          </div>
        </section>
      ) : null}

      {program.curriculum.length > 0 ? (
        <section className="bg-slate-50 py-16">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-center font-display text-3xl font-bold text-slate-900">
              Curriculum journey
            </h2>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {program.curriculum.map((phase, index) => (
                <div key={phase.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">
                    {index + 1}
                  </span>
                  <h3 className="mt-4 font-display text-lg font-bold text-slate-900">
                    {phase.title}
                  </h3>
                  {phase.description ? (
                    <p className="mt-2 text-sm text-slate-600">{phase.description}</p>
                  ) : null}
                  {phase.topics.length > 0 ? (
                    <ul className="mt-4 space-y-2">
                      {phase.topics.map((topic) => (
                        <li key={topic} className="flex items-start gap-2 text-sm text-slate-600">
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                          {topic}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {program.outcomes.length > 0 ? (
        <section className="bg-white py-16">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-brand-900 to-slate-800 p-8 sm:p-10">
              <h2 className="flex items-center gap-2 font-display text-2xl font-bold text-white">
                <Award className="h-6 w-6" />
                Learning outcomes
              </h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {program.outcomes.map((outcome) => (
                  <div key={outcome} className="flex items-start gap-2.5 text-brand-50">
                    <Check className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" />
                    {outcome}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      ) : null}

      <section className="bg-slate-50 py-16">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl font-bold text-slate-900">
            Ready to get started?
          </h2>
          <p className="mt-3 text-slate-600">
            Book a free trial class and see how much fun learning can be.
          </p>
          <Link
            to="/contact"
            className="mt-6 inline-flex h-12 items-center rounded-xl bg-brand-600 px-7 text-base font-semibold text-white transition-colors hover:bg-brand-700"
          >
            Book a Free Trial
          </Link>
        </div>
      </section>
    </>
  );
}
