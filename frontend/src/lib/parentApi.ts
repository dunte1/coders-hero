import api from '@/lib/axios';
import type { Page, PaginationMeta } from '@/types/cms';
import type {
  Appointment,
  AppointmentAdminUpdate,
  AppointmentInput,
  Conversation,
  ConversationDetail,
  Fee,
  ParentAttendance,
  ParentProgress,
  ParentSummary,
  PayFeeInput,
  PortalNotification,
  PortalPayment,
  PortalStudent,
  ReportCard,
  StartConversationInput,
  TeacherContact,
} from '@/types/portal';

const unwrap = <T>(res: { data: { data: T } }): T => res.data.data;

const unwrapPage = <T>(res: { data: { data: T[]; meta: PaginationMeta } }): Page<T> => ({
  results: res.data.data,
  meta: res.data.meta,
});

export const parentApi = {
  summary: () => api.get<{ data: ParentSummary }>('/parent/summary').then(unwrap<ParentSummary>),

  children: (params?: { grade?: string; status?: string }) =>
    api.get<{ data: PortalStudent[] }>('/parent/children', { params }).then(unwrap<PortalStudent[]>),

  teachers: () => api.get<{ data: TeacherContact[] }>('/parent/teachers').then(unwrap<TeacherContact[]>),

  attendance: (month?: string) =>
    api
      .get<{ data: ParentAttendance }>('/parent/attendance', { params: month ? { month } : undefined })
      .then(unwrap<ParentAttendance>),

  reportCards: () => api.get<{ data: ReportCard[] }>('/parent/report-cards').then(unwrap<ReportCard[]>),

  reportCard: (id: number) =>
    api.get<{ data: ReportCard }>(`/parent/report-cards/${id}`).then(unwrap<ReportCard>),

  progress: () => api.get<{ data: ParentProgress }>('/parent/progress').then(unwrap<ParentProgress>),

  fees: () => api.get<{ data: Fee[] }>('/parent/fees').then(unwrap<Fee[]>),

  fee: (id: number) => api.get<{ data: Fee }>(`/parent/fees/${id}`).then(unwrap<Fee>),

  payFee: (id: number, data: PayFeeInput) =>
    api.post<{ data: PortalPayment }>(`/parent/fees/${id}/pay`, data).then(unwrap<PortalPayment>),

  receipt: (id: number) =>
    api.get<{ data: PortalPayment }>(`/parent/payments/${id}`).then(unwrap<PortalPayment>),

  appointments: () => api.get<{ data: Appointment[] }>('/parent/appointments').then(unwrap<Appointment[]>),

  createAppointment: (data: AppointmentInput) =>
    api.post<{ data: Appointment }>('/parent/appointments', data).then(unwrap<Appointment>),

  updateAppointment: (id: number, data: Partial<AppointmentInput>) =>
    api.put<{ data: Appointment }>(`/parent/appointments/${id}`, data).then(unwrap<Appointment>),

  cancelAppointment: (id: number) =>
    api.put<{ data: Appointment }>(`/parent/appointments/${id}`, { status: 'cancelled' }).then(unwrap<Appointment>),

  deleteAppointment: (id: number) => api.delete(`/parent/appointments/${id}`).then(() => undefined),

  notifications: (params?: { filter?: 'unread' }) =>
    api
      .get<{ data: PortalNotification[]; meta: PaginationMeta }>('/parent/notifications', { params })
      .then(unwrapPage<PortalNotification>),

  markNotificationRead: (id: string) =>
    api.post<{ data: PortalNotification }>(`/parent/notifications/${id}/read`).then(unwrap<PortalNotification>),

  markAllNotificationsRead: () =>
    api.post<{ data: null }>('/parent/notifications/read-all').then(() => undefined),

  assignments: () =>
    api.get<{ data: any[] }>('/parent/assignments').then(unwrap<any[]>),

  courses: () =>
    api.get<{ data: any[] }>('/parent/courses').then(unwrap<any[]>),

  projects: () =>
    api.get<{ data: any[] }>('/parent/projects').then(unwrap<any[]>),

  competitions: () =>
    api.get<{ data: any[] }>('/parent/competitions').then(unwrap<any[]>),

  certificates: () =>
    api.get<{ data: any[] }>('/parent/certificates').then(unwrap<any[]>),

  receiptPdf: async (id: number) => {
    const res = await api.get<Blob>(`/parent/payments/${id}/pdf`, { responseType: 'blob' });
    const disposition = res.headers['content-disposition'] ?? '';
    const match = disposition.match(/filename="?([^"]+)"?/);
    const filename = match ? match[1] : `receipt-${id}.pdf`;
    const blobUrl = window.URL.createObjectURL(res.data);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(blobUrl);
  },
};

export const chatApi = {
  conversations: () => api.get<{ data: Conversation[] }>('/chat').then(unwrap<Conversation[]>),

  conversation: (id: number) =>
    api.get<{ data: ConversationDetail }>(`/chat/${id}`).then(unwrap<ConversationDetail>),

  start: (data: StartConversationInput) =>
    api.post<{ data: ConversationDetail['messages'][number] }>('/chat', data).then(unwrap<ConversationDetail['messages'][number]>),

  send: (id: number, body: string) =>
    api.post<{ data: ConversationDetail['messages'][number] }>(`/chat/${id}/messages`, { body }).then(unwrap<ConversationDetail['messages'][number]>),

  markRead: (id: number) =>
    api.post<{ data: null }>(`/chat/${id}/read`).then(() => undefined),
};

export const appointmentsAdminApi = {
  list: (params?: { page?: number; per_page?: number; status?: string }) =>
    api
      .get<{ data: Appointment[]; meta: PaginationMeta }>('/appointments', { params })
      .then(unwrapPage<Appointment>),

  update: (id: number, data: AppointmentAdminUpdate) =>
    api.put<{ data: Appointment }>(`/appointments/${id}`, data).then(unwrap<Appointment>),

  remove: (id: number) => api.delete(`/appointments/${id}`).then(() => undefined),
};

export { getErrorMessage } from '@/lib/studentsApi';
