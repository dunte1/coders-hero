import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  QrCode,
  Wrench,
  UserPlus,
} from 'lucide-react';
import {
  useRoboticsEquipmentItem,
  useAssignEquipment,
  useReturnEquipment,
  useCreateMaintenance,
  useResolveMaintenance,
  useReviewReservation,
  useRoboticsTeams,
  useStudentOptions,
  useRoboticsAssignments,
} from '@/hooks/useRobotics';
import { useAuth } from '@/hooks/useAuth';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageSpinner } from '@/components/ui/Spinner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
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
  EQUIPMENT_TYPES,
  MAINTENANCE_TYPES,
  formatDate,
  isRoboticsStaff,
} from '@/lib/roboticsUtils';
import type { RoboticsEquipmentReservation, RoboticsMaintenanceRecord, RoboticsAssignment, RoboticsMaintenanceType } from '@/types/robotics';

const typeColors: Record<string, string> = {
  kit: 'bg-blue-500',
  arduino_board: 'bg-emerald-500',
  lego_kit: 'bg-amber-500',
  sensor: 'bg-violet-500',
  microcontroller: 'bg-rose-500',
  component: 'bg-slate-400',
};

export default function RoboticsEquipmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isStaff = isRoboticsStaff(user?.role?.name);

  const equipmentId = Number(id);
  const { data: item, isLoading } = useRoboticsEquipmentItem(equipmentId);
  const { data: teams } = useRoboticsTeams();
  const { data: students } = useStudentOptions();
  const { data: assignments } = useRoboticsAssignments({ equipment_id: equipmentId });
  const assignEquipment = useAssignEquipment();
  const returnEquipment = useReturnEquipment();
  const createMaintenance = useCreateMaintenance();
  const resolveMaintenance = useResolveMaintenance();
  const reviewReservation = useReviewReservation();

  const [assignOpen, setAssignOpen] = useState(false);
  const [maintenanceOpen, setMaintenanceOpen] = useState(false);
  const [assignForm, setAssignForm] = useState({ assignable_type: 'student', assignable_id: '', quantity: '1', expected_return_at: '' });
  const [maintenanceForm, setMaintenanceForm] = useState({ type: 'inspection', issue_description: '', maintenance_date: '' });

  if (isLoading || !item) return <PageSpinner />;

  const handleAssign = () => {
    assignEquipment.mutate(
      {
        equipmentId,
        data: {
          assignable_type: assignForm.assignable_type as 'student' | 'team',
          assignable_id: Number(assignForm.assignable_id),
          quantity: Number(assignForm.quantity) || 1,
          expected_return_at: assignForm.expected_return_at || null,
        },
      },
      {
        onSuccess: () => {
          setAssignOpen(false);
          setAssignForm({ assignable_type: 'student', assignable_id: '', quantity: '1', expected_return_at: '' });
        },
      }
    );
  };

  const handleCreateMaintenance = () => {
    createMaintenance.mutate(
      {
        equipment_id: equipmentId,
        type: maintenanceForm.type as RoboticsMaintenanceType,
        issue_description: maintenanceForm.issue_description || null,
        maintenance_date: maintenanceForm.maintenance_date || null,
      },
      {
        onSuccess: () => {
          setMaintenanceOpen(false);
          setMaintenanceForm({ type: 'inspection', issue_description: '', maintenance_date: '' });
        },
      }
    );
  };

  const assignableOptions =
    assignForm.assignable_type === 'team' ? (teams?.results ?? []) : (students ?? []);

  return (
    <div className="space-y-6">
      <PageHeader
        title={item.name}
        description={`${item.sku ? `SKU: ${item.sku}` : 'No SKU'}${item.manufacturer ? ` · ${item.manufacturer}` : ''}`}
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Robotics Lab', href: '/robotics/dashboard' },
          { label: 'Equipment', href: '/robotics/equipment' },
          { label: item.name },
        ]}
        actions={
          <Button variant="outline" onClick={() => navigate('/robotics/equipment')}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Equipment details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <span className={`inline-block h-3 w-3 rounded-full ${typeColors[item.type] ?? 'bg-slate-400'}`} />
              <StatusBadge status={item.status} />
            </div>
            <dl className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-slate-500">Type</dt>
                <dd className="font-medium text-slate-900 capitalize">{item.type.replace(/_/g, ' ')}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Condition</dt>
                <dd className="font-medium text-slate-900 capitalize">{item.condition}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Quantity</dt>
                <dd className="font-medium text-slate-900">
                  {item.quantity_available}/{item.quantity_total} available
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Location</dt>
                <dd className="font-medium text-slate-900">{item.location ?? '—'}</dd>
              </div>
              <div>
                <dt className="text-slate-500">QR Code</dt>
                <dd className="font-medium text-slate-900">{item.qr_code ?? 'Not generated'}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Type in catalog</dt>
                <dd className="text-slate-600">{EQUIPMENT_TYPES.includes(item.type) ? 'Registered type' : '—'}</dd>
              </div>
            </dl>
            {item.description && (
              <p className="mt-4 text-sm text-slate-600">{item.description}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {isStaff && (
              <>
                <DialogRoot open={assignOpen} onOpenChange={setAssignOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full">
                      <UserPlus className="h-4 w-4 mr-2" /> Assign Equipment
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Assign {item.name}</DialogTitle>
                      <DialogDescription>Allocate units to a student or team.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4">
                      <SelectRoot value={assignForm.assignable_type} onValueChange={(v) => setAssignForm({ ...assignForm, assignable_type: v, assignable_id: '' })}>
                        <SelectTrigger label="Assign to">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="student">Student</SelectItem>
                          <SelectItem value="team">Team</SelectItem>
                        </SelectContent>
                      </SelectRoot>
                      <SelectRoot value={assignForm.assignable_id} onValueChange={(v) => setAssignForm({ ...assignForm, assignable_id: v })}>
                        <SelectTrigger label={assignForm.assignable_type === 'team' ? 'Team' : 'Student'}>
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                        <SelectContent>
                          {(assignableOptions as Array<{ id: number; name?: string | null; full_name?: string | null }>).map((opt) => (
                            <SelectItem key={opt.id} value={String(opt.id)}>
                              {opt.name ?? opt.full_name ?? `#${opt.id}`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </SelectRoot>
                      <Input label="Quantity" type="number" min={1} value={assignForm.quantity} onChange={(e) => setAssignForm({ ...assignForm, quantity: e.target.value })} />
                      <Input label="Expected return" type="date" value={assignForm.expected_return_at} onChange={(e) => setAssignForm({ ...assignForm, expected_return_at: e.target.value })} />
                    </div>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                      </DialogClose>
                      <Button onClick={handleAssign} disabled={!assignForm.assignable_id || assignEquipment.isPending}>
                        {assignEquipment.isPending ? 'Assigning...' : 'Assign'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </DialogRoot>

                <DialogRoot open={maintenanceOpen} onOpenChange={setMaintenanceOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full">
                      <Wrench className="h-4 w-4 mr-2" /> Record Maintenance
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Record maintenance</DialogTitle>
                      <DialogDescription>Log a repair, calibration, inspection or replacement.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4">
                      <SelectRoot value={maintenanceForm.type} onValueChange={(v) => setMaintenanceForm({ ...maintenanceForm, type: v })}>
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
                        <Textarea
                          className="mt-1.5"
                          label="Issue description"
                          value={maintenanceForm.issue_description}
                          onChange={(e) => setMaintenanceForm({ ...maintenanceForm, issue_description: e.target.value })}
                          rows={3}
                        />
                      </div>
                      <Input label="Maintenance date" type="date" value={maintenanceForm.maintenance_date} onChange={(e) => setMaintenanceForm({ ...maintenanceForm, maintenance_date: e.target.value })} />
                    </div>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                      </DialogClose>
                      <Button onClick={handleCreateMaintenance} disabled={createMaintenance.isPending}>
                        {createMaintenance.isPending ? 'Saving...' : 'Save Record'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </DialogRoot>

                <Button variant="outline" className="w-full" onClick={() => navigate(`/robotics/equipment/${item.id}`)}>
                  <QrCode className="h-4 w-4 mr-2" /> View QR details
                </Button>
              </>
            )}
            <p className="text-xs text-slate-400">
              {item.quantity_available} of {item.quantity_total} units currently available.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Assignments</CardTitle>
          </CardHeader>
          <CardContent>
            {(assignments?.results?.length ?? 0) === 0 ? (
              <p className="text-sm text-slate-500">No active assignments.</p>
            ) : (
              <ul className="space-y-3">
                {assignments?.results.map((a: RoboticsAssignment) => (
                  <li key={a.id} className="flex items-center justify-between rounded-lg border border-slate-100 p-3">
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {a.assignable?.name ?? a.assignable?.full_name ?? '—'}
                      </p>
                      <p className="text-xs text-slate-500">
                        {a.quantity} units · Assigned {formatDate(a.assigned_at)} · Due {formatDate(a.expected_return_at)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={a.status} />
                      {isStaff && a.status === 'assigned' && (
                        <Button variant="outline" size="sm" onClick={() => returnEquipment.mutate(a.id)}>
                          Return
                        </Button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pending reservations</CardTitle>
          </CardHeader>
          <CardContent>
            {(item.pending_reservations?.length ?? 0) === 0 ? (
              <p className="text-sm text-slate-500">No pending reservations.</p>
            ) : (
              <ul className="space-y-3">
                {item.pending_reservations?.map((r: RoboticsEquipmentReservation) => (
                  <li key={r.id} className="flex items-center justify-between rounded-lg border border-slate-100 p-3">
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {r.team?.name ?? r.reserved_by?.name ?? '—'}
                      </p>
                      <p className="text-xs text-slate-500">
                        {r.quantity} units · {formatDate(r.start_at)} → {formatDate(r.end_at)}
                      </p>
                    </div>
                    {isStaff ? (
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => reviewReservation.mutate({ id: r.id, action: 'reject' })}>
                          Reject
                        </Button>
                        <Button size="sm" onClick={() => reviewReservation.mutate({ id: r.id, action: 'approve' })}>
                          Approve
                        </Button>
                      </div>
                    ) : (
                      <StatusBadge status={r.status} />
                    )}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Maintenance records</CardTitle>
        </CardHeader>
        <CardContent>
          {(item.maintenance_records?.length ?? 0) === 0 ? (
            <p className="text-sm text-slate-500">No maintenance records yet.</p>
          ) : (
            <ul className="space-y-3">
              {item.maintenance_records?.map((m: RoboticsMaintenanceRecord) => (
                <li key={m.id} className="flex items-center justify-between rounded-lg border border-slate-100 p-3">
                  <div>
                    <p className="text-sm font-medium text-slate-900 capitalize">{m.type}</p>
                    <p className="text-xs text-slate-500">
                      {m.issue_description ?? 'No description'} · {formatDate(m.maintenance_date)}
                      {m.cost ? ` · Cost: KSh ${Number(m.cost).toLocaleString()}` : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={m.status} />
                    {isStaff && m.status !== 'resolved' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => resolveMaintenance.mutate({ id: m.id, data: {} })}
                      >
                        Mark resolved
                      </Button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
