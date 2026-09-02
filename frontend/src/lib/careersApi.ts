import api from '@/lib/axios';
import type { JobListing, JobApplication, JobListingInput } from '@/types/careers';

interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

interface Page<T> {
  data: T[];
  meta: PaginationMeta;
}

const unwrap = <T>(res: { data: { data: T } }): T => res.data.data;
const unwrapPage = <T>(res: { data: { data: T[]; meta: PaginationMeta } }): Page<T> => ({
  data: res.data.data,
  meta: res.data.meta,
});

export const careersApi = {
  jobs: {
    list: (params?: Record<string, string | number>) =>
      api.get<{ data: JobListing[]; meta: PaginationMeta }>('/cms/jobs', { params }).then(unwrapPage<JobListing>),
    get: (id: number) =>
      api.get<{ data: JobListing }>(`/cms/jobs/${id}`).then(unwrap<JobListing>),
    create: (data: JobListingInput) =>
      api.post<{ data: JobListing }>('/cms/jobs', data).then(unwrap<JobListing>),
    update: (id: number, data: Partial<JobListingInput>) =>
      api.put<{ data: JobListing }>(`/cms/jobs/${id}`, data).then(unwrap<JobListing>),
    remove: (id: number) =>
      api.delete(`/cms/jobs/${id}`).then(unwrap),
    toggleFeatured: (id: number) =>
      api.put<{ data: JobListing }>(`/cms/jobs/${id}/toggle-featured`).then(unwrap<JobListing>),
  },
  applications: {
    list: (params?: Record<string, string | number>) =>
      api.get<{ data: JobApplication[]; meta: PaginationMeta }>('/cms/job-applications', { params }).then(unwrapPage<JobApplication>),
    get: (id: number) =>
      api.get<{ data: JobApplication }>(`/cms/job-applications/${id}`).then(unwrap<JobApplication>),
    updateStatus: (id: number, status: string) =>
      api.put<{ data: JobApplication }>(`/cms/job-applications/${id}/status`, { status }).then(unwrap<JobApplication>),
  },
  publicJobs: {
    list: (params?: Record<string, string | number>) =>
      api.get<{ data: JobListing[]; meta: PaginationMeta }>('/public/jobs', { params }).then(unwrapPage<JobListing>),
    get: (id: number) =>
      api.get<{ data: JobListing }>(`/public/jobs/${id}`).then(unwrap<JobListing>),
    apply: (id: number, formData: FormData) =>
      api.post(`/public/jobs/${id}/apply`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }).then(unwrap),
  },
};
