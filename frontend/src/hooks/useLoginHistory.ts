import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '@/lib/api';
import { toast } from 'sonner';

export function useLoginHistory(params?: Record<string, string | number | boolean>) {
  return useQuery({
    queryKey: ['login-history', params],
    queryFn: () => authApi.getLoginHistory(params),
  });
}

export function useClearLoginHistory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => authApi.clearLoginHistory(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['login-history'] });
      toast.success('Login history cleared');
    },
    onError: (error: { response?: { data?: { detail?: string } } }) => {
      toast.error(error.response?.data?.detail || 'Failed to clear login history');
    },
  });
}
