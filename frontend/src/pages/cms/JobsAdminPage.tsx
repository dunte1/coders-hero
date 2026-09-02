import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Pencil, Trash2, Star, StarOff } from 'lucide-react';
import { careersApi } from '@/lib/careersApi';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ConfirmDelete } from '@/components/cms/ConfirmDelete';
import type { JobListing } from '@/types/careers';

export default function JobsAdminPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<JobListing | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['cms', 'jobs', search],
    queryFn: () => careersApi.jobs.list({ ...(search ? { search } : {}), per_page: 20 }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => careersApi.jobs.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms', 'jobs'] });
      toast.success('Job listing deleted');
      setDeleteTarget(null);
    },
    onError: () => toast.error('Failed to delete'),
  });

  const toggleFeaturedMutation = useMutation({
    mutationFn: (id: number) => careersApi.jobs.toggleFeatured(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms', 'jobs'] });
    },
  });

  const jobs = data?.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Job Listings"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Job Listings' }]}
        actions={
          <Button onClick={() => navigate('/cms/jobs/new')}>New Job</Button>
        }
      />

      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 p-4">
          <Input
            placeholder="Search jobs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-4 py-3 font-medium text-slate-600">Title</th>
                <th className="px-4 py-3 font-medium text-slate-600">Department</th>
                <th className="px-4 py-3 font-medium text-slate-600">Location</th>
                <th className="px-4 py-3 font-medium text-slate-600">Type</th>
                <th className="px-4 py-3 font-medium text-slate-600">Status</th>
                <th className="px-4 py-3 font-medium text-slate-600">Featured</th>
                <th className="px-4 py-3 font-medium text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500">Loading...</td>
                </tr>
              ) : jobs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500">No jobs found</td>
                </tr>
              ) : (
                jobs.map((job: JobListing) => (
                  <tr key={job.id} className="border-b border-slate-100">
                    <td className="px-4 py-3 font-medium text-slate-900">{job.title}</td>
                    <td className="px-4 py-3 text-slate-600">{job.department || '-'}</td>
                    <td className="px-4 py-3 text-slate-600">{job.location || '-'}</td>
                    <td className="px-4 py-3 text-slate-600 capitalize">{job.employment_type.replace('_', ' ')}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={job.status} />
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleFeaturedMutation.mutate(job.id)}
                        className="text-slate-400 hover:text-amber-500"
                      >
                        {job.is_featured ? <Star className="h-4 w-4 fill-amber-400 text-amber-400" /> : <StarOff className="h-4 w-4" />}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => navigate(`/cms/jobs/${job.id}/edit`)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(job)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDelete
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
        title="Delete Job Listing"
        description={`Are you sure you want to delete "${deleteTarget?.title}"? This will also delete all associated applications.`}
        loading={deleteMutation.isPending}
        onConfirm={() => {
          if (deleteTarget) deleteMutation.mutate(deleteTarget.id);
        }}
      />
    </div>
  );
}
