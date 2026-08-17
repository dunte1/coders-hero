import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Cpu, Puzzle, Trophy } from 'lucide-react';
import { websiteApi } from '@/lib/websiteApi';
import { usePageMeta, formatSiteTitle } from '@/hooks/usePageMeta';
import { useCachedSiteName } from '@/hooks/useCachedSiteSettings';
import { usePageView } from '@/hooks/usePageView';
import { PageBanner } from '@/components/website/PageBanner';
import { ProgramCard } from '@/components/website/ProgramCard';
import { Spinner } from '@/components/ui/Spinner';

const highlights = [
  {
    icon: Puzzle,
    title: 'Build real robots',
    body: 'Hands-on builds with LEGO, VEX and Arduino kits that spark engineering curiosity.',
  },
  {
    icon: Cpu,
    title: 'Learn to program',
    body: 'From block-based coding to text-based control, every robot is programmed by the student.',
  },
  {
    icon: Trophy,
    title: 'Compete and showcase',
    body: 'End-of-term showcases and friendly competitions build confidence and teamwork.',
  },
];

export default function RoboticsPage() {
  const siteName = useCachedSiteName();
  usePageMeta({ title: formatSiteTitle('Robotics', siteName) });
  usePageView();

  const { data: site } = useQuery({ queryKey: ['website', 'site'], queryFn: websiteApi.site.get });
  const { data: programs, isLoading, isError } = useQuery({
    queryKey: ['website', 'programs', 'robotics'],
    queryFn: () => websiteApi.programs.list({ category: 'robotics', per_page: 9 }),
  });

  const section = site?.sections?.robotics;

  return (
    <>
      <PageBanner
        badge={section?.badge ?? 'Robotics'}
        title={section?.title ?? 'Robotics programs'}
        subtitle={
          section?.subtitle ??
          'Design, build and program robots while learning engineering, teamwork and problem-solving.'
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
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-600 text-white">
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
            Robotics programs
          </h2>
          <div className="mt-10">
            {isLoading ? (
              <div className="flex justify-center py-16">
                <Spinner />
              </div>
            ) : isError || !programs || programs.data.length === 0 ? (
              <p className="py-16 text-center text-slate-500">
                Robotics programs are coming soon. Check back shortly!
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
              to="/programs?category=robotics"
              className="inline-flex h-11 items-center rounded-xl border border-brand-200 bg-white px-6 text-sm font-semibold text-brand-700 transition-colors hover:bg-brand-50"
            >
              View all robotics programs
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-white py-14">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl font-bold text-slate-900">Ready to build?</h2>
          <p className="mt-3 text-slate-600">Join a robotics class and bring your ideas to life.</p>
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
