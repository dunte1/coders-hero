import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { studentProjectsApi } from '@/lib/api';
import { toast } from 'sonner';

export function useMyProjects(params?: Record<string, string | number | boolean>) {
  return useQuery({ queryKey: ['student-projects', params], queryFn: () => studentProjectsApi.getAll(params) });
}

export function useStudentProject(id: number) {
  return useQuery({ queryKey: ['student-project', id], queryFn: () => studentProjectsApi.get(id), enabled: !!id });
}

export function useCreateStudentProject() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: studentProjectsApi.create, onSuccess: () => { qc.invalidateQueries({ queryKey: ['student-projects'] }); toast.success('Project created'); }, onError: (e: any) => toast.error(e?.response?.data?.message || 'Failed') });
}

export function useUpdateStudentProject() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, data }: { id: number; data: any }) => studentProjectsApi.update(id, data), onSuccess: () => { qc.invalidateQueries({ queryKey: ['student-projects'] }); toast.success('Project updated'); }, onError: (e: any) => toast.error(e?.response?.data?.message || 'Failed') });
}

export function useDeleteStudentProject() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: studentProjectsApi.delete, onSuccess: () => { qc.invalidateQueries({ queryKey: ['student-projects'] }); toast.success('Project deleted'); } });
}

export function usePublishStudentProject() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: studentProjectsApi.publish, onSuccess: () => { qc.invalidateQueries({ queryKey: ['student-projects'] }); toast.success('Project published'); } });
}

export function useUnpublishStudentProject() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: studentProjectsApi.unpublish, onSuccess: () => { qc.invalidateQueries({ queryKey: ['student-projects'] }); toast.success('Project unpublished'); } });
}
