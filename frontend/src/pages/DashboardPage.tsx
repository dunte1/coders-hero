import { useDashboard } from '@/hooks/useDashboard';
import { useAuth } from '@/hooks/useAuth';
import { StatsGrid } from '@/components/features/dashboard/StatsGrid';
import { RecentActivity } from '@/components/features/dashboard/RecentActivity';
import { UpcomingDeadlines } from '@/components/features/dashboard/UpcomingDeadlines';
import { EnrollmentChart, CourseStatsChart, CompletionChart } from '@/components/features/dashboard/Charts';
import { PageSpinner } from '@/components/ui/Spinner';
import { Navigate } from 'react-router-dom';

export default function DashboardPage() {
  const { data: stats, isLoading } = useDashboard();
  const { user } = useAuth();

  if (user?.role?.name?.toLowerCase() === 'parent') {
    return <Navigate to="/parent" replace />;
  }

  if (isLoading) return <PageSpinner />;

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

      {stats && <StatsGrid stats={stats} userRole={user?.role?.name?.toLowerCase()} />}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <EnrollmentChart />
          <CompletionChart />
        </div>
        <div className="space-y-6">
          <RecentActivity />
          <UpcomingDeadlines />
        </div>
      </div>

      <CourseStatsChart />
    </div>
  );
}
