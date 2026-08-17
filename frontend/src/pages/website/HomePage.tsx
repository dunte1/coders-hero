import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Sparkles } from 'lucide-react';
import { websiteApi } from '@/lib/websiteApi';
import { usePageMeta } from '@/hooks/usePageMeta';
import { usePageView } from '@/hooks/usePageView';
import { getSetting, type HomeData } from '@/types/website';
import { SectionHeading } from '@/components/website/SectionHeading';
import { ServiceCard } from '@/components/website/ServiceCard';
import { ProgramCard } from '@/components/website/ProgramCard';
import { BlogCard } from '@/components/website/BlogCard';
import { TestimonialCard } from '@/components/website/TestimonialCard';
import { FaqAccordion } from '@/components/website/FaqAccordion';

interface StatsMeta {
  stats?: { value: string; label: string }[];
}

function FeatureBand({ section }: { section: NonNullable<HomeData['sections'][string]> }) {
  const stats = (section.meta as StatsMeta | undefined)?.stats ?? [];

  return (
    <section className="bg-slate-50 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading title={section.title} subtitle={section.subtitle} />
        <div className="mt-10 grid grid-cols-2 gap-6 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm"
            >
              <p className="font-display text-4xl font-bold text-brand-600">{stat.value}</p>
              <p className="mt-2 text-sm font-medium text-slate-600">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SplitFeature({
  section,
  reverse,
}: {
  section: NonNullable<HomeData['sections'][string]>;
  reverse?: boolean;
}) {
  return (
    <section className="py-16">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div className={reverse ? 'lg:order-2' : ''}>
          {section.badge ? (
            <span className="inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-700">
              {section.badge}
            </span>
          ) : null}
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            {section.title}
          </h2>
          {section.subtitle ? (
            <p className="mt-3 text-lg font-medium text-brand-600">{section.subtitle}</p>
          ) : null}
          {section.body ? (
            <p className="mt-4 text-base leading-relaxed text-slate-600">{section.body}</p>
          ) : null}
          {section.button_label && section.button_url ? (
            <Link
              to={section.button_url}
              className="mt-6 inline-flex h-12 items-center rounded-xl bg-brand-600 px-6 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700"
            >
              {section.button_label}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          ) : null}
        </div>
        <div className={reverse ? 'lg:order-1' : ''}>
          {section.image_url ? (
            <img
              src={section.image_url}
              alt={section.title ?? ''}
              className="w-full rounded-3xl border border-slate-200 object-cover shadow-xl"
            />
          ) : (
            <div className="flex aspect-[4/3] items-center justify-center rounded-3xl bg-gradient-to-br from-brand-100 via-indigo-50 to-amber-50">
              <span className="flex h-20 w-20 items-center justify-center rounded-full bg-white/70 text-brand-600">
                <Sparkles className="h-10 w-10" />
              </span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  usePageView();
  const { data, isLoading, isError } = useQuery({
    queryKey: ['website', 'site'],
    queryFn: websiteApi.site.get,
  });

  const settings = data?.settings;
  const sections = data?.sections ?? {};

  usePageMeta({
    title: getSetting(settings, 'seo.meta_title') || data?.sections.seo?.title || "Coder's Hero",
    description:
      getSetting(settings, 'seo.meta_description') ||
      data?.sections.seo?.subtitle ||
      'Coding, robotics and STEM classes for kids.',
    ogImage: getSetting(settings, 'seo.og_image') || undefined,
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <span className="font-display text-lg font-semibold text-slate-400">Loading...</span>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="font-display text-3xl font-bold text-slate-900">
          We couldn't load the site right now
        </h1>
        <p className="mt-3 text-slate-600">
          Please refresh the page in a moment. If the problem persists, reach out via{' '}
          <Link to="/contact" className="text-brand-600 underline">
            our contact page
          </Link>
          .
        </p>
      </div>
    );
  }

  const hero = sections.hero;
  const stats = sections.stats;
  const servicesIntro = sections.services_intro;
  const programsIntro = sections.programs_intro;
  const robotics = sections.robotics;
  const coding = sections.coding;
  const galleryIntro = sections.gallery_intro;
  const testimonialsIntro = sections.testimonials_intro;
  const blogIntro = sections.blog_intro;
  const cta = sections.cta;

  return (
    <>
      {hero ? (
        <section className="relative overflow-hidden bg-gradient-to-b from-brand-50 via-indigo-50/50 to-white">
          <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-24">
            <div>
              {hero.badge ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-700">
                  <Sparkles className="h-3.5 w-3.5" />
                  {hero.badge}
                </span>
              ) : null}
              <h1 className="mt-4 font-display text-4xl font-bold leading-tight tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                {hero.title}
              </h1>
              {hero.subtitle ? (
                <p className="mt-5 text-lg leading-relaxed text-slate-600 sm:text-xl">{hero.subtitle}</p>
              ) : null}
              {hero.body ? (
                <p className="mt-3 text-base text-slate-500">{hero.body}</p>
              ) : null}
              <div className="mt-8 flex flex-wrap items-center gap-3">
                {hero.button_label && hero.button_url ? (
                  <Link
                    to={hero.button_url}
                    className="inline-flex h-12 items-center rounded-xl bg-brand-600 px-7 text-base font-semibold text-white shadow-lg shadow-brand-600/20 transition-colors hover:bg-brand-700"
                  >
                    {hero.button_label}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                ) : null}
                <Link
                  to="/contact"
                  className="inline-flex h-12 items-center rounded-xl border border-slate-300 bg-white px-7 text-base font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                >
                  Book a Free Trial
                </Link>
              </div>
            </div>

            <div className="relative hidden lg:block">
              {data.gallery.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <img
                    src={data.gallery[0].image_url ?? ''}
                    alt={data.gallery[0].title}
                    className="aspect-square w-full rounded-3xl border border-white object-cover shadow-xl"
                  />
                  <img
                    src={data.gallery[1]?.image_url ?? ''}
                    alt={data.gallery[1]?.title ?? ''}
                    className="mt-10 aspect-square w-full rounded-3xl border border-white object-cover shadow-xl"
                  />
                  <img
                    src={data.gallery[2]?.image_url ?? ''}
                    alt={data.gallery[2]?.title ?? ''}
                    className="-mt-10 aspect-square w-full rounded-3xl border border-white object-cover shadow-xl"
                  />
                  <img
                    src={data.gallery[3]?.image_url ?? ''}
                    alt={data.gallery[3]?.title ?? ''}
                    className="aspect-square w-full rounded-3xl border border-white object-cover shadow-xl"
                  />
                </div>
              ) : (
                <div className="flex aspect-[4/3] items-center justify-center rounded-3xl bg-gradient-to-br from-brand-500 to-indigo-600">
                  <span className="text-6xl text-white">🚀</span>
                </div>
              )}
            </div>
          </div>
        </section>
      ) : null}

      {stats ? <FeatureBand section={stats} /> : null}

      {servicesIntro || data.services.length > 0 ? (
        <section className="bg-white py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              badge="Our services"
              title={servicesIntro?.title ?? 'What we offer'}
              subtitle={servicesIntro?.subtitle}
            />
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {data.services.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {programsIntro || data.programs.length > 0 ? (
        <section className="bg-slate-50 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              badge="Programs"
              title={programsIntro?.title ?? 'Explore our programs'}
              subtitle={programsIntro?.subtitle}
            />
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {data.programs.map((program) => (
                <ProgramCard key={program.id} program={program} />
              ))}
            </div>
            <div className="mt-10 text-center">
              <Link
                to="/programs"
                className="inline-flex h-11 items-center rounded-xl border border-brand-200 bg-white px-6 text-sm font-semibold text-brand-700 transition-colors hover:bg-brand-50"
              >
                View all programs
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      ) : null}

      {robotics ? <SplitFeature section={robotics} /> : null}
      {coding ? <SplitFeature section={coding} reverse /> : null}

      {galleryIntro || data.gallery.length > 0 ? (
        <section className="bg-slate-50 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              badge="Gallery"
              title={galleryIntro?.title ?? 'Inside our classroom'}
              subtitle={galleryIntro?.subtitle}
            />
            <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {data.gallery.slice(0, 8).map((item) => (
                <Link
                  key={item.id}
                  to="/gallery"
                  className="group relative aspect-square overflow-hidden rounded-2xl"
                >
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-slate-200">
                      <span className="text-sm text-slate-400">{item.title}</span>
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 via-transparent to-transparent p-4 opacity-0 transition-opacity group-hover:opacity-100">
                    <p className="text-sm font-medium text-white">{item.title}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {testimonialsIntro || data.testimonials.length > 0 ? (
        <section className="bg-white py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              badge="Testimonials"
              title={testimonialsIntro?.title ?? 'Loved by parents, loved by kids'}
              subtitle={testimonialsIntro?.subtitle}
            />
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {data.testimonials.slice(0, 3).map((testimonial) => (
                <TestimonialCard key={testimonial.id} testimonial={testimonial} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {blogIntro || data.blog_posts.length > 0 ? (
        <section className="bg-slate-50 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              badge="Blog"
              title={blogIntro?.title ?? 'From the blog'}
              subtitle={blogIntro?.subtitle}
            />
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {data.blog_posts.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {data.faqs.length > 0 ? (
        <section className="bg-white py-16">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <SectionHeading badge="FAQ" title="Frequently asked questions" />
            <div className="mt-10">
              <FaqAccordion faqs={data.faqs.slice(0, 6)} />
            </div>
            <div className="mt-6 text-center">
              <Link to="/faqs" className="text-sm font-semibold text-brand-600 hover:text-brand-700">
                View all FAQs →
              </Link>
            </div>
          </div>
        </section>
      ) : null}

      {cta ? (
        <section className="relative overflow-hidden bg-gradient-to-br from-brand-600 to-indigo-700 py-16">
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">{cta.title}</h2>
            {cta.subtitle ? (
              <p className="mt-3 text-lg text-brand-100">{cta.subtitle}</p>
            ) : null}
            <Link
              to={cta.button_url ?? '/contact'}
              className="mt-8 inline-flex h-12 items-center rounded-xl bg-white px-8 text-base font-semibold text-brand-700 shadow-lg transition-colors hover:bg-brand-50"
            >
              {cta.button_label ?? 'Get Started'}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </section>
      ) : null}
    </>
  );
}
