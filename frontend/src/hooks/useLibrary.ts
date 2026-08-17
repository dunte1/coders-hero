import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { libraryApi, getErrorMessage, type AuthorInput, type CategoryInput } from '@/lib/libraryApi';
import type { LibraryQueryParams } from '@/types/library';

// Catalog (all authenticated users)
export function useLibraryCatalog(params?: LibraryQueryParams) {
  return useQuery({ queryKey: ['library', 'catalog', params], queryFn: () => libraryApi.catalog(params) });
}

export function useLibraryResource(id: number) {
  return useQuery({ queryKey: ['library', 'catalog', 'item', id], queryFn: () => libraryApi.resource(id), enabled: !!id });
}

export function useLibraryCategoryOptions() {
  return useQuery({ queryKey: ['library', 'categories', 'options'], queryFn: () => libraryApi.categoryOptions() });
}

export function useLibraryAuthorOptions() {
  return useQuery({ queryKey: ['library', 'authors', 'options'], queryFn: () => libraryApi.authorOptions() });
}

export function useBorrowResource() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data?: { due_at?: string | null; note?: string | null } }) => libraryApi.borrow(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library'] });
      toast.success('Resource borrowed');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useReserveResource() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data?: { note?: string | null } }) => libraryApi.reserve(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library'] });
      toast.success('Reservation created');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useMyBorrowings(params?: { page?: number; per_page?: number; status?: string }) {
  return useQuery({ queryKey: ['library', 'my', 'borrowings', params], queryFn: () => libraryApi.myBorrowings(params) });
}

export function useMyReservations(params?: { page?: number; per_page?: number }) {
  return useQuery({ queryKey: ['library', 'my', 'reservations', params], queryFn: () => libraryApi.myReservations(params) });
}

export function useCancelMyReservation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => libraryApi.cancelMyReservation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library', 'my', 'reservations'] });
      toast.success('Reservation cancelled');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useMyHistory(params?: { page?: number; per_page?: number }) {
  return useQuery({ queryKey: ['library', 'my', 'history', params], queryFn: () => libraryApi.myHistory(params) });
}

// Admin / librarian
export function useLibrarySummary() {
  return useQuery({ queryKey: ['library', 'summary'], queryFn: () => libraryApi.summary() });
}

export function useLibraryCategories(params?: { page?: number; per_page?: number; search?: string }) {
  return useQuery({ queryKey: ['library', 'categories', params], queryFn: () => libraryApi.categories(params) });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CategoryInput) => libraryApi.createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library', 'categories'] });
      queryClient.invalidateQueries({ queryKey: ['library', 'categories', 'options'] });
      queryClient.invalidateQueries({ queryKey: ['library', 'summary'] });
      toast.success('Category created');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CategoryInput> }) => libraryApi.updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library', 'categories'] });
      queryClient.invalidateQueries({ queryKey: ['library', 'categories', 'options'] });
      toast.success('Category updated');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => libraryApi.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library', 'categories'] });
      queryClient.invalidateQueries({ queryKey: ['library', 'categories', 'options'] });
      toast.success('Category deleted');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useLibraryAuthors(params?: { page?: number; per_page?: number; search?: string }) {
  return useQuery({ queryKey: ['library', 'authors', params], queryFn: () => libraryApi.authors(params) });
}

export function useCreateAuthor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: AuthorInput) => libraryApi.createAuthor(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library', 'authors'] });
      queryClient.invalidateQueries({ queryKey: ['library', 'authors', 'options'] });
      toast.success('Author created');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useUpdateAuthor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<AuthorInput> }) => libraryApi.updateAuthor(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library', 'authors'] });
      queryClient.invalidateQueries({ queryKey: ['library', 'authors', 'options'] });
      toast.success('Author updated');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useDeleteAuthor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => libraryApi.deleteAuthor(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library', 'authors'] });
      queryClient.invalidateQueries({ queryKey: ['library', 'authors', 'options'] });
      toast.success('Author deleted');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useLibraryResources(params?: LibraryQueryParams & { borrowed?: string; include_inactive?: string }) {
  return useQuery({ queryKey: ['library', 'resources', params], queryFn: () => libraryApi.resources(params) });
}

export function useCreateResource() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: FormData) => libraryApi.createResource(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library', 'resources'] });
      queryClient.invalidateQueries({ queryKey: ['library', 'catalog'] });
      queryClient.invalidateQueries({ queryKey: ['library', 'summary'] });
      toast.success('Resource added to the library');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useUpdateResource() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: FormData }) => libraryApi.updateResource(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library', 'resources'] });
      queryClient.invalidateQueries({ queryKey: ['library', 'catalog'] });
      toast.success('Resource updated');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useDeleteResource() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => libraryApi.deleteResource(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library', 'resources'] });
      queryClient.invalidateQueries({ queryKey: ['library', 'catalog'] });
      queryClient.invalidateQueries({ queryKey: ['library', 'summary'] });
      toast.success('Resource deleted');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useBorrowings(params?: { page?: number; per_page?: number; status?: string; overdue?: string }) {
  return useQuery({ queryKey: ['library', 'borrowings', params], queryFn: () => libraryApi.borrowings(params) });
}

export function useReturnBorrowing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => libraryApi.returnBorrowing(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library', 'borrowings'] });
      queryClient.invalidateQueries({ queryKey: ['library', 'resources'] });
      queryClient.invalidateQueries({ queryKey: ['library', 'catalog'] });
      queryClient.invalidateQueries({ queryKey: ['library', 'summary'] });
      toast.success('Resource returned');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useReservations(params?: { page?: number; per_page?: number; status?: string }) {
  return useQuery({ queryKey: ['library', 'reservations', params], queryFn: () => libraryApi.reservations(params) });
}

export function useCancelReservation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => libraryApi.cancelReservation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library', 'reservations'] });
      queryClient.invalidateQueries({ queryKey: ['library', 'summary'] });
      toast.success('Reservation cancelled');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}
