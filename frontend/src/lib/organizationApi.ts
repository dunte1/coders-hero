import api from '@/lib/axios';
import type { PaginationMeta } from '@/types/cms';

export interface Branch {
  id: number;
  name: string;
  code: string;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  phone: string | null;
  email: string | null;
  principal_name: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BranchInput {
  name: string;
  code: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  phone?: string;
  email?: string;
  principal_name?: string;
  notes?: string;
  is_active?: boolean;
}

export interface PartnerSchool {
  id: number;
  name: string;
  contact_person: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  partnership_type: 'feeder' | 'sibling' | 'affiliate' | 'other';
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PartnerSchoolInput {
  name: string;
  contact_person?: string;
  contact_email?: string;
  contact_phone?: string;
  address?: string;
  city?: string;
  country?: string;
  partnership_type?: 'feeder' | 'sibling' | 'affiliate' | 'other';
  notes?: string;
  is_active?: boolean;
}

export interface AcademicYear {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface AcademicYearInput {
  name: string;
  start_date: string;
  end_date: string;
  is_current?: boolean;
  notes?: string;
}

interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

const unwrapPage = <T>(res: { data: PaginatedResponse<T> }) => ({
  results: res.data.data,
  meta: res.data.meta,
});

const unwrap = <T>(res: { data: { data: T } }) => res.data.data;

// ── Branches ──────────────────────────────────────────────────────────────

export const branchesApi = {
  list: (params?: { page?: number; per_page?: number; search?: string; is_active?: boolean }) =>
    api.get<PaginatedResponse<Branch>>('/organization/branches', { params }).then(unwrapPage<Branch>),

  all: () => api.get<{ data: Branch[] }>('/organization/branches/all').then(unwrap<Branch[]>),

  get: (id: number) => api.get<{ data: Branch }>(`/organization/branches/${id}`).then(unwrap<Branch>),

  create: (data: BranchInput) => api.post<{ data: Branch }>('/organization/branches', data).then(unwrap<Branch>),

  update: (id: number, data: Partial<BranchInput>) => api.put<{ data: Branch }>(`/organization/branches/${id}`, data).then(unwrap<Branch>),

  delete: (id: number) => api.delete(`/organization/branches/${id}`),
};

// ── Partner Schools ───────────────────────────────────────────────────────

export const partnerSchoolsApi = {
  list: (params?: { page?: number; per_page?: number; search?: string; partnership_type?: string; is_active?: boolean }) =>
    api.get<PaginatedResponse<PartnerSchool>>('/organization/partner-schools', { params }).then(unwrapPage<PartnerSchool>),

  all: () => api.get<{ data: PartnerSchool[] }>('/organization/partner-schools/all').then(unwrap<PartnerSchool[]>),

  get: (id: number) => api.get<{ data: PartnerSchool }>(`/organization/partner-schools/${id}`).then(unwrap<PartnerSchool>),

  create: (data: PartnerSchoolInput) => api.post<{ data: PartnerSchool }>('/organization/partner-schools', data).then(unwrap<PartnerSchool>),

  update: (id: number, data: Partial<PartnerSchoolInput>) => api.put<{ data: PartnerSchool }>(`/organization/partner-schools/${id}`, data).then(unwrap<PartnerSchool>),

  delete: (id: number) => api.delete(`/organization/partner-schools/${id}`),
};

// ── Academic Years ────────────────────────────────────────────────────────

export const academicYearsApi = {
  list: (params?: { page?: number; per_page?: number; search?: string; is_current?: boolean }) =>
    api.get<PaginatedResponse<AcademicYear>>('/organization/academic-years', { params }).then(unwrapPage<AcademicYear>),

  current: () => api.get<{ data: AcademicYear }>('/organization/academic-years/current').then(unwrap<AcademicYear>),

  get: (id: number) => api.get<{ data: AcademicYear }>(`/organization/academic-years/${id}`).then(unwrap<AcademicYear>),

  create: (data: AcademicYearInput) => api.post<{ data: AcademicYear }>('/organization/academic-years', data).then(unwrap<AcademicYear>),

  update: (id: number, data: Partial<AcademicYearInput>) => api.put<{ data: AcademicYear }>(`/organization/academic-years/${id}`, data).then(unwrap<AcademicYear>),

  delete: (id: number) => api.delete(`/organization/academic-years/${id}`),

  setCurrent: (id: number) => api.put<{ data: AcademicYear }>(`/organization/academic-years/${id}/set-current`).then(unwrap<AcademicYear>),
};
