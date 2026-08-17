import { useState } from 'react';
import { Plus, Wrench } from 'lucide-react';
import {
  useRoboticsMaintenance,
  useCreateMaintenance,
  useResolveMaintenance,
  useRoboticsEquipment,
} from '@/hooks/useRobotics';
import { useAuth } from '@/hooks/useAuth';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageSpinner } from '@/components/ui/Spinner';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import {
  DialogRoot,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/Dialog';
import {
  SelectRoot,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/Select';
import {
  MAINTENANCE_TYPES,
  MAINTENANCE_STATUSES,
  formatDate,
  isRoboticsStaff,
} from '@/lib/roboticsUtils';
import type { RoboticsMaintenanceRecord, RoboticsMaintenanceType } from '@/types/robotics';

export default function RoboticsMaintenancePage() {
  const { user } = useAuth();
  const isStaff = isRoboticsStaff(user?.role?.name);

  const [status, setStatus] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({ equipment_id: '', type: 'inspection', issue_description: '', maintenance_date: '' });

  const { data, isLoading } = useRoboticsMaintenance({ status: status || undefined });
  const { data: equipment } = useRoboticsEquipment();
  const createMaintenance = useCreateMaintenance();
  const resolveMaintenance = useResolveMaintenance();

  const handleCreate = () => {
    createMaintenance.mutate(
      {
        equipment_id: Number(form.equipment_id),
        type: form.type as RoboticsMaintenanceType,
        issue_description: form.issue_description || null,
        maintenance_date: form.maintenance_date || null,
      },
      {
        onSuccess: () => {
          setCreateOpen(false);
          setForm({ equipment_id: '', type: 'inspection', issue_description: '', maintenance_date: '' });
        },
      }
    );
  };

  const columns: Column<RoboticsMaintenanceRecord>[] = [
    {
      key: 'equipment',
      header: 'Equipment',
      render: (item) => <p className="font-medium text-slate-900">{item.equipment?.name ?? '—'}</p>,
    },
    {
      key: 'type',
      header: 'Type',
      render: (item) => <span className="capitalize text-slate-600">{item.type}</span>,
    },
    {
      key: 'issue_description',
      header: 'Issue',
      render: (item) => <span className="text-slate-600">{item.issue_description ?? '—'}</span>,
    },
    {
      key: 'maintenance_date',
      header: 'Date',
      render: (item) => <span className="text-slate-600">{formatDate(item.maintenance_date)}</span>,
    },
    {
      key: 'cost',
      header: 'Cost',
      render: (item) =>
        item.cost ? <span className="text-slate-600">KSh {Number(item.cost).toLocaleString()}</span> : '—',
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => <StatusBadge status={item.status} />,
    },
  ];

  if (isLoading) return <PageSpinner />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Robotics Maintenance"
        description="Repairs, calibration, inspections and replacements"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Robotics Lab', href: '/robotics/dashboard' }, { label: 'Maintenance' }]}
        actions={
          isStaff && (
            <DialogRoot open={createOpen} onOpenChange={setCreateOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" /> Record Maintenance
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Record Maintenance</DialogTitle>
                  <DialogDescription>Log a maintenance task for a piece of equipment.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4">
                  <SelectRoot value={form.equipment_id} onValueChange={(v) => setForm({ ...form, equipment_id: v })}>
                    <SelectTrigger label="Equipment *">
                      <SelectValue placeholder="Select equipment..." />
                    </SelectTrigger>
                    <SelectContent>
                      {(equipment?.results ?? []).map((e) => (
                        <SelectItem key={e.id} value={String(e.id)}>
                          {e.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </SelectRoot>
                  <SelectRoot value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                    <SelectTrigger label="Type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MAINTENANCE_TYPES.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </SelectRoot>
                  <div>
                    <Textarea className="mt-1.5" label="Issue description" value={form.issue_description} onChange={(e) => setForm({ ...form, issue_description: e.target.value })} rows={3} />
                  </div>
                  <Input label="Maintenance date" type="date" value={form.maintenance_date} onChange={(e) => setForm({ ...form, maintenance_date: e.target.value })} />
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button onClick={handleCreate} disabled={!form.equipment_id || createMaintenance.isPending}>
                    {createMaintenance.isPending ? 'Saving...' : 'Save Record'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </DialogRoot>
          )
        }
      />

      <DataTable
        columns={columns}
        data={data?.results ?? []}
        totalCount={data?.meta.total ?? 0}
        page={1}
        pageSize={data?.meta.per_page ?? 10}
        searchable={false}
        rowActions={
          isStaff
            ? (item) =>
                item.status !== 'resolved' ? (
                  <Button variant="outline" size="sm" onClick={() => resolveMaintenance.mutate({ id: item.id, data: {} })}>
                    <Wrench className="h-4 w-4 mr-1" /> Mark Resolved
                  </Button>
                ) : undefined
            : undefined
        }
        filters={
          <SelectRoot value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All statuses</SelectItem>
              {MAINTENANCE_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s.replace(/_/g, ' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </SelectRoot>
        }
      />
    </div>
  );
}
