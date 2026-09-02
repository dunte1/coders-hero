import api from '@/lib/axios';
import type { Page, PaginationMeta } from '@/types/cms';
import { getErrorMessage } from '@/lib/studentsApi';

export { getErrorMessage };

export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TicketCategory = 'technical' | 'billing' | 'general' | 'bug_report';

export interface SupportTicket {
  id: number;
  subject: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  user_id: number | null;
  user_name: string | null;
  guest_name: string | null;
  guest_email: string | null;
  assigned_to: number | null;
  assigned_to_name: string | null;
  replies_count: number;
  created_at: string;
  updated_at: string;
}

export interface TicketReply {
  id: number;
  ticket_id: number;
  user_id: number | null;
  user_name: string;
  is_staff: boolean;
  message: string;
  created_at: string;
}

export interface SupportTicketDetail extends SupportTicket {
  replies: TicketReply[];
}

export interface TicketQueryParams {
  page?: number;
  per_page?: number;
  status?: TicketStatus;
  priority?: TicketPriority;
  category?: TicketCategory;
  search?: string;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
}

export interface CreateTicketData {
  subject: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  guest_name?: string;
  guest_email?: string;
}

export interface ReplyData {
  message: string;
}

export interface UpdateTicketData {
  status?: TicketStatus;
  priority?: TicketPriority;
  assigned_to?: number | null;
}

const unwrap = <T>(res: { data: { data: T } }): T => res.data.data;

const unwrapPage = <T>(res: { data: { data: T[]; meta: PaginationMeta } }): Page<T> => ({
  results: res.data.data,
  meta: res.data.meta,
});

export const supportApi = {
  getTickets: (params?: TicketQueryParams) =>
    api.get<{ data: SupportTicket[]; meta: PaginationMeta }>('/support/tickets', { params }).then(unwrapPage),

  getTicket: (id: number) =>
    api.get<{ data: SupportTicketDetail }>(`/support/tickets/${id}`).then(unwrap),

  createTicket: (data: CreateTicketData) =>
    api.post<{ data: SupportTicket }>('/support/tickets', data).then(unwrap),

  replyToTicket: (id: number, data: ReplyData) =>
    api.post<{ data: TicketReply }>(`/support/tickets/${id}/reply`, data).then(unwrap),

  updateTicketStatus: (id: number, data: UpdateTicketData) =>
    api.put<{ data: SupportTicket }>(`/support/tickets/${id}`, data).then(unwrap),
};
