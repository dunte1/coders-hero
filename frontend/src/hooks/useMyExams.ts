import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { studentExamsApi } from '@/lib/api';
import { toast } from 'sonner';

export function useAvailableExams() {
  return useQuery({ queryKey: ['student-exams'], queryFn: () => studentExamsApi.getAvailable() });
}

export function useExamDetail(id: number) {
  return useQuery({ queryKey: ['student-exam', id], queryFn: () => studentExamsApi.getExam(id), enabled: !!id });
}

export function useStartExamAttempt() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: studentExamsApi.startAttempt, onSuccess: () => { qc.invalidateQueries({ queryKey: ['student-exam-attempts'] }); toast.success('Exam started'); }, onError: (e: any) => toast.error(e?.response?.data?.message || 'Failed') });
}

export function useSubmitExamAttempt() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, answers }: { id: number; answers: Record<number, string> }) => studentExamsApi.submitAttempt(id, answers), onSuccess: () => { qc.invalidateQueries({ queryKey: ['student-exam-attempts'] }); qc.invalidateQueries({ queryKey: ['student-exams'] }); toast.success('Exam submitted'); }, onError: (e: any) => toast.error(e?.response?.data?.message || 'Failed') });
}

export function useMyExamAttempts() {
  return useQuery({ queryKey: ['student-exam-attempts'], queryFn: () => studentExamsApi.getAttempts() });
}
