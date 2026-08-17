import api from '@/lib/axios';
import type {
  AnalyticsFilterOptions,
  AnalyticsFilters,
  AnalyticsOverview,
  AttendanceAnalytics,
  BranchAnalytics,
  CompetitionAnalytics,
  CourseAnalytics,
  EnrollmentAnalytics,
  ProgressAnalytics,
  RevenueAnalytics,
  TeacherPerformance,
} from '@/types/analytics';

const unwrap = <T>(res: { data: { data: T } }): T => res.data.data;

const query = (filters?: AnalyticsFilters) => {
  const params: Record<string, string> = {};
  if (filters?.from) params.from = filters.from;
  if (filters?.to) params.to = filters.to;
  if (filters?.branch && filters.branch !== 'all') params.branch = filters.branch;
  return params;
};

export const analyticsApi = {
  overview: (filters?: AnalyticsFilters) =>
    api.get<{ data: AnalyticsOverview }>('/admin/analytics/overview', { params: query(filters) }).then(unwrap),

  enrollments: (filters?: AnalyticsFilters) =>
    api.get<{ data: EnrollmentAnalytics }>('/admin/analytics/enrollments', { params: query(filters) }).then(unwrap),

  revenue: (filters?: AnalyticsFilters) =>
    api.get<{ data: RevenueAnalytics }>('/admin/analytics/revenue', { params: query(filters) }).then(unwrap),

  attendance: (filters?: AnalyticsFilters) =>
    api.get<{ data: AttendanceAnalytics }>('/admin/analytics/attendance', { params: query(filters) }).then(unwrap),

  courses: (filters?: AnalyticsFilters) =>
    api.get<{ data: CourseAnalytics }>('/admin/analytics/courses', { params: query(filters) }).then(unwrap),

  teachers: (filters?: AnalyticsFilters) =>
    api.get<{ data: TeacherPerformance[] }>('/admin/analytics/teachers', { params: query(filters) }).then(unwrap),

  competitions: (filters?: AnalyticsFilters) =>
    api.get<{ data: CompetitionAnalytics }>('/admin/analytics/competitions', { params: query(filters) }).then(unwrap),

  branches: (filters?: AnalyticsFilters) =>
    api.get<{ data: BranchAnalytics }>('/admin/analytics/branches', { params: query(filters) }).then(unwrap),

  progress: (filters?: AnalyticsFilters) =>
    api.get<{ data: ProgressAnalytics }>('/admin/analytics/progress', { params: query(filters) }).then(unwrap),

  filterOptions: () =>
    api.get<{ data: AnalyticsFilterOptions }>('/admin/analytics/filter-options').then(unwrap),
};
