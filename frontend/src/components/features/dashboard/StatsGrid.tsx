import { Users, BookOpen, GraduationCap, FolderKanban, CheckSquare, TrendingUp, DollarSign, UserCheck } from 'lucide-react';
import { StatsCard } from '@/components/ui/StatsCard';
import type { DashboardStats } from '@/types';
import { formatCurrency } from '@/lib/utils';

interface StatsGridProps {
  stats: DashboardStats;
  userRole?: string;
}

export function StatsGrid({ stats, userRole }: StatsGridProps) {
  const isAdmin = userRole === 'admin';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {isAdmin && (
        <>
          <StatsCard icon={Users} title="Total Users" value={stats.total_users} trend={{ value: 12, isPositive: true }} />
          <StatsCard icon={UserCheck} title="Employees" value={stats.total_employees} trend={{ value: 5, isPositive: true }} />
        </>
      )}
      <StatsCard icon={BookOpen} title="Courses" value={stats.total_courses} trend={{ value: 8, isPositive: true }} />
      <StatsCard icon={GraduationCap} title="Enrollments" value={stats.total_enrollments} trend={{ value: 15, isPositive: true }} />
      <StatsCard icon={FolderKanban} title="Active Projects" value={stats.active_projects} />
      <StatsCard icon={CheckSquare} title="Pending Tasks" value={stats.pending_tasks} />
      <StatsCard icon={TrendingUp} title="Completion Rate" value={`${stats.completion_rate}%`} trend={{ value: 3, isPositive: true }} />
      {isAdmin && (
        <StatsCard icon={DollarSign} title="Revenue" value={formatCurrency(stats.revenue)} trend={{ value: 10, isPositive: true }} />
      )}
    </div>
  );
}
