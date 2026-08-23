import { useQuery } from '@tanstack/react-query';
import { parentAnnouncementsApi } from '@/lib/api';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageSpinner } from '@/components/ui/Spinner';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Megaphone } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { useState } from 'react';

interface Announcement {
  id: number;
  title: string;
  content: string;
  priority: string;
  is_pinned: boolean;
  created_at: string;
  author?: { name: string } | null;
}

const PRIORITY_VARIANT: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  urgent: 'destructive',
  high: 'destructive',
  normal: 'default',
  low: 'secondary',
};

export default function ParentAnnouncementsPage() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['parent-announcements', page],
    queryFn: () => parentAnnouncementsApi.getAll({ page, per_page: 10 }),
  });

  if (isLoading) return <PageSpinner />;

  const announcements = (data?.results ?? []) as Announcement[];
  const total = data?.count ?? 0;
  const lastPage = Math.ceil(total / 10);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Announcements"
        description="Stay updated with school announcements and news."
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Parent Portal', href: '/parent' }, { label: 'Announcements' }]}
      />

      {announcements.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title="No announcements"
          description="There are no announcements at this time."
        />
      ) : (
        <div className="space-y-4">
          {announcements.map((a) => (
            <Card key={a.id}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {a.is_pinned && (
                        <Badge variant="outline" className="text-xs">Pinned</Badge>
                      )}
                      <Badge variant={PRIORITY_VARIANT[a.priority] ?? 'secondary'}>
                        {a.priority}
                      </Badge>
                    </div>
                    <h3 className="font-semibold text-slate-900 mb-1">{a.title}</h3>
                    <p className="text-sm text-slate-600 whitespace-pre-wrap line-clamp-3">
                      {a.content}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-slate-400">{formatDate(a.created_at)}</p>
                    {a.author && (
                      <p className="text-xs text-slate-500 mt-1">{a.author.name}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {lastPage > 1 && (
        <div className="flex justify-center gap-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
            className="px-3 py-1.5 text-sm border rounded-md disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-3 py-1.5 text-sm text-slate-600">
            Page {page} of {lastPage}
          </span>
          <button
            disabled={page >= lastPage}
            onClick={() => setPage(page + 1)}
            className="px-3 py-1.5 text-sm border rounded-md disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
