import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { adminApi } from '@/lib/adminApi';

function getErrorMessage(err: unknown): string {
  const error = err as { response?: { data?: { message?: string } } };
  return error.response?.data?.message || 'Something went wrong';
}

export function useActivityLogs(params?: { page?: number; per_page?: number; log_name?: string; event?: string; search?: string }) {
  return useQuery({
    queryKey: ['admin', 'activity-logs', params],
    queryFn: () => adminApi.activityLogs(params),
  });
}

export function useActivityEvents() {
  return useQuery({
    queryKey: ['admin', 'activity-events'],
    queryFn: adminApi.activityEvents,
  });
}

export function useSystemHealth() {
  return useQuery({
    queryKey: ['admin', 'system-health'],
    queryFn: adminApi.systemHealth,
  });
}

export function useSystemLogs(params?: { lines?: number; level?: string }) {
  return useQuery({
    queryKey: ['admin', 'system-logs', params],
    queryFn: () => adminApi.systemLogs(params),
  });
}

export function useBackups() {
  return useQuery({
    queryKey: ['admin', 'backups'],
    queryFn: adminApi.backups,
  });
}

export function useCreateBackup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminApi.createBackup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'backups'] });
      toast.success('Backup created successfully');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useDeleteBackup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => adminApi.deleteBackup(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'backups'] });
      toast.success('Backup deleted');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}
