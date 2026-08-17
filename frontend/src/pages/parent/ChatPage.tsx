import { useEffect, useRef, useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MessageSquare, Send, Plus, PenSquare } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageSpinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/Dialog';
import {
  SelectRoot,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/Select';
import {
  useConversations,
  useConversation,
  useSendMessage,
  useStartConversation,
  useMarkChatRead,
  useParentTeachers,
  useParentChildren,
} from '@/hooks/useParentPortal';
import { useAuth } from '@/hooks/useAuth';
import { formatRelativeDate, getInitials } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { Conversation, ChatMessage } from '@/types/portal';

const startSchema = z.object({
  teacher_user_id: z.string().min(1, 'Teacher is required'),
  student_id: z.string().optional(),
  body: z.string().min(1, 'Message is required'),
});

type StartFormValues = z.infer<typeof startSchema>;

function NewMessageDialog() {
  const startMutation = useStartConversation();
  const { data: teachers } = useParentTeachers();
  const { data: children } = useParentChildren();
  const [open, setOpen] = useState(false);

  const methods = useForm<StartFormValues>({
    resolver: zodResolver(startSchema),
    defaultValues: { teacher_user_id: '', student_id: '', body: '' },
  });

  const { register, handleSubmit, setValue, watch, reset } = methods;

  const onFormSubmit = (values: StartFormValues) => {
    startMutation.mutate(
      {
        teacher_user_id: values.teacher_user_id,
        student_id: values.student_id ? Number(values.student_id) : null,
        body: values.body,
      },
      {
        onSuccess: () => {
          reset({ teacher_user_id: '', student_id: '', body: '' });
          setOpen(false);
        },
      }
    );
  };

  return (
    <DialogRoot open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4" />
          New Message
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Start Conversation</DialogTitle>
          <DialogDescription>Send a message to one of your child&apos;s teachers.</DialogDescription>
        </DialogHeader>
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
            <SelectRoot value={watch('teacher_user_id')} onValueChange={(value) => setValue('teacher_user_id', value)}>
              <SelectTrigger label="Teacher" error={methods.formState.errors.teacher_user_id?.message}>
                <SelectValue placeholder="Select teacher" />
              </SelectTrigger>
              <SelectContent>
                {teachers?.map((teacher) => (
                  <SelectItem key={teacher.id} value={teacher.id}>
                    {teacher.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </SelectRoot>
            <SelectRoot value={watch('student_id')} onValueChange={(value) => setValue('student_id', value)}>
              <SelectTrigger label="Student (optional)">
                <SelectValue placeholder="Select student" />
              </SelectTrigger>
              <SelectContent>
                {children?.map((student) => (
                  <SelectItem key={student.id} value={String(student.id)}>
                    {student.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </SelectRoot>
            <Textarea
              label="Message"
              rows={3}
              placeholder="Write your message..."
              error={methods.formState.errors.body?.message}
              {...register('body')}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" type="button">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" loading={startMutation.isPending}>
                <Send className="h-4 w-4" />
                Send
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </DialogRoot>
  );
}

function MessageBubble({ message, isOwn }: { message: ChatMessage; isOwn: boolean }) {
  return (
    <div className={cn('flex', isOwn ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[75%] rounded-2xl px-4 py-2.5 text-sm',
          isOwn ? 'rounded-br-sm bg-brand-600 text-white' : 'rounded-bl-sm bg-slate-100 text-slate-900'
        )}
      >
        <p className="whitespace-pre-wrap break-words">{message.body}</p>
        <p className={cn('mt-1 text-xs', isOwn ? 'text-brand-200' : 'text-slate-400')}>
          {formatRelativeDate(message.created_at)}
        </p>
      </div>
    </div>
  );
}

function ConversationThread({ conversationId }: { conversationId: number }) {
  const { user } = useAuth();
  const { data, isLoading } = useConversation(conversationId);
  const sendMutation = useSendMessage();
  const markReadMutation = useMarkChatRead();
  const [body, setBody] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const conversation = data?.conversation;
  const messages = data?.messages || [];

  useEffect(() => {
    if (conversationId) {
      markReadMutation.mutate(conversationId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages.length]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <PageSpinner />
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="flex h-full items-center justify-center">
        <EmptyState icon={MessageSquare} title="Select a conversation" description="Choose a conversation to start chatting." />
      </div>
    );
  }

  const otherName = conversation.teacherUser?.name || conversation.guardianUser?.name || 'Contact';

  const onSend = () => {
    const trimmed = body.trim();
    if (!trimmed) return;
    sendMutation.mutate(
      { id: conversationId, body: trimmed },
      {
        onSuccess: () => setBody(''),
      }
    );
  };

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-slate-200 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700">
            {getInitials(otherName.split(' ')[0] || '?', otherName.split(' ')[1] || '')}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">{otherName}</p>
            <p className="text-xs text-slate-500">
              {conversation.student ? `About ${conversation.student.first_name} ${conversation.student.last_name}` : 'General'}
            </p>
          </div>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-400">No messages yet. Say hello!</p>
        ) : (
          messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isOwn={String(user?.id) === message.sender_user_id}
            />
          ))
        )}
      </div>

      <div className="flex items-end gap-2 border-t border-slate-200 p-3">
        <Textarea
          rows={1}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              onSend();
            }
          }}
          placeholder="Type a message..."
          className="min-h-10 flex-1 resize-none"
        />
        <Button size="icon" onClick={onSend} loading={sendMutation.isPending} disabled={!body.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export default function ChatPage() {
  const { user } = useAuth();
  const { data: conversations, isLoading } = useConversations();
  const [activeId, setActiveId] = useState<number | null>(null);
  const isParent = user?.role?.name?.toLowerCase() === 'parent';

  const activeConversation = activeId ?? conversations?.[0]?.id ?? null;

  if (isLoading) return <PageSpinner />;

  const list = conversations || [];

  return (
    <div className="flex h-full flex-col space-y-4">
      <PageHeader
        title="Messages"
        description={isParent ? 'Chat with your child\'s teachers.' : 'Conversations with parents.'}
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Messages' }]}
        actions={isParent ? <NewMessageDialog /> : undefined}
      />

      <div className="grid h-[calc(100vh-16rem)] grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
            <p className="text-sm font-semibold text-slate-900">Conversations ({list.length})</p>
            {isParent && (
              <Button variant="ghost" size="sm" onClick={() => {}}>
                <PenSquare className="h-4 w-4" />
                New
              </Button>
            )}
          </div>
          <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 22rem)' }}>
            {list.length === 0 ? (
              <EmptyState
                icon={MessageSquare}
                title="No conversations"
                description={isParent ? 'Start a conversation with a teacher.' : 'Parent messages will appear here.'}
              />
            ) : (
              <div className="divide-y divide-slate-100">
                {list.map((conversation: Conversation) => {
                  const name = isParent
                    ? conversation.teacherUser?.name
                    : conversation.guardianUser?.name;
                  return (
                    <button
                      key={conversation.id}
                      type="button"
                      onClick={() => setActiveId(conversation.id)}
                      className={cn(
                        'flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50',
                        conversation.id === activeConversation && 'bg-brand-50 hover:bg-brand-50'
                      )}
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700">
                        {getInitials((name || '?').split(' ')[0] || '?', (name || '').split(' ')[1] || '')}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate text-sm font-medium text-slate-900">{name || 'Contact'}</p>
                          {conversation.last_message_at_formatted && (
                            <span className="shrink-0 text-xs text-slate-400">
                              {formatRelativeDate(conversation.last_message_at || '')}
                            </span>
                          )}
                        </div>
                        <p className="truncate text-xs text-slate-500">
                          {conversation.student ? `${conversation.student.first_name}: ` : ''}
                          {conversation.last_message || 'No messages yet'}
                        </p>
                      </div>
                      {conversation.unread_count > 0 && (
                        <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-brand-600 px-1.5 text-xs font-bold text-white">
                          {conversation.unread_count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </Card>

        <Card className="overflow-hidden lg:col-span-2">
          {activeConversation ? (
            <ConversationThread key={activeConversation} conversationId={activeConversation} />
          ) : (
            <div className="flex h-full items-center justify-center">
              <EmptyState icon={MessageSquare} title="No conversation selected" description="Select a conversation to view messages." />
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
