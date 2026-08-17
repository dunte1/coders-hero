import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { attendanceApi, getErrorMessage } from '@/lib/studentsApi';
import type { AttendanceEntryInput, SisListParams } from '@/types/students';

export function useAttendanceList(params?: SisListParams) {
  return useQuery({
    queryKey: ['attendance', params],
    queryFn: () => attendanceApi.list(params),
  });
}

export function useBulkAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ date, entries }: { date: string; entries: AttendanceEntryInput[] }) =>
      attendanceApi.bulk(date, entries),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      queryClient.invalidateQueries({ queryKey: ['student-attendance'] });
      queryClient.invalidateQueries({ queryKey: ['students', 'overview'] });
      toast.success(`Attendance saved for ${variables.date}`);
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useUpdateAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<AttendanceEntryInput & { attendance_date?: string }> }) =>
      attendanceApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      queryClient.invalidateQueries({ queryKey: ['student-attendance'] });
      toast.success('Attendance updated successfully');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useDeleteAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => attendanceApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      queryClient.invalidateQueries({ queryKey: ['student-attendance'] });
      toast.success('Attendance record deleted successfully');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useAttendanceReport(params?: SisListParams) {
  return useQuery({
    queryKey: ['attendance-report', params],
    queryFn: () => attendanceApi.report(params),
  });
}
