import { useState } from 'react';
import {
  AlertTriangle,
  Award,
  BookOpen,
  Bot,
  Briefcase,
  Building2,
  CalendarCheck,
  CheckSquare,
  ChevronDown,
  ChevronUp,
  DollarSign,
  FolderKanban,
  GraduationCap,
  TrendingUp,
  Trophy,
  UserCheck,
  Users,
} from 'lucide-react';
import { StatsCard } from '@/components/ui/StatsCard';
import type { DashboardStats } from '@/types';
import { formatCurrency } from '@/lib/utils';

interface StatsGridProps {
  stats: DashboardStats;
  userRole?: string;
}

export function StatsGrid({ stats, userRole }: StatsGridProps) {
  const [showMore, setShowMore] = useState(false);
  const role = userRole?.toLowerCase();
  const isAdmin = role === 'admin' || role === 'super_admin' || role === 'director' || role === 'branch_manager' || role === 'school_admin';
  const isInstructor = role === 'instructor';
  const isEmployee = role === 'employee';
  const o = stats.overview ?? {};

  if (isAdmin) {
    // Primary: top 6 most important metrics
    const primaryStats = [
      { icon: DollarSign, title: 'Monthly Revenue', value: formatCurrency(o.revenue ?? 0), color: 'emerald' as const },
      { icon: AlertTriangle, title: 'Outstanding Fees', value: formatCurrency(o.outstanding_fees ?? 0), color: 'red' as const },
      { icon: Users, title: 'Total Students', value: o.total_students ?? 0, color: 'blue' as const },
      { icon: GraduationCap, title: 'Course Enrollments', value: o.total_enrollments ?? 0, color: 'purple' as const },
      { icon: TrendingUp, title: 'Completion Rate', value: `${o.completion_rate ?? 0}%`, color: 'emerald' as const },
      { icon: CalendarCheck, title: 'Attendance Today', value: `${(o.attendance_summary?.present ?? 0) + (o.attendance_summary?.late ?? 0)} present`, color: 'brand' as const },
    ];

    // Secondary: everything else
    const secondaryStats = [
      { icon: Users, title: 'Total Users', value: o.total_users ?? 0, color: 'slate' as const },
      { icon: UserCheck, title: 'Total Teachers', value: o.total_teachers ?? 0, color: 'blue' as const },
      { icon: Building2, title: 'Active Schools', value: o.active_schools ?? 0, color: 'slate' as const },
      { icon: BookOpen, title: 'Courses', value: o.total_courses ?? 0, color: 'brand' as const },
      { icon: Trophy, title: 'Competitions', value: o.competition_registrations ?? 0, color: 'amber' as const },
      { icon: CheckSquare, title: 'Pending Tasks', value: o.pending_tasks ?? 0, color: 'amber' as const },
      { icon: Briefcase, title: 'Employees', value: o.total_employees ?? 0, color: 'slate' as const },
      { icon: FolderKanban, title: 'Active Projects', value: o.active_projects ?? 0, color: 'purple' as const },
      { icon: Bot, title: 'AI Interactions (30d)', value: o.ai_insights?.total_interactions_30d ?? o.ai_interactions_30d ?? 0, color: 'purple' as const },
    ];

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {primaryStats.map((stat) => (
            <StatsCard key={stat.title} {...stat} />
          ))}
        </div>

        {/* Collapsible secondary stats */}
        <div>
          <button
            onClick={() => setShowMore(!showMore)}
            className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors mb-3"
          >
            {showMore ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            {showMore ? 'Show less' : `Show more stats (${secondaryStats.length})`}
          </button>
          {showMore && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 animate-in slide-in-from-top-2 duration-200">
              {secondaryStats.map((stat) => (
                <StatsCard key={stat.title} {...stat} />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (isInstructor) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatsCard icon={BookOpen} title="My Courses" value={o.total_courses ?? 0} color="brand" />
        <StatsCard icon={GraduationCap} title="Published" value={o.published_courses ?? 0} color="emerald" />
        <StatsCard icon={Users} title="Students" value={o.total_students ?? 0} color="blue" />
        <StatsCard icon={GraduationCap} title="Enrollments" value={o.total_enrollments ?? 0} color="purple" />
        <StatsCard icon={Trophy} title="Completed" value={o.completed_enrollments ?? 0} color="emerald" />
      </div>
    );
  }

  if (isEmployee) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatsCard icon={CheckSquare} title="Pending Tasks" value={o.pending_tasks ?? 0} color="amber" />
        <StatsCard icon={CheckSquare} title="Completed" value={o.completed_tasks ?? 0} color="emerald" />
        <StatsCard icon={AlertTriangle} title="Overdue" value={o.overdue_tasks ?? 0} color="red" />
        <StatsCard icon={BookOpen} title="Active Courses" value={o.active_courses ?? 0} color="brand" />
        <StatsCard icon={FolderKanban} title="Projects" value={o.projects ?? 0} color="purple" />
      </div>
    );
  }

  // Student / default
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      <StatsCard icon={BookOpen} title="Active Courses" value={o.active_courses ?? 0} color="brand" />
      <StatsCard icon={Trophy} title="Completed" value={o.completed_courses ?? 0} color="emerald" />
      <StatsCard icon={GraduationCap} title="Total Courses" value={o.total_courses ?? 0} color="blue" />
      <StatsCard icon={TrendingUp} title="Avg Progress" value={`${o.average_progress ?? 0}%`} color="purple" />
      <StatsCard icon={Award} title="Certificates" value={o.certificates ?? 0} color="amber" />
    </div>
  );
}
