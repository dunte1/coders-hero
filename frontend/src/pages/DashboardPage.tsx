import { useDashboard } from '@/hooks/useDashboard';
import { useAuth } from '@/hooks/useAuth';
import { StatsGrid } from '@/components/features/dashboard/StatsGrid';
import { QuickActions } from '@/components/features/dashboard/QuickActions';
import { RecentActivity } from '@/components/features/dashboard/RecentActivity';
import {
  UpcomingDeadlines,
  type DeadlineItem,
} from '@/components/features/dashboard/UpcomingDeadlines';
import {
  EnrollmentChart,
  CourseStatsChart,
  CompletionChart,
} from '@/components/features/dashboard/Charts';
import { NotificationList } from '@/components/features/notifications/NotificationList';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { PageSpinner } from '@/components/ui/Spinner';
import { Bot, MessageSquare, Coins, Users, TrendingUp } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import type { DashboardActivity, DashboardStats, DashboardUserRef } from '@/types';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function activityUserName(user?: DashboardUserRef | null) {
  const parts = (user?.name ?? '').trim().split(/\s+/);
  return {
    first_name: user?.first_name ?? parts[0] ?? 'Unknown',
    last_name: user?.last_name ?? (parts.length > 1 ? parts.slice(1).join(' ') : ''),
  };
}

function buildActivities(stats: DashboardStats): DashboardActivity[] {
  if (stats.recent_activity && stats.recent_activity.length > 0) {
    return stats.recent_activity;
  }

  const activities: DashboardActivity[] = [];

  const push = (
    type: DashboardActivity['type'],
    message: string,
    user: DashboardUserRef | null | undefined,
    timestamp?: string | null
  ) => {
    if (!timestamp) return;
    activities.push({
      type,
      message,
      user: { ...activityUserName(user), avatar: user?.avatar ?? null },
      timestamp,
    });
  };

  (stats.recent_enrollments ?? []).forEach((e) =>
    push('enrollment', `enrolled in ${e.course?.title ?? 'a course'}`, e.user, e.enrolled_at)
  );
  (stats.recent_completions ?? []).forEach((c) =>
    push('enrollment', `completed ${c.course?.title ?? 'a course'}`, c.user, c.completed_at)
  );
  (stats.my_tasks ?? []).forEach((t) =>
    push(
      'task',
      t.status === 'completed' ? `completed task "${t.title}"` : `working on task "${t.title}"`,
      t.assignee,
      t.created_at
    )
  );
  (stats.recent_announcements ?? []).forEach((a) =>
    push('announcement', `posted "${a.title}"`, a.author, a.created_at)
  );

  return activities;
}

function buildDeadlines(stats: DashboardStats): DeadlineItem[] {
  const items: DeadlineItem[] = [];

  (stats.upcoming_tasks ?? []).forEach((t) =>
    items.push({ id: t.id, title: t.title, kind: 'task', dueDate: t.due_date, priority: t.priority })
  );
  (stats.my_tasks ?? []).forEach((t) => {
    if (t.due_date) {
      items.push({ id: t.id, title: t.title, kind: 'task', dueDate: t.due_date, priority: t.priority });
    }
  });
  (stats.upcoming_events ?? []).forEach((e) =>
    items.push({ id: e.id, title: e.title, kind: 'event', dueDate: e.starts_at, location: e.location })
  );

  return items
    .filter((item) => item.dueDate)
    .sort((a, b) => new Date(a.dueDate as string).getTime() - new Date(b.dueDate as string).getTime())
    .slice(0, 6);
}

export default function DashboardPage() {
  const { data: stats, isLoading } = useDashboard();
  const { user } = useAuth();

  if (user?.role?.name?.toLowerCase() === 'parent') {
    return <Navigate to="/parent" replace />;
  }

  if (isLoading) return <PageSpinner />;
  if (error) return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="text-slate-400 mb-4">
        <svg className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-slate-900">Failed to load dashboard</h3>
      <p className="text-sm text-slate-500 mt-1">Please check your connection and try again.</p>
      <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 text-sm font-medium">
        Retry
      </button>
    </div>
  );
  if (!stats) return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="text-slate-400 mb-4">
        <svg className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m6 4.125l2.25 2.25m0 0l2.25 2.25M12 13.875l2.25-2.25M12 13.875l-2.25 2.25M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-slate-900">No data available</h3>
      <p className="text-sm text-slate-500 mt-1">Dashboard data is being loaded.</p>
    </div>
  );

  const activities = buildActivities(stats);
  const deadlines = buildDeadlines(stats);
  const hasAdminData = Boolean(stats.enrollment_stats);

  const enrollmentData = (stats.enrollment_stats?.monthly ?? []).map((m) => ({
    month: MONTHS[(m.month - 1) % 12],
    enrollments: m.count,
  }));
  const completionData = (stats.completion_stats?.monthly ?? []).map((m) => ({
    month: MONTHS[(m.month - 1) % 12],
    completions: m.count,
  }));
  const courseData = (stats.course_popularity ?? [])
    .map((c) => ({ name: c.title, value: c.enrollments_count ?? 0 }))
    .filter((c) => c.value > 0);

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <StatsGrid stats={stats} userRole={user?.role?.name} />

      {/* Quick Actions */}
      <QuickActions userRole={user?.role?.name} />

      {/* Main Content: Charts + Activity/Deadlines */}
      {hasAdminData ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <EnrollmentChart data={enrollmentData} />
            <CompletionChart data={completionData} />
          </div>
          <div className="space-y-6">
            <RecentActivity activities={activities} />
            <UpcomingDeadlines items={deadlines} />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentActivity activities={activities} />
          <UpcomingDeadlines items={deadlines} />
        </div>
      )}

      {/* Course Distribution + Notifications */}
      {hasAdminData && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <CourseStatsChart data={courseData} />
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              <NotificationList notifications={stats.recent_notifications ?? []} />
            </CardContent>
          </Card>
        </div>
      )}

      {/* AI Insights */}
      {hasAdminData && stats.overview?.ai_insights && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Bot className="h-5 w-5 text-indigo-500" />
              AI Platform Insights
              <span className="text-xs font-normal text-slate-400 ml-1">(last 30 days)</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { icon: MessageSquare, label: 'Interactions', value: stats.overview.ai_insights.total_interactions_30d, color: 'text-blue-500' },
                { icon: TrendingUp, label: 'Tokens Used', value: stats.overview.ai_insights.total_tokens_30d.toLocaleString(), color: 'text-emerald-500' },
                { icon: Coins, label: 'Total Cost', value: `$${stats.overview.ai_insights.total_cost_30d.toFixed(2)}`, color: 'text-amber-500' },
                { icon: TrendingUp, label: 'Avg Tokens/Chat', value: stats.overview.ai_insights.avg_tokens_per_interaction, color: 'text-purple-500' },
                { icon: Users, label: 'Active Users', value: stats.overview.ai_insights.unique_users_30d, color: 'text-rose-500' },
                { icon: Bot, label: 'Top Assistant', value: stats.overview.ai_insights.top_assistant ?? 'N/A', color: 'text-indigo-500', isText: true },
              ].map((item) => (
                <div key={item.label} className="flex flex-col items-center text-center p-3 rounded-xl bg-slate-50">
                  <item.icon className={`h-5 w-5 mb-2 ${item.color}`} />
                  <p className={`font-bold text-slate-900 ${item.isText ? 'text-sm' : 'text-xl'}`}>{item.value}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{item.label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
