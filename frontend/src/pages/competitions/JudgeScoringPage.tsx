import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCompetition, useSubmitCompetitionScores } from '@/hooks/useCompetitions';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageSpinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { EmptyState } from '@/components/ui/EmptyState';
import { ArrowLeft, Gavel } from 'lucide-react';
import type { CompetitionTeam } from '@/types/competitions';

export default function JudgeScoringPage() {
  const { id } = useParams<{ id: string }>();
  const competitionId = Number(id);
  const navigate = useNavigate();

  const { data: competition, isLoading } = useCompetition(competitionId);
  const submitScores = useSubmitCompetitionScores();

  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const [scores, setScores] = useState<Record<number, string>>({});
  const [remarks, setRemarks] = useState<Record<number, string>>({});

  if (isLoading) return <PageSpinner />;
  if (!competition) {
    return (
      <EmptyState
        icon={Gavel}
        title="Competition not found"
        description="The competition may have been deleted."
        action={{ label: 'Back to Competitions', onClick: () => navigate('/competitions') }}
      />
    );
  }

  const teams = (competition.teams ?? []).filter((t) => t.status !== 'disqualified');
  const criteria = competition.criteria ?? [];
  const selectedTeam = teams.find((t) => t.id === selectedTeamId);

  const handleSubmit = () => {
    if (!selectedTeam) return;
    const entries = criteria
      .map((c) => ({
        criterion_id: c.id,
        score: Number(scores[c.id]),
        remarks: remarks[c.id]?.trim() || null,
      }))
      .filter((e) => !Number.isNaN(e.score));
    if (entries.length === 0) return;
    submitScores.mutate(
      { competitionId, data: { team_id: selectedTeam.id, scores: entries } },
      {
        onSuccess: () => {
          setScores({});
          setRemarks({});
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Judge: ${competition.name}`}
        description="Submit scores for each criterion"
        breadcrumbs={[
          { label: 'Competitions', href: '/competitions' },
          { label: competition.name, href: `/competitions/${competitionId}` },
          { label: 'Judge Scoring' },
        ]}
        actions={
          <Button variant="outline" onClick={() => navigate(`/competitions/${competitionId}`)}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-slate-700">Select a team</h3>
          {teams.length === 0 ? (
            <p className="text-sm text-slate-500">No eligible teams.</p>
          ) : (
            teams.map((team: CompetitionTeam) => (
              <button
                key={team.id}
                onClick={() => setSelectedTeamId(team.id)}
                className={`w-full rounded-lg border p-3 text-left transition-colors ${
                  selectedTeamId === team.id
                    ? 'border-brand-500 bg-brand-50'
                    : 'border-slate-200 bg-white hover:border-brand-300'
                }`}
              >
                <p className="text-sm font-medium text-slate-900">{team.name}</p>
                <p className="text-xs text-slate-500">
                  {team.project_title || 'No project title'}
                  {team.members_count ? ` · ${team.members_count} members` : ''}
                </p>
              </button>
            ))
          )}
        </div>

        <div className="lg:col-span-2">
          {selectedTeam ? (
            <Card>
              <CardHeader>
                <CardTitle>{selectedTeam.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                {criteria.length === 0 ? (
                  <p className="text-sm text-slate-500">No judging criteria set yet. Please ask the organizer to add criteria.</p>
                ) : (
                  criteria.map((c) => (
                    <div key={c.id} className="grid gap-2 sm:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium text-slate-700">
                          {c.name} <span className="text-xs font-normal text-slate-500">(max {c.max_score} pts)</span>
                        </label>
                        {c.description && <p className="text-xs text-slate-500">{c.description}</p>}
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min={0}
                          max={c.max_score}
                          step={0.5}
                          value={scores[c.id] ?? ''}
                          onChange={(e) => setScores((s) => ({ ...s, [c.id]: e.target.value }))}
                          placeholder={`0 - ${c.max_score}`}
                        />
                        <Textarea
                          className="flex-1"
                          rows={1}
                          value={remarks[c.id] ?? ''}
                          onChange={(e) => setRemarks((r) => ({ ...r, [c.id]: e.target.value }))}
                          placeholder="Remarks (optional)"
                        />
                      </div>
                    </div>
                  ))
                )}
                {criteria.length > 0 && (
                  <div className="flex justify-end">
                    <Button onClick={handleSubmit} disabled={submitScores.isPending}>
                      {submitScores.isPending ? 'Submitting...' : 'Submit Scores'}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8 text-center text-sm text-slate-500">
                Select a team from the list to begin scoring.
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
