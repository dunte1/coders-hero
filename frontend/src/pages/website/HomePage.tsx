import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Sparkles, CheckCircle2, ChevronRight, Zap, Shield, Users, GraduationCap, BookOpen, Building2 } from 'lucide-react';
import { websiteApi } from '@/lib/websiteApi';
import { usePageMeta } from '@/hooks/usePageMeta';
import { usePageView } from '@/hooks/usePageView';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { getSetting, type HomeData } from '@/types/website';
import { SectionHeading } from '@/components/website/SectionHeading';
import { ServiceCard } from '@/components/website/ServiceCard';
import { ProgramCard } from '@/components/website/ProgramCard';
import { BlogCard } from '@/components/website/BlogCard';
import { TestimonialCarousel } from '@/components/website/TestimonialCarousel';
import { FaqAccordion } from '@/components/website/FaqAccordion';

interface StatsMeta {
  stats?: { value: string; label: string }[];
}

const featureIcons = [Zap, Shield, Users, CheckCircle2];

function FeatureBand({ section }: { section: NonNullable<HomeData['sections'][string]> }) {
  const stats = (section.meta as StatsMeta | undefined)?.stats ?? [];

  return (
    <section className="bg-slate-50 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="reveal">
          <SectionHeading title={section.title} subtitle={section.subtitle} />
        </div>
        <div className="mt-12 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4 stagger-children">
          {stats.map((stat, i) => {
            const Icon = featureIcons[i % featureIcons.length];
            return (
              <div
                key={stat.label}
                className="group rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1"
              >
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-500 group-hover:text-white">
                  <Icon className="h-6 w-6" />
                </div>
                <p className="font-display text-3xl font-bold text-slate-900 sm:text-4xl">{stat.value}</p>
                <p className="mt-2 text-sm font-medium text-slate-500">{stat.label}</p>
              </div>
            );
          })}
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
    <section className="py-20">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div className={`${reverse ? 'lg:order-2' : ''} reveal`}>
          {section.badge ? (
            <span className="inline-block rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-700">
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
              className="mt-6 inline-flex h-12 items-center rounded-xl bg-brand-500 px-6 text-sm font-semibold text-slate-900 shadow-lg shadow-brand-500/20 transition-all hover:bg-brand-400 hover:shadow-xl hover:shadow-brand-500/30 hover:-translate-y-0.5"
            >
              {section.button_label}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          ) : null}
        </div>
        <div className={`${reverse ? 'lg:order-1' : ''} reveal reveal-delay-2`}>
          {section.image_url ? (
            <img
              src={section.image_url}
              alt={section.title ?? ''}
              className="w-full rounded-3xl border border-slate-200 object-cover shadow-xl transition-shadow duration-300 hover:shadow-2xl"
              loading="lazy"
            />
          ) : (
            <div className="flex aspect-[4/3] items-center justify-center rounded-3xl bg-gradient-to-br from-brand-800 via-brand-900 to-slate-900">
              <span className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-500/20 text-brand-400 float-subtle">
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
  const scrollRef = useScrollReveal();
  const { data, isLoading, isError } = useQuery({
    queryKey: ['website', 'site'],
    queryFn: websiteApi.site.get,
  });

  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "EducationalOrganization",
      "name": "Coder's Hero",
      "url": window.location.origin,
      "description": "Premium coding and STEM education platform for children in Kenya. Learn coding, robotics, and digital skills.",
      "address": { "@type": "PostalAddress", "addressCountry": "KE" },
      "contactPoint": { "@type": "ContactPoint", "contactType": "customer service" },
      "sameAs": [],
    });
    document.head.appendChild(script);
    return () => { document.head.removeChild(script); };
  }, []);

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
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-200 border-t-brand-500" />
          <span className="text-sm font-medium text-slate-400">Loading...</span>
        </div>
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
          <Link to="/contact" className="text-brand-600 underline hover:text-brand-700">
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

  // Social proof counters from CMS stats section (or defaults)
  const defaultStats = [
    { icon: Users, value: '500+', label: 'Students Enrolled' },
    { icon: Building2, value: '15+', label: 'Partner Schools' },
    { icon: BookOpen, value: '50+', label: 'Courses Available' },
    { icon: GraduationCap, value: '20+', label: 'Expert Instructors' },
  ];
  const rawStats = (stats?.meta as StatsMeta | undefined)?.stats ?? [];
  const socialProof = rawStats.length > 0
    ? rawStats.map((s, i) => ({ ...s, icon: defaultStats[i % defaultStats.length].icon }))
    : defaultStats;

  return (
    <div ref={scrollRef}>
      {/* Hero Section — Dark brand background */}
      {hero ? (
        <section className="relative overflow-hidden bg-slate-900">
          {/* Circuit pattern overlay */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImVub3ZkZXIiPjxnIGZpbGw9IiMwMEU1RTUiIGZpbGwtb3BhY2l0eT0iMC4wNCI+PHBhdGggZD0iTTM2IDM0djZoNnYtNmgtNnptMC0zMHY2aDZ2LTZoLTZ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-60" />
          {/* Cyan gradient accent */}
          <div className="absolute inset-0 bg-gradient-to-br from-brand-900/40 via-transparent to-brand-800/20" />
          {/* Floating decorative orbs */}
          <div className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-brand-500/10 blur-3xl float-subtle" />
          <div className="absolute -bottom-32 -left-20 h-96 w-96 rounded-full bg-brand-400/8 blur-3xl float-subtle" style={{ animationDelay: '2s' }} />
          <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-28">
            <div>
              {hero.badge ? (
                <span className="hero-fade-up inline-flex items-center gap-1.5 rounded-full bg-brand-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-400 ring-1 ring-brand-500/30">
                  <Sparkles className="h-3.5 w-3.5" />
                  {hero.badge}
                </span>
              ) : null}
              <h1 className="hero-fade-up hero-fade-up-delay-1 mt-4 font-display text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
                {hero.title}
              </h1>
              {hero.subtitle ? (
                <p className="hero-fade-up hero-fade-up-delay-2 mt-5 text-lg leading-relaxed text-slate-300 sm:text-xl">
                  {hero.subtitle}
                </p>
              ) : null}
              {hero.body ? (
                <p className="hero-fade-up hero-fade-up-delay-3 mt-3 text-base text-slate-400">{hero.body}</p>
              ) : null}
              <div className="hero-fade-up hero-fade-up-delay-4 mt-8 flex flex-wrap items-center gap-3">
                {hero.button_label && hero.button_url ? (
                  <Link
                    to={hero.button_url}
                    className="inline-flex h-12 items-center rounded-xl bg-brand-500 px-7 text-base font-semibold text-slate-900 shadow-lg shadow-brand-500/25 transition-all hover:bg-brand-400 hover:shadow-xl hover:shadow-brand-500/30 hover:-translate-y-0.5"
                  >
                    {hero.button_label}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                ) : null}
                <Link
                  to="/contact"
                  className="inline-flex h-12 items-center rounded-xl border border-slate-600 bg-transparent px-7 text-base font-semibold text-white shadow-sm transition-all hover:bg-slate-800 hover:border-brand-500/50 hover:shadow-md hover:-translate-y-0.5"
                >
                  Book a Free Trial
                </Link>
              </div>
            </div>

            <div className="relative hidden lg:block">
              {data.gallery.length > 0 ? (
                <div className="grid grid-cols-2 gap-4 stagger-children">
                  {data.gallery.slice(0, 4).map((item, i) => (
                    <div key={item.id} className={i % 2 === 1 ? 'mt-8' : ''}>
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.title}
                          className="aspect-square w-full rounded-3xl border border-slate-700 object-cover shadow-xl transition-transform duration-300 hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex aspect-square items-center justify-center rounded-3xl bg-gradient-to-br from-brand-800 to-slate-800">
                          <Sparkles className="h-8 w-8 text-brand-500" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex aspect-[4/3] items-center justify-center rounded-3xl bg-gradient-to-br from-brand-700 to-slate-800">
                  <span className="text-6xl float-subtle">🚀</span>
                </div>
              )}
            </div>
          </div>
        </section>
      ) : null}

      {/* Social Proof Counters — from CMS stats section or defaults */}
      <section className="py-10 bg-white border-b border-slate-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {socialProof.map((item) => (
              <div key={item.label} className="reveal">
                <item.icon className="h-8 w-8 mx-auto text-brand-500 mb-3" />
                <div className="text-3xl font-bold text-slate-900">{item.value}</div>
                <div className="text-sm text-slate-500 mt-1">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      {stats ? <FeatureBand section={stats} /> : null}

      {/* Services */}
      {servicesIntro || data.services.length > 0 ? (
        <section className="bg-white py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="reveal">
              <SectionHeading
                badge="Our services"
                title={servicesIntro?.title ?? 'What we offer'}
                subtitle={servicesIntro?.subtitle}
              />
            </div>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 stagger-children">
              {data.services.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* Programs */}
      {programsIntro || data.programs.length > 0 ? (
        <section className="bg-slate-50 py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="reveal">
              <SectionHeading
                badge="Programs"
                title={programsIntro?.title ?? 'Explore our programs'}
                subtitle={programsIntro?.subtitle}
              />
            </div>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 stagger-children">
              {data.programs.map((program) => (
                <ProgramCard key={program.id} program={program} />
              ))}
            </div>
            <div className="mt-10 text-center reveal">
              <Link
                to="/programs"
                className="inline-flex h-12 items-center gap-2 rounded-xl border border-brand-200 bg-white px-6 text-sm font-semibold text-brand-700 shadow-sm transition-all hover:bg-brand-50 hover:shadow-md hover:-translate-y-0.5"
              >
                View all programs
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      ) : null}

      {/* Split features */}
      {robotics ? <SplitFeature section={robotics} /> : null}
      {coding ? <SplitFeature section={coding} reverse /> : null}

      {/* Gallery */}
      {galleryIntro || data.gallery.length > 0 ? (
        <section className="bg-slate-50 py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="reveal">
              <SectionHeading
                badge="Gallery"
                title={galleryIntro?.title ?? 'Inside our classroom'}
                subtitle={galleryIntro?.subtitle}
              />
            </div>
            <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4 stagger-children">
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
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-slate-200">
                      <span className="text-sm text-slate-400">{item.title}</span>
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 via-black/10 to-transparent p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <p className="text-sm font-medium text-white">{item.title}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* Testimonials */}
      {testimonialsIntro || data.testimonials.length > 0 ? (
        <section className="bg-white py-20">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="reveal">
              <SectionHeading
                badge="Testimonials"
                title={testimonialsIntro?.title ?? 'Loved by parents, loved by kids'}
                subtitle={testimonialsIntro?.subtitle}
              />
            </div>
            <div className="mt-12 reveal reveal-delay-1">
              <TestimonialCarousel testimonials={data.testimonials} />
            </div>
          </div>
        </section>
      ) : null}

      {/* Blog */}
      {blogIntro || data.blog_posts.length > 0 ? (
        <section className="bg-slate-50 py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="reveal">
              <SectionHeading
                badge="Blog"
                title={blogIntro?.title ?? 'From the blog'}
                subtitle={blogIntro?.subtitle}
              />
            </div>
            <div className="mt-12 grid gap-6 md:grid-cols-3 stagger-children">
              {data.blog_posts.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* FAQ */}
      {data.faqs.length > 0 ? (
        <section className="bg-white py-20">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <div className="reveal">
              <SectionHeading badge="FAQ" title="Frequently asked questions" />
            </div>
            <div className="mt-10 reveal reveal-delay-1">
              <FaqAccordion faqs={data.faqs.slice(0, 6)} />
            </div>
            <div className="mt-6 text-center reveal reveal-delay-2">
              <Link to="/faqs" className="text-sm font-semibold text-brand-600 hover:text-brand-700">
                View all FAQs →
              </Link>
            </div>
          </div>
        </section>
      ) : null}

      {/* CTA — Dark with cyan accents */}
      {cta ? (
        <section className="relative overflow-hidden bg-slate-900 py-20">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImVub3ZkZXIiPjxnIGZpbGw9IiMwMEU1RTUiIGZpbGwtb3BhY2l0eT0iMC4wNCI+PHBhdGggZD0iTTM2IDM0djZoNnYtNmgtNnptMC0zMHY2aDZ2LTZoLTZ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-60" />
          <div className="absolute inset-0 bg-gradient-to-br from-brand-900/40 via-transparent to-brand-800/20" />
          {/* Floating decorative orbs */}
          <div className="absolute -top-16 -left-16 h-56 w-56 rounded-full bg-brand-500/12 blur-3xl float-subtle" />
          <div className="absolute -bottom-20 -right-16 h-64 w-64 rounded-full bg-brand-400/10 blur-3xl float-subtle" style={{ animationDelay: '3s' }} />
          <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <div className="reveal">
              <h2 className="font-display text-3xl font-bold text-white sm:text-4xl lg:text-5xl">{cta.title}</h2>
              {cta.subtitle ? (
                <p className="mt-4 text-lg text-slate-300 sm:text-xl">{cta.subtitle}</p>
              ) : null}
              <Link
                to={cta.button_url ?? '/contact'}
                className="mt-8 inline-flex h-13 items-center rounded-xl bg-brand-500 px-8 text-base font-semibold text-slate-900 shadow-lg shadow-brand-500/25 transition-all hover:bg-brand-400 hover:shadow-xl hover:-translate-y-0.5"
              >
                {cta.button_label ?? 'Get Started'}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
