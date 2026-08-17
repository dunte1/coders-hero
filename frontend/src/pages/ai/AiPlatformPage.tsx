import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Bot,
  GraduationCap,
  BookOpen,
  Users,
  Briefcase,
  Code2,
  Sparkles,
  Send,
  Plus,
  Trash2,
  Wand2,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { DialogRoot, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/Dialog';
import { formatRelativeDate } from '@/lib/utils';
import {
  useAiAssistants,
  useAiConversations,
  useAiConversation,
  useCreateAiConversation,
  useSendAiMessage,
  useDeleteAiConversation,
  useAiPromptTemplates,
  useAiGenerate,
  useAiMyUsage,
} from '@/hooks/useAi';
import type { AiAssistant, AiMessage, AiPromptTemplate } from '@/types/ai';

const ASSISTANT_ICONS: Record<string, typeof Bot> = {
  'student-tutor': GraduationCap,
  'teacher-assistant': BookOpen,
  'parent-assistant': Users,
  'admin-assistant': Briefcase,
  'coding-mentor': Code2,
  'robotics-coach': Bot,
};

function assistantIcon(assistant?: AiAssistant | null) {
  if (!assistant) return Bot;
  return ASSISTANT_ICONS[assistant.slug] ?? Bot;
}

function MessageBubble({ message }: { message: AiMessage }) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-100">
          <Bot className="h-4 w-4 text-brand-600" />
        </div>
      )}
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
          isUser ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-800'
        }`}
      >
        {message.content}
        {!isUser && message.total_tokens > 0 && (
          <p className="mt-2 text-[10px] text-slate-400">
            {message.model} · {message.total_tokens} tokens
          </p>
        )}
      </div>
    </div>
  );
}

interface ToolForm {
  [key: string]: string;
}

export default function AiPlatformPage() {
  const { conversationId } = useParams<{ conversationId?: string }>();
  const navigate = useNavigate();
  const [draft, setDraft] = useState('');
  const [selectedAssistant, setSelectedAssistant] = useState<string>('student-tutor');
  const [createOpen, setCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [toolSlug, setToolSlug] = useState('generate-quiz');
  const [toolForm, setToolForm] = useState<ToolForm>({});
  const [toolResult, setToolResult] = useState('');
  const [toolLoading, setToolLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data: assistants = [] } = useAiAssistants();
  const { data: conversationsData } = useAiConversations({ per_page: 50 });
  const { data: conversation, isLoading: convLoading } = useAiConversation(Number(conversationId ?? 0));
  const createConversation = useCreateAiConversation();
  const sendMessage = useSendAiMessage();
  const deleteConversation = useDeleteAiConversation();
  const { data: templates = [] } = useAiPromptTemplates();
  const generate = useAiGenerate();
  const { data: usage } = useAiMyUsage(30);

  const conversations = conversationsData?.results ?? [];
  const messages = conversation?.messages ?? [];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  useEffect(() => {
    if (conversation?.assistant) {
      setSelectedAssistant(conversation.assistant.slug);
    }
  }, [conversation]);

  const selectedAssistantObj = assistants.find((a) => a.slug === selectedAssistant) ?? assistants[0];
  const toolTemplate = templates.find((t) => t.slug === toolSlug);

  const handleCreate = () => {
    createConversation.mutate(
      { assistant_slug: selectedAssistant, title: newTitle || undefined },
      {
        onSuccess: (data) => {
          setCreateOpen(false);
          setNewTitle('');
          navigate(`/ai/conversations/${data.id}`);
        },
      }
    );
  };

  const handleSend = () => {
    if (!conversationId || !draft.trim()) return;
    sendMessage.mutate({ id: Number(conversationId), content: draft.trim() });
    setDraft('');
  };

  const handleTool = (template: AiPromptTemplate) => {
    const variables = template.variables ?? [];
    const missing = variables.filter((v) => !toolForm[v]?.trim());
    if (missing.length > 0) {
      setToolResult(`Please fill in: ${missing.join(', ')}`);
      return;
    }

    setToolLoading(true);
    setToolResult('');
    generate.mutate(
      { slug: template.slug, variables: Object.fromEntries(variables.map((v) => [v, toolForm[v]])) },
      {
        onSuccess: (res) => setToolResult(res.content),
        onSettled: () => setToolLoading(false),
      }
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Platform"
        description="Specialized AI assistants for every role in the school"
        breadcrumbs={conversationId ? [{ label: 'AI Platform', href: '/ai' }, { label: 'Conversation' }] : undefined}
        actions={
          <>
            <Link
              to="/ai/usage"
              className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-3 h-8 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              My Usage
            </Link>
            <Button size="sm" onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4 mr-1" />New Conversation
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Assistant picker */}
        <Card className="lg:col-span-1 h-fit">
          <CardContent className="p-4 space-y-2">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-2">Assistants</p>
            {assistants.map((a) => {
              const Icon = assistantIcon(a);
              return (
                <button
                  key={a.id}
                  onClick={() => {
                    setSelectedAssistant(a.slug);
                    setToolSlug(
                      templates.find((t) => t.category === a.category)?.slug ??
                        templates.find((t) => t.slug === 'generate-quiz')?.slug ??
                        toolSlug
                    );
                  }}
                  className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${
                    selectedAssistant === a.slug ? 'bg-brand-50 border border-brand-200' : 'hover:bg-slate-50 border border-transparent'
                  }`}
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-100">
                    <Icon className="h-4.5 w-4.5 h-5 w-5 text-brand-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{a.name}</p>
                    <p className="text-xs text-slate-500 truncate">{a.category}</p>
                  </div>
                </button>
              );
            })}
            {usage && (
              <div className="mt-4 rounded-lg bg-slate-50 p-3 text-xs text-slate-600 space-y-1">
                <p className="font-semibold text-slate-700">Usage (30 days)</p>
                <p>{usage.total_calls} calls · {usage.total_tokens.toLocaleString()} tokens</p>
                <p>Cost: ${Number(usage.total_cost).toFixed(4)}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Chat / tools */}
        <div className="lg:col-span-3 space-y-6">
          {!conversationId ? (
            <Card>
              <CardContent className="p-6 space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-brand-600" />
                    {selectedAssistantObj?.name ?? 'Assistant'}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">{selectedAssistantObj?.description}</p>
                </div>

                <div className="grid gap-4">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Quick tools</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {templates.map((t) => (
                        <button
                          key={t.id}
                          onClick={() => {
                            setToolSlug(t.slug);
                            setToolForm({});
                            setToolResult('');
                          }}
                          className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-sm transition-colors ${
                            toolSlug === t.slug ? 'border-brand-300 bg-brand-50 text-brand-700' : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <Wand2 className="h-4 w-4 shrink-0" />
                          <span className="truncate">{t.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {toolTemplate && (
                    <div className="rounded-xl border border-slate-200 p-4 space-y-3">
                      <p className="text-sm font-medium text-slate-800">{toolTemplate.name}</p>
                      <p className="text-xs text-slate-500">{toolTemplate.description}</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {(toolTemplate.variables ?? []).map((v) => (
                          <div key={v} className="space-y-1">
                            <Label className="text-xs capitalize">{v.replace(/_/g, ' ')}</Label>
                            <Input
                              value={toolForm[v] ?? ''}
                              onChange={(e) => setToolForm({ ...toolForm, [v]: e.target.value })}
                              placeholder={v}
                            />
                          </div>
                        ))}
                      </div>
                      <Button onClick={() => handleTool(toolTemplate)} disabled={toolLoading}>
                        {toolLoading ? <Spinner size="sm" /> : <Wand2 className="h-4 w-4 mr-1" />}
                        Generate
                      </Button>
                      {toolResult && (
                        <div className="rounded-lg bg-slate-50 p-4 text-sm text-slate-800 whitespace-pre-wrap border border-slate-200">
                          {toolResult}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="border-t border-slate-100 pt-5">
                  <p className="text-sm text-slate-500 mb-3">Or start a conversation with {selectedAssistantObj?.name}.</p>
                  <Button onClick={() => setCreateOpen(true)}>
                    <Plus className="h-4 w-4 mr-1" />Start Conversation
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : convLoading ? (
            <Card>
              <CardContent className="py-16 flex items-center justify-center">
                <Spinner />
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
                  <div className="flex items-center gap-2 min-w-0">
                    {(() => {
                      const Icon = assistantIcon(conversation?.assistant);
                      return (
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-100">
                          <Icon className="h-4 w-4 text-brand-600" />
                        </div>
                      );
                    })()}
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">{conversation?.title}</p>
                      <p className="text-xs text-slate-500">{conversation?.assistant?.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (window.confirm('Delete this conversation?')) {
                          deleteConversation.mutate(Number(conversationId), { onSuccess: () => navigate('/ai') });
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>

                <div className="h-[420px] overflow-y-auto space-y-4 p-5">
                  {messages.length === 0 ? (
                    <EmptyState
                      icon={Bot}
                      title="Start the conversation"
                      description={`Ask ${conversation?.assistant?.name ?? 'the assistant'} anything below.`}
                    />
                  ) : (
                    messages.map((m) => <MessageBubble key={m.id} message={m} />)
                  )}
                  {sendMessage.isPending && (
                    <div className="flex gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-100">
                        <Bot className="h-4 w-4 text-brand-600" />
                      </div>
                      <div className="rounded-2xl bg-slate-100 px-4 py-3">
                        <Spinner size="sm" />
                      </div>
                    </div>
                  )}
                  <div ref={bottomRef} />
                </div>

                <div className="border-t border-slate-100 p-4 flex gap-2">
                  <Textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder={`Message ${conversation?.assistant?.name ?? 'the assistant'}…`}
                    rows={2}
                    className="resize-none"
                  />
                  <Button onClick={handleSend} disabled={!draft.trim() || sendMessage.isPending} className="self-end">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Conversation history */}
          <Card>
            <CardContent className="p-4">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Recent conversations</p>
              {conversations.length === 0 ? (
                <p className="text-sm text-slate-500">No conversations yet.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {conversations.slice(0, 8).map((c) => (
                    <Link
                      key={c.id}
                      to={`/ai/conversations/${c.id}`}
                      className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm transition-colors ${
                        c.id === Number(conversationId) ? 'border-brand-300 bg-brand-50' : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <Bot className="h-4 w-4 shrink-0 text-brand-600" />
                      <span className="truncate flex-1">{c.title}</span>
                      <span className="text-xs text-slate-400 shrink-0">{formatRelativeDate(c.updated_at ?? '')}</span>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <DialogRoot open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Conversation</DialogTitle>
            <DialogDescription>
              Start a new chat with {selectedAssistantObj?.name ?? 'the selected assistant'}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Label htmlFor="ai-new-title">Title (optional)</Label>
            <Input
              id="ai-new-title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. Help with while loops"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={createConversation.isPending}>
              {createConversation.isPending ? 'Creating…' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>
    </div>
  );
}
