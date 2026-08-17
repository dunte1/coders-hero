import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCompetitionResults } from '@/hooks/useCompetitions';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageSpinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ArrowLeft, Award, Trophy, Crown, Medal } from 'lucide-react';

const rankIcon = (rank: number) => {
  if (rank === 1) return <Crown className="h-5 w-5 text-amber-400" />;
  if (rank === 2) return <Medal className="h-5 w-5 text-slate-400" />;
  if (rank === 3) return <Medal className="h-5 w-5 text-orange-400" />;
  return <Trophy className="h-4 w-4 text-slate-300" />;
};

export default function CompetitionLeaderboardPage() {
  const { id } = useParams<{ id: string }>();
  const competitionId = Number(id);
  const navigate = useNavigate();

  const { data: results, isLoading } = useCompetitionResults(competitionId);
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);

  if (isLoading) return <PageSpinner />;
  if (!results) {
    return (
      <EmptyState
        icon={Award}
        title="No results yet"
        description="Results will appear once the competition is completed."
        action={{ label: 'Back', onClick: () => navigate(`/competitions/${competitionId}`) }}
      />
    );
  }

  const selected = results.rankings.find((r) => r.team.id === selectedTeamId);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leaderboard"
        description={results.competition.name}
        breadcrumbs={[
          { label: 'Competitions', href: '/competitions' },
          { label: results.competition.name, href: `/competitions/${competitionId}` },
          { label: 'Leaderboard' },
        ]}
        actions={
          <Button variant="outline" onClick={() => navigate(`/competitions/${competitionId}`)}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
        }
      />

      <div className="flex items-center gap-2">
        <StatusBadge status={results.competition.status} />
        <span className="text-sm text-slate-500">
          Weighted averages across {results.criteria.length} criteria
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="p-0">
            <ul className="divide-y divide-slate-100">
              {results.rankings.map((row) => (
                <li key={row.team.id}>
                  <button
                    onClick={() => setSelectedTeamId(row.team.id)}
                    className={`flex w-full items-center justify-between gap-3 p-4 text-left transition-colors ${
                      selectedTeamId === row.team.id ? 'bg-brand-50' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-sm font-semibold text-white">
                        {row.rank}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{row.team.name}</p>
                        <p className="text-xs text-slate-500">
                          {row.team.leader?.full_name ?? '—'} · {row.team.member_count} members
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-brand-600">{row.percentage}%</span>
                      <span className="text-xs text-slate-400">{row.total_score}/{row.max_score}</span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {selected && (
          <Card>
            <CardContent className="space-y-4 p-5">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-600 text-white">
                  {rankIcon(selected.rank)}
                </span>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">{selected.team.name}</h3>
                  <p className="text-sm text-slate-500">
                    Rank #{selected.rank} · {selected.percentage}% · {selected.total_score}/{selected.max_score} points
                  </p>
                </div>
              </div>
              {selected.team.project_title && (
                <p className="text-sm text-slate-600">Project: {selected.team.project_title}</p>
              )}
              {selected.team.submission_url && (
                <p className="text-sm text-slate-600">
                  Submission:{' '}
                  <a href={selected.team.submission_url} target="_blank" rel="noreferrer" className="text-brand-600 hover:underline">
                    {selected.team.submission_url}
                  </a>
                </p>
              )}
              <div className="rounded-lg border border-slate-200">
                {selected.breakdown.map((b) => (
                  <div key={b.criterion_id} className="flex items-center justify-between border-b border-slate-100 px-4 py-2.5 text-sm last:border-0">
                    <span className="text-slate-600">{b.name}</span>
                    <span className="font-medium text-slate-800">
                      {b.average_score === null ? '—' : `${b.average_score}/${b.max_score}`}
                      <span className="ml-2 text-xs text-slate-400">avg of {b.judge_count} judge(s) ×{b.weight}</span>
                    </span>
                  </div>
                ))}
              </div>
              {selected.team.members.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selected.team.members.map((m) => (
                    <span key={m.id} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                      {m.full_name}
                    </span>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
