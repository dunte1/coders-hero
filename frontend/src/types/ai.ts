export interface AiAssistant {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  category: string;
  icon: string;
  system_prompt: string | null;
  model: string | null;
  max_tokens: number | null;
  temperature: string | number | null;
  is_active: boolean;
  conversations_count?: number;
  created_at: string | null;
}

export interface AiPromptTemplate {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  category: string;
  template: string;
  variables: string[] | null;
  is_active: boolean;
  created_at: string | null;
}

export interface AiMessage {
  id: number;
  conversation_id: number;
  role: 'user' | 'assistant' | 'system';
  content: string;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  cost: string | number;
  model: string | null;
  latency_ms: number | null;
  meta: Record<string, unknown> | null;
  created_at: string | null;
}

export interface AiConversation {
  id: number;
  user_id: string;
  assistant_id: number;
  assistant?: AiAssistant | null;
  title: string;
  status: string;
  context: Record<string, unknown> | null;
  messages_count?: number;
  messages?: AiMessage[];
  created_at: string | null;
  updated_at: string | null;
}

export interface AiChatResult {
  user_message: AiMessage;
  assistant_message: AiMessage;
  title: string;
}

export interface AiGenerateResult {
  content: string;
  model: string;
  assistant: string;
  cost: number;
  total_tokens: number;
}

export interface AiUsageByAssistant {
  assistant_id: number;
  calls: number;
  tokens: number;
  cost: string | number;
  assistant?: AiAssistant | null;
}

export interface AiUsageSummary {
  total_calls: number;
  blocked: number;
  total_tokens: number;
  total_cost: number;
  by_assistant: AiUsageByAssistant[];
}

export interface AiUsageLogEntry {
  id: number;
  user_id: string;
  assistant_id: number;
  conversation_id: number | null;
  model: string | null;
  endpoint: string;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  cost: string | number;
  latency_ms: number | null;
  blocked: boolean;
  created_at: string | null;
  user?: { id: number; name: string } | null;
  assistant?: AiAssistant | null;
}

export interface AiAdminUsage {
  summary: AiUsageSummary;
  logs: AiUsageLogEntry[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface AiAssistantInput {
  name: string;
  description?: string | null;
  category: string;
  icon?: string | null;
  system_prompt?: string | null;
  model?: string | null;
  max_tokens?: number | null;
  temperature?: number | null;
  is_active?: boolean;
}

export interface AiTemplateInput {
  name: string;
  description?: string | null;
  category: string;
  template: string;
  variables?: string[] | null;
  is_active?: boolean;
}
