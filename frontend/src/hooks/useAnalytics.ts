import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '@/lib/analyticsApi';
import type { AnalyticsFilters } from '@/types/analytics';

export function useAnalyticsOverview(filters?: AnalyticsFilters) {
  return useQuery({ queryKey: ['analytics', 'overview', filters], queryFn: () => analyticsApi.overview(filters) });
}

export function useEnrollmentAnalytics(filters?: AnalyticsFilters) {
  return useQuery({ queryKey: ['analytics', 'enrollments', filters], queryFn: () => analyticsApi.enrollments(filters) });
}

export function useRevenueAnalytics(filters?: AnalyticsFilters) {
  return useQuery({ queryKey: ['analytics', 'revenue', filters], queryFn: () => analyticsApi.revenue(filters) });
}

export function useAttendanceAnalytics(filters?: AnalyticsFilters) {
  return useQuery({ queryKey: ['analytics', 'attendance', filters], queryFn: () => analyticsApi.attendance(filters) });
}

export function useCourseAnalytics(filters?: AnalyticsFilters) {
  return useQuery({ queryKey: ['analytics', 'courses', filters], queryFn: () => analyticsApi.courses(filters) });
}

export function useTeacherAnalytics(filters?: AnalyticsFilters) {
  return useQuery({ queryKey: ['analytics', 'teachers', filters], queryFn: () => analyticsApi.teachers(filters) });
}

export function useCompetitionAnalytics(filters?: AnalyticsFilters) {
  return useQuery({ queryKey: ['analytics', 'competitions', filters], queryFn: () => analyticsApi.competitions(filters) });
}

export function useBranchAnalytics(filters?: AnalyticsFilters) {
  return useQuery({ queryKey: ['analytics', 'branches', filters], queryFn: () => analyticsApi.branches(filters) });
}

export function useProgressAnalytics(filters?: AnalyticsFilters) {
  return useQuery({ queryKey: ['analytics', 'progress', filters], queryFn: () => analyticsApi.progress(filters) });
}

export function useAnalyticsFilterOptions() {
  return useQuery({ queryKey: ['analytics', 'filter-options'], queryFn: () => analyticsApi.filterOptions() });
}
