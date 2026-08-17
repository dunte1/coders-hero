import api from '@/lib/axios';
import type { Page, PaginationMeta } from '@/types/cms';
import type {
  Admission,
  AdmissionInput,
  AdmissionUpdate,
  Attendance,
  AttendanceEntryInput,
  AttendanceReport,
  Guardian,
  GuardianInput,
  GuardianUpdate,
  MedicalRecord,
  MedicalRecordInput,
  MonthlyAttendance,
  SisListParams,
  Student,
  StudentDetail,
  StudentDocument,
  StudentInput,
  StudentOverview,
  StudentTimelineEntry,
  StudentTimelineInput,
  StudentUpdate,
} from '@/types/students';
import type {
  AdminPaymentInput,
  CodingProgress,
  CodingProgressInput,
  Fee,
  FeeInput,
  PortalPayment,
  ReportCard,
  ReportCardInput,
} from '@/types/portal';

const unwrap = <T>(res: { data: { data: T } }): T => res.data.data;

const unwrapPage = <T>(res: { data: { data: T[]; meta: PaginationMeta } }): Page<T> => ({
  results: res.data.data,
  meta: res.data.meta,
});

export function getErrorMessage(err: unknown): string {
  const error = err as { response?: { data?: { message?: string } } };
  return error.response?.data?.message || 'Something went wrong';
}

