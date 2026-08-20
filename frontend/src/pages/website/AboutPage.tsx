import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ArrowRight, Target, Users, Lightbulb, Heart, BookOpen, Cpu, Bot, Code2, FlaskConical, Gamepad2, Smartphone, BrainCircuit, Rocket, CheckCircle2, Shield, Zap } from 'lucide-react';
import { websiteApi } from '@/lib/websiteApi';
import { usePageMeta, formatSiteTitle } from '@/hooks/usePageMeta';
import { useCachedSiteName } from '@/hooks/useCachedSiteSettings';
import { usePageView } from '@/hooks/usePageView';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { PageBanner } from '@/components/website/PageBanner';
import { Spinner } from '@/components/ui/Spinner';

const valueIcons = [Target, Lightbulb, Users, Heart];
const valueData = [
  { title: 'Our Mission', description: 'To empower the next generation with essential technology skills through hands-on, engaging, and practical learning experiences.' },
  { title: 'Innovation', description: 'We believe in learning by doing. Our curriculum is designed to spark creativity and problem-solving through real-world projects.' },
  { title: 'Community', description: 'Building a vibrant community of young innovators, mentors, and parents who share a passion for technology and learning.' },
  { title: 'Inclusivity', description: 'Technology education should be accessible to every child, regardless of background. We create pathways for all learners.' },
];

const serviceIconMap: Record<string, typeof Rocket> = {
  Bot, Code2, FlaskConical, Gamepad2, Smartphone, BrainCircuit, Rocket,
};

const statIcons = [Zap, CheckCircle2, Shield, Users];

interface StatsMeta {
  stats?: { value: string; label: string }[];
}

export default function AboutPage() {
  const siteName = useCachedSiteName();
  usePageMeta({
    title: formatSiteTitle('About Us', siteName),
    description: 'Learn about Coder\'s Hero — a leading technology education platform dedicated to teaching kids aged 5-17 essential coding, robotics, and digital skills in Kenya.',
  });
  usePageView();

  const { data: siteData, isLoading } = useQuery({
    queryKey: ['website', 'site'],
    queryFn: websiteApi.site.get,
  });

  const scrollRef = useScrollReveal();

  if (isLoading) return <Spinner />;

  const services = siteData?.services ?? [];
  const programs = siteData?.programs ?? [];
  const sections = siteData?.sections ?? {};
  const statsSection = sections.stats;
  const stats = (statsSection?.meta as StatsMeta | undefined)?.stats ?? [];

  // Fallback stats if CMS doesn't have them
  const displayStats = stats.length > 0 ? stats : [
    { value: '500+', label: 'Students Enrolled' },
    { value: '50+', label: 'Courses Available' },
    { value: '20+', label: 'Expert Instructors' },
    { value: '15+', label: 'Partner Schools' },
  ];

  // Use services from API if available, otherwise show programs
  const whatWeTeach = services.length > 0 ? services.map((s) => ({
    icon: serviceIconMap[s.icon ?? ''] ?? Rocket,
    title: s.name,
    description: s.short_description ?? '',
  })) : programs.slice(0, 6).map((p) => ({
    icon: Rocket,
    title: p.name,
    description: p.description,
  }));

  return (
    <div ref={scrollRef}>
      <PageBanner
        badge="About Us"
        title="Empowering young minds through technology"
        subtitle="Coder's Hero is a leading technology education platform dedicated to teaching kids aged 5-17 essential coding, robotics, and digital skills."
      />

      {/* Who We Are + Stats */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div className="reveal">
              <h2 className="font-display text-3xl font-bold text-slate-900">
                Who We Are
              </h2>
              <p className="mt-4 text-lg text-slate-600 leading-relaxed">
                Coder's Hero is a comprehensive ERP and Learning Management System designed
                specifically for technology education institutions. We provide a complete
                ecosystem for teaching coding, robotics, and STEM subjects to young learners.
              </p>
              <p className="mt-4 text-slate-600 leading-relaxed">
                Our platform combines cutting-edge technology with proven educational methodologies
                to create an engaging learning environment. From block-based programming for
                beginners to advanced Python and web development for teens, we offer structured
                pathways that grow with each student.
              </p>
              <p className="mt-4 text-slate-600 leading-relaxed">
                With integrated management tools for schools, parents, and teachers, we ensure
                that every aspect of the learning journey is tracked, supported, and optimized
                for success.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-6 reveal reveal-delay-2">
              {displayStats.map((stat, i) => {
                const Icon = statIcons[i % statIcons.length];
                return (
                  <div key={stat.label} className="rounded-2xl bg-brand-50 p-6 text-center">
                    <Icon className="h-6 w-6 mx-auto mb-2 text-brand-600" />
                    <div className="text-3xl font-bold text-brand-700">{stat.value}</div>
                    <div className="mt-1 text-sm text-slate-600">{stat.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="bg-slate-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 reveal">
            <h2 className="font-display text-3xl font-bold text-slate-900">
              Our Core Values
            </h2>
            <p className="mt-3 text-slate-600 max-w-2xl mx-auto">
              The principles that guide everything we do at Coder's Hero.
            </p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 stagger-children">
            {valueData.map((value, i) => {
              const Icon = valueIcons[i];
              return (
                <div
                  key={value.title}
                  className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100 transition-all duration-300 hover:shadow-md hover:-translate-y-1"
                >
                  <div className="mb-4 inline-flex rounded-xl bg-brand-100 p-3 text-brand-600">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">{value.title}</h3>
                  <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                    {value.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* What We Teach — from API services or programs */}
      {whatWeTeach.length > 0 ? (
        <section className="bg-white py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 reveal">
              <h2 className="font-display text-3xl font-bold text-slate-900">
                What We Teach
              </h2>
              <p className="mt-3 text-slate-600 max-w-2xl mx-auto">
                Comprehensive technology education covering the most in-demand skills.
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 stagger-children">
              {whatWeTeach.map((item) => (
                <div
                  key={item.title}
                  className="flex items-start gap-4 rounded-2xl border border-slate-100 p-6 transition-all duration-300 hover:shadow-md hover:-translate-y-1"
                >
                  <div className="shrink-0 rounded-xl bg-slate-900 p-3 text-brand-400">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{item.title}</h3>
                    <p className="mt-1 text-sm text-slate-600">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* CTA */}
      <section className="relative overflow-hidden bg-slate-900 py-16">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImVub3ZkZXIiPjxnIGZpbGw9IiMwMEU1RTUiIGZpbGwtb3BhY2l0eT0iMC4wNCI+PHBhdGggZD0iTTM2IDM0djZoNnYtNmgtNnptMC0zMHY2aDZ2LTZoLTZ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-br from-brand-900/40 via-transparent to-brand-800/20" />
        <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl font-bold text-white">
            Ready to Start Learning?
          </h2>
          <p className="mt-3 text-slate-300">
            Join hundreds of students already learning with Coder's Hero.
          </p>
          <div className="mt-6 flex items-center justify-center gap-4">
            <Link
              to="/programs"
              className="inline-flex h-11 items-center rounded-xl bg-brand-500 px-6 text-sm font-semibold text-slate-900 transition-all hover:bg-brand-400 hover:-translate-y-0.5"
            >
              Explore Programs
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link
              to="/contact"
              className="inline-flex h-11 items-center rounded-xl border border-slate-600 px-6 text-sm font-semibold text-white transition-all hover:bg-slate-800 hover:border-brand-500/50"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
