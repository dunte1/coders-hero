import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { cmsApi, getErrorMessage } from '@/lib/cmsApi';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageSpinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Switch } from '@/components/ui/Switch';
import {
  SelectRoot,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/Select';
import { ImageInput } from '@/components/cms/ImageInput';
import type { BlogPostDetail, BlogPostInput, BlogStatus } from '@/types/cms';

function toDatetimeLocal(value?: string | null): string {
  if (!value) return '';
  const date = new Date(value);
  if (isNaN(date.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}`;
}

const blogSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  excerpt: z.string().optional(),
  category: z.string().optional(),
  tags: z.string().optional(),
  cover_image: z.string().optional(),
  status: z.enum(['draft', 'published', 'archived']),
  is_featured: z.boolean(),
  published_at: z.string().optional(),
  meta_title: z.string().optional(),
  meta_description: z.string().optional(),
  content: z.string().min(1, 'Content is required'),
});

type BlogFormValues = z.infer<typeof blogSchema>;

interface BlogFormProps {
  post?: BlogPostDetail;
  isEdit: boolean;
  onSubmit: (data: BlogPostInput) => void;
  isSaving: boolean;
}

function BlogForm({ post, isEdit, onSubmit, isSaving }: BlogFormProps) {
  const methods = useForm<BlogFormValues>({
    resolver: zodResolver(blogSchema),
    defaultValues: {
      title: '',
      excerpt: '',
      category: '',
      tags: '',
      cover_image: '',
      status: 'draft',
      is_featured: false,
      published_at: '',
      meta_title: '',
      meta_description: '',
      content: '',
    },
  });

  const { register, handleSubmit, watch, setValue, reset } = methods;

  useEffect(() => {
    if (post) {
      reset({
        title: post.title,
        excerpt: post.excerpt || '',
        category: post.category || '',
        tags: (post.tags || []).join(', '),
        cover_image: post.cover_url || '',
        status: post.status,
        is_featured: post.is_featured,
        published_at: toDatetimeLocal(post.published_at),
        meta_title: post.meta_title || '',
        meta_description: post.meta_description || '',
        content: post.content,
      });
    }
  }, [post, reset]);

  const onFormSubmit = (values: BlogFormValues) => {
    const payload: BlogPostInput = {
      title: values.title,
      excerpt: values.excerpt || undefined,
      content: values.content,
      cover_image: values.cover_image || undefined,
      category: values.category || undefined,
      tags: values.tags
        ? values.tags
            .split(',')
            .map((tag) => tag.trim())
            .filter((tag) => tag !== '')
        : undefined,
      status: values.status,
      is_featured: values.is_featured,
      published_at: values.published_at ? new Date(values.published_at).toISOString() : undefined,
      meta_title: values.meta_title || undefined,
      meta_description: values.meta_description || undefined,
    };
    onSubmit(payload);
  };

  const contentPreview = watch('content');

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Title"
          placeholder="e.g. Why Kids Should Learn to Code"
          error={methods.formState.errors.title?.message}
          {...register('title')}
        />
        <Input
          label="Category"
          placeholder="e.g. Coding, Robotics, STEM"
          {...register('category')}
        />
      </div>

      <Textarea
        label="Excerpt"
        rows={2}
        placeholder="Short summary shown on blog cards"
        {...register('excerpt')}
      />

      <Input
        label="Tags"
        placeholder="Comma separated, e.g. scratch, kids, education"
        {...register('tags')}
      />

      <ImageInput
        label="Cover Image"
        value={watch('cover_image')}
        onChange={(value) => setValue('cover_image', value)}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SelectRoot
          value={watch('status')}
          onValueChange={(value: BlogStatus) => setValue('status', value)}
        >
          <SelectTrigger label="Status">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </SelectRoot>

        <Input
          label="Publish Date"
          type="datetime-local"
          {...register('published_at')}
        />

        <div className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
          <p className="text-sm font-medium text-slate-700">Featured</p>
          <Switch checked={watch('is_featured')} onCheckedChange={(v) => setValue('is_featured', v)} />
        </div>
      </div>

      <Textarea
        label="Content"
        rows={10}
        className="font-mono text-sm"
        placeholder="HTML content of the post..."
        error={methods.formState.errors.content?.message}
        {...register('content')}
      />

      <div className="space-y-2">
        <p className="text-sm font-medium text-slate-700">Preview</p>
        <div
          className="prose prose-sm max-w-none rounded-lg border border-slate-200 bg-slate-50 p-4"
          dangerouslySetInnerHTML={{ __html: contentPreview || '<p class="text-slate-400">Nothing to preview yet.</p>' }}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Meta Title"
          placeholder="SEO title"
          error={methods.formState.errors.meta_title?.message}
          {...register('meta_title')}
        />
        <Textarea
          label="Meta Description"
          rows={2}
          placeholder="SEO description"
          {...register('meta_description')}
        />
      </div>

      <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-4">
        <Button type="submit" loading={isSaving}>
          {isEdit ? 'Save Changes' : 'Create Post'}
        </Button>
      </div>
    </form>
  );
}

export default function BlogEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEdit = !!id;
  const postId = id ? parseInt(id, 10) : null;

  const { data: post, isLoading } = useQuery({
    queryKey: ['cms', 'blog', 'detail', postId],
    queryFn: () => cmsApi.blog.get(postId as number),
    enabled: !!postId,
  });

  const createMutation = useMutation({
    mutationFn: (data: BlogPostInput) => cmsApi.blog.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms', 'blog'] });
      toast.success('Post created successfully');
      navigate('/cms/blog');
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: BlogPostInput }) => cmsApi.blog.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms', 'blog'] });
      queryClient.invalidateQueries({ queryKey: ['cms', 'blog', 'detail', postId] });
      toast.success('Post updated successfully');
      navigate('/cms/blog');
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  if (isEdit && isLoading) return <PageSpinner />;
  if (isEdit && !post) {
    return <div className="py-12 text-center text-slate-500">Post not found</div>;
  }

  const handleSubmit = (data: BlogPostInput) => {
    if (isEdit && postId) {
      updateMutation.mutate({ id: postId, data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        title={isEdit ? 'Edit Post' : 'New Post'}
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Blog', href: '/cms/blog' },
          { label: isEdit ? 'Edit' : 'New' },
        ]}
      />
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <BlogForm
          key={postId || 'new'}
          post={post}
          isEdit={isEdit}
          onSubmit={handleSubmit}
          isSaving={createMutation.isPending || updateMutation.isPending}
        />
      </div>
    </div>
  );
}
