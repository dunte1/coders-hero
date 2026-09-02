import api from '@/lib/axios';
import type { Page, PaginationMeta } from '@/types/cms';

export interface Popup {
  id: number;
  title: string;
  body: string | null;
  image: string | null;
  image_url: string | null;
  button_text: string | null;
  button_url: string | null;
  type: 'advert' | 'seasonal_greeting';
  animation_style: string;
  overlay_style: string;
  start_date: string | null;
  end_date: string | null;
  frequency: 'every_visit' | 'once_per_session' | 'once_per_day' | 'once_ever';
  active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface PopupInput {
  title: string;
  body?: string;
  image?: string;
  button_text?: string;
  button_url?: string;
  type: 'advert' | 'seasonal_greeting';
  animation_style?: string;
  overlay_style?: string;
  start_date?: string | null;
  end_date?: string | null;
  frequency: 'every_visit' | 'once_per_session' | 'once_per_day' | 'once_ever';
  active?: boolean;
  sort_order?: number;
}

export interface PopupListParams {
  page?: number;
  per_page?: number;
  search?: string;
  type?: string;
  active?: boolean;
}

const unwrap = <T>(res: { data: { data: T } }): T => res.data.data;

const unwrapPage = <T>(res: { data: { data: T[]; meta: PaginationMeta } }): Page<T> => ({
  results: res.data.data,
  meta: res.data.meta,
});

export function getErrorMessage(err: unknown): string {
  const error = err as { response?: { data?: { message?: string } } };
  return error.response?.data?.message || 'Something went wrong';
}

export const popupsApi = {
  list: (params?: PopupListParams) =>
    api.get<{ data: Popup[]; meta: PaginationMeta }>('/admin/popups', { params }).then(unwrapPage<Popup>),

  get: (id: number) =>
    api.get<{ data: Popup }>(`/admin/popups/${id}`).then(unwrap<Popup>),

  create: (data: PopupInput) =>
    api.post<{ data: Popup }>('/admin/popups', data).then(unwrap<Popup>),

  update: (id: number, data: PopupInput) =>
    api.put<{ data: Popup }>(`/admin/popups/${id}`, data).then(unwrap<Popup>),

  toggleActive: (id: number) =>
    api.put<{ data: Popup }>(`/admin/popups/${id}/toggle-active`).then(unwrap<Popup>),

  remove: (id: number) => api.delete(`/admin/popups/${id}`).then(() => undefined),

  public: {
    get: () =>
      api.get<{ data: Popup[] }>('/public/popups').then(unwrap<Popup[]>),
  },
};
