import { useState } from 'react';
import { NotificationList } from '@/components/features/notifications/NotificationList';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageSpinner } from '@/components/ui/Spinner';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { Card, CardContent } from '@/components/ui/Card';
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
  useDeleteNotification,
  useNotificationStats,
} from '@/hooks/useNotifications';

const categoryTabs: Array<{ value: string; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'attendance', label: 'Attendance' },
  { value: 'fees', label: 'Fees' },
  { value: 'assignments', label: 'Assignments' },
  { value: 'exams', label: 'Exams' },
  { value: 'competitions', label: 'Competitions' },
  { value: 'certificates', label: 'Certificates' },
  { value: 'system', label: 'System' },
];

export default function NotificationsPage() {
  const [tab, setTab] = useState('all');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  const { data, isLoading } = useNotifications({
    per_page: 50,
    category: tab === 'all' ? undefined : tab,
    is_read: showUnreadOnly ? false : undefined,
  });

  const { data: stats } = useNotificationStats();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const deleteNotification = useDeleteNotification();

  const notifications = data?.results ?? [];

  const handleMarkRead = (id: string) => {
    markRead.mutate(id);
  };

  const handleMarkAllRead = () => {
    markAllRead.mutate();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this notification?')) deleteNotification.mutate(id);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader
        title="Notifications"
        description={stats ? `${stats.unread} unread · ${stats.this_week} this week` : undefined}
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Notifications' }]}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="flex-wrap">
            {categoryTabs.map((t) => (
              <TabsTrigger key={t.value} value={t.value}>
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={showUnreadOnly}
            onChange={(e) => setShowUnreadOnly(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-brand-600"
          />
          Unread only
        </label>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8">
              <PageSpinner />
            </div>
          ) : (
            <NotificationList
              notifications={notifications}
              onMarkRead={handleMarkRead}
              onMarkAllRead={handleMarkAllRead}
              onDelete={handleDelete}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
