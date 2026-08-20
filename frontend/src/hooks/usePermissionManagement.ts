import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { permissionsApi } from '@/lib/api';
import { toast } from 'sonner';
import type { PermissionCreate, PermissionUpdate } from '@/types';

export function usePermissions(params?: Record<string, string | number | boolean>) {
  return useQuery({
    queryKey: ['permissions', params],
    queryFn: () => permissionsApi.getPermissions(params),
  });
}

export function usePermissionGroups() {
  return useQuery({
    queryKey: ['permission-groups'],
    queryFn: async () => {
      const res = await permissionsApi.getPermissionGroups();
      // API returns { groupName: Permission[], ... } or string[]
      if (Array.isArray(res)) return res;
      if (res && typeof res === 'object') return Object.keys(res);
      return [];
    },
  });
}

export function useCreatePermission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: PermissionCreate) => permissionsApi.createPermission(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permissions'] });
      toast.success('Permission created successfully');
    },
    onError: (error: { response?: { data?: { detail?: string } } }) => {
      toast.error(error.response?.data?.detail || 'Failed to create permission');
    },
  });
}

export function useUpdatePermission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: PermissionUpdate }) =>
      permissionsApi.updatePermission(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permissions'] });
      toast.success('Permission updated successfully');
    },
    onError: (error: { response?: { data?: { detail?: string } } }) => {
      toast.error(error.response?.data?.detail || 'Failed to update permission');
    },
  });
}

export function useDeletePermission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => permissionsApi.deletePermission(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permissions'] });
      toast.success('Permission deleted successfully');
    },
    onError: (error: { response?: { data?: { detail?: string } } }) => {
      toast.error(error.response?.data?.detail || 'Failed to delete permission');
    },
  });
}
