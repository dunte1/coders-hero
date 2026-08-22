import { Trophy } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageSpinner } from '@/components/ui/Spinner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { useParentCompetitions } from '@/hooks/useParentPortal';
import { formatDate } from '@/lib/utils';

interface CompetitionItem {
  id: number;
  name: string;
  start_date?: string | null;
  end_date?: string | null;
  team_name?: string | null;
  result?: string | null;
}

export default function ParentCompetitionsPage() {
  const { data, isLoading } = useParentCompetitions(); const d: any = data;;

  if (isLoading) return <PageSpinner />;

  const competitions: any[] = Array.isArray(d) ? data : (d?.results ?? []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Competitions"
        description="Your child's competition participation and results"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Parent Portal', href: '/parent' }, { label: 'Competitions' }]}
      />

      {competitions.length === 0 ? (
        <Card>
          <CardContent>
            <EmptyState
              icon={Trophy}
              title="No competitions found"
              description="Your child has not participated in any competitions yet."
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {competitions.map((comp: any) => (
            <Card key={comp.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-50">
                      <Trophy className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-slate-900">{comp.name}</h3>
                      <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-slate-500">
                        {comp.start_date && (
                          <span>
                            {formatDate(comp.start_date)}
                            {comp.end_date ? ` â€“ ${formatDate(comp.end_date)}` : ''}
                          </span>
                        )}
                        {comp.team_name && <span>Team: {comp.team_name}</span>}
                      </div>
                    </div>
                  </div>
                  {comp.result && (
                    <Badge variant="success">{comp.result}</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
