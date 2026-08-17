import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { rolesApi } from '@/lib/api';
import { toast } from 'sonner';
import type { RoleCreate, RoleUpdate } from '@/types';

export function useRoles(params?: Record<string, string | number | boolean>) {
  return useQuery({
    queryKey: ['roles', params],
    queryFn: () => rolesApi.getRoles(params),
  });
}

export function useRole(id: number) {
  return useQuery({
    queryKey: ['role', id],
    queryFn: () => rolesApi.getRole(id),
    enabled: !!id,
  });
}

export function useRolePermissions(roleId: number) {
  return useQuery({
    queryKey: ['role', roleId, 'permissions'],
    queryFn: () => rolesApi.getRolePermissions(roleId),
    enabled: !!roleId,
  });
}

export function useRoleUsers(roleId: number, params?: Record<string, string | number | boolean>) {
  return useQuery({
    queryKey: ['role', roleId, 'users', params],
    queryFn: () => rolesApi.getRoleUsers(roleId, params),
    enabled: !!roleId,
  });
}

export function useCreateRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: RoleCreate) => rolesApi.createRole(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast.success('Role created successfully');
    },
    onError: (error: { response?: { data?: { detail?: string } } }) => {
      toast.error(error.response?.data?.detail || 'Failed to create role');
    },
  });
}

export function useUpdateRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: RoleUpdate }) => rolesApi.updateRole(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      queryClient.invalidateQueries({ queryKey: ['role', variables.id] });
      toast.success('Role updated successfully');
    },
    onError: (error: { response?: { data?: { detail?: string } } }) => {
      toast.error(error.response?.data?.detail || 'Failed to update role');
    },
  });
}

export function useDeleteRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => rolesApi.deleteRole(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast.success('Role deleted successfully');
    },
    onError: (error: { response?: { data?: { detail?: string } } }) => {
      toast.error(error.response?.data?.detail || 'Failed to delete role');
    },
  });
}

export function useSyncRolePermissions() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, permissions }: { id: number; permissions: string[] }) =>
      rolesApi.syncRolePermissions(id, permissions),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      queryClient.invalidateQueries({ queryKey: ['role', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['role', variables.id, 'permissions'] });
      toast.success('Permissions updated successfully');
    },
    onError: (error: { response?: { data?: { detail?: string } } }) => {
      toast.error(error.response?.data?.detail || 'Failed to update permissions');
    },
  });
}
