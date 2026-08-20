import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Blocks, Gamepad2, Globe } from 'lucide-react';
import { websiteApi } from '@/lib/websiteApi';
import { usePageMeta, formatSiteTitle } from '@/hooks/usePageMeta';
import { useCachedSiteName } from '@/hooks/useCachedSiteSettings';
import { usePageView } from '@/hooks/usePageView';
import { PageBanner } from '@/components/website/PageBanner';
import { ProgramCard } from '@/components/website/ProgramCard';
import { Spinner } from '@/components/ui/Spinner';

const highlights = [
  {
    icon: Blocks,
    title: 'Start with blocks',
    body: 'Visual, drag-and-drop coding makes the first steps intuitive and fun for young learners.',
  },
  {
    icon: Globe,
    title: 'Progress to Python',
    body: 'Graduate to real text-based languages and build games, apps and websites.',
  },
  {
    icon: Gamepad2,
    title: 'Learn by building',
    body: 'Every class ends with a project students are proud to create and share.',
  },
];

export default function CodingPage() {
  const siteName = useCachedSiteName();
  usePageMeta({
    title: formatSiteTitle('Coding', siteName),
    description: 'Learn coding from Scratch to Python and JavaScript. Structured programming courses for children aged 5-18 at Coder\'s Hero.',
  });
  usePageView();

  const { data: site } = useQuery({ queryKey: ['website', 'site'], queryFn: websiteApi.site.get });
  const { data: programs, isLoading, isError } = useQuery({
    queryKey: ['website', 'programs', 'coding'],
    queryFn: () => websiteApi.programs.list({ category: 'coding', per_page: 9 }),
  });

  const section = site?.sections?.coding;

  return (
    <>
      <PageBanner
        badge={section?.badge ?? 'Coding'}
        title={section?.title ?? 'Coding programs'}
        subtitle={
          section?.subtitle ??
          'A progressive path from visual blocks to text-based programming, building real projects along the way.'
        }
      />

      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {section?.body ? (
            <p className="mx-auto max-w-3xl text-center text-lg leading-relaxed text-slate-600">
              {section.body}
            </p>
          ) : null}
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {highlights.map(({ icon: Icon, title, body }) => (
              <div key={title} className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-brand-400">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-display text-lg font-bold text-slate-900">{title}</h3>
                <p className="mt-2 text-sm text-slate-600">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center font-display text-3xl font-bold text-slate-900">
            Coding programs
          </h2>
          <div className="mt-10">
            {isLoading ? (
              <div className="flex justify-center py-16">
                <Spinner />
              </div>
            ) : isError || !programs || programs.data.length === 0 ? (
              <p className="py-16 text-center text-slate-500">
                Coding programs are coming soon. Check back shortly!
              </p>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {programs.data.map((program) => (
                  <ProgramCard key={program.id} program={program} />
                ))}
              </div>
            )}
          </div>
          <div className="mt-10 text-center">
            <Link
              to="/programs?category=coding"
              className="inline-flex h-11 items-center rounded-xl border border-brand-200 bg-white px-6 text-sm font-semibold text-brand-700 transition-colors hover:bg-brand-50"
            >
              View all coding programs
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-white py-14">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl font-bold text-slate-900">Start coding today</h2>
          <p className="mt-3 text-slate-600">Your child's first project is just one class away.</p>
          <Link
            to="/contact"
            className="mt-6 inline-flex h-11 items-center rounded-xl bg-brand-600 px-6 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
          >
            Book a Free Trial
          </Link>
        </div>
      </section>
    </>
  );
}
