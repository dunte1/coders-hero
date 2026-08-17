import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar';
import { getInitials, formatRelativeDate } from '@/lib/utils';
import { BookOpen, UserPlus, CheckSquare, FileText } from 'lucide-react';

interface Activity {
  id: number;
  type: 'enrollment' | 'user_joined' | 'task_completed' | 'announcement';
  message: string;
  user: {
    first_name: string;
    last_name: string;
    avatar?: string;
  };
  timestamp: string;
}

const activityIcons: Record<string, typeof BookOpen> = {
  enrollment: BookOpen,
  user_joined: UserPlus,
  task_completed: CheckSquare,
  announcement: FileText,
};

const activityColors: Record<string, string> = {
  enrollment: 'bg-blue-50 text-blue-600',
  user_joined: 'bg-emerald-50 text-emerald-600',
  task_completed: 'bg-purple-50 text-purple-600',
  announcement: 'bg-amber-50 text-amber-600',
};

export function RecentActivity() {
  const activities: Activity[] = [
    {
      id: 1,
      type: 'enrollment',
      message: 'enrolled in Advanced React Patterns',
      user: { first_name: 'Sarah', last_name: 'Johnson' },
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    },
    {
      id: 2,
      type: 'task_completed',
      message: 'completed "Design System Setup"',
      user: { first_name: 'Mike', last_name: 'Chen' },
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    },
    {
      id: 3,
      type: 'user_joined',
      message: 'joined the platform',
      user: { first_name: 'Alex', last_name: 'Rivera' },
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    },
    {
      id: 4,
      type: 'announcement',
      message: 'posted a new announcement',
      user: { first_name: 'Admin', last_name: 'User' },
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    },
    {
      id: 5,
      type: 'enrollment',
      message: 'enrolled in Python for Data Science',
      user: { first_name: 'Emma', last_name: 'Wilson' },
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => {
            const Icon = activityIcons[activity.type] || BookOpen;
            const colorClass = activityColors[activity.type] || 'bg-slate-50 text-slate-600';
            return (
              <div key={activity.id} className="flex items-start gap-3">
                <div className={`mt-0.5 rounded-lg p-1.5 ${colorClass}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-700">
                    <span className="font-medium">
                      {activity.user.first_name} {activity.user.last_name}
                    </span>{' '}
                    {activity.message}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {formatRelativeDate(activity.timestamp)}
                  </p>
                </div>
                <Avatar className="h-7 w-7 shrink-0">
                  <AvatarImage src={activity.user.avatar} />
                  <AvatarFallback className="text-[9px]">
                    {getInitials(activity.user.first_name, activity.user.last_name)}
                  </AvatarFallback>
                </Avatar>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
