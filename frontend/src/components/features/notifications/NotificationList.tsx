import { Bell, Check, CheckCheck, Trash2, Info, CalendarClock, CreditCard, ClipboardList, FileText, Trophy, Award } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { Notification, NotificationCategory } from '@/types';
import { formatRelativeDate, cn } from '@/lib/utils';

interface NotificationListProps {
  notifications: Notification[];
  onMarkRead?: (id: string) => void;
  onMarkAllRead?: () => void;
  onDelete?: (id: string) => void;
}

const typeConfig: Record<string, { icon: typeof Info; color: string }> = {
  attendance: { icon: CalendarClock, color: 'text-blue-500' },
  fees: { icon: CreditCard, color: 'text-emerald-500' },
  assignments: { icon: ClipboardList, color: 'text-indigo-500' },
  exams: { icon: FileText, color: 'text-violet-500' },
  competitions: { icon: Trophy, color: 'text-amber-500' },
  certificates: { icon: Award, color: 'text-pink-500' },
  system: { icon: Info, color: 'text-slate-500' },
  info: { icon: Info, color: 'text-blue-500' },
  success: { icon: Award, color: 'text-emerald-500' },
  warning: { icon: Info, color: 'text-amber-500' },
  error: { icon: Info, color: 'text-red-500' },
};

const configFor = (notif: Notification) =>
  typeConfig[notif.category ?? ''] || typeConfig[notif.type] || typeConfig.system;

const categoryLabel = (category?: NotificationCategory) => {
  const labels: Record<NotificationCategory, string> = {
    attendance: 'Attendance',
    fees: 'Fees',
    assignments: 'Assignments',
    exams: 'Exams',
    competitions: 'Competitions',
    certificates: 'Certificates',
    system: 'System',
  };
  return category ? labels[category] : 'Notification';
};

export function NotificationList({
  notifications,
  onMarkRead,
  onMarkAllRead,
  onDelete,
}: NotificationListProps) {
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-slate-600" />
          <h2 className="text-lg font-semibold">Notifications</h2>
          {unreadCount > 0 && (
            <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-700">
              {unreadCount} unread
            </span>
          )}
        </div>
        {unreadCount > 0 && onMarkAllRead && (
          <Button variant="ghost" size="sm" onClick={onMarkAllRead}>
            <CheckCheck className="h-4 w-4 mr-1" />
            Mark all read
          </Button>
        )}
      </div>

      <div className="space-y-2">
        {notifications.length === 0 && (
          <div className="text-center py-12">
            <Bell className="h-8 w-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-500">No notifications</p>
          </div>
        )}
        {notifications.map((notif) => {
          const config = configFor(notif);
          const Icon = config.icon;
          return (
            <div
              key={notif.id}
              className={cn(
                'flex items-start gap-3 rounded-lg border p-3 transition-colors',
                notif.is_read
                  ? 'border-slate-100 bg-white'
                  : 'border-brand-100 bg-brand-50/50'
              )}
            >
              <Icon className={cn('mt-0.5 h-5 w-5 shrink-0', config.color)} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-medium text-slate-900">{notif.title}</h4>
                  {!notif.is_read && (
                    <span className="h-2 w-2 rounded-full bg-brand-500" />
                  )}
                </div>
                <p className="text-sm text-slate-500 mt-0.5">{notif.message}</p>
                <p className="text-xs text-slate-400 mt-1">
                  <span className="capitalize">{categoryLabel(notif.category)}</span> · {formatRelativeDate(notif.created_at)}
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {!notif.is_read && onMarkRead && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onMarkRead(notif.id)}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                )}
                {onDelete && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-500 hover:text-red-700"
                    onClick={() => onDelete(notif.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
