import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';

export function useMyClasses() {
  return useQuery({
    queryKey: ['student-classes'],
    queryFn: () => api.get('/student/classes').then(r => r.data),
  });
}
