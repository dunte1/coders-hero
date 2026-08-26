import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Pin, Lock, Trash2, Reply } from 'lucide-react';
import Markdown from 'react-markdown';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatRelativeDate, getInitials } from '@/lib/utils';
import { useForumThread, useCreatePost, useDeleteThread } from '@/hooks/useLms';
import type { ForumPost } from '@/types/lms';

function renderReply(
  post: ForumPost,
  allPosts: ForumPost[]
): React.ReactNode {
  const children = allPosts.filter((p) => p.parent_id === post.id);

  return (
    <div key={post.id} className="flex items-start gap-4 rounded-lg border border-slate-200 p-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-medium text-slate-700">
        {post.user ? getInitials(post.user.name.split(' ')[0], post.user.name.split(' ')[1] ?? '') : '?'}
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-slate-900">{post.user?.name ?? 'Unknown'}</p>
          <span className="text-xs text-slate-400">{formatRelativeDate(post.created_at)}</span>
        </div>
        <div className="prose prose-sm prose-slate mt-1 max-w-none">
          <Markdown>{post.content}</Markdown>
        </div>
      </div>
      {children.length > 0 && (
        <div className="mt-2 w-full space-y-3 pl-8 border-l-2 border-slate-100">
          {children.map((child) => renderReply(child, allPosts))}
        </div>
      )}
    </div>
  );
}

export default function LmsForumThreadPage() {
  const { id } = useParams<{ id: string }>();
  const threadId = Number(id);
  const navigate = useNavigate();
  const { data: thread, isLoading } = useForumThread(threadId);
  const createPost = useCreatePost(threadId);
  const deleteThread = useDeleteThread();
  const [content, setContent] = useState('');
  const [replyTo, setReplyTo] = useState<number | null>(null);

  if (isLoading) return <Spinner />;
  if (!thread) return <EmptyState title="Thread not found" />;

  const posts = thread.posts ?? [];
  const topLevel = posts.filter((p) => p.parent_id === null);

  const handlePost = () => {
    createPost.mutate(
      { content, parentId: replyTo ?? undefined },
      { onSuccess: () => { setContent(''); setReplyTo(null); } }
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
              onClick={() => deleteThread.mutate(threadId, { onSuccess: () => navigate('/lms/forum') })}
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
              <div className="prose prose-sm prose-slate mt-2 max-w-none">
                <Markdown>{thread.content}</Markdown>
              </div>
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
                <div key={p.id}>
                  <div className="flex items-start gap-4 rounded-lg border border-slate-200 p-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-medium text-slate-700">
                      {p.user ? getInitials(p.user.name.split(' ')[0], p.user.name.split(' ')[1] ?? '') : '?'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-slate-900">{p.user?.name ?? 'Unknown'}</p>
                        <span className="text-xs text-slate-400">{formatRelativeDate(p.created_at)}</span>
                      </div>
                      <div className="prose prose-sm prose-slate mt-1 max-w-none">
                        <Markdown>{p.content}</Markdown>
                      </div>
                      {!thread.is_locked && (
                        <button
                          onClick={() => setReplyTo(replyTo === p.id ? null : p.id)}
                          className="mt-2 flex items-center gap-1 text-xs text-slate-500 hover:text-brand-600"
                        >
                          <Reply className="h-3 w-3" /> Reply
                        </button>
                      )}
                    </div>
                  </div>
                  {p.replies && p.replies.length > 0 && (
                    <div className="ml-8 mt-2 space-y-3 border-l-2 border-slate-100 pl-4">
                      {p.replies.map((child) => renderReply(child, posts))}
                    </div>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {!thread.is_locked && (
          <Card>
            <CardContent className="p-6">
              {replyTo !== null && (
                <div className="mb-3 flex items-center justify-between rounded-md bg-slate-50 px-3 py-2 text-sm text-slate-600">
                  <span>Replying to post #{replyTo}</span>
                  <button onClick={() => setReplyTo(null)} className="text-xs text-slate-400 hover:text-slate-600">Cancel</button>
                </div>
              )}
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