export const studentsApi = {
  list: (params?: SisListParams) =>
    api.get<{ data: Student[]; meta: PaginationMeta }>('/students', { params }).then(unwrapPage<Student>),

  overview: () => api.get<{ data: StudentOverview }>('/students/overview').then(unwrap<StudentOverview>),

  get: (id: number) => api.get<{ data: StudentDetail }>(`/students/${id}`).then(unwrap<StudentDetail>),

  idCardPdf: async (id: number) => {
    const res = await api.get<Blob>(`/students/${id}/id-card/pdf`, { responseType: 'blob' });
    return res.data;
  },

  create: (data: StudentInput) =>
    api.post<{ data: Student }>('/students', data).then(unwrap<Student>),

  update: (id: number, data: StudentUpdate) =>
    api.put<{ data: Student }>(`/students/${id}`, data).then(unwrap<Student>),

  remove: (id: number) => api.delete(`/students/${id}`).then(() => undefined),

  uploadPhoto: (id: number, file: File) => {
    const formData = new FormData();
    formData.append('photo', file);
    return api
      .post<{ data: Student }>(`/students/${id}/photo`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then(unwrap<Student>);
  },

  uploadIdCardPhoto: (id: number, file: File) => {
    const formData = new FormData();
    formData.append('photo', file);
    return api
      .post<{ data: Student }>(`/students/${id}/id-card/photo`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then(unwrap<Student>);
  },

  promote: (id: number, newGrade?: string) =>
    api.put<{ data: Student }>(`/students/${id}/promote`, { new_grade: newGrade }).then(unwrap<Student>),

  transfer: (id: number, branch: string, note?: string) =>
    api.put<{ data: Student }>(`/students/${id}/transfer`, { branch, note }).then(unwrap<Student>),

  graduate: (id: number, graduationDate?: string) =>
    api.put<{ data: Student }>(`/students/${id}/graduate`, { graduation_date: graduationDate }).then(unwrap<Student>),

  grades: () => api.get<{ data: string[] }>('/students/filters/grades').then(unwrap<string[]>),

  branches: () => api.get<{ data: string[] }>('/students/filters/branches').then(unwrap<string[]>),

  medical: {
    get: (studentId: number) =>
      api.get<{ data: MedicalRecord }>(`/students/${studentId}/medical`).then(unwrap<MedicalRecord>),
    upsert: (studentId: number, data: MedicalRecordInput) =>
      api.post<{ data: MedicalRecord }>(`/students/${studentId}/medical`, data).then(unwrap<MedicalRecord>),
    remove: (studentId: number) => api.delete(`/students/${studentId}/medical`).then(() => undefined),
  },

  documents: {
    list: (studentId: number, params?: SisListParams) =>
      api
        .get<{ data: StudentDocument[]; meta: PaginationMeta }>(`/students/${studentId}/documents`, { params })
        .then(unwrapPage<StudentDocument>),
    upload: (studentId: number, name: string, documentType: string, file: File) => {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('document_type', documentType);
      formData.append('file', file);
      return api
        .post<{ data: StudentDocument }>(`/students/${studentId}/documents`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        .then(unwrap<StudentDocument>);
    },
    remove: (documentId: number) => api.delete(`/students/documents/${documentId}`).then(() => undefined),
  },

  timeline: {
    list: (studentId: number, params?: SisListParams) =>
      api
        .get<{ data: StudentTimelineEntry[]; meta: PaginationMeta }>(`/students/${studentId}/timeline`, { params })
        .then(unwrapPage<StudentTimelineEntry>),
    add: (studentId: number, data: StudentTimelineInput) =>
      api
        .post<{ data: StudentTimelineEntry }>(`/students/${studentId}/timeline`, data)
        .then(unwrap<StudentTimelineEntry>),
    remove: (entryId: number) => api.delete(`/students/timeline/${entryId}`).then(() => undefined),
  },

  attendance: {
    list: (studentId: number, params?: SisListParams) =>
      api
        .get<{ data: Attendance[]; meta: PaginationMeta }>(`/students/${studentId}/attendance`, { params })
        .then(unwrapPage<Attendance>),
    monthly: (studentId: number, month?: string) =>
      api
        .get<{ data: MonthlyAttendance[] }>(`/students/${studentId}/attendance/monthly`, { params: { month } })
        .then(unwrap<MonthlyAttendance[]>),
  },

  reportCards: {
    list: (studentId: number) =>
      api.get<{ data: ReportCard[] }>(`/students/${studentId}/report-cards`).then(unwrap<ReportCard[]>),
    create: (studentId: number, data: ReportCardInput) =>
      api.post<{ data: ReportCard }>(`/students/${studentId}/report-cards`, data).then(unwrap<ReportCard>),
    update: (reportCardId: number, data: Partial<ReportCardInput>) =>
      api.put<{ data: ReportCard }>(`/students/report-cards/${reportCardId}`, data).then(unwrap<ReportCard>),
    remove: (reportCardId: number) =>
      api.delete(`/students/report-cards/${reportCardId}`).then(() => undefined),
  },

  progress: {
    list: (studentId: number) =>
      api.get<{ data: CodingProgress[] }>(`/students/${studentId}/coding-progress`).then(unwrap<CodingProgress[]>),
    create: (studentId: number, data: CodingProgressInput) =>
      api.post<{ data: CodingProgress }>(`/students/${studentId}/coding-progress`, data).then(unwrap<CodingProgress>),
    update: (progressId: number, data: Partial<CodingProgressInput>) =>
      api.put<{ data: CodingProgress }>(`/students/coding-progress/${progressId}`, data).then(unwrap<CodingProgress>),
    remove: (progressId: number) =>
      api.delete(`/students/coding-progress/${progressId}`).then(() => undefined),
  },

  fees: {
    list: (studentId: number) =>
      api.get<{ data: Fee[] }>(`/students/${studentId}/fees`).then(unwrap<Fee[]>),
    create: (studentId: number, data: FeeInput) =>
      api.post<{ data: Fee }>(`/students/${studentId}/fees`, data).then(unwrap<Fee>),
    update: (feeId: number, data: Partial<FeeInput>) =>
      api.put<{ data: Fee }>(`/students/fees/${feeId}`, data).then(unwrap<Fee>),
    remove: (feeId: number) => api.delete(`/students/fees/${feeId}`).then(() => undefined),
    payments: (feeId: number) =>
      api.get<{ data: PortalPayment[] }>(`/students/fees/${feeId}/payments`).then(unwrap<PortalPayment[]>),
    addPayment: (feeId: number, data: AdminPaymentInput) =>
      api.post<{ data: PortalPayment }>(`/students/fees/${feeId}/payments`, data).then(unwrap<PortalPayment>),
    removePayment: (paymentId: number) =>
      api.delete(`/students/payments/${paymentId}`).then(() => undefined),
  },
};

export const guardiansApi = {
  list: (params?: SisListParams) =>
    api.get<{ data: Guardian[]; meta: PaginationMeta }>('/guardians', { params }).then(unwrapPage<Guardian>),

  all: () => api.get<{ data: Guardian[] }>('/guardians/all').then(unwrap<Guardian[]>),

  get: (id: number) => api.get<{ data: Guardian }>(`/guardians/${id}`).then(unwrap<Guardian>),

  create: (data: GuardianInput) =>
    api.post<{ data: Guardian }>('/guardians', data).then(unwrap<Guardian>),

  update: (id: number, data: GuardianUpdate) =>
    api.put<{ data: Guardian }>(`/guardians/${id}`, data).then(unwrap<Guardian>),

  remove: (id: number) => api.delete(`/guardians/${id}`).then(() => undefined),
};

export const admissionsApi = {
  list: (params?: SisListParams) =>
    api.get<{ data: Admission[]; meta: PaginationMeta }>('/admissions', { params }).then(unwrapPage<Admission>),

  get: (id: number) => api.get<{ data: Admission }>(`/admissions/${id}`).then(unwrap<Admission>),

  create: (data: AdmissionInput) =>
    api.post<{ data: Admission }>('/admissions', data).then(unwrap<Admission>),

  update: (id: number, data: AdmissionUpdate) =>
    api.put<{ data: Admission }>(`/admissions/${id}`, data).then(unwrap<Admission>),

  remove: (id: number) => api.delete(`/admissions/${id}`).then(() => undefined),

  admit: (id: number) => api.put<{ data: Admission }>(`/admissions/${id}/admit`).then(unwrap<Admission>),

  reject: (id: number) => api.put<{ data: Admission }>(`/admissions/${id}/reject`).then(unwrap<Admission>),
};

export const attendanceApi = {
  list: (params?: SisListParams) =>
    api.get<{ data: Attendance[]; meta: PaginationMeta }>('/attendance', { params }).then(unwrapPage<Attendance>),

  bulk: (attendanceDate: string, entries: AttendanceEntryInput[]) =>
    api
      .post<{ data: Attendance[] }>('/attendance/bulk', { attendance_date: attendanceDate, entries })
      .then(unwrap<Attendance[]>),

  update: (id: number, data: Partial<AttendanceEntryInput & { attendance_date?: string }>) =>
    api.put<{ data: Attendance }>(`/attendance/${id}`, data).then(unwrap<Attendance>),

  remove: (id: number) => api.delete(`/attendance/${id}`).then(() => undefined),

  report: (params?: SisListParams) =>
    api.get<{ data: AttendanceReport }>('/attendance/report', { params }).then(unwrap<AttendanceReport>),
};

export const sisExports = {
  students: async (params?: SisListParams) => {
    const res = await api.get<Blob>('/students/exports/students', { params, responseType: 'blob' });
    return res.data;
  },
  studentsPdf: async (params?: SisListParams) => {
    const res = await api.get<Blob>('/students/exports/students/pdf', { params, responseType: 'blob' });
    return res.data;
  },
  attendance: async (params?: SisListParams) => {
    const res = await api.get<Blob>('/students/exports/attendance', { params, responseType: 'blob' });
    return res.data;
  },
  attendancePdf: async (params?: SisListParams) => {
    const res = await api.get<Blob>('/students/exports/attendance/pdf', { params, responseType: 'blob' });
    return res.data;
  },
};

export function downloadBlob(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}
