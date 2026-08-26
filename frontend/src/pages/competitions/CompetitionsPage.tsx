import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCompetitions, useCompetitionSummary } from '@/hooks/useCompetitions';
import { useAuthStore } from '@/store/authStore';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageSpinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { StatsCard } from '@/components/ui/StatsCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { SearchInput } from '@/components/ui/SearchInput';
import { Pagination } from '@/components/ui/Pagination';
import {
  SelectRoot,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/Select';
import { Trophy, Users, CheckCircle2, CalendarRange, Plus, ArrowRight } from 'lucide-react';
import { COMPETITION_TYPES, COMPETITION_STATUSES } from '@/lib/competitionOptions';
import type { CompetitionType, CompetitionStatus } from '@/types/competitions';

const STAFF_ROLES = ['admin', 'super_admin', 'teacher', 'instructor'];

export default function CompetitionsPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const userRole = user?.role?.name?.toLowerCase() || 'employee';
  const isStaff = STAFF_ROLES.includes(userRole);

  const [type, setType] = useState<CompetitionType | 'all'>('all');
  const [status, setStatus] = useState<CompetitionStatus | 'all'>('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useCompetitions({
    page,
    type: type === 'all' ? undefined : type,
    status: status === 'all' ? undefined : status,
    search: search || undefined,
  });
  const { data: summary } = useCompetitionSummary();

  const competitions = data?.results || [];
  const totalPages = data?.meta?.last_page ?? 1;
  const totalCount = data?.meta?.total ?? 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Competitions"
        description="Coding challenges, robotics battles and innovation events"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Competitions' }]}
        actions={
          isStaff && (
            <Button onClick={() => navigate('/competitions/create')}>
              <Plus className="h-4 w-4 mr-1" /> New Competition
            </Button>
          )
        }
      />

      {isStaff && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard icon={Trophy} title="Total Competitions" value={summary?.total_competitions ?? 0} />
          <StatsCard icon={CalendarRange} title="Active" value={summary?.active_competitions ?? 0} />
          <StatsCard icon={CheckCircle2} title="Completed" value={summary?.completed_competitions ?? 0} />
          <StatsCard icon={Users} title="Teams Registered" value={summary?.total_teams ?? 0} />
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <SearchInput value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search competitions..." className="w-full sm:w-64" />
        <SelectRoot value={type} onValueChange={(v) => setType(v as CompetitionType | 'all')}>
          <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {COMPETITION_TYPES.map((t) => (
              <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
            ))}
          </SelectContent>
        </SelectRoot>
        <SelectRoot value={status} onValueChange={(v) => setStatus(v as CompetitionStatus | 'all')}>
          <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {COMPETITION_STATUSES.map((s) => (
              <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
            ))}
          </SelectContent>
        </SelectRoot>
      </div>

      {isLoading ? (
        <PageSpinner />
      ) : isError ? (
        <EmptyState icon={Trophy} title="Could not load competitions" description="Please try again later." />
      ) : competitions.length === 0 ? (
        <EmptyState icon={Trophy} title="No competitions found" description="Try adjusting your filters." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {competitions.map((competition) => (
            <Card key={competition.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                    <Trophy className="h-5 w-5" />
                  </div>
                  <StatusBadge status={competition.status} />
                </div>
                <h3 className="mt-4 font-semibold text-slate-900 line-clamp-1">{competition.name}</h3>
                <p className="mt-1 text-sm text-slate-500 line-clamp-2">
                  {competition.description || 'No description provided.'}
                </p>
                <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                  <span className="capitalize">{competition.type.replace(/_/g, ' ')}</span>
                  <span>{competition.teams_count ?? 0} teams</span>
                </div>
                <Button variant="outline" size="sm" className="mt-4 w-full" onClick={() => navigate(`/competitions/${competition.id}`)}>
                  View Details <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
          totalCount={totalCount}
          pageSize={15}
        />
      )}
    </div>
  );
}
