import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ArrowRight, Target, Users, Lightbulb, Heart, BookOpen, Cpu } from 'lucide-react';
import { websiteApi } from '@/lib/websiteApi';
import { usePageMeta, formatSiteTitle } from '@/hooks/usePageMeta';
import { useCachedSiteName } from '@/hooks/useCachedSiteSettings';
import { usePageView } from '@/hooks/usePageView';
import { PageBanner } from '@/components/website/PageBanner';
import { Spinner } from '@/components/ui/Spinner';

const values = [
  {
    icon: Target,
    title: 'Our Mission',
    description: 'To empower the next generation with essential technology skills through hands-on, engaging, and practical learning experiences.',
  },
  {
    icon: Lightbulb,
    title: 'Innovation',
    description: 'We believe in learning by doing. Our curriculum is designed to spark creativity and problem-solving through real-world projects.',
  },
  {
    icon: Users,
    title: 'Community',
    description: 'Building a vibrant community of young innovators, mentors, and parents who share a passion for technology and learning.',
  },
  {
    icon: Heart,
    title: 'Inclusivity',
    description: 'Technology education should be accessible to every child, regardless of background. We create pathways for all learners.',
  },
];

const stats = [
  { label: 'Students Enrolled', value: '500+' },
  { label: 'Courses Available', value: '50+' },
  { label: 'Expert Instructors', value: '20+' },
  { label: 'Partner Schools', value: '15+' },
];

export default function AboutPage() {
  const siteName = useCachedSiteName();
  usePageMeta({ title: formatSiteTitle('About Us', siteName) });
  usePageView();

  const { data: siteData, isLoading } = useQuery({
    queryKey: ['website', 'site'],
    queryFn: websiteApi.site.get,
  });

  return (
    <>
      <PageBanner
        badge="About Us"
        title="Empowering young minds through technology"
        subtitle="Coder's Hero is a leading technology education platform dedicated to teaching kids aged 5-17 essential coding, robotics, and digital skills."
      />

      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
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
            <div className="grid grid-cols-2 gap-6">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl bg-brand-50 p-6 text-center"
                >
                  <div className="text-3xl font-bold text-brand-600">{stat.value}</div>
                  <div className="mt-1 text-sm text-slate-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-bold text-slate-900">
              Our Core Values
            </h2>
            <p className="mt-3 text-slate-600 max-w-2xl mx-auto">
              The principles that guide everything we do at Coder's Hero.
            </p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((value) => (
              <div
                key={value.title}
                className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100"
              >
                <div className="mb-4 inline-flex rounded-xl bg-brand-100 p-3 text-brand-600">
                  <value.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">{value.title}</h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-bold text-slate-900">
              What We Teach
            </h2>
            <p className="mt-3 text-slate-600 max-w-2xl mx-auto">
              Comprehensive technology education covering the most in-demand skills.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: BookOpen, title: 'Coding & Programming', description: 'From Scratch and Blockly to Python, JavaScript, and more.' },
              { icon: Cpu, title: 'Robotics & Electronics', description: 'Hands-on robotics with Arduino, LEGO kits, and custom projects.' },
              { icon: Target, title: 'Web Development', description: 'HTML, CSS, React, and modern web technologies.' },
              { icon: Lightbulb, title: 'AI & Machine Learning', description: 'Introduction to artificial intelligence concepts and applications.' },
              { icon: Users, title: 'Game Development', description: 'Creating games using Scratch, Unity, and other platforms.' },
              { icon: Heart, title: 'Digital Literacy', description: 'Essential computer skills and digital citizenship.' },
            ].map((item) => (
              <div
                key={item.title}
                className="flex items-start gap-4 rounded-2xl border border-slate-100 p-6"
              >
                <div className="shrink-0 rounded-xl bg-brand-100 p-3 text-brand-600">
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

      <section className="bg-brand-600 py-16">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl font-bold text-white">
            Ready to Start Learning?
          </h2>
          <p className="mt-3 text-brand-100">
            Join hundreds of students already learning with Coder's Hero.
          </p>
          <div className="mt-6 flex items-center justify-center gap-4">
            <Link
              to="/programs"
              className="inline-flex h-11 items-center rounded-xl bg-white px-6 text-sm font-semibold text-brand-600 transition-colors hover:bg-brand-50"
            >
              Explore Programs
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link
              to="/contact"
              className="inline-flex h-11 items-center rounded-xl border border-white/30 px-6 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
