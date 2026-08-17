import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getErrorMessage, studentsApi } from '@/lib/studentsApi';
import type {
  MedicalRecordInput,
  SisListParams,
  StudentInput,
  StudentTimelineInput,
  StudentUpdate,
} from '@/types/students';
import type {
  AdminPaymentInput,
  CodingProgressInput,
  FeeInput,
  ReportCardInput,
} from '@/types/portal';

export function useStudents(params?: SisListParams) {
  return useQuery({
    queryKey: ['students', params],
    queryFn: () => studentsApi.list(params),
  });
}

export function useStudent(id: number) {
  return useQuery({
    queryKey: ['student', id],
    queryFn: () => studentsApi.get(id),
    enabled: !!id,
  });
}

export function useStudentOverview() {
  return useQuery({
    queryKey: ['students', 'overview'],
    queryFn: () => studentsApi.overview(),
  });
}

export function useStudentGrades() {
  return useQuery({
    queryKey: ['students', 'grades'],
    queryFn: () => studentsApi.grades(),
  });
}

export function useStudentBranches() {
  return useQuery({
    queryKey: ['students', 'branches'],
    queryFn: () => studentsApi.branches(),
  });
}

export function useCreateStudent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: StudentInput) => studentsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast.success('Student created successfully');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useUpdateStudent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: StudentUpdate }) => studentsApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['student', variables.id] });
      toast.success('Student updated successfully');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useDeleteStudent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => studentsApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast.success('Student deleted successfully');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function usePromoteStudent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, newGrade }: { id: number; newGrade?: string }) => studentsApi.promote(id, newGrade),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['student', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['student-timeline'] });
      toast.success('Student promoted successfully');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useTransferStudent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, branch, note }: { id: number; branch: string; note?: string }) =>
      studentsApi.transfer(id, branch, note),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['student', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['student-timeline'] });
      toast.success('Student transferred successfully');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useGraduateStudent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, graduationDate }: { id: number; graduationDate?: string }) =>
      studentsApi.graduate(id, graduationDate),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['student', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['student-timeline'] });
      toast.success('Student graduated successfully');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useUploadStudentPhoto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, file }: { id: number; file: File }) => studentsApi.uploadPhoto(id, file),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['student', variables.id] });
      toast.success('Photo uploaded successfully');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useStudentMedical(studentId: number) {
  return useQuery({
    queryKey: ['student-medical', studentId],
    queryFn: async () => {
      try {
        return await studentsApi.medical.get(studentId);
      } catch {
        return null;
      }
    },
    enabled: !!studentId,
  });
}

export function useSaveMedicalRecord() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ studentId, data }: { studentId: number; data: MedicalRecordInput }) =>
      studentsApi.medical.upsert(studentId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['student-medical', variables.studentId] });
      queryClient.invalidateQueries({ queryKey: ['student', variables.studentId] });
      toast.success('Medical record saved successfully');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useStudentDocuments(studentId: number) {
  return useQuery({
    queryKey: ['student-documents', studentId],
    queryFn: () => studentsApi.documents.list(studentId),
    enabled: !!studentId,
  });
}

