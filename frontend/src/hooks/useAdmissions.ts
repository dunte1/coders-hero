import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { admissionsApi, getErrorMessage } from '@/lib/studentsApi';
import type { AdmissionInput, AdmissionUpdate, SisListParams } from '@/types/students';

export function useAdmissions(params?: SisListParams) {
  return useQuery({
    queryKey: ['admissions', params],
    queryFn: () => admissionsApi.list(params),
  });
}

export function useAdmission(id: number) {
  return useQuery({
    queryKey: ['admission', id],
    queryFn: () => admissionsApi.get(id),
    enabled: !!id,
  });
}

export function useCreateAdmission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: AdmissionInput) => admissionsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admissions'] });
      toast.success('Admission created successfully');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useUpdateAdmission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: AdmissionUpdate }) => admissionsApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admissions'] });
      queryClient.invalidateQueries({ queryKey: ['admission', variables.id] });
      toast.success('Admission updated successfully');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useDeleteAdmission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => admissionsApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admissions'] });
      toast.success('Admission deleted successfully');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useAdmitAdmission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => admissionsApi.admit(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admissions'] });
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast.success('Applicant admitted as student successfully');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useRejectAdmission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => admissionsApi.reject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admissions'] });
      toast.success('Admission rejected');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}
