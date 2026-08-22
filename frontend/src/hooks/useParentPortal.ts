import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { appointmentsAdminApi, chatApi, getErrorMessage, parentApi } from '@/lib/parentApi';
import type {
  AppointmentAdminUpdate,
  AppointmentInput,
  PayFeeInput,
  StartConversationInput,
} from '@/types/portal';

export function useParentSummary() {
  return useQuery({
    queryKey: ['parent', 'summary'],
    queryFn: () => parentApi.summary(),
  });
}

export function useParentChildren(params?: { grade?: string; status?: string }) {
  return useQuery({
    queryKey: ['parent', 'children', params],
    queryFn: () => parentApi.children(params),
  });
}

export function useParentTeachers() {
  return useQuery({
    queryKey: ['parent', 'teachers'],
    queryFn: () => parentApi.teachers(),
  });
}

export function useParentAttendance(month?: string) {
  return useQuery({
    queryKey: ['parent', 'attendance', month],
    queryFn: () => parentApi.attendance(month),
  });
}

export function useParentReportCards() {
  return useQuery({
    queryKey: ['parent', 'report-cards'],
    queryFn: () => parentApi.reportCards(),
  });
}

export function useParentReportCard(id: number) {
  return useQuery({
    queryKey: ['parent', 'report-card', id],
    queryFn: () => parentApi.reportCard(id),
    enabled: !!id,
  });
}

export function useParentProgress() {
  return useQuery({
    queryKey: ['parent', 'progress'],
    queryFn: () => parentApi.progress(),
  });
}

export function useParentFees() {
  return useQuery({
    queryKey: ['parent', 'fees'],
    queryFn: () => parentApi.fees(),
  });
}

export function useParentReceipt(id: number) {
  return useQuery({
    queryKey: ['parent', 'receipt', id],
    queryFn: () => parentApi.receipt(id),
    enabled: !!id,
  });
}

export function usePayFee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: PayFeeInput }) => parentApi.payFee(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parent', 'fees'] });
      queryClient.invalidateQueries({ queryKey: ['parent', 'summary'] });
      toast.success('Payment successful. Receipt generated.');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useParentAppointments() {
  return useQuery({
    queryKey: ['parent', 'appointments'],
    queryFn: () => parentApi.appointments(),
  });
}

export function useCreateAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: AppointmentInput) => parentApi.createAppointment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parent', 'appointments'] });
      toast.success('Appointment booked successfully');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useCancelAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => parentApi.cancelAppointment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parent', 'appointments'] });
      toast.success('Appointment cancelled');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useDeleteAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => parentApi.deleteAppointment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parent', 'appointments'] });
      toast.success('Appointment deleted');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function usePortalNotifications(filter?: 'unread') {
  return useQuery({
    queryKey: ['parent', 'notifications', filter],
    queryFn: () => parentApi.notifications(filter ? { filter } : undefined),
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => parentApi.markNotificationRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parent', 'notifications'] });
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => parentApi.markAllNotificationsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parent', 'notifications'] });
      toast.success('All notifications marked as read');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useConversations() {
  return useQuery({
    queryKey: ['chat', 'conversations'],
    queryFn: () => chatApi.conversations(),
    refetchInterval: 15000,
  });
}

export function useConversation(id: number) {
  return useQuery({
    queryKey: ['chat', 'conversation', id],
    queryFn: () => chatApi.conversation(id),
    enabled: !!id,
    refetchInterval: 5000,
  });
}

export function useStartConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: StartConversationInput) => chatApi.start(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat', 'conversations'] });
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: string }) => chatApi.send(id, body),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['chat', 'conversation', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['chat', 'conversations'] });
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useMarkChatRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => chatApi.markRead(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['chat', 'conversations'] });
      queryClient.invalidateQueries({ queryKey: ['chat', 'conversation', id] });
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useAdminAppointments(params?: { page?: number; per_page?: number; status?: string }) {
  return useQuery({
    queryKey: ['admin', 'appointments', params],
    queryFn: () => appointmentsAdminApi.list(params),
  });
}

export function useUpdateAdminAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: AppointmentAdminUpdate }) =>
      appointmentsAdminApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'appointments'] });
      toast.success('Appointment updated successfully');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useDeleteAdminAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => appointmentsAdminApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'appointments'] });
      toast.success('Appointment deleted');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

// Parent Portal – child data hooks
export function useParentAssignments() {
  return useQuery({
    queryKey: ['parent', 'assignments'],
    queryFn: () => parentApi.assignments(),
  });
}

export function useParentCourses() {
  return useQuery({
    queryKey: ['parent', 'courses'],
    queryFn: () => parentApi.courses(),
  });
}

export function useParentProjects() {
  return useQuery({
    queryKey: ['parent', 'projects'],
    queryFn: () => parentApi.projects(),
  });
}

export function useParentCompetitions() {
  return useQuery({
    queryKey: ['parent', 'competitions'],
    queryFn: () => parentApi.competitions(),
  });
}

export function useParentCertificates() {
  return useQuery({
    queryKey: ['parent', 'certificates'],
    queryFn: () => parentApi.certificates(),
  });
}
