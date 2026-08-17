export interface AnalyticsFilters {
  from?: string;
  to?: string;
  branch?: string;
}

export interface AnalyticsOverview {
  total_students: number;
  active_students: number;
  total_revenue: number;
  outstanding_fees: number;
  total_enrollments: number;
  completion_rate: number;
  attendance_rate: number;
  active_competitions: number;
  total_courses: number;
}

export interface EnrollmentAnalytics {
  total: number;
  monthly: Record<string, number>;
  by_status: Record<string, number>;
  by_grade: Record<string, { students: number; enrollments: number }>;
}

export interface RevenueAnalytics {
  total: number;
  monthly: Record<string, number>;
  by_method: Record<string, number>;
  outstanding: Record<string, number>;
  outstanding_total: number;
}

export interface DailyAttendance {
  date: string;
  total: number;
  present: number;
  rate: number;
}

export interface AttendanceAnalytics {
  rate: number;
  daily: DailyAttendance[];
  by_status: Record<string, number>;
}

export interface TopCourse {
  id: number;
  title: string;
  enrollments: number;
  completed: number;
  completion_rate: number;
}

export interface CourseAnalytics {
  completion_rate: number;
  total_enrollments: number;
  completed: number;
  top_courses: TopCourse[];
}

export interface TeacherPerformance {
  id: number;
  name: string;
  courses: number;
  enrollments: number;
  completed: number;
  completion_rate: number;
}

export interface CompetitionAnalyticsItem {
  id: number;
  name: string;
  type: string;
  status: string;
  teams: number;
  participants: number;
}

export interface CompetitionAnalytics {
  total_competitions: number;
  total_teams: number;
  competitions: CompetitionAnalyticsItem[];
  by_status: Record<string, number>;
  by_type: Record<string, number>;
}

export interface BranchPerformance {
  branch: string;
  students: number;
  active: number;
  revenue: number;
  attendance_rate: number;
}

export interface BranchAnalytics {
  branches: BranchPerformance[];
  total_branches: number;
}

export interface ProgressAnalytics {
  total: number;
  completed: number;
  average_progress: number;
  buckets: Record<string, number>;
}

export interface AnalyticsFilterOptions {
  branches: string[];
}
