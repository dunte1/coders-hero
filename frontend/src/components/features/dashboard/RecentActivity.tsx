import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar';
import { getInitials, formatRelativeDate } from '@/lib/utils';
import { Activity as ActivityIcon, BookOpen, UserPlus, CheckSquare, FileText } from 'lucide-react';
import type { DashboardActivity } from '@/types';

const activityIcons: Record<string, typeof BookOpen> = {
  enrollment: BookOpen,
  user_joined: UserPlus,
  task: CheckSquare,
  announcement: FileText,
};

const activityColors: Record<string, string> = {
  enrollment: 'bg-blue-50 text-blue-600',
  user_joined: 'bg-emerald-50 text-emerald-600',
  task: 'bg-purple-50 text-purple-600',
  announcement: 'bg-amber-50 text-amber-600',
};

interface RecentActivityProps {
  activities: DashboardActivity[];
}

export function RecentActivity({ activities }: RecentActivityProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-slate-400">
            <ActivityIcon className="mb-2 h-8 w-8" />
            <p className="text-sm">No recent activity</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity, index) => {
              const Icon = activityIcons[activity.type] || ActivityIcon;
              const color = activityColors[activity.type] || 'bg-slate-50 text-slate-600';
              return (
                <div key={index} className="flex items-start gap-3">
                  <div className={`mt-0.5 rounded-lg p-1.5 ${color}`}>
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
                    <AvatarImage src={activity.user.avatar ?? undefined} />
                    <AvatarFallback className="text-[9px]">
                      {getInitials(activity.user.first_name, activity.user.last_name)}
                    </AvatarFallback>
                  </Avatar>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
