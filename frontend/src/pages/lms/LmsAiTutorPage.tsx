import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Bot, Send, Plus, Trash2 } from 'lucide-react';
import Markdown from 'react-markdown';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { Input } from '@/components/ui/Input';
import { DialogRoot, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/Dialog';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatRelativeDate } from '@/lib/utils';
import {
  useTutorConversations,
  useTutorConversation,
  useCreateConversation,
  useSendTutorMessage,
  useDeleteConversation,
} from '@/hooks/useLms';
import type { AiTutorMessage } from '@/types/lms';

export default function LmsAiTutorPage() {
  const { conversationId } = useParams<{ conversationId?: string }>();
  const navigate = useNavigate();
  const [listOpen, setListOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const { data: conversationsData, isLoading: listLoading } = useTutorConversations({ per_page: 50 });
  const { data: conversation, isLoading: convLoading } = useTutorConversation(Number(conversationId ?? 0));
  const createConversation = useCreateConversation();
  const sendMessage = useSendTutorMessage(Number(conversationId ?? 0));
  const deleteConversation = useDeleteConversation();
  const [draft, setDraft] = useState('');
  const [createOpen, setCreateOpen] = useState(false);

  const conversations = conversationsData?.results ?? [];
  const messages = conversation?.messages ?? [];

  const handleCreate = () => {
    createConversation.mutate(
      { title: newTitle || 'New conversation', course_id: null, lesson_id: null },
      {
        onSuccess: (data) => {
          setCreateOpen(false);
          setNewTitle('');
          navigate(`/lms/ai-tutor/conversations/${data.id}`);
        },
      }
    );
  };

  const handleSend = () => {
    if (!conversationId || !draft.trim()) return;
    sendMessage.mutate(draft.trim(), { onSuccess: () => setDraft('') });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Tutor"
        description="Ask questions and get help with your lessons."
        breadcrumbs={conversationId ? [{ label: 'AI Tutor', href: '/lms/ai-tutor' }, { label: 'Conversation' }] : undefined}
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => setListOpen((o) => !o)}>
              Conversations ({conversations.length})
            </Button>
            <Button size="sm" onClick={() => setCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />New Conversation
            </Button>
          </>
        }
      />

      {!conversationId ? (
        <Card>
          <CardContent className="py-12">
            <EmptyState
              icon={Bot}
              title="Start a conversation"
              description="Select an existing conversation or create a new one to ask the AI tutor a question."
              action={{ label: 'Create Conversation', onClick: () => setCreateOpen(true) }}
            />
          </CardContent>
        </Card>
      ) : convLoading ? (
        <Spinner />
      ) : !conversation ? (
        <EmptyState title="Conversation not found" />
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle>{conversation.title}</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => deleteConversation.mutate(conversation.id, { onSuccess: () => navigate('/lms/ai-tutor') })}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="flex h-[480px] flex-col">
              <div className="flex-1 space-y-4 overflow-y-auto pr-1">
                {messages.length === 0 ? (
                  <EmptyState title="No messages yet" description="Ask the AI tutor anything about your lessons." />
                ) : (
                  messages.map((m: AiTutorMessage) => (
                    <MessageBubble key={m.id} message={m} />
                  ))
                )}
                {sendMessage.isPending && (
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Spinner size="sm" /> AI tutor is thinking...
                  </div>
                )}
              </div>
              <div className="mt-4 flex items-end gap-2">
                <Textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Type your question..."
                  rows={2}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                />
                <Button size="icon" onClick={handleSend} loading={sendMessage.isPending} disabled={!draft.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {listOpen && (
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Conversations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {listLoading ? (
                  <Spinner />
                ) : conversations.length === 0 ? (
                  <EmptyState title="No conversations" />
                ) : (
                  conversations.map((c) => (
                    <Link
                      key={c.id}
                      to={`/lms/ai-tutor/conversations/${c.id}`}
                      className="block rounded-lg border border-slate-200 p-3 hover:bg-slate-50"
                    >
                      <p className="text-sm font-medium text-slate-900">{c.title}</p>
                      <p className="text-xs text-slate-500">{formatRelativeDate(c.updated_at)}</p>
                    </Link>
                  ))
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <DialogRoot open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Conversation</DialogTitle>
            <DialogDescription>Give your conversation a title.</DialogDescription>
          </DialogHeader>
          <Input label="Title" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="e.g. Help with Python loops" />
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} loading={createConversation.isPending}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>
    </div>
  );
}

function MessageBubble({ message }: { message: AiTutorMessage }) {
  const isUser = message.role === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[80%] rounded-lg px-4 py-3 text-sm ${isUser ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-800'}`}>
        <div className={isUser ? 'whitespace-pre-wrap' : 'prose prose-sm prose-slate max-w-none'}>
          {isUser ? (
            <p>{message.content}</p>
          ) : (
            <Markdown
              components={{
                pre: ({ children }) => (
                  <pre className="overflow-x-auto rounded-md bg-slate-900 p-3 text-sm text-slate-100">
                    {children}
                  </pre>
                ),
                code: ({ children, className, ...rest }) => {
                  const isInline = !className;
                  return isInline ? (
                    <code className="rounded bg-slate-200 px-1 py-0.5 text-xs font-mono" {...rest}>{children}</code>
                  ) : (
                    <code className={className} {...rest}>{children}</code>
                  );
                },
              }}
            >
              {message.content}
            </Markdown>
          )}
        </div>
        <p className={`mt-1 text-[10px] ${isUser ? 'text-brand-200' : 'text-slate-400'}`}>
          {formatRelativeDate(message.created_at)}
        </p>
      </div>
    </div>
  );
}
