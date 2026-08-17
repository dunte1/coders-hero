import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { hrApi, getErrorMessage } from '@/lib/hrApi';
import type {
  EmployeeContractInput,
  EmployeeHrInput,
  LeaveRequestInput,
  PerformanceReviewInput,
  StaffAttendanceInput,
} from '@/types/hr';

// Summary / options
export function useHrSummary() {
  return useQuery({ queryKey: ['hr', 'summary'], queryFn: () => hrApi.summary() });
}

export function useMyHrSummary() {
  return useQuery({ queryKey: ['my-hr', 'summary'], queryFn: () => hrApi.mySummary() });
}

export function useMyHrProfile() {
  return useQuery({ queryKey: ['my-hr', 'profile'], queryFn: () => hrApi.myProfile() });
}

export function useHrDepartments() {
  return useQuery({ queryKey: ['hr', 'departments'], queryFn: () => hrApi.departments() });
}

export function useHrPositions() {
  return useQuery({ queryKey: ['hr', 'positions'], queryFn: () => hrApi.positions() });
}

// Reports
export function useHeadcountReport(params?: { status?: string; department_id?: number }) {
  return useQuery({ queryKey: ['hr', 'reports', 'headcount', params], queryFn: () => hrApi.headcountReport(params) });
}

export function useLeaveReport(params?: { status?: string; leave_type?: string; from?: string; to?: string }) {
  return useQuery({ queryKey: ['hr', 'reports', 'leave', params], queryFn: () => hrApi.leaveReport(params) });
}

export function useAttendanceReport(params?: { from?: string; to?: string }) {
  return useQuery({ queryKey: ['hr', 'reports', 'attendance', params], queryFn: () => hrApi.attendanceReport(params) });
}

export function usePayrollReport(params?: { month?: string; status?: string }) {
  return useQuery({ queryKey: ['hr', 'reports', 'payroll', params], queryFn: () => hrApi.payrollReport(params) });
}

