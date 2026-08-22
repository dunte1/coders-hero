import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { toast } from 'sonner';

export function useMyAssignments() {
  return useQuery({
    queryKey: ['student-assignments'],
    queryFn: () => api.get('/student/assignments').then(r => r.data),
  });
}

export function useMyAssignmentDetail(id: number) {
  return useQuery({
    queryKey: ['student-assignment', id],
    queryFn: () => api.get(`/student/assignments/${id}`).then(r => r.data),
    enabled: !!id,
  });
}

export function useSubmitAssignment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: FormData }) =>
      api.post(`/student/assignments/${id}/submit`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['student-assignments'] });
      toast.success('Assignment submitted');
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Failed'),
  });
}

export function useSaveAssignmentDraft() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: FormData }) =>
      api.post(`/student/assignments/${id}/draft`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['student-assignments'] });
      toast.success('Draft saved');
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Failed'),
  });
}
