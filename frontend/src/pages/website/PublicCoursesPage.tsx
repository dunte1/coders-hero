import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { BookOpen, Clock, BarChart, ArrowUpDown } from 'lucide-react';
import { websiteApi } from '@/lib/websiteApi';
import { usePageMeta, formatSiteTitle } from '@/hooks/usePageMeta';
import { useCachedSiteName } from '@/hooks/useCachedSiteSettings';
import { usePageView } from '@/hooks/usePageView';
import { PageBanner } from '@/components/website/PageBanner';
import { Spinner } from '@/components/ui/Spinner';

const levelColors: Record<string, string> = {
  beginner: 'bg-emerald-100 text-emerald-700',
  intermediate: 'bg-amber-100 text-amber-700',
  advanced: 'bg-red-100 text-red-700',
};

export default function PublicCoursesPage() {
  const siteName = useCachedSiteName();
  usePageMeta({
    title: formatSiteTitle('Courses', siteName),
    description: 'Browse our coding, robotics, and STEM courses for children aged 5-18.',
  });
  usePageView();

  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('newest');
  const [level, setLevel] = useState('');

  const { data: courses, isLoading, isError } = useQuery({
    queryKey: ['website', 'courses', search],
    queryFn: () => websiteApi.courses.list({ search: search || undefined }),
  });

  const filteredCourses = useMemo(() => {
    if (!courses) return [];
    let result = [...courses];
    if (level) result = result.filter((c) => c.level === level);
    if (sort === 'price_low') result.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
    else if (sort === 'price_high') result.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
    else if (sort === 'title') result.sort((a, b) => a.title.localeCompare(b.title));
    return result;
  }, [courses, sort, level]);

  return (
    <>
      <PageBanner
        badge="Our Courses"
        title="Explore our course catalog"
        subtitle="From beginner-friendly coding classes to advanced robotics and AI, find the perfect course for your learning journey."
      />
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-wrap items-center gap-3">
            <input
              type="text"
              placeholder="Search courses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full max-w-md rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
            <div className="flex items-center gap-2">
              <ArrowUpDown className="h-4 w-4 text-slate-400" />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              >
                <option value="newest">Newest</option>
                <option value="title">Alphabetical</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
              </select>
            </div>
            <div className="flex gap-2">
              {['', 'beginner', 'intermediate', 'advanced'].map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLevel(l)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    level === l
                      ? 'bg-brand-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {l || 'All Levels'}
                </button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <Spinner />
            </div>
          ) : isError || !courses || courses.length === 0 ? (
            <div className="py-20 text-center">
              <BookOpen className="mx-auto h-12 w-12 text-slate-300 mb-4" />
              <p className="text-slate-500 text-lg">No courses found.</p>
              <p className="text-slate-400 mt-2">Try adjusting your search or check back later.</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-slate-500 mb-4">{filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''} found</p>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredCourses.map((course) => (
                <div
                  key={course.id}
                  className="group rounded-2xl border border-slate-100 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  {course.thumbnail && (
                    <div className="aspect-video overflow-hidden bg-slate-100">
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-2">
                      {course.level && (
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                            levelColors[course.level] ?? 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {course.level}
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2 group-hover:text-brand-600 transition-colors">
                      {course.title}
                    </h3>
                    {course.description && (
                      <p className="text-sm text-slate-600 line-clamp-3 mb-4">{course.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      {course.duration_hours ? (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          <span>{course.duration_hours}h</span>
                        </div>
                      ) : null}
                      {course.level && (
                        <div className="flex items-center gap-1">
                          <BarChart className="h-3.5 w-3.5" />
                          <span className="capitalize">{course.level}</span>
                        </div>
                      )}
                    </div>
                    {course.price != null && (
                      <div className="mt-4 text-lg font-bold text-brand-600">
                        KES {course.price.toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            </>
          )}
        </div>
      </section>
      <section className="bg-slate-50 py-16">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl font-bold text-slate-900">
            Can't find what you're looking for?
          </h2>
          <p className="mt-3 text-slate-600">
            Contact us to learn more about our courses or to get personalized recommendations.
          </p>
          <Link
            to="/contact"
            className="mt-6 inline-flex h-11 items-center rounded-xl bg-brand-600 px-6 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
          >
            Contact Us
          </Link>
        </div>
      </section>
    </>
  );
}
