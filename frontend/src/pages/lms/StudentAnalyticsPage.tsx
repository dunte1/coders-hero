import { Trophy, Flame, Award, BookOpen, TrendingUp } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { StatsCard } from '@/components/ui/StatsCard';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatRelativeDate } from '@/lib/utils';
import { useStreak, useBadges, usePoints } from '@/hooks/useGamification';

export default function StudentAnalyticsPage() {
  const { data: streakData, isLoading: streakLoading } = useStreak();
  const { data: badgesData, isLoading: badgesLoading } = useBadges();
  const { data: pointsData, isLoading: pointsLoading } = usePoints();

  const isLoading = streakLoading || badgesLoading || pointsLoading;

  if (isLoading) return <Spinner />;

  const badges = badgesData ?? [];
  const earnedBadges = badges.filter((b) => b.earned);
  const totalPoints = pointsData?.total_points ?? 0;
  const currentStreak = streakData?.current_streak ?? 0;
  const recentEntries = pointsData?.recent_entries ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Analytics"
        description="Track your learning progress and achievements."
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Analytics' }]}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard icon={TrendingUp} title="Total Points" value={totalPoints} color="brand" />
        <StatsCard icon={Flame} title="Current Streak" value={`${currentStreak} days`} color="amber" />
        <StatsCard icon={Award} title="Badges Earned" value={earnedBadges.length} color="purple" />
        <StatsCard icon={BookOpen} title="Courses Completed" value={0} color="emerald" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Points Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {recentEntries.length === 0 ? (
              <EmptyState title="No activity yet" description="Start learning to earn points!" />
            ) : (
              <div className="space-y-3">
                {recentEntries.map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between rounded-lg border border-slate-100 p-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-50 text-xs font-medium text-brand-600">
                        +{entry.points}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{entry.reason}</p>
                        <p className="text-xs text-slate-400">{formatRelativeDate(entry.created_at)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Streak Info</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 rounded-lg bg-amber-50 p-4">
              <Flame className="h-10 w-10 text-amber-500" />
              <div>
                <p className="text-2xl font-bold text-slate-900">{currentStreak} days</p>
                <p className="text-sm text-slate-500">Current learning streak</p>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-4 rounded-lg bg-slate-50 p-4">
              <TrendingUp className="h-10 w-10 text-slate-400" />
              <div>
                <p className="text-2xl font-bold text-slate-900">{streakData?.longest_streak ?? 0} days</p>
                <p className="text-sm text-slate-500">Longest streak</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
