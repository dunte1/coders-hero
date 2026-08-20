import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { announcementsApi } from '@/lib/api';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageSpinner } from '@/components/ui/Spinner';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar';
import { getInitials, formatDateTime } from '@/lib/utils';
import { Pin } from 'lucide-react';

export default function AnnouncementDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = useQuery({
    queryKey: ['announcement', id],
    queryFn: () =>
      announcementsApi.getAnnouncements({}).then((res) =>
        res.results.find((a) => a.id === parseInt(id || '0'))
      ),
    enabled: !!id,
  });

  if (isLoading) return <PageSpinner />;
  if (!data) return <div className="text-center py-12">Announcement not found</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader
        title={data.title}
        breadcrumbs={[
          { label: 'Announcements', href: '/announcements' },
          { label: data.title },
        ]}
      />
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            {data.is_pinned && <Pin className="h-4 w-4 text-brand-500" />}
            <Badge variant={data.priority === 'urgent' ? 'destructive' : data.priority === 'high' ? 'warning' : 'secondary'}>
              {data.priority}
            </Badge>
            <Badge variant="outline">{data.target_audience}</Badge>
          </div>

          <div className="prose prose-slate max-w-none mb-6">
            <p className="whitespace-pre-wrap text-slate-700">{data.content}</p>
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
            <Avatar className="h-8 w-8">
              <AvatarImage src={data.author?.avatar} />
              <AvatarFallback className="text-xs">
                {getInitials(data.author?.name || 'Author')}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">
                {data.author?.name}
              </p>
              <p className="text-xs text-slate-500">{formatDateTime(data.created_at)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
