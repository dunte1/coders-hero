import api from '@/lib/axios';
import type { Page, PaginationMeta } from '@/types/cms';
import { getErrorMessage } from '@/lib/studentsApi';

export { getErrorMessage };

export interface CodingLanguageItem {
  id: number;
  name: string;
  slug: string;
  icon: string | null;
  piston_language: string | null;
  entry_file: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CodingLanguageCreate {
  name: string;
  slug: string;
  icon?: string | null;
  piston_language?: string | null;
  entry_file?: string | null;
  is_active?: boolean;
}

export interface CodingLanguageUpdate {
  name?: string;
  slug?: string;
  icon?: string | null;
  piston_language?: string | null;
  entry_file?: string | null;
  is_active?: boolean;
}

const unwrap = <T>(res: { data: { data: T } }): T => res.data.data;

const unwrapPage = <T>(res: { data: { data: T[]; meta: PaginationMeta } }): Page<T> => ({
  results: res.data.data,
  meta: res.data.meta,
});

export const codingLanguagesApi = {
  list: (params?: { page?: number; per_page?: number; search?: string; is_active?: boolean }) =>
    api.get<{ data: CodingLanguageItem[]; meta: PaginationMeta }>('/admin/coding-languages', { params }).then(unwrapPage<CodingLanguageItem>),

  get: (id: number) =>
    api.get<{ data: CodingLanguageItem }>(`/admin/coding-languages/${id}`).then(unwrap<CodingLanguageItem>),

  create: (data: CodingLanguageCreate) =>
    api.post<{ data: CodingLanguageItem }>('/admin/coding-languages', data).then(unwrap<CodingLanguageItem>),

  update: (id: number, data: CodingLanguageUpdate) =>
    api.put<{ data: CodingLanguageItem }>(`/admin/coding-languages/${id}`, data).then(unwrap<CodingLanguageItem>),

  delete: (id: number) =>
    api.delete(`/admin/coding-languages/${id}`).then(() => undefined),

  getPublic: () =>
    api.get<{ data: CodingLanguageItem[] }>('/coding-languages').then(unwrap<CodingLanguageItem[]>),
};
