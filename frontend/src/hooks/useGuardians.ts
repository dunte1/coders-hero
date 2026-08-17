import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getErrorMessage, guardiansApi } from '@/lib/studentsApi';
import type { GuardianInput, GuardianUpdate, SisListParams } from '@/types/students';

export function useGuardians(params?: SisListParams) {
  return useQuery({
    queryKey: ['guardians', params],
    queryFn: () => guardiansApi.list(params),
  });
}

export function useAllGuardians() {
  return useQuery({
    queryKey: ['guardians', 'all'],
    queryFn: () => guardiansApi.all(),
  });
}

export function useGuardian(id: number) {
  return useQuery({
    queryKey: ['guardian', id],
    queryFn: () => guardiansApi.get(id),
    enabled: !!id,
  });
}

export function useCreateGuardian() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: GuardianInput) => guardiansApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guardians'] });
      toast.success('Guardian created successfully');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useUpdateGuardian() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: GuardianUpdate }) => guardiansApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['guardians'] });
      queryClient.invalidateQueries({ queryKey: ['guardian', variables.id] });
      toast.success('Guardian updated successfully');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useDeleteGuardian() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => guardiansApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guardians'] });
      toast.success('Guardian deleted successfully');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}
