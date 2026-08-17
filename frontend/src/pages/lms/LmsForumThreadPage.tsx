import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Pin, Lock, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatRelativeDate, getInitials } from '@/lib/utils';
import { useForumThread, useCreatePost, useDeleteThread } from '@/hooks/useLms';

export default function LmsForumThreadPage() {
  const { id } = useParams<{ id: string }>();
  const threadId = Number(id);
  const { data: thread, isLoading } = useForumThread(threadId);
  const createPost = useCreatePost(threadId);
  const deleteThread = useDeleteThread();
  const [content, setContent] = useState('');

  if (isLoading) return <Spinner />;
  if (!thread) return <EmptyState title="Thread not found" />;

  const posts = thread.posts ?? [];
  const topLevel = posts.filter((p) => p.parent_id === null);

  const handlePost = () => {
    createPost.mutate(
      { content },
      { onSuccess: () => setContent('') }
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={thread.title}
        description={`Posted by ${thread.user?.name ?? 'Unknown'} · ${formatRelativeDate(thread.created_at)}`}
        breadcrumbs={[{ label: 'Forum', href: '/lms/forum' }, { label: thread.title }]}
        actions={
          <>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => deleteThread.mutate(threadId, { onSuccess: () => (window.location.href = '/lms/forum') })}
            >
              <Trash2 className="mr-1 h-4 w-4" />Delete
            </Button>
          </>
        }
      />

      <Link to="/lms/forum" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-brand-600">
        <ArrowLeft className="h-4 w-4" />Back to forum
      </Link>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-medium text-brand-700">
              {thread.user ? getInitials(thread.user.name.split(' ')[0], thread.user.name.split(' ')[1] ?? '') : '?'}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-slate-900">{thread.user?.name ?? 'Unknown'}</h3>
                {thread.is_pinned && <Pin className="h-3 w-3 text-brand-600" />}
                {thread.is_locked && <Lock className="h-3 w-3 text-slate-400" />}
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{thread.content}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Replies ({topLevel.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {topLevel.length === 0 ? (
              <EmptyState title="No replies yet" description="Be the first to reply." />
            ) : (
              topLevel.map((p) => (
                <div key={p.id} className="flex items-start gap-4 rounded-lg border border-slate-200 p-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-medium text-slate-700">
                    {p.user ? getInitials(p.user.name.split(' ')[0], p.user.name.split(' ')[1] ?? '') : '?'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-slate-900">{p.user?.name ?? 'Unknown'}</p>
                      <span className="text-xs text-slate-400">{formatRelativeDate(p.created_at)}</span>
                    </div>
                    <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">{p.content}</p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {!thread.is_locked && (
          <Card>
            <CardContent className="p-6">
              <Textarea
                label="Your reply"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
                placeholder="Write your reply..."
              />
              <div className="mt-3 flex justify-end">
                <Button onClick={handlePost} loading={createPost.isPending} disabled={!content.trim()}>
                  Post Reply
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
