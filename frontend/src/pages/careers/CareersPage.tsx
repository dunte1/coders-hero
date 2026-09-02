import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { MapPin, Briefcase, Clock, Search } from 'lucide-react';
import { careersApi } from '@/lib/careersApi';
import { PageBanner } from '@/components/website/PageBanner';
import { Input } from '@/components/ui/Input';
import {
  SelectRoot,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/Select';
import type { JobListing, JobEmploymentType } from '@/types/careers';

const EMPLOYMENT_LABELS: Record<JobEmploymentType, string> = {
  full_time: 'Full Time',
  part_time: 'Part Time',
  contract: 'Contract',
  internship: 'Internship',
};

export default function CareersPage() {
  const [search, setSearch] = useState('');
  const [employmentType, setEmploymentType] = useState<string>('');

  const { data, isLoading } = useQuery<{ data: JobListing[]; meta: { current_page: number; last_page: number; per_page: number; total: number } }>({
    queryKey: ['public-jobs', search, employmentType],
    queryFn: () =>
      careersApi.publicJobs.list({
        ...(search ? { search } : {}),
        ...(employmentType ? { employment_type: employmentType } : {}),
        per_page: 12,
      }),
  });

  const jobs = data?.data ?? [];

  return (
    <>
      <PageBanner title="Careers" subtitle="Join our team and help shape the future of education" />

      <div className="mx-auto max-w-6xl px-4 py-12">
        {/* Filters */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search jobs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <SelectRoot value={employmentType} onValueChange={setEmploymentType}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Employment Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Types</SelectItem>
              <SelectItem value="full_time">Full Time</SelectItem>
              <SelectItem value="part_time">Part Time</SelectItem>
              <SelectItem value="contract">Contract</SelectItem>
              <SelectItem value="internship">Internship</SelectItem>
            </SelectContent>
          </SelectRoot>
        </div>

        {/* Job Listings */}
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 animate-pulse rounded-xl bg-slate-100" />
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="py-16 text-center">
            <Briefcase className="mx-auto mb-4 h-12 w-12 text-slate-300" />
            <p className="text-lg text-slate-500">No open positions at the moment.</p>
            <p className="mt-2 text-sm text-slate-400">Check back later for new opportunities.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job: JobListing) => (
              <Link
                key={job.id}
                to={`/careers/${job.id}`}
                className="group rounded-xl border border-slate-200 bg-white p-6 transition-all hover:border-brand-300 hover:shadow-lg"
              >
                {job.is_featured && (
                  <span className="mb-3 inline-block rounded-full bg-brand-100 px-2.5 py-0.5 text-xs font-medium text-brand-700">
                    Featured
                  </span>
                )}
                <h3 className="text-lg font-semibold text-slate-900 group-hover:text-brand-600">
                  {job.title}
                </h3>
                <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-500">
                  {job.department && (
                    <span className="flex items-center gap-1">
                      <Briefcase className="h-3.5 w-3.5" />
                      {job.department}
                    </span>
                  )}
                  {job.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {job.location}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {EMPLOYMENT_LABELS[job.employment_type]}
                  </span>
                </div>
                <p className="mt-3 line-clamp-3 text-sm text-slate-600">
                  {job.description}
                </p>
                <div className="mt-4">
                  <span className="text-sm font-medium text-brand-600 group-hover:text-brand-700">
                    View Details →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
