import api from '@/lib/axios';
import type { Page, PaginationMeta } from '@/types/cms';

export interface ActivityLogItem {
  id: number;
  log_name: string | null;
  description: string;
  subject_type: string | null;
  subject_id: string | null;
  event: string | null;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  properties: Record<string, unknown> | null;
  batch_uuid: string | null;
  created_at: string;
  causer?: { id: string; first_name?: string; last_name?: string; name?: string; email?: string } | null;
}

export interface SystemHealth {
  app: { name: string; env: string; debug: boolean; url: string; version: string; php_version: string; timezone: string };
  database: { connection: string; driver: string; healthy: boolean };
  cache: string;
  queue: string;
  session: string;
  storage: { writable: boolean; disk: string };
  system: { memory_used_mb: number; request_time: string; server_time: string };
}

export interface BackupItem {
  name: string;
  size: number;
  size_human: string;
  created_at: string;
}

const unwrap = <T>(res: { data: { data: T } }): T => res.data.data;

const unwrapPage = <T>(res: { data: { data: T[]; meta: PaginationMeta } }): Page<T> => ({
  results: res.data.data,
  meta: res.data.meta,
});

export const adminApi = {
  activityLogs: (params?: { page?: number; per_page?: number; log_name?: string; event?: string; search?: string; causer_id?: string }) =>
    api.get<{ data: ActivityLogItem[]; meta: PaginationMeta }>('/admin/activity-logs', { params }).then(unwrapPage<ActivityLogItem>),

  activityEvents: () => api.get<{ data: Record<string, number> }>('/admin/activity-logs/events').then(unwrap<Record<string, number>>),

  systemHealth: () => api.get<{ data: SystemHealth }>('/admin/system/health').then(unwrap<SystemHealth>),

  systemLogs: (params?: { lines?: number; level?: string }) =>
    api.get<{ data: { lines: Array<{ line: number; content: string }> } }>('/admin/system/logs', { params }).then(unwrap<{ lines: Array<{ line: number; content: string }> }>),

  backups: () => api.get<{ data: { backups: BackupItem[] } }>('/admin/system/backups').then(unwrap<{ backups: BackupItem[] }>),

  createBackup: () => api.post<{ data: BackupItem }>('/admin/system/backups').then(unwrap<BackupItem>),

  deleteBackup: (name: string) => api.delete('/admin/system/backups', { params: { name } }),

  downloadBackup: async (name: string) => {
    const res = await api.get('/admin/system/backups/download', { params: { name }, responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
};
