import { useState } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageSpinner } from '@/components/ui/Spinner';
import { Button, buttonVariants } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/Badge';
import { usePortalNotifications, useMarkNotificationRead, useMarkAllNotificationsRead } from '@/hooks/useParentPortal';
import { formatRelativeDate } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { PortalNotification } from '@/types/portal';

const NOTIFICATION_TYPE_LABEL: Record<string, string> = {
  announcement: 'Announcement',
  fee: 'Fee',
  appointment: 'Appointment',
  attendance: 'Attendance',
  report_card: 'Report Card',
  message: 'Message',
};

function NotificationRow({ notification, onMarkRead }: { notification: PortalNotification; onMarkRead: (id: string) => void }) {
  const unread = !notification.read_at;
  const title = notification.data.title || NOTIFICATION_TYPE_LABEL[notification.type] || notification.type;
  const message = notification.data.message;

  return (
    <button
      type="button"
      onClick={() => {
        if (unread) onMarkRead(notification.id);
      }}
      className={cn(
        'flex w-full items-start gap-3 rounded-lg border border-slate-200 bg-white p-4 text-left transition-colors',
        unread ? 'border-brand-200 bg-brand-50/50 hover:bg-brand-50' : 'hover:bg-slate-50'
      )}
    >
      <div
        className={cn(
          'mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
          unread ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-500'
        )}
      >
        <Bell className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className={cn('text-sm', unread ? 'font-semibold text-slate-900' : 'font-medium text-slate-700')}>
            {title}
          </p>
          <span className="shrink-0 text-xs text-slate-400">{formatRelativeDate(notification.created_at)}</span>
        </div>
        {message && <p className="mt-1 text-sm text-slate-600">{message}</p>}
        <div className="mt-2">
          <Badge variant={unread ? 'default' : 'secondary'}>{NOTIFICATION_TYPE_LABEL[notification.type] || notification.type}</Badge>
          {unread && <span className="ml-2 text-xs font-medium text-brand-600">Unread</span>}
        </div>
      </div>
    </button>
  );
}

export default function ParentNotificationsPage() {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const { data, isLoading } = usePortalNotifications(filter === 'unread' ? 'unread' : undefined);
  const markReadMutation = useMarkNotificationRead();
  const markAllMutation = useMarkAllNotificationsRead();

  if (isLoading) return <PageSpinner />;

  const notifications = data?.results || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description="Announcements and updates from the school."
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Parent Portal', href: '/parent' }, { label: 'Notifications' }]}
        actions={
          notifications.some((n) => !n.read_at) ? (
            <Button variant="outline" loading={markAllMutation.isPending} onClick={() => markAllMutation.mutate()}>
              <CheckCheck className="h-4 w-4" />
              Mark all read
            </Button>
          ) : undefined
        }
      />

      <div className="flex gap-2">
        <LinkButton active={filter === 'all'} onClick={() => setFilter('all')}>
          All
        </LinkButton>
        <LinkButton active={filter === 'unread'} onClick={() => setFilter('unread')}>
          Unread
        </LinkButton>
      </div>

      {notifications.length === 0 ? (
        <Card>
          <CardContent>
            <EmptyState
              icon={Bell}
              title="No notifications"
              description={filter === 'unread' ? 'You have no unread notifications.' : 'Notifications will appear here when available.'}
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <NotificationRow
              key={notification.id}
              notification={notification}
              onMarkRead={(id) => markReadMutation.mutate(id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function LinkButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        buttonVariants({ variant: active ? 'default' : 'outline', size: 'sm' }),
        active ? 'pointer-events-auto' : ''
      )}
    >
      {children}
    </button>
  );
}
