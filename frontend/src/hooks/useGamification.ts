import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/api';
import api from '@/lib/axios';

export interface StreakData {
  current_streak: number;
  longest_streak: number;
  last_activity_at: string | null;
}

export interface Badge {
  id: number;
  name: string;
  description: string;
  icon: string;
  points: number;
  category: string;
  earned: boolean;
  earned_at: string | null;
}

export interface PointsEntry {
  id: number;
  points: number;
  reason: string;
  created_at: string;
}

export interface PointsData {
  total_points: number;
  recent_entries: PointsEntry[];
}

export interface LeaderboardEntry {
  user_id: number;
  user_name: string;
  total_points: number;
  rank: number;
}

const unwrap = <T>(res: { data: { data: T } }): T => res.data.data;

export function useStreak() {
  return useQuery({
    queryKey: ['gamification', 'streak'],
    queryFn: () => api.get('/gamification/streak').then(unwrap<StreakData>),
  });
}

export function useBadges() {
  return useQuery({
    queryKey: ['gamification', 'badges'],
    queryFn: () => api.get('/gamification/badges').then(unwrap<Badge[]>),
  });
}

export function usePoints() {
  return useQuery({
    queryKey: ['gamification', 'points'],
    queryFn: () => api.get('/gamification/points').then(unwrap<PointsData>),
  });
}

export function useLeaderboard() {
  return useQuery({
    queryKey: ['gamification', 'leaderboard'],
    queryFn: () => api.get('/gamification/leaderboard').then(unwrap<LeaderboardEntry[]>),
  });
}
