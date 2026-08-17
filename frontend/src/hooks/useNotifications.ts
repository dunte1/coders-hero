import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  notificationsApi,
  notificationAdminApi,
  getErrorMessage,
} from '@/lib/api';
import type {
  NotificationPreference,
  NotificationTemplateInput,
  NotificationBroadcastInput,
  NotificationChannel,
} from '@/types';

export interface NotificationsQueryParams {
  page?: number;
  per_page?: number;
  category?: string;
  is_read?: boolean;
}

export function useNotifications(params?: NotificationsQueryParams) {
  return useQuery({
    queryKey: ['notifications', params],
    queryFn: () =>
      notificationsApi.getNotifications(
        params as Record<string, string | number | boolean>
      ),
  });
}

export function useNotificationStats() {
  return useQuery({
    queryKey: ['notifications', 'stats'],
    queryFn: () => notificationsApi.getNotificationStats(),
    refetchInterval: 30000,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationsApi.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'stats'] });
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => notificationsApi.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'stats'] });
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useDeleteNotification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationsApi.deleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'stats'] });
      toast.success('Notification deleted');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useNotificationPreferences() {
  return useQuery({
    queryKey: ['notification-preferences'],
    queryFn: () => notificationsApi.getPreferences(),
  });
}

export function useUpdateNotificationPreferences() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (preferences: NotificationPreference[]) =>
      notificationsApi.updatePreferences(preferences),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-preferences'] });
      toast.success('Notification preferences updated');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useFcmTokens() {
  return useQuery({
    queryKey: ['fcm-tokens'],
    queryFn: () => notificationsApi.getFcmTokens(),
  });
}

export function useRegisterFcmToken() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { token: string; device_name?: string; platform?: string }) =>
      notificationsApi.registerFcmToken(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fcm-tokens'] });
      toast.success('Push device registered');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useRevokeFcmToken() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => notificationsApi.revokeFcmToken(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fcm-tokens'] });
      toast.success('Push device removed');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useNotificationTemplates() {
  return useQuery({
    queryKey: ['notification-templates'],
    queryFn: () => notificationsApi.getTemplates({ per_page: 100 }),
  });
}

// Admin
export function useAdminNotificationSummary() {
  return useQuery({
    queryKey: ['notifications', 'admin', 'summary'],
    queryFn: () => notificationAdminApi.getSummary(),
  });
}

export function useAdminNotificationDeliveries(params?: {
  page?: number;
  per_page?: number;
  channel?: string;
  status?: string;
}) {
  return useQuery({
    queryKey: ['notifications', 'admin', 'deliveries', params],
    queryFn: () =>
      notificationAdminApi.getDeliveries(
        params as Record<string, string | number | boolean>
      ),
  });
}

export function useAdminNotificationTemplates() {
  return useQuery({
    queryKey: ['notifications', 'admin', 'templates'],
    queryFn: () => notificationAdminApi.getTemplates({ per_page: 100 }),
  });
}

export function useCreateNotificationTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: NotificationTemplateInput) =>
      notificationAdminApi.createTemplate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', 'admin', 'templates'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'admin', 'summary'] });
      toast.success('Notification template created');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useUpdateNotificationTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<NotificationTemplateInput> }) =>
      notificationAdminApi.updateTemplate(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', 'admin', 'templates'] });
      toast.success('Notification template updated');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useDeleteNotificationTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => notificationAdminApi.deleteTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', 'admin', 'templates'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'admin', 'summary'] });
      toast.success('Notification template deleted');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useSendNotificationBroadcast() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: NotificationBroadcastInput) =>
      notificationAdminApi.sendBroadcast(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', 'admin', 'deliveries'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'admin', 'summary'] });
      toast.success('Notification broadcast sent');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useRetryNotificationDelivery() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => notificationAdminApi.retryDelivery(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', 'admin', 'deliveries'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'admin', 'summary'] });
      toast.success('Delivery retried');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export const notificationChannelOptions: NotificationChannel[] = ['in_app', 'email', 'sms', 'push'];
