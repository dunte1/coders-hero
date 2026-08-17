import { useDashboard } from '@/hooks/useDashboard';
import { useAuth } from '@/hooks/useAuth';
import { StatsGrid } from '@/components/features/dashboard/StatsGrid';
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
  if (!stats) return null;

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
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Welcome back, {user?.first_name}!
        </h1>
        <p className="text-sm text-slate-500">
          Here's an overview of your platform.
        </p>
      </div>

      <StatsGrid stats={stats} userRole={user?.role?.name} />

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

      {hasAdminData && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <CourseStatsChart data={courseData} />
          </div>
          <Card>
            <CardContent className="pt-6">
              <NotificationList notifications={stats.recent_notifications ?? []} />
            </CardContent>
          </Card>
        </div>
      )}

      {hasAdminData && stats.overview?.ai_insights && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Bot className="h-5 w-5 text-indigo-500" />
              AI Platform Insights (30 days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="text-center">
                <MessageSquare className="h-5 w-5 mx-auto mb-1 text-slate-400" />
                <p className="text-2xl font-bold text-slate-900">{stats.overview.ai_insights.total_interactions_30d}</p>
                <p className="text-xs text-slate-500">Interactions</p>
              </div>
              <div className="text-center">
                <TrendingUp className="h-5 w-5 mx-auto mb-1 text-slate-400" />
                <p className="text-2xl font-bold text-slate-900">{stats.overview.ai_insights.total_tokens_30d.toLocaleString()}</p>
                <p className="text-xs text-slate-500">Tokens Used</p>
              </div>
              <div className="text-center">
                <Coins className="h-5 w-5 mx-auto mb-1 text-slate-400" />
                <p className="text-2xl font-bold text-slate-900">${stats.overview.ai_insights.total_cost_30d.toFixed(2)}</p>
                <p className="text-xs text-slate-500">Total Cost</p>
              </div>
              <div className="text-center">
                <TrendingUp className="h-5 w-5 mx-auto mb-1 text-slate-400" />
                <p className="text-2xl font-bold text-slate-900">{stats.overview.ai_insights.avg_tokens_per_interaction}</p>
                <p className="text-xs text-slate-500">Avg Tokens/Chat</p>
              </div>
              <div className="text-center">
                <Users className="h-5 w-5 mx-auto mb-1 text-slate-400" />
                <p className="text-2xl font-bold text-slate-900">{stats.overview.ai_insights.unique_users_30d}</p>
                <p className="text-xs text-slate-500">Active Users</p>
              </div>
              <div className="text-center">
                <Bot className="h-5 w-5 mx-auto mb-1 text-slate-400" />
                <p className="text-sm font-bold text-slate-900 truncate">{stats.overview.ai_insights.top_assistant ?? 'N/A'}</p>
                <p className="text-xs text-slate-500">Top Assistant</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
