import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/lib/api';

export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: () => dashboardApi.getDashboard(),
    staleTime: 2 * 60 * 1000,
  });
}

export function useDashboardStats(params?: Record<string, string | number | boolean>) {
  return useQuery({
    queryKey: ['dashboardStats', params],
    queryFn: () => dashboardApi.getStats(params),
    staleTime: 2 * 60 * 1000,
  });
}
