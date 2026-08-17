import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  useMyCompetitionTeams,
  useCompetitionStudentOptions,
  useAddTeamMember,
  useRemoveTeamMember,
  useSubmitCompetitionTeam,
} from '@/hooks/useCompetitions';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageSpinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Users, Plus, Trash2, Send, ExternalLink } from 'lucide-react';
import type { CompetitionTeam } from '@/types/competitions';

export default function MyCompetitionsPage() {
  const navigate = useNavigate();
  const { data: teams, isLoading } = useMyCompetitionTeams();
  const addMember = useAddTeamMember();
  const removeMember = useRemoveTeamMember();
  const submitTeam = useSubmitCompetitionTeam();

  const [memberTeamId, setMemberTeamId] = useState<number | null>(null);
  const [memberSearch, setMemberSearch] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');

  const [submitTeamId, setSubmitTeamId] = useState<number | null>(null);
  const [submissionUrl, setSubmissionUrl] = useState('');
  const [submitTitle, setSubmitTitle] = useState('');

  const { data: studentOptions } = useCompetitionStudentOptions(memberSearch);

  const selectTeam = (id: number) => {
    setMemberTeamId(id);
    setMemberSearch('');
    setSelectedStudentId('');
  };

  const handleAddMember = () => {
    if (!memberTeamId || !selectedStudentId) return;
    addMember.mutate(
      { teamId: memberTeamId, data: { student_id: Number(selectedStudentId) } },
      { onSuccess: () => setSelectedStudentId('') }
    );
  };

  const handleSubmit = (team: CompetitionTeam) => {
    if (!submissionUrl.trim()) return;
    submitTeam.mutate(
      { teamId: team.id, data: { submission_url: submissionUrl.trim(), project_title: submitTitle.trim() || null } },
      {
        onSuccess: () => {
          setSubmitTeamId(null);
          setSubmissionUrl('');
          setSubmitTitle('');
        },
      }
    );
  };

  if (isLoading) return <PageSpinner />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Competitions"
        description="Teams you lead or participate in"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'My Competitions' }]}
      />

      {!teams || teams.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No teams yet"
          description="Register a team from a competition page to get started."
          action={{ label: 'Browse Competitions', onClick: () => navigate('/competitions') }}
        />
      ) : (
        <div className="space-y-4">
          {teams.map((team) => {
            const isLeader = team.is_leader === true;
            const registrationOpen = team.competition?.status === 'registration_open';
            const canSubmit =
              team.competition?.status === 'ongoing' || team.competition?.status === 'registration_open';

            return (
              <Card key={team.id}>
                <CardContent className="p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-semibold text-slate-900">{team.name}</h3>
                        <StatusBadge status={team.status} />
                      </div>
                      <p className="text-sm text-slate-500">
                        {team.competition?.name ?? `Competition #${team.competition_id}`} · Leader:{' '}
                        {team.leader?.full_name ?? '—'}
                      </p>
                      {team.project_title && (
                        <p className="text-sm text-slate-600">Project: {team.project_title}</p>
                      )}
                      {team.submission_url && (
                        <p className="text-sm text-slate-600">
                          <a
                            href={team.submission_url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-brand-600 hover:underline"
                          >
                            Submission <ExternalLink className="h-3 w-3" />
                          </a>
                        </p>
                      )}
                    </div>
                    <Link to={`/competitions/${team.competition_id}`}>
                      <Button variant="outline" size="sm">View Competition</Button>
                    </Link>
                  </div>

                  <div className="mt-4">
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                        Members ({team.members?.length ?? 0})
                      </p>
                      {registrationOpen && !isLeader && team.status !== 'submitted' && (
                        <p className="text-xs text-slate-400">Only the team leader can manage members.</p>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(team.members ?? []).map((m) => (
                        <span
                          key={m.id}
                          className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
                        >
                          {m.full_name}
                          {m.id === team.leader_student_id && (
                            <span className="rounded bg-brand-100 px-1.5 py-0.5 text-[10px] font-semibold text-brand-700">
                              LEADER
                            </span>
                          )}
                          {registrationOpen && m.id !== team.leader_student_id && (
                            <button
                              className="text-slate-400 hover:text-red-500"
                              onClick={() => removeMember.mutate({ teamId: team.id, studentId: m.id })}
                              title="Remove member"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>

                  {registrationOpen && isLeader && team.status !== 'submitted' && (
                    <div className="mt-4 rounded-lg border border-slate-200 p-4">
                      <p className="mb-2 flex items-center gap-1 text-sm font-medium text-slate-700">
                        <Plus className="h-4 w-4" /> Add member
                      </p>
                      <div className="flex flex-wrap items-center gap-2">
                        <Input
                          className="w-full sm:w-64"
                          placeholder="Search by name or student ID..."
                          value={memberSearch}
                          onChange={(e) => {
                            setMemberSearch(e.target.value);
                            if (memberTeamId !== team.id) selectTeam(team.id);
                          }}
                          onFocus={() => {
                            if (memberTeamId !== team.id) selectTeam(team.id);
                          }}
                        />
                        {memberTeamId === team.id && (studentOptions ?? []).length > 0 && (
                          <select
                            className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm"
                            value={selectedStudentId}
                            onChange={(e) => setSelectedStudentId(e.target.value)}
                          >
                            <option value="">Select student...</option>
                            {studentOptions?.map((s) => (
                              <option key={s.id} value={s.id}>
                                {s.full_name} ({s.student_id}){s.grade ? ` · ${s.grade}` : ''}
                              </option>
                            ))}
                          </select>
                        )}
                        <Button
                          onClick={handleAddMember}
                          disabled={!selectedStudentId || addMember.isPending}
                          size="sm"
                        >
                          {addMember.isPending ? 'Adding...' : 'Add'}
                        </Button>
                      </div>
                    </div>
                  )}

                  {canSubmit && team.status !== 'submitted' && isLeader && (
                    <div className="mt-4 rounded-lg border border-slate-200 p-4">
                      <p className="mb-2 flex items-center gap-1 text-sm font-medium text-slate-700">
                        <Send className="h-4 w-4" /> Submit project
                      </p>
                      <div className="flex flex-wrap items-end gap-2">
                        <Input
                          className="w-full sm:flex-1"
                          placeholder="Submission URL (e.g. GitHub repo)"
                          value={submitTeamId === team.id ? submissionUrl : ''}
                          onChange={(e) => {
                            setSubmitTeamId(team.id);
                            setSubmissionUrl(e.target.value);
                          }}
                        />
                        <Input
                          className="w-full sm:w-56"
                          placeholder="Project title"
                          value={submitTeamId === team.id ? submitTitle : ''}
                          onChange={(e) => {
                            setSubmitTeamId(team.id);
                            setSubmitTitle(e.target.value);
                          }}
                        />
                        <Button onClick={() => handleSubmit(team)} disabled={submitTeam.isPending} size="sm">
                          {submitTeam.isPending ? 'Submitting...' : 'Submit'}
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
