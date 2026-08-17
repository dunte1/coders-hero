import api from '@/lib/axios';
import type { Page, PaginationMeta } from '@/types/cms';
import type {
  AttendanceReport,
  Department,
  EmployeeContract,
  EmployeeContractInput,
  EmployeeDocument,
  EmployeeHr,
  EmployeeHrInput,
  HeadcountReport,
  HrSummary,
  LeaveBalance,
  LeaveReport,
  LeaveRequest,
  LeaveRequestInput,
  MyHrSummary,
  Payroll,
  PayrollReport,
  Payslip,
  PerformanceReview,
  PerformanceReviewInput,
  Position,
  StaffAttendance,
  StaffAttendanceInput,
} from '@/types/hr';

const unwrap = <T>(res: { data: { data: T } }): T => res.data.data;

const unwrapPage = <T>(res: { data: { data: T[]; meta: PaginationMeta } }): Page<T> => ({
  results: res.data.data,
  meta: res.data.meta,
});

async function downloadFile(url: string, params?: Record<string, string | number | undefined>): Promise<void> {
  const res = await api.get<Blob>(url, { params, responseType: 'blob' });
  const disposition = res.headers['content-disposition'] ?? '';
  const match = disposition.match(/filename="?([^"]+)"?/);
  const filename = match ? match[1] : url.split('/').pop() ?? 'download.csv';
  const blobUrl = window.URL.createObjectURL(res.data);
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(blobUrl);
}

