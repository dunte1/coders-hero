import { Award, Trophy, Star, Lock } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatRelativeDate } from '@/lib/utils';
import { useBadges } from '@/hooks/useGamification';
import { cn } from '@/lib/utils';

export default function AchievementsPage() {
  const { data: badgesData, isLoading } = useBadges();

  if (isLoading) return <Spinner />;

  const badges = badgesData ?? [];
  const earnedBadges = badges.filter((b) => b.earned);
  const unearnedBadges = badges.filter((b) => !b.earned);

  if (badges.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Achievements"
          description="Your badges and achievements."
          breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Achievements' }]}
        />
        <Card>
          <CardContent className="py-12">
            <EmptyState
              icon={Award}
              title="No badges available"
              description="Complete courses and activities to earn badges."
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Achievements"
        description="Your badges and achievements."
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Achievements' }]}
      />

      <div className="flex items-center gap-3">
        <Badge variant="default">{earnedBadges.length} Earned</Badge>
        <Badge variant="secondary">{unearnedBadges.length} Locked</Badge>
      </div>

      {earnedBadges.length > 0 && (
        <div>
          <h2 className="mb-3 text-lg font-semibold text-slate-900">Earned</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {earnedBadges.map((badge) => (
              <Card key={badge.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-2xl">
                      {badge.icon ? (
                        <span>{badge.icon}</span>
                      ) : (
                        <Trophy className="h-7 w-7 text-brand-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-900">{badge.name}</h3>
                      <p className="mt-1 text-sm text-slate-500 line-clamp-2">{badge.description}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <Badge variant="success">Earned</Badge>
                        <span className="text-xs text-slate-400">
                          {badge.points} pts
                        </span>
                      </div>
                      {badge.earned_at && (
                        <p className="mt-1 text-xs text-slate-400">
                          Earned {formatRelativeDate(badge.earned_at)}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {unearnedBadges.length > 0 && (
        <div>
          <h2 className="mb-3 text-lg font-semibold text-slate-900">Locked</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {unearnedBadges.map((badge) => (
              <Card key={badge.id} className="opacity-60">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-2xl">
                      {badge.icon ? (
                        <span className="grayscale">{badge.icon}</span>
                      ) : (
                        <Lock className="h-7 w-7 text-slate-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-700">{badge.name}</h3>
                      <p className="mt-1 text-sm text-slate-400 line-clamp-2">{badge.description}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <Badge variant="secondary">Locked</Badge>
                        <span className="text-xs text-slate-400">
                          {badge.points} pts
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
