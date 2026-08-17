import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { aiApi, getErrorMessage } from '@/lib/aiApi';
import type { AiAssistantInput, AiTemplateInput } from '@/types/ai';

export function useAiAssistants() {
  return useQuery({ queryKey: ['ai', 'assistants'], queryFn: () => aiApi.assistants() });
}

export function useAiAssistant(slug?: string) {
  return useQuery({ queryKey: ['ai', 'assistant', slug], queryFn: () => aiApi.assistant(slug!), enabled: !!slug });
}

export function useAiConversations(params?: { page?: number; per_page?: number; assistant_id?: number }) {
  return useQuery({ queryKey: ['ai', 'conversations', params], queryFn: () => aiApi.conversations(params) });
}

export function useAiConversation(id?: number) {
  return useQuery({ queryKey: ['ai', 'conversation', id], queryFn: () => aiApi.conversation(id!), enabled: !!id });
}

export function useCreateAiConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: aiApi.createConversation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai', 'conversations'] });
      toast.success('Conversation created');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useRenameAiConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, title }: { id: number; title: string }) => aiApi.renameConversation(id, title),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai', 'conversations'] });
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useDeleteAiConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => aiApi.deleteConversation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai', 'conversations'] });
      toast.success('Conversation deleted');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useSendAiMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, content }: { id: number; content: string }) => aiApi.sendMessage(id, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai', 'conversation'] });
      queryClient.invalidateQueries({ queryKey: ['ai', 'conversations'] });
      queryClient.invalidateQueries({ queryKey: ['ai', 'usage'] });
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useAiPromptTemplates(category?: string) {
  return useQuery({ queryKey: ['ai', 'templates', category], queryFn: () => aiApi.promptTemplates(category) });
}

export function useAiGenerate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ slug, variables }: { slug: string; variables: Record<string, unknown> }) =>
      aiApi.generate(slug, variables),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai', 'usage'] });
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useAiMyUsage(days = 30) {
  return useQuery({ queryKey: ['ai', 'usage', days], queryFn: () => aiApi.myUsage(days) });
}

// Admin
export function useAdminAiAssistants(params?: { search?: string; page?: number; per_page?: number }) {
  return useQuery({ queryKey: ['ai', 'admin', 'assistants', params], queryFn: () => aiApi.adminAssistants(params) });
}

export function useCreateAiAssistant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: AiAssistantInput) => aiApi.createAssistant(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai', 'admin', 'assistants'] });
      toast.success('Assistant created');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useUpdateAiAssistant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<AiAssistantInput> }) => aiApi.updateAssistant(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai', 'admin', 'assistants'] });
      toast.success('Assistant updated');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useDeleteAiAssistant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => aiApi.deleteAssistant(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai', 'admin', 'assistants'] });
      toast.success('Assistant deleted');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useAdminAiTemplates(params?: { category?: string; search?: string; page?: number; per_page?: number }) {
  return useQuery({ queryKey: ['ai', 'admin', 'templates', params], queryFn: () => aiApi.adminTemplates(params) });
}

export function useCreateAiTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: AiTemplateInput) => aiApi.createTemplate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai', 'admin', 'templates'] });
      toast.success('Prompt template created');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useUpdateAiTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<AiTemplateInput> }) => aiApi.updateTemplate(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai', 'admin', 'templates'] });
      toast.success('Prompt template updated');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useDeleteAiTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => aiApi.deleteTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai', 'admin', 'templates'] });
      toast.success('Prompt template deleted');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useAdminAiUsage(params?: { assistant_id?: number; from?: string; to?: string; page?: number; per_page?: number }) {
  return useQuery({ queryKey: ['ai', 'admin', 'usage', params], queryFn: () => aiApi.adminUsage(params) });
}
