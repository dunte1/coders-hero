import api from '@/lib/axios';
import type { Page, PaginationMeta } from '@/types/cms';
import type {
  AiAdminUsage,
  AiAssistant,
  AiAssistantInput,
  AiChatResult,
  AiConversation,
  AiGenerateResult,
  AiPromptTemplate,
  AiTemplateInput,
  AiUsageSummary,
} from '@/types/ai';

const unwrap = <T>(res: { data: { data: T } }): T => res.data.data;

const unwrapPage = <T>(res: { data: { data: T[]; meta: PaginationMeta } }): Page<T> => ({
  results: res.data.data,
  meta: res.data.meta,
});

export const aiApi = {
  // Assistants (all authenticated users)
  assistants: () => api.get<{ data: AiAssistant[] }>('/lms/ai/assistants').then(unwrap),
  assistant: (slug: string) => api.get<{ data: AiAssistant }>(`/lms/ai/assistants/${slug}`).then(unwrap),

  // Conversations
  conversations: (params?: { page?: number; per_page?: number; assistant_id?: number }) =>
    api.get<{ data: AiConversation[]; meta: PaginationMeta }>('/lms/ai/conversations', { params }).then(unwrapPage),

  conversation: (id: number) =>
    api.get<{ data: AiConversation }>(`/lms/ai/conversations/${id}`).then(unwrap),

  createConversation: (data: { assistant_slug: string; title?: string; context?: Record<string, unknown> }) =>
    api.post<{ data: AiConversation }>('/lms/ai/conversations', data).then(unwrap),

  renameConversation: (id: number, title: string) =>
    api.put<{ data: AiConversation }>(`/lms/ai/conversations/${id}`, { title }).then(unwrap),

  deleteConversation: (id: number) =>
    api.delete(`/lms/ai/conversations/${id}`).then((res) => res.data),

  sendMessage: (id: number, content: string) =>
    api.post<{ data: AiChatResult }>(`/lms/ai/conversations/${id}/messages`, { content }).then(unwrap),

  // Prompt templates + generation
  promptTemplates: (category?: string) =>
    api.get<{ data: AiPromptTemplate[] }>('/lms/ai/prompt-templates', { params: { category } }).then(unwrap),

  generate: (slug: string, variables: Record<string, unknown>) =>
    api.post<{ data: AiGenerateResult }>('/lms/ai/generate', { slug, variables }).then(unwrap),

  // Usage
  myUsage: (days = 30) =>
    api.get<{ data: AiUsageSummary }>('/lms/ai/my-usage', { params: { days } }).then(unwrap),

  // Admin management
  adminAssistants: (params?: { search?: string; page?: number; per_page?: number }) =>
    api.get<{ data: AiAssistant[]; meta: PaginationMeta }>('/admin/ai/assistants', { params }).then(unwrapPage),

  createAssistant: (data: AiAssistantInput) =>
    api.post<{ data: AiAssistant }>('/admin/ai/assistants', data).then(unwrap),

  updateAssistant: (id: number, data: Partial<AiAssistantInput>) =>
    api.put<{ data: AiAssistant }>(`/admin/ai/assistants/${id}`, data).then(unwrap),

  deleteAssistant: (id: number) =>
    api.delete(`/admin/ai/assistants/${id}`).then((res) => res.data),

  adminTemplates: (params?: { category?: string; search?: string; page?: number; per_page?: number }) =>
    api.get<{ data: AiPromptTemplate[]; meta: PaginationMeta }>('/admin/ai/prompt-templates', { params }).then(unwrapPage),

  createTemplate: (data: AiTemplateInput) =>
    api.post<{ data: AiPromptTemplate }>('/admin/ai/prompt-templates', data).then(unwrap),

  updateTemplate: (id: number, data: Partial<AiTemplateInput>) =>
    api.put<{ data: AiPromptTemplate }>(`/admin/ai/prompt-templates/${id}`, data).then(unwrap),

  deleteTemplate: (id: number) =>
    api.delete(`/admin/ai/prompt-templates/${id}`).then((res) => res.data),

  adminUsage: (params?: { assistant_id?: number; from?: string; to?: string; page?: number; per_page?: number }) =>
    api.get<{ data: AiAdminUsage }>('/admin/ai/usage', { params }).then(unwrap),
};

export { getErrorMessage } from '@/lib/studentsApi';
