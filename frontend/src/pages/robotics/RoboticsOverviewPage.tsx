import { useNavigate } from 'react-router-dom';
import { useRoboticsSummary } from '@/hooks/useRobotics';
import { useAuth } from '@/hooks/useAuth';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageSpinner } from '@/components/ui/Spinner';
import { StatsCard } from '@/components/ui/StatsCard';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/Progress';
import {
  Cpu,
  Wrench,
  CalendarCheck,
  Users,
  FolderKanban,
  AlertTriangle,
  ArrowRight,
  QrCode,
} from 'lucide-react';

const sections = [
  { label: 'Equipment', href: '/robotics/equipment', icon: Cpu, desc: 'Kits, boards, sensors and components' },
  { label: 'Teams', href: '/robotics/teams', icon: Users, desc: 'Robotics teams and members' },
  { label: 'Projects', href: '/robotics/projects', icon: FolderKanban, desc: 'Class, competition and personal projects' },
  { label: 'Reservations', href: '/robotics/reservations', icon: CalendarCheck, desc: 'Equipment reservations and schedules' },
  { label: 'Maintenance', href: '/robotics/maintenance', icon: Wrench, desc: 'Repairs, calibration and inspections' },
];

export default function RoboticsOverviewPage() {
  const navigate = useNavigate();
  const { data: summary, isLoading } = useRoboticsSummary();
  const { user } = useAuth();

  if (isLoading) return <PageSpinner />;

  const isStaff = ['teacher', 'instructor', 'admin', 'super_admin'].includes(user?.role?.name?.toLowerCase() ?? '');

  return (
    <div className="space-y-6">
      <PageHeader
        title="Robotics Lab"
        description="Equipment, teams, projects, reservations and maintenance"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Robotics Lab' }]}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard icon={Cpu} title="Equipment Items" value={summary?.total_equipment ?? 0} />
        <StatsCard icon={QrCode} title="Units Available" value={summary?.available_units ?? 0} />
        <StatsCard icon={Wrench} title="Open Maintenance" value={summary?.open_maintenance ?? 0} />
        <StatsCard icon={AlertTriangle} title="Pending Reservations" value={summary?.pending_reservations ?? 0} />
        <StatsCard icon={Users} title="Teams" value={summary?.teams ?? 0} />
        <StatsCard icon={FolderKanban} title="Projects" value={summary?.projects ?? 0} />
        <StatsCard icon={Cpu} title="Total Units" value={summary?.total_units ?? 0} />
        <StatsCard icon={Cpu} title="Assigned Units" value={summary?.assigned_units ?? 0} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <h3 className="font-semibold text-slate-900">Equipment by type</h3>
            {!summary?.by_type || Object.keys(summary.by_type).length === 0 ? (
              <p className="mt-2 text-sm text-slate-500">No equipment registered yet.</p>
            ) : (
              <ul className="mt-3 space-y-3">
                {Object.entries(summary.by_type).map(([type, count]) => (
                  <li key={type} className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 capitalize">{type.replace(/_/g, ' ')}</span>
                    <span className="font-medium text-slate-900">{count}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <h3 className="font-semibold text-slate-900">Unit availability</h3>
            <p className="mt-1 text-3xl font-bold text-slate-900">
              {summary?.total_units
                ? Math.round(((summary.available_units ?? 0) / summary.total_units) * 100)
                : 0}
              %
            </p>
            <Progress
              value={summary?.total_units ? ((summary.available_units ?? 0) / summary.total_units) * 100 : 0}
              className="mt-3"
            />
            <p className="mt-2 text-sm text-slate-500">
              {summary?.available_units ?? 0} available · {summary?.assigned_units ?? 0} assigned
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <h3 className="font-semibold text-slate-900">Lab activity</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li className="flex justify-between">
                <span className="text-slate-600">Active equipment</span>
                <span className="font-medium text-slate-900">{summary?.active_equipment ?? 0}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-slate-600">Retired equipment</span>
                <span className="font-medium text-slate-900">{summary?.retired_equipment ?? 0}</span>
              </li>
              <li className="flex justify-between border-t border-slate-100 pt-2">
                <span className="text-slate-600">Projects</span>
                <span className="font-medium text-slate-900">{summary?.projects ?? 0}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-slate-600">Teams</span>
                <span className="font-medium text-slate-900">{summary?.teams ?? 0}</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {sections.map(({ label, href, icon: Icon, desc }) => (
          <Card key={href} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate(href)}>
            <CardContent className="p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                <Icon className="h-5 w-5" />
              </div>
              <h4 className="mt-3 font-semibold text-slate-900">{label}</h4>
              <p className="mt-1 text-sm text-slate-500">{desc}</p>
              <Button variant="ghost" size="sm" className="mt-3 px-0 text-brand-600 hover:bg-transparent">
                Open <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {isStaff && (
        <p className="text-sm text-slate-500">
          You have staff access — you can manage equipment, approve reservations, maintain inventory and review project submissions.
        </p>
      )}
    </div>
  );
}