export const hrApi = {
  // Summary / options
  summary: () => api.get<{ data: HrSummary }>('/hr/summary').then(unwrap<HrSummary>),

  mySummary: () => api.get<{ data: MyHrSummary }>('/my/hr/summary').then(unwrap<MyHrSummary>),

  myProfile: () => api.get<{ data: EmployeeHr }>('/my/hr/profile').then(unwrap<EmployeeHr>),

  departments: () => api.get<{ data: Department[] }>('/hr/options/departments').then(unwrap<Department[]>),

  positions: () => api.get<{ data: Position[] }>('/hr/options/positions').then(unwrap<Position[]>),

  // Reports
  headcountReport: (params?: { status?: string; department_id?: number }) =>
    api.get<{ data: HeadcountReport }>('/hr/reports/headcount', { params }).then(unwrap<HeadcountReport>),

  leaveReport: (params?: { status?: string; leave_type?: string; from?: string; to?: string }) =>
    api.get<{ data: LeaveReport }>('/hr/reports/leave', { params }).then(unwrap<LeaveReport>),

  attendanceReport: (params?: { from?: string; to?: string }) =>
    api.get<{ data: AttendanceReport }>('/hr/reports/attendance', { params }).then(unwrap<AttendanceReport>),

  payrollReport: (params?: { month?: string; status?: string }) =>
    api.get<{ data: PayrollReport }>('/hr/reports/payroll', { params }).then(unwrap<PayrollReport>),

  // Exports
  exportEmployees: (params?: { status?: string; department_id?: number }) =>
    downloadFile('/hr/export/employees', params),

  exportLeave: (params?: { status?: string; from?: string; to?: string }) =>
    downloadFile('/hr/export/leave', params),

  exportAttendance: (params?: { from?: string; to?: string }) =>
    downloadFile('/hr/export/attendance', params),

  // Employees
  employees: (params?: { page?: number; per_page?: number; search?: string }) =>
    api.get<{ data: EmployeeHr[]; meta: PaginationMeta }>('/hr/employees', { params }).then(unwrapPage<EmployeeHr>),

  employee: (id: number) =>
    api.get<{ data: EmployeeHr }>(`/hr/employees/${id}`).then(unwrap<EmployeeHr>),

  updateEmployee: (id: number, data: EmployeeHrInput) =>
    api.put<{ data: EmployeeHr }>(`/hr/employees/${id}`, data).then(unwrap<EmployeeHr>),

  // Contracts
  contracts: (params?: { page?: number; per_page?: number; employee_id?: number; status?: string; type?: string }) =>
    api.get<{ data: EmployeeContract[]; meta: PaginationMeta }>('/hr/contracts', { params }).then(unwrapPage<EmployeeContract>),

  contract: (id: number) =>
    api.get<{ data: EmployeeContract }>(`/hr/contracts/${id}`).then(unwrap<EmployeeContract>),

  createContract: (data: EmployeeContractInput) =>
    api.post<{ data: EmployeeContract }>('/hr/contracts', data).then(unwrap<EmployeeContract>),

  updateContract: (id: number, data: Partial<EmployeeContractInput>) =>
    api.put<{ data: EmployeeContract }>(`/hr/contracts/${id}`, data).then(unwrap<EmployeeContract>),

  terminateContract: (id: number, status: 'terminated' | 'superseded') =>
    api.put<{ data: EmployeeContract }>(`/hr/contracts/${id}/terminate`, { status }).then(unwrap<EmployeeContract>),

  deleteContract: (id: number) =>
    api.delete<{ data: null }>(`/hr/contracts/${id}`).then(() => undefined),

  // Leave
  leaves: (params?: { page?: number; per_page?: number; status?: string; leave_type?: string; employee_id?: number; from?: string; to?: string; search?: string }) =>
    api.get<{ data: LeaveRequest[]; meta: PaginationMeta }>('/hr/leaves', { params }).then(unwrapPage<LeaveRequest>),

  leave: (id: number) =>
    api.get<{ data: LeaveRequest }>(`/hr/leaves/${id}`).then(unwrap<LeaveRequest>),

  createLeave: (data: LeaveRequestInput) =>
    api.post<{ data: LeaveRequest }>('/hr/leaves', data).then(unwrap<LeaveRequest>),

  reviewLeave: (id: number, data: { status: 'approved' | 'rejected'; note?: string | null }) =>
    api.put<{ data: LeaveRequest }>(`/hr/leaves/${id}/review`, data).then(unwrap<LeaveRequest>),

  cancelLeave: (id: number) =>
    api.put<{ data: LeaveRequest }>(`/hr/leaves/${id}/cancel`).then(unwrap<LeaveRequest>),

  // Attendance
  attendance: (params?: { page?: number; per_page?: number; employee_id?: number; status?: string; attendance_date?: string; from?: string; to?: string }) =>
    api.get<{ data: StaffAttendance[]; meta: PaginationMeta }>('/hr/attendance', { params }).then(unwrapPage<StaffAttendance>),

  createAttendance: (data: StaffAttendanceInput) =>
    api.post<{ data: StaffAttendance }>('/hr/attendance', data).then(unwrap<StaffAttendance>),

  bulkAttendance: (data: { attendance_date: string; records: Omit<StaffAttendanceInput, 'attendance_date'>[] }) =>
    api.post<{ data: StaffAttendance[] }>('/hr/attendance/bulk', data).then(unwrap<StaffAttendance[]>),

  updateAttendance: (id: number, data: Partial<StaffAttendanceInput>) =>
    api.put<{ data: StaffAttendance }>(`/hr/attendance/${id}`, data).then(unwrap<StaffAttendance>),

  deleteAttendance: (id: number) =>
    api.delete<{ data: null }>(`/hr/attendance/${id}`).then(() => undefined),

  // Payroll
  payrolls: (params?: { page?: number; per_page?: number; month?: string; status?: string }) =>
    api.get<{ data: Payroll[]; meta: PaginationMeta }>('/hr/payrolls', { params }).then(unwrapPage<Payroll>),

  payroll: (id: number) =>
    api.get<{ data: Payroll }>(`/hr/payrolls/${id}`).then(unwrap<Payroll>),

  runPayroll: (month: string) =>
    api.post<{ data: Payroll }>('/hr/payrolls/run', { month }).then(unwrap<Payroll>),

  processPayroll: (id: number) =>
    api.put<{ data: Payroll }>(`/hr/payrolls/${id}/process`).then(unwrap<Payroll>),

  markPayrollPaid: (id: number, payment_method?: string | null) =>
    api.put<{ data: Payroll }>(`/hr/payrolls/${id}/mark-paid`, { payment_method: payment_method ?? 'bank_transfer' }).then(unwrap<Payroll>),

  cancelPayroll: (id: number) =>
    api.put<{ data: Payroll }>(`/hr/payrolls/${id}/cancel`).then(unwrap<Payroll>),

  payslip: (id: number) =>
    api.get<{ data: Payslip }>(`/hr/payslips/${id}`).then(unwrap<Payslip>),

  // Performance reviews
  reviews: (params?: { page?: number; per_page?: number; employee_id?: number; status?: string; search?: string }) =>
    api.get<{ data: PerformanceReview[]; meta: PaginationMeta }>('/hr/reviews', { params }).then(unwrapPage<PerformanceReview>),

  review: (id: number) =>
    api.get<{ data: PerformanceReview }>(`/hr/reviews/${id}`).then(unwrap<PerformanceReview>),

  createReview: (data: PerformanceReviewInput) =>
    api.post<{ data: PerformanceReview }>('/hr/reviews', data).then(unwrap<PerformanceReview>),

  updateReview: (id: number, data: Partial<PerformanceReviewInput>) =>
    api.put<{ data: PerformanceReview }>(`/hr/reviews/${id}`, data).then(unwrap<PerformanceReview>),

  deleteReview: (id: number) =>
    api.delete<{ data: null }>(`/hr/reviews/${id}`).then(() => undefined),

  // Documents
  documents: (params?: { page?: number; per_page?: number; employee_id?: number; category?: string; search?: string }) =>
    api.get<{ data: EmployeeDocument[]; meta: PaginationMeta }>('/hr/documents', { params }).then(unwrapPage<EmployeeDocument>),

  createDocument: (data: FormData) =>
    api.post<{ data: EmployeeDocument }>('/hr/documents', data).then(unwrap<EmployeeDocument>),

  documentDownloadUrl: (id: number) => `/hr/documents/${id}/download`,

  deleteDocument: (id: number) =>
    api.delete<{ data: null }>(`/hr/documents/${id}`).then(() => undefined),

  // Self-service
  myLeaves: (params?: { page?: number; per_page?: number; status?: string }) =>
    api.get<{ data: LeaveRequest[]; meta: PaginationMeta }>('/my/hr/leaves', { params }).then(unwrapPage<LeaveRequest>),

  myLeaveBalance: () => api.get<{ data: LeaveBalance }>('/my/hr/leaves/balance').then(unwrap<LeaveBalance>),

  myCreateLeave: (data: LeaveRequestInput) =>
    api.post<{ data: LeaveRequest }>('/my/hr/leaves', data).then(unwrap<LeaveRequest>),

  myCancelLeave: (id: number) =>
    api.put<{ data: LeaveRequest }>(`/my/hr/leaves/${id}/cancel`).then(unwrap<LeaveRequest>),

  myAttendance: (params?: { page?: number; per_page?: number; from?: string; to?: string }) =>
    api.get<{ data: StaffAttendance[]; meta: PaginationMeta }>('/my/hr/attendance', { params }).then(unwrapPage<StaffAttendance>),

  myPayslips: (params?: { page?: number; per_page?: number; status?: string }) =>
    api.get<{ data: Payslip[]; meta: PaginationMeta }>('/my/hr/payslips', { params }).then(unwrapPage<Payslip>),

  myPayslip: (id: number) =>
    api.get<{ data: Payslip }>(`/my/hr/payslips/${id}`).then(unwrap<Payslip>),

  myDocuments: (params?: { page?: number; per_page?: number; category?: string }) =>
    api.get<{ data: EmployeeDocument[]; meta: PaginationMeta }>('/my/hr/documents', { params }).then(unwrapPage<EmployeeDocument>),

  myCreateDocument: (data: FormData) =>
    api.post<{ data: EmployeeDocument }>('/my/hr/documents', data).then(unwrap<EmployeeDocument>),
};

export { getErrorMessage } from '@/lib/studentsApi';
