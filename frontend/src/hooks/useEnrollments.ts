import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { enrollmentsApi } from '@/lib/api';
import { toast } from 'sonner';

export function useEnrollments(params?: Record<string, string | number | boolean>) {
  return useQuery({
    queryKey: ['enrollments', params],
    queryFn: () => enrollmentsApi.getEnrollments(params),
  });
}

export function useMyCourses() {
  return useQuery({
    queryKey: ['myCourses'],
    queryFn: () => enrollmentsApi.getMyCourses(),
  });
}

export function useEnroll() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (courseId: number) => enrollmentsApi.enroll(courseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
      queryClient.invalidateQueries({ queryKey: ['myCourses'] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast.success('Enrolled successfully');
    },
    onError: (error: { response?: { data?: { detail?: string } } }) => {
      toast.error(error.response?.data?.detail || 'Failed to enroll');
    },
  });
}

export function useUnenroll() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (enrollmentId: number) => enrollmentsApi.unenroll(enrollmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
      queryClient.invalidateQueries({ queryKey: ['myCourses'] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast.success('Unenrolled successfully');
    },
  });
}

export function useUpdateProgress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ enrollmentId, progress }: { enrollmentId: number; progress: number }) =>
      enrollmentsApi.updateProgress(enrollmentId, progress),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
      queryClient.invalidateQueries({ queryKey: ['myCourses'] });
    },
  });
}
