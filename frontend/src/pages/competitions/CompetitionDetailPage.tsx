import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  useCompetition,
  useCompetitionLeaderboard,
  useRegisterTeam,
  useChangeCompetitionStatus,
} from '@/hooks/useCompetitions';
import { useAuthStore } from '@/store/authStore';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageSpinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Label } from '@/components/ui/Label';
import {
  SelectRoot,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/Select';
import {
  Trophy,
  Users,
  CalendarRange,
  MapPin,
  Scale,
  ArrowLeft,
  Gavel,
  ClipboardList,
  Award,
} from 'lucide-react';
import { COMPETITION_STATUS_TRANSITIONS, competitionTypeLabel } from '@/lib/competitionOptions';

const STAFF_ROLES = ['admin', 'super_admin', 'teacher', 'instructor'];

export default function CompetitionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const competitionId = Number(id);
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const userRole = user?.role?.name?.toLowerCase() || 'employee';
  const isStaff = STAFF_ROLES.includes(userRole);

  const { data: competition, isLoading } = useCompetition(competitionId);
  const { data: leaderboard } = useCompetitionLeaderboard(competitionId, true);
  const registerTeam = useRegisterTeam();
  const changeStatus = useChangeCompetitionStatus();

  const [registerOpen, setRegisterOpen] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [projectTitle, setProjectTitle] = useState('');
  const [teamDescription, setTeamDescription] = useState('');

  if (isLoading) return <PageSpinner />;
  if (!competition) {
    return (
      <EmptyState
        icon={Trophy}
        title="Competition not found"
        description="The competition may have been deleted."
        action={{ label: 'Back to Competitions', onClick: () => navigate('/competitions') }}
      />
    );
  }

  const transitions = COMPETITION_STATUS_TRANSITIONS[competition.status] || [];

  const handleRegister = () => {
    registerTeam.mutate(
      { competitionId, data: { name: teamName, project_title: projectTitle || null, description: teamDescription || null } },
      {
        onSuccess: () => {
          setRegisterOpen(false);
          setTeamName('');
          setProjectTitle('');
          setTeamDescription('');
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={competition.name}
        description={competitionTypeLabel(competition.type)}
        breadcrumbs={[{ label: 'Competitions', href: '/competitions' }, { label: competition.name }]}
        actions={
          <>
            <Button variant="outline" onClick={() => navigate('/competitions')}>
              <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </Button>
            {isStaff && (
              <Button onClick={() => navigate(`/competitions/${competitionId}/manage`)}>
                <ClipboardList className="h-4 w-4 mr-1" /> Manage
              </Button>
            )}
            {userRole === 'judge' && (
              <Button onClick={() => navigate(`/competitions/${competitionId}/judge`)}>
                <Gavel className="h-4 w-4 mr-1" /> Score Teams
              </Button>
            )}
          </>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <StatusBadge status={competition.status} />
        <span className="inline-flex items-center gap-1 text-sm text-slate-500">
          <CalendarRange className="h-4 w-4" />
          {competition.start_date
            ? `${new Date(competition.start_date).toLocaleDateString()}${competition.end_date ? ' – ' + new Date(competition.end_date).toLocaleDateString() : ''}`
            : 'Dates TBA'}
        </span>
        {competition.venue && (
          <span className="inline-flex items-center gap-1 text-sm text-slate-500">
            <MapPin className="h-4 w-4" /> {competition.venue}
          </span>
        )}
        <span className="inline-flex items-center gap-1 text-sm text-slate-500">
          <Users className="h-4 w-4" /> {competition.max_team_size} max per team
        </span>
      </div>

      {isStaff && transitions.length > 0 && (
        <Card>
          <CardContent className="p-4 flex flex-wrap items-center gap-3">
            <span className="text-sm font-medium text-slate-700">Change status:</span>
            <SelectRoot value="" onValueChange={(s) => changeStatus.mutate({ id: competitionId, status: s })}>
              <SelectTrigger className="w-52"><SelectValue placeholder="Select next status" /></SelectTrigger>
              <SelectContent>
                {transitions.map((s) => (
                  <SelectItem key={s} value={s}>{s.replace(/_/g, ' ')}</SelectItem>
                ))}
              </SelectContent>
            </SelectRoot>
          </CardContent>
        </Card>
      )}

      {competition.status === 'registration_open' && userRole === 'student' && !registerOpen && (
        <Card className="border-brand-200 bg-brand-50/50">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-800">Registration is open</p>
              <p className="text-xs text-slate-500">Register a team to participate in this competition.</p>
            </div>
            <Button onClick={() => setRegisterOpen(true)}>Register Team</Button>
          </CardContent>
        </Card>
      )}

      {registerOpen && (
        <Card>
          <CardHeader>
            <CardTitle>Register Your Team</CardTitle>
            <CardDescription>You will become the team leader.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="team-name">Team Name</Label>
              <Input id="team-name" value={teamName} onChange={(e) => setTeamName(e.target.value)} placeholder="e.g. CodeBusters" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="project-title">Project Title (optional)</Label>
              <Input id="project-title" value={projectTitle} onChange={(e) => setProjectTitle(e.target.value)} placeholder="e.g. Smart Campus App" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="team-description">Description (optional)</Label>
              <Textarea id="team-description" value={teamDescription} onChange={(e) => setTeamDescription(e.target.value)} rows={3} />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setRegisterOpen(false)}>Cancel</Button>
              <Button onClick={handleRegister} disabled={!teamName.trim() || registerTeam.isPending}>
                {registerTeam.isPending ? 'Registering...' : 'Register'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>About</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-slate-600">
            <p>{competition.description || 'No description provided.'}</p>
            {competition.rules && competition.rules.length > 0 && (
              <div>
                <h4 className="mb-2 flex items-center gap-1 font-semibold text-slate-800">
                  <Scale className="h-4 w-4" /> Rules
                </h4>
                <ul className="list-disc pl-5 space-y-1">
                  {competition.rules.map((rule, i) => (
                    <li key={i}>{rule}</li>
                  ))}
                </ul>
              </div>
            )}
            <p>
              Registration deadline:{' '}
              {competition.registration_deadline
                ? new Date(competition.registration_deadline).toLocaleString()
                : 'Not set'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Judging Criteria</CardTitle>
              <CardDescription>{competition.criteria?.length ?? 0} criteria</CardDescription>
            </div>
            <Trophy className="h-5 w-5 text-brand-500" />
          </CardHeader>
          <CardContent>
            {competition.criteria && competition.criteria.length > 0 ? (
              <ul className="divide-y divide-slate-100">
                {competition.criteria.map((c) => (
                  <li key={c.id} className="flex items-center justify-between py-2.5">
                    <div>
                      <p className="text-sm font-medium text-slate-800">{c.name}</p>
                      {c.description && <p className="text-xs text-slate-500">{c.description}</p>}
                    </div>
                    <div className="text-right text-xs text-slate-500">
                      <p>{c.max_score} pts</p>
                      <p>×{c.weight}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-500">No criteria set yet.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Teams</CardTitle>
            <CardDescription>{competition.teams_count ?? 0} registered</CardDescription>
          </div>
          <Users className="h-5 w-5 text-brand-500" />
        </CardHeader>
        <CardContent>
          {competition.teams && competition.teams.length > 0 ? (
            <ul className="divide-y divide-slate-100">
              {competition.teams.map((team) => (
                <li key={team.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{team.name}</p>
                    <p className="text-xs text-slate-500">
                      Leader: {team.leader?.full_name ?? '—'} · {team.members_count ?? team.members?.length ?? 0} members
                    </p>
                    {team.project_title && (
                      <p className="text-xs text-slate-500">Project: {team.project_title}</p>
                    )}
                  </div>
                  <StatusBadge status={team.status} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-500">No teams registered yet.</p>
          )}
        </CardContent>
      </Card>

      {leaderboard && leaderboard.rankings.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Leaderboard</CardTitle>
              <CardDescription>Weighted scores across all judges</CardDescription>
            </div>
            <Award className="h-5 w-5 text-brand-500" />
          </CardHeader>
          <CardContent>
            <ul className="divide-y divide-slate-100">
              {leaderboard.rankings.map((row) => (
                <li key={row.team.id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-600 text-xs font-semibold text-white">
                      {row.rank}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{row.team.name}</p>
                      <p className="text-xs text-slate-500">{row.total_score} / {row.max_score} points</p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-brand-600">{row.percentage}%</span>
                </li>
              ))}
            </ul>
            <div className="mt-4">
              <Link to={`/competitions/${competitionId}/leaderboard`}>
                <Button variant="outline" size="sm">Full Leaderboard</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
