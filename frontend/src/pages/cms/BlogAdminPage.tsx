import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { Eye, Pencil, Plus, Star, Trash2 } from 'lucide-react';
import { cmsApi, getErrorMessage } from '@/lib/cmsApi';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageSpinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import {
  SelectRoot,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/Select';
import { ConfirmDelete } from '@/components/cms/ConfirmDelete';
import { formatDate, cn } from '@/lib/utils';
import type { BlogPost } from '@/types/cms';
import type { Column } from '@/components/ui/DataTable';

export default function BlogAdminPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['cms', 'blog', { page, search, status }],
    queryFn: () =>
      cmsApi.blog.list({
        page,
        search: search || undefined,
        status: status === 'all' ? undefined : status,
      }),
  });

  const deletePost = useMutation({
    mutationFn: (id: number) => cmsApi.blog.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms', 'blog'] });
      toast.success('Post deleted');
      setDeleteId(null);
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const publishPost = useMutation({
    mutationFn: (id: number) => cmsApi.blog.publish(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms', 'blog'] });
      toast.success('Post published');
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const unpublishPost = useMutation({
    mutationFn: (id: number) => cmsApi.blog.unpublish(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms', 'blog'] });
      toast.success('Post unpublished');
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const columns = useMemo<Column<BlogPost>[]>(
    () => [
      {
        key: 'title',
        header: 'Title',
        render: (item) => (
          <div className="flex items-center gap-3 min-w-0">
            {item.cover_url ? (
              <img
                src={item.cover_url}
                alt=""
                className="h-10 w-14 rounded-md object-cover shrink-0"
              />
            ) : (
              <div className="h-10 w-14 rounded-md bg-slate-100 shrink-0 flex items-center justify-center">
                <Star className="h-4 w-4 text-slate-300" />
              </div>
            )}
            <div className="min-w-0">
              <p className="font-medium text-slate-900 truncate">{item.title}</p>
              {item.slug && (
                <p className="text-xs text-slate-500 truncate">/{item.slug}</p>
              )}
            </div>
          </div>
        ),
      },
      { key: 'category', header: 'Category', render: (item) => item.category || '—' },
      {
        key: 'status',
        header: 'Status',
        render: (item) => <StatusBadge status={item.status} />,
      },
      {
        key: 'is_featured',
        header: 'Featured',
        render: (item) =>
          item.is_featured ? (
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
          ) : (
            <span className="text-slate-300 text-sm">—</span>
          ),
      },
      {
        key: 'published_at',
        header: 'Published',
        render: (item) =>
          item.published_at ? formatDate(item.published_at) : <span className="text-slate-400">—</span>,
      },
      {
        key: 'views',
        header: 'Views',
        render: (item) => (
          <span className="inline-flex items-center gap-1 text-slate-600">
            <Eye className="h-3.5 w-3.5 text-slate-400" />
            {item.views}
          </span>
        ),
      },
    ],
    []
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Blog Posts"
        description="Manage blog posts for the website"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Blog' }]}
        actions={
          <Link to="/cms/blog/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Post
            </Button>
          </Link>
        }
      />

      {isLoading ? (
        <PageSpinner />
      ) : (
        <DataTable<BlogPost>
          columns={columns}
          data={data?.results || []}
          totalCount={data?.meta.total || 0}
          page={data?.meta.current_page || 1}
          pageSize={data?.meta.per_page || 10}
          loading={isFetching}
          searchPlaceholder="Search posts..."
          onSearch={(query) => {
            setSearch(query);
            setPage(1);
          }}
          onPageChange={setPage}
          filters={
            <SelectRoot value={status} onValueChange={(value) => {
              setStatus(value);
              setPage(1);
            }}>
              <SelectTrigger className="w-40" label="">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </SelectRoot>
          }
          emptyTitle="No blog posts found"
          emptyDescription="Create your first blog post to get started."
          rowActions={(item) => (
            <>
              {item.status === 'published' ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => unpublishPost.mutate(item.id)}
                >
                  Unpublish
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-emerald-600"
                  onClick={() => publishPost.mutate(item.id)}
                >
                  Publish
                </Button>
              )}
              <Link to={`/cms/blog/${item.id}/edit`}>
                <Button variant="outline" size="sm">
                  <Pencil className="mr-1 h-3.5 w-3.5" />
                  Edit
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                className={cn('h-8 w-8 text-red-500')}
                onClick={() => setDeleteId(item.id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </>
          )}
        />
      )}

      <ConfirmDelete
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Delete Post"
        description="Are you sure you want to delete this blog post? This action cannot be undone."
        loading={deletePost.isPending}
        onConfirm={() => {
          if (deleteId) deletePost.mutate(deleteId);
        }}
      />
    </div>
  );
}
