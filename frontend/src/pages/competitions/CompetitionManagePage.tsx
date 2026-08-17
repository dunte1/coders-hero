import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import {
  useCompetition,
  useCompetitionScores,
  useCreateCriterion,
  useDeleteCriterion,
  useAssignJudge,
  useRemoveJudge,
  useDisqualifyTeam,
  useVerifyCompetitionScore,
} from '@/hooks/useCompetitions';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageSpinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { ArrowLeft, Plus, Trash2, Gavel, CheckCircle2, ShieldAlert, ShieldCheck } from 'lucide-react';

interface AdminUser {
  id: string;
  name: string;
  email: string;
}

const unwrapUsers = (res: { data: { data: AdminUser[] } }): AdminUser[] => res.data.data;

export default function CompetitionManagePage() {
  const { id } = useParams<{ id: string }>();
  const competitionId = Number(id);
  const navigate = useNavigate();

  const { data: competition, isLoading } = useCompetition(competitionId);
  const { data: scores } = useCompetitionScores(competitionId);

  const { data: users } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: () => api.get<{ data: AdminUser[] }>('/admin/users', { params: { per_page: 200 } }).then(unwrapUsers),
  });

  const createCriterion = useCreateCriterion();
  const deleteCriterion = useDeleteCriterion();
  const assignJudge = useAssignJudge();
  const removeJudge = useRemoveJudge();
  const disqualifyTeam = useDisqualifyTeam();
  const verifyScore = useVerifyCompetitionScore();

  const [criterionName, setCriterionName] = useState('');
  const [criterionDesc, setCriterionDesc] = useState('');
  const [criterionMax, setCriterionMax] = useState('10');
  const [criterionWeight, setCriterionWeight] = useState('1');

  const [selectedJudgeId, setSelectedJudgeId] = useState('');
  const [judgeTitle, setJudgeTitle] = useState('');

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

  const handleAddCriterion = () => {
    createCriterion.mutate(
      {
        competitionId,
        data: {
          name: criterionName,
          description: criterionDesc || null,
          max_score: Number(criterionMax),
          weight: Number(criterionWeight) || 1,
        },
      },
      {
        onSuccess: () => {
          setCriterionName('');
          setCriterionDesc('');
          setCriterionMax('10');
          setCriterionWeight('1');
        },
      }
    );
  };

  const handleAssignJudge = () => {
    if (!selectedJudgeId) return;
    assignJudge.mutate(
      { competitionId, data: { user_id: selectedJudgeId, title: judgeTitle || null } },
      { onSuccess: () => { setSelectedJudgeId(''); setJudgeTitle(''); } }
    );
  };

  const judgeOptions = (users ?? []).filter(
    (u) => !competition.judges?.some((j) => j.id === u.id)
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Manage: ${competition.name}`}
        description="Criteria, judges, teams and score verification"
        breadcrumbs={[
          { label: 'Competitions', href: '/competitions' },
          { label: competition.name, href: `/competitions/${competitionId}` },
          { label: 'Manage' },
        ]}
        actions={
          <Button variant="outline" onClick={() => navigate(`/competitions/${competitionId}`)}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
        }
      />

      <Tabs defaultValue="criteria">
        <TabsList>
          <TabsTrigger value="criteria">Criteria</TabsTrigger>
          <TabsTrigger value="judges">Judges</TabsTrigger>
          <TabsTrigger value="teams">Teams</TabsTrigger>
          <TabsTrigger value="scores">Scores</TabsTrigger>
        </TabsList>

        <TabsContent value="criteria" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Add Criterion</CardTitle>
              <CardDescription>Scores use the max score; totals are weighted by weight.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Input label="Name *" value={criterionName} onChange={(e) => setCriterionName(e.target.value)} placeholder="e.g. Creativity" />
              <Input label="Max Score *" type="number" min={1} value={criterionMax} onChange={(e) => setCriterionMax(e.target.value)} />
              <Input label="Weight" type="number" min={1} value={criterionWeight} onChange={(e) => setCriterionWeight(e.target.value)} />
              <div className="flex items-end">
                <Button onClick={handleAddCriterion} disabled={!criterionName.trim() || createCriterion.isPending} className="w-full">
                  <Plus className="h-4 w-4 mr-1" /> Add
                </Button>
              </div>
              <div className="sm:col-span-2 lg:col-span-4">
                <Textarea label="Description (optional)" value={criterionDesc} onChange={(e) => setCriterionDesc(e.target.value)} rows={2} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-0">
              <ul className="divide-y divide-slate-100">
                {(competition.criteria ?? []).map((c) => (
                  <li key={c.id} className="flex items-center justify-between p-4">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{c.name}</p>
                      <p className="text-xs text-slate-500">
                        {c.max_score} pts × weight {c.weight}{c.description ? ` · ${c.description}` : ''}
                      </p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => deleteCriterion.mutate(c.id)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </li>
                ))}
                {(competition.criteria ?? []).length === 0 && (
                  <li className="p-4 text-sm text-slate-500">No criteria yet.</li>
                )}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="judges" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Assign Judge</CardTitle>
              <CardDescription>Judges can only access competitions they are assigned to.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700">User *</label>
                <select
                  value={selectedJudgeId}
                  onChange={(e) => setSelectedJudgeId(e.target.value)}
                  className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                >
                  <option value="">Select user...</option>
                  {judgeOptions.map((u) => (
                    <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                  ))}
                </select>
              </div>
              <Input label="Title (optional)" value={judgeTitle} onChange={(e) => setJudgeTitle(e.target.value)} placeholder="e.g. Lead Judge" />
              <div className="flex items-end">
                <Button onClick={handleAssignJudge} disabled={!selectedJudgeId || assignJudge.isPending} className="w-full">
                  <Gavel className="h-4 w-4 mr-1" /> Assign
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-0">
              <ul className="divide-y divide-slate-100">
                {(competition.judges ?? []).map((judge) => (
                  <li key={judge.id} className="flex items-center justify-between p-4">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{judge.name}</p>
                      <p className="text-xs text-slate-500">{judge.title ?? 'Judge'}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => removeJudge.mutate({ competitionId, userId: judge.id })}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </li>
                ))}
                {(competition.judges ?? []).length === 0 && (
                  <li className="p-4 text-sm text-slate-500">No judges assigned.</li>
                )}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="teams" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <ul className="divide-y divide-slate-100">
                {(competition.teams ?? []).map((team) => (
                  <li key={team.id} className="flex items-center justify-between gap-3 p-4">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{team.name}</p>
                      <p className="text-xs text-slate-500">
                        Leader: {team.leader?.full_name ?? '—'} · {team.members_count ?? team.members?.length ?? 0} members
                        {team.project_title ? ` · ${team.project_title}` : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={team.status} />
                      {team.status !== 'disqualified' ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => disqualifyTeam.mutate({ teamId: team.id, disqualified: true })}
                        >
                          <ShieldAlert className="h-4 w-4 mr-1 text-red-500" /> Disqualify
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => disqualifyTeam.mutate({ teamId: team.id, disqualified: false })}
                        >
                          <ShieldCheck className="h-4 w-4 mr-1 text-green-600" /> Re-instate
                        </Button>
                      )}
                    </div>
                  </li>
                ))}
                {(competition.teams ?? []).length === 0 && (
                  <li className="p-4 text-sm text-slate-500">No teams registered.</li>
                )}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scores" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <ul className="divide-y divide-slate-100">
                {(scores ?? []).map((score) => (
                  <li key={score.id} className="flex items-center justify-between gap-3 p-4">
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {score.team?.name ?? `Team #${score.competition_team_id}`} · {score.criterion?.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {score.score} pts by {score.judge?.name ?? '—'}
                        {score.remarks ? ` · ${score.remarks}` : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {score.verified_at ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600">
                          <CheckCircle2 className="h-4 w-4" /> Verified
                        </span>
                      ) : (
                        <Button variant="outline" size="sm" onClick={() => verifyScore.mutate(score.id)}>
                          <CheckCircle2 className="h-4 w-4 mr-1" /> Verify
                        </Button>
                      )}
                    </div>
                  </li>
                ))}
                {(scores ?? []).length === 0 && (
                  <li className="p-4 text-sm text-slate-500">No scores submitted yet.</li>
                )}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