export function useUploadDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ studentId, name, documentType, file }: { studentId: number; name: string; documentType: string; file: File }) =>
      studentsApi.documents.upload(studentId, name, documentType, file),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['student-documents', variables.studentId] });
      toast.success('Document uploaded successfully');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (documentId: number) => studentsApi.documents.remove(documentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-documents'] });
      toast.success('Document deleted successfully');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useStudentTimeline(studentId: number) {
  return useQuery({
    queryKey: ['student-timeline', studentId],
    queryFn: () => studentsApi.timeline.list(studentId),
    enabled: !!studentId,
  });
}

export function useAddTimelineEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ studentId, data }: { studentId: number; data: StudentTimelineInput }) =>
      studentsApi.timeline.add(studentId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['student-timeline', variables.studentId] });
      toast.success('Timeline entry added successfully');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useDeleteTimelineEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (entryId: number) => studentsApi.timeline.remove(entryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-timeline'] });
      toast.success('Timeline entry deleted successfully');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useStudentAttendance(studentId: number, params?: SisListParams) {
  return useQuery({
    queryKey: ['student-attendance', studentId, params],
    queryFn: () => studentsApi.attendance.list(studentId, params),
    enabled: !!studentId,
  });
}

export function useStudentMonthlyAttendance(studentId: number, month?: string) {
  return useQuery({
    queryKey: ['student-attendance-monthly', studentId, month],
    queryFn: () => studentsApi.attendance.monthly(studentId, month),
    enabled: !!studentId,
  });
}

export function useStudentReportCards(studentId: number) {
  return useQuery({
    queryKey: ['student-report-cards', studentId],
    queryFn: () => studentsApi.reportCards.list(studentId),
    enabled: !!studentId,
  });
}

export function useCreateReportCard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ studentId, data }: { studentId: number; data: ReportCardInput }) =>
      studentsApi.reportCards.create(studentId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['student-report-cards', variables.studentId] });
      toast.success('Report card created successfully');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useUpdateReportCard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ reportCardId, data }: { reportCardId: number; data: Partial<ReportCardInput> }) =>
      studentsApi.reportCards.update(reportCardId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-report-cards'] });
      toast.success('Report card updated successfully');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useDeleteReportCard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reportCardId: number) => studentsApi.reportCards.remove(reportCardId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-report-cards'] });
      toast.success('Report card deleted successfully');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useStudentProgress(studentId: number) {
  return useQuery({
    queryKey: ['student-progress', studentId],
    queryFn: () => studentsApi.progress.list(studentId),
    enabled: !!studentId,
  });
}

export function useSaveCodingProgress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ studentId, data }: { studentId: number; data: CodingProgressInput }) =>
      studentsApi.progress.create(studentId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['student-progress', variables.studentId] });
      toast.success('Coding progress saved successfully');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useUpdateCodingProgress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ progressId, data }: { progressId: number; data: Partial<CodingProgressInput> }) =>
      studentsApi.progress.update(progressId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-progress'] });
      toast.success('Coding progress updated successfully');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useDeleteCodingProgress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (progressId: number) => studentsApi.progress.remove(progressId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-progress'] });
      toast.success('Coding progress deleted successfully');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useStudentFees(studentId: number) {
  return useQuery({
    queryKey: ['student-fees', studentId],
    queryFn: () => studentsApi.fees.list(studentId),
    enabled: !!studentId,
  });
}

export function useCreateFee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ studentId, data }: { studentId: number; data: FeeInput }) =>
      studentsApi.fees.create(studentId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['student-fees', variables.studentId] });
      toast.success('Fee created successfully');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useUpdateFee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ feeId, data }: { feeId: number; data: Partial<FeeInput> }) =>
      studentsApi.fees.update(feeId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-fees'] });
      toast.success('Fee updated successfully');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useDeleteFee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (feeId: number) => studentsApi.fees.remove(feeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-fees'] });
      toast.success('Fee deleted successfully');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useFeePayments(feeId: number) {
  return useQuery({
    queryKey: ['fee-payments', feeId],
    queryFn: () => studentsApi.fees.payments(feeId),
    enabled: !!feeId,
  });
}

export function useAddPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ feeId, data }: { feeId: number; data: AdminPaymentInput }) =>
      studentsApi.fees.addPayment(feeId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fee-payments'] });
      queryClient.invalidateQueries({ queryKey: ['student-fees'] });
      toast.success('Payment recorded successfully');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useDeletePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (paymentId: number) => studentsApi.fees.removePayment(paymentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fee-payments'] });
      queryClient.invalidateQueries({ queryKey: ['student-fees'] });
      toast.success('Payment deleted successfully');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}
