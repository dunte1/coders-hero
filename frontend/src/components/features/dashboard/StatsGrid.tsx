import {
  AlertTriangle,
  Award,
  BookOpen,
  Bot,
  Briefcase,
  Building2,
  CalendarCheck,
  CheckSquare,
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
  const role = userRole?.toLowerCase();
  const isAdmin = role === 'admin' || role === 'super_admin' || role === 'director' || role === 'branch_manager' || role === 'school_admin';
  const isInstructor = role === 'instructor';
  const isEmployee = role === 'employee';
  const o = stats.overview ?? {};

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {isAdmin && (
        <>
          <StatsCard icon={Users} title="Total Students" value={o.total_students ?? 0} />
          <StatsCard icon={UserCheck} title="Total Teachers" value={o.total_teachers ?? 0} />
          <StatsCard icon={Building2} title="Active Schools" value={o.active_schools ?? 0} />
          <StatsCard
            icon={DollarSign}
            title="Monthly Revenue"
            value={formatCurrency(o.revenue ?? 0)}
          />
          <StatsCard
            icon={AlertTriangle}
            title="Outstanding Fees"
            value={formatCurrency(o.outstanding_fees ?? 0)}
          />
          <StatsCard icon={GraduationCap} title="Course Enrollments" value={o.total_enrollments ?? 0} />
          <StatsCard
            icon={Trophy}
            title="Competition Registrations"
            value={o.competition_registrations ?? 0}
          />
          <StatsCard
            icon={CalendarCheck}
            title="Attendance Today"
            value={`${(o.attendance_summary?.present ?? 0) + (o.attendance_summary?.late ?? 0)} present · ${o.attendance_summary?.absent ?? 0} absent`}
          />
          <StatsCard icon={Bot} title="AI Interactions (30d)" value={o.ai_insights?.total_interactions_30d ?? o.ai_interactions_30d ?? 0} />
          <StatsCard icon={TrendingUp} title="Completion Rate" value={`${o.completion_rate ?? 0}%`} />
          <StatsCard icon={BookOpen} title="Courses" value={o.total_courses ?? 0} />
          <StatsCard icon={CheckSquare} title="Pending Tasks" value={o.pending_tasks ?? 0} />
          <StatsCard icon={Users} title="Total Users" value={o.total_users ?? 0} />
          <StatsCard icon={Briefcase} title="Employees" value={o.total_employees ?? 0} />
          <StatsCard icon={FolderKanban} title="Active Projects" value={o.active_projects ?? 0} />
        </>
      )}

      {isInstructor && (
        <>
          <StatsCard icon={BookOpen} title="My Courses" value={o.total_courses ?? 0} />
          <StatsCard icon={GraduationCap} title="Published Courses" value={o.published_courses ?? 0} />
          <StatsCard icon={Users} title="Students" value={o.total_students ?? 0} />
          <StatsCard icon={GraduationCap} title="Enrollments" value={o.total_enrollments ?? 0} />
          <StatsCard icon={Trophy} title="Completed Enrollments" value={o.completed_enrollments ?? 0} />
        </>
      )}

      {isEmployee && (
        <>
          <StatsCard icon={CheckSquare} title="Pending Tasks" value={o.pending_tasks ?? 0} />
          <StatsCard icon={CheckSquare} title="Completed Tasks" value={o.completed_tasks ?? 0} />
          <StatsCard icon={AlertTriangle} title="Overdue Tasks" value={o.overdue_tasks ?? 0} />
          <StatsCard icon={BookOpen} title="Active Courses" value={o.active_courses ?? 0} />
          <StatsCard icon={FolderKanban} title="Projects" value={o.projects ?? 0} />
        </>
      )}

      {!isAdmin && !isInstructor && !isEmployee && (
        <>
          <StatsCard icon={BookOpen} title="Active Courses" value={o.active_courses ?? 0} />
          <StatsCard icon={Trophy} title="Completed Courses" value={o.completed_courses ?? 0} />
          <StatsCard icon={GraduationCap} title="Total Courses" value={o.total_courses ?? 0} />
          <StatsCard icon={TrendingUp} title="Average Progress" value={`${o.average_progress ?? 0}%`} />
          <StatsCard icon={Award} title="Certificates" value={o.certificates ?? 0} />
        </>
      )}
    </div>
  );
}
