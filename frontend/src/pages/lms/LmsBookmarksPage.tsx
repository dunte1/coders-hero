import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SelectRoot, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/Select';
import { DataTable } from '@/components/ui/DataTable';
import { useBookmarks, useToggleBookmark } from '@/hooks/useLms';
import { formatDate } from '@/lib/utils';
import type { Column } from '@/components/ui/DataTable';

type BookmarkRow = { id: number; bookmarkable: unknown; created_at: string };

function resolveLabel(bookmarkable: unknown): { label: string; href: string } {
  const obj = (bookmarkable ?? {}) as Record<string, unknown>;
  const title = (obj.title as string) ?? (obj.name as string) ?? 'Saved item';
  const id = (obj.id as number) ?? 0;
  if (typeof obj.course_id !== 'undefined') {
    return { label: title, href: `/lms/coding-exercises/${id}` };
  }
  return { label: title, href: id ? `/courses/${id}` : '/courses' };
}

export default function LmsBookmarksPage() {
  const [page, setPage] = useState(1);
  const [type, setType] = useState('');
  const { data, isLoading } = useBookmarks({ page, type: type || undefined });
  const toggleBookmark = useToggleBookmark();

  const rows = data?.results ?? [];

  const columns: Column<BookmarkRow>[] = [
    {
      key: 'bookmarkable',
      header: 'Saved Item',
      render: (r) => {
        const { label, href } = resolveLabel(r.bookmarkable);
        return <Link to={href} className="font-medium text-slate-900 hover:text-brand-600">{label}</Link>;
      },
    },
    { key: 'created_at', header: 'Saved On', render: (r) => formatDate(r.created_at) },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bookmarks"
        description="Your saved courses, lessons and forum threads."
      />

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle>Saved Items</CardTitle>
          <SelectRoot value={type} onValueChange={(v) => { setType(v); setPage(1); }}>
            <SelectTrigger className="w-40"><SelectValue placeholder="All types" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="">All</SelectItem>
              <SelectItem value="course">Courses</SelectItem>
              <SelectItem value="lesson">Lessons</SelectItem>
              <SelectItem value="thread">Threads</SelectItem>
            </SelectContent>
          </SelectRoot>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={rows}
            totalCount={data?.meta.total ?? 0}
            page={page}
            onPageChange={setPage}
            loading={isLoading}
            searchable={false}
            emptyTitle="No bookmarks yet"
            emptyDescription="Save items to see them here."
            rowActions={(r) => (
              <Button
                size="sm"
                variant="ghost"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => toggleBookmark.mutate({ type: (type as 'course' | 'lesson' | 'thread') || 'course', id: r.id })}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          />
        </CardContent>
      </Card>
    </div>
  );
}
