import api from '@/lib/axios';
import type { Page, PaginationMeta } from '@/types/cms';
import type {
  LibraryAuthor,
  LibraryBorrowing,
  LibraryCategory,
  LibraryQueryParams,
  LibraryReadingHistory,
  LibraryReservation,
  LibraryResource,
  LibraryResourceType,
  LibrarySummary,
} from '@/types/library';

const unwrap = <T>(res: { data: { data: T } }): T => res.data.data;

const unwrapPage = <T>(res: { data: { data: T[]; meta: PaginationMeta } }): Page<T> => ({
  results: res.data.data,
  meta: res.data.meta,
});

export interface CategoryInput {
  name: string;
  description?: string | null;
  is_active?: boolean;
}

export interface AuthorInput {
  name: string;
  bio?: string | null;
}

export interface ResourceInput {
  title: string;
  resource_type: LibraryResourceType;
  category_id?: number | null;
  author_id?: number | null;
  description?: string | null;
  language?: string;
  is_public?: boolean;
  download_allowed?: boolean;
  is_active?: boolean;
}

export const libraryApi = {
  // Catalog (all authenticated users)
  catalog: (params?: LibraryQueryParams) =>
    api.get<{ data: LibraryResource[]; meta: PaginationMeta }>('/library/catalog', { params }).then(unwrapPage<LibraryResource>),

  resource: (id: number) =>
    api.get<{ data: LibraryResource }>(`/library/catalog/resources/${id}`).then(unwrap<LibraryResource>),

  categoryOptions: () => api.get<{ data: LibraryCategory[] }>('/library/categories/options').then(unwrap<LibraryCategory[]>),

  authorOptions: () => api.get<{ data: LibraryAuthor[] }>('/library/authors/options').then(unwrap<LibraryAuthor[]>),

  borrow: (id: number, data?: { due_at?: string | null; note?: string | null }) =>
    api.post<{ data: LibraryBorrowing }>(`/library/resources/${id}/borrow`, data ?? {}).then(unwrap<LibraryBorrowing>),

  reserve: (id: number, data?: { note?: string | null }) =>
    api.post<{ data: LibraryReservation }>(`/library/resources/${id}/reserve`, data ?? {}).then(unwrap<LibraryReservation>),

  myBorrowings: (params?: { page?: number; per_page?: number; status?: string }) =>
    api.get<{ data: LibraryBorrowing[]; meta: PaginationMeta }>('/library/my/borrowings', { params }).then(unwrapPage<LibraryBorrowing>),

  myReservations: (params?: { page?: number; per_page?: number }) =>
    api.get<{ data: LibraryReservation[]; meta: PaginationMeta }>('/library/my/reservations', { params }).then(unwrapPage<LibraryReservation>),

  cancelMyReservation: (id: number) =>
    api.put<{ data: LibraryReservation }>(`/library/my/reservations/${id}/cancel`).then(unwrap<LibraryReservation>),

  myHistory: (params?: { page?: number; per_page?: number }) =>
    api.get<{ data: LibraryReadingHistory[]; meta: PaginationMeta }>('/library/my/history', { params }).then(unwrapPage<LibraryReadingHistory>),

  // Admin / librarian
  summary: () => api.get<{ data: LibrarySummary }>('/library/summary').then(unwrap<LibrarySummary>),

  categories: (params?: { page?: number; per_page?: number; search?: string }) =>
    api.get<{ data: LibraryCategory[]; meta: PaginationMeta }>('/library/categories', { params }).then(unwrapPage<LibraryCategory>),

  createCategory: (data: CategoryInput) =>
    api.post<{ data: LibraryCategory }>('/library/categories', data).then(unwrap<LibraryCategory>),

  updateCategory: (id: number, data: Partial<CategoryInput>) =>
    api.put<{ data: LibraryCategory }>(`/library/categories/${id}`, data).then(unwrap<LibraryCategory>),

  deleteCategory: (id: number) =>
    api.delete<{ data: null }>(`/library/categories/${id}`).then(() => undefined),

  authors: (params?: { page?: number; per_page?: number; search?: string }) =>
    api.get<{ data: LibraryAuthor[]; meta: PaginationMeta }>('/library/authors', { params }).then(unwrapPage<LibraryAuthor>),

  createAuthor: (data: AuthorInput) =>
    api.post<{ data: LibraryAuthor }>('/library/authors', data).then(unwrap<LibraryAuthor>),

  updateAuthor: (id: number, data: Partial<AuthorInput>) =>
    api.put<{ data: LibraryAuthor }>(`/library/authors/${id}`, data).then(unwrap<LibraryAuthor>),

  deleteAuthor: (id: number) =>
    api.delete<{ data: null }>(`/library/authors/${id}`).then(() => undefined),

  resources: (params?: LibraryQueryParams & { borrowed?: string; include_inactive?: string }) =>
    api.get<{ data: LibraryResource[]; meta: PaginationMeta }>('/library/resources', { params }).then(unwrapPage<LibraryResource>),

  createResource: (data: FormData) =>
    api.post<{ data: LibraryResource }>('/library/resources', data).then(unwrap<LibraryResource>),

  updateResource: (id: number, data: FormData) =>
    api.put<{ data: LibraryResource }>(`/library/resources/${id}`, data).then(unwrap<LibraryResource>),

  uploadResource: (id: number, data: FormData) =>
    api.post<{ data: LibraryResource }>(`/library/resources/${id}/upload`, data).then(unwrap<LibraryResource>),

  deleteResource: (id: number) =>
    api.delete<{ data: null }>(`/library/resources/${id}`).then(() => undefined),

  borrowings: (params?: { page?: number; per_page?: number; status?: string; overdue?: string }) =>
    api.get<{ data: LibraryBorrowing[]; meta: PaginationMeta }>('/library/borrowings', { params }).then(unwrapPage<LibraryBorrowing>),

  returnBorrowing: (id: number) =>
    api.put<{ data: LibraryBorrowing }>(`/library/borrowings/${id}/return`).then(unwrap<LibraryBorrowing>),

  reservations: (params?: { page?: number; per_page?: number; status?: string }) =>
    api.get<{ data: LibraryReservation[]; meta: PaginationMeta }>('/library/reservations', { params }).then(unwrapPage<LibraryReservation>),

  cancelReservation: (id: number) =>
    api.put<{ data: LibraryReservation }>(`/library/reservations/${id}/cancel`).then(unwrap<LibraryReservation>),
};

export { getErrorMessage } from '@/lib/studentsApi';