// Exports
export function useExportEmployees() {
  return useMutation({
    mutationFn: (params?: { status?: string; department_id?: number }) => hrApi.exportEmployees(params),
    onSuccess: () => toast.success('Employees exported'),
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useExportLeave() {
  return useMutation({
    mutationFn: (params?: { status?: string; from?: string; to?: string }) => hrApi.exportLeave(params),
    onSuccess: () => toast.success('Leave requests exported'),
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useExportAttendance() {
  return useMutation({
    mutationFn: (params?: { from?: string; to?: string }) => hrApi.exportAttendance(params),
    onSuccess: () => toast.success('Attendance exported'),
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useExportEmployeesPdf() {
  return useMutation({
    mutationFn: (params?: { status?: string; department_id?: number }) => hrApi.exportEmployeesPdf(params),
    onSuccess: () => toast.success('Employees PDF exported'),
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useExportLeavePdf() {
  return useMutation({
    mutationFn: (params?: { status?: string; from?: string; to?: string }) => hrApi.exportLeavePdf(params),
    onSuccess: () => toast.success('Leave requests PDF exported'),
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useExportAttendancePdf() {
  return useMutation({
    mutationFn: (params?: { from?: string; to?: string }) => hrApi.exportAttendancePdf(params),
    onSuccess: () => toast.success('Attendance PDF exported'),
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

// Employees
export function useHrEmployees(params?: { page?: number; per_page?: number; search?: string }) {
  return useQuery({ queryKey: ['hr', 'employees', params], queryFn: () => hrApi.employees(params) });
}

export function useHrEmployee(id: number) {
  return useQuery({ queryKey: ['hr', 'employees', 'item', id], queryFn: () => hrApi.employee(id), enabled: !!id });
}

export function useUpdateHrEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: EmployeeHrInput }) => hrApi.updateEmployee(id, data),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['hr', 'employees'] });
      queryClient.invalidateQueries({ queryKey: ['hr', 'employees', 'item', id] });
      queryClient.invalidateQueries({ queryKey: ['hr', 'summary'] });
      toast.success('Employee updated');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

// Contracts
export function useHrContracts(params?: { page?: number; per_page?: number; employee_id?: number; status?: string; type?: string }) {
  return useQuery({ queryKey: ['hr', 'contracts', params], queryFn: () => hrApi.contracts(params) });
}

export function useCreateContract() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: EmployeeContractInput) => hrApi.createContract(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr', 'contracts'] });
      queryClient.invalidateQueries({ queryKey: ['hr', 'summary'] });
      toast.success('Contract created');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useUpdateContract() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<EmployeeContractInput> }) => hrApi.updateContract(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr', 'contracts'] });
      toast.success('Contract updated');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useTerminateContract() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: 'terminated' | 'superseded' }) => hrApi.terminateContract(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr', 'contracts'] });
      toast.success('Contract terminated');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useDeleteContract() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => hrApi.deleteContract(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr', 'contracts'] });
      toast.success('Contract deleted');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

// Leave
export function useHrLeaves(params?: { page?: number; per_page?: number; status?: string; leave_type?: string; employee_id?: number; from?: string; to?: string; search?: string }) {
  return useQuery({ queryKey: ['hr', 'leaves', params], queryFn: () => hrApi.leaves(params) });
}

export function useCreateLeave() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: LeaveRequestInput) => hrApi.createLeave(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr', 'leaves'] });
      queryClient.invalidateQueries({ queryKey: ['hr', 'summary'] });
      toast.success('Leave request submitted');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useReviewLeave() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: { status: 'approved' | 'rejected'; note?: string | null } }) => hrApi.reviewLeave(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr', 'leaves'] });
      queryClient.invalidateQueries({ queryKey: ['hr', 'summary'] });
      toast.success('Leave request reviewed');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useCancelLeave() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => hrApi.cancelLeave(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr', 'leaves'] });
      toast.success('Leave request cancelled');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

// Attendance
export function useHrAttendance(params?: { page?: number; per_page?: number; employee_id?: number; status?: string; attendance_date?: string; from?: string; to?: string }) {
  return useQuery({ queryKey: ['hr', 'attendance', params], queryFn: () => hrApi.attendance(params) });
}

export function useCreateAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: StaffAttendanceInput) => hrApi.createAttendance(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr', 'attendance'] });
      toast.success('Attendance recorded');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useBulkStaffAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { attendance_date: string; records: Omit<StaffAttendanceInput, 'attendance_date'>[] }) => hrApi.bulkAttendance(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['hr', 'attendance'] });
      queryClient.invalidateQueries({ queryKey: ['hr', 'summary'] });
      toast.success(`${data.length} attendance record(s) saved`);
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useUpdateAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<StaffAttendanceInput> }) => hrApi.updateAttendance(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr', 'attendance'] });
      toast.success('Attendance updated');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useDeleteAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => hrApi.deleteAttendance(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr', 'attendance'] });
      toast.success('Attendance record deleted');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

// Payroll
export function useHrPayrolls(params?: { page?: number; per_page?: number; month?: string; status?: string }) {
  return useQuery({ queryKey: ['hr', 'payrolls', params], queryFn: () => hrApi.payrolls(params) });
}

export function useHrPayroll(id: number) {
  return useQuery({ queryKey: ['hr', 'payrolls', 'item', id], queryFn: () => hrApi.payroll(id), enabled: !!id });
}

export function useRunPayroll() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (month: string) => hrApi.runPayroll(month),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr', 'payrolls'] });
      queryClient.invalidateQueries({ queryKey: ['hr', 'summary'] });
      toast.success('Payroll generated');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useProcessPayroll() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => hrApi.processPayroll(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr', 'payrolls'] });
      toast.success('Payroll processed');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useMarkPayrollPaid() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payment_method }: { id: number; payment_method?: string | null }) => hrApi.markPayrollPaid(id, payment_method),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr', 'payrolls'] });
      toast.success('Payroll marked as paid');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useCancelPayroll() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => hrApi.cancelPayroll(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr', 'payrolls'] });
      toast.success('Payroll cancelled');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

// Performance reviews
export function useHrReviews(params?: { page?: number; per_page?: number; employee_id?: number; status?: string; search?: string }) {
  return useQuery({ queryKey: ['hr', 'reviews', params], queryFn: () => hrApi.reviews(params) });
}

export function useCreateReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: PerformanceReviewInput) => hrApi.createReview(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr', 'reviews'] });
      queryClient.invalidateQueries({ queryKey: ['hr', 'summary'] });
      toast.success('Performance review created');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useUpdateReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<PerformanceReviewInput> }) => hrApi.updateReview(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr', 'reviews'] });
      toast.success('Performance review updated');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useDeleteReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => hrApi.deleteReview(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr', 'reviews'] });
      toast.success('Performance review deleted');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

// Documents
export function useHrDocuments(params?: { page?: number; per_page?: number; employee_id?: number; category?: string; search?: string }) {
  return useQuery({ queryKey: ['hr', 'documents', params], queryFn: () => hrApi.documents(params) });
}

export function useCreateDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: FormData) => hrApi.createDocument(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr', 'documents'] });
      toast.success('Document uploaded');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => hrApi.deleteDocument(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr', 'documents'] });
      toast.success('Document deleted');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

// Self-service
export function useMyLeaves(params?: { page?: number; per_page?: number; status?: string }) {
  return useQuery({ queryKey: ['my-hr', 'leaves', params], queryFn: () => hrApi.myLeaves(params) });
}

export function useMyLeaveBalance() {
  return useQuery({ queryKey: ['my-hr', 'leaves', 'balance'], queryFn: () => hrApi.myLeaveBalance() });
}

export function useMyCreateLeave() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: LeaveRequestInput) => hrApi.myCreateLeave(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-hr', 'leaves'] });
      queryClient.invalidateQueries({ queryKey: ['my-hr', 'leaves', 'balance'] });
      queryClient.invalidateQueries({ queryKey: ['my-hr', 'summary'] });
      toast.success('Leave request submitted');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useMyCancelLeave() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => hrApi.myCancelLeave(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-hr', 'leaves'] });
      queryClient.invalidateQueries({ queryKey: ['my-hr', 'leaves', 'balance'] });
      queryClient.invalidateQueries({ queryKey: ['my-hr', 'summary'] });
      toast.success('Leave request cancelled');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useMyAttendance(params?: { page?: number; from?: string; to?: string }) {
  return useQuery({ queryKey: ['my-hr', 'attendance', params], queryFn: () => hrApi.myAttendance(params) });
}

export function useMyPayslips(params?: { page?: number; per_page?: number; status?: string }) {
  return useQuery({ queryKey: ['my-hr', 'payslips', params], queryFn: () => hrApi.myPayslips(params) });
}

export function useMyPayslip(id: number) {
  return useQuery({ queryKey: ['my-hr', 'payslips', 'item', id], queryFn: () => hrApi.myPayslip(id), enabled: !!id });
}

export function useMyDocuments(params?: { page?: number; category?: string }) {
  return useQuery({ queryKey: ['my-hr', 'documents', params], queryFn: () => hrApi.myDocuments(params) });
}

export function useMyCreateDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: FormData) => hrApi.myCreateDocument(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-hr', 'documents'] });
      toast.success('Document uploaded');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}
