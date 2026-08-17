import { useState } from 'react';
import { Plus, CalendarCheck, XCircle, CheckCircle2, CircleCheck } from 'lucide-react';
import {
  useMyRoboticsReservations,
  useRoboticsReservations,
  useCreateReservation,
  useCancelReservation,
  useReviewReservation,
  useRoboticsEquipment,
} from '@/hooks/useRobotics';
import { useAuth } from '@/hooks/useAuth';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageSpinner } from '@/components/ui/Spinner';
import { Card, CardContent } from '@/components/ui/Card';
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { formatDate, isRoboticsStaff } from '@/lib/roboticsUtils';
import type { RoboticsEquipmentReservation } from '@/types/robotics';

export default function RoboticsReservationsPage() {
  const { user } = useAuth();
  const isStaff = isRoboticsStaff(user?.role?.name);

  const [status, setStatus] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({ equipment_id: '', quantity: '1', start_at: '', end_at: '', purpose: '' });

  const { data: mine, isLoading: mineLoading } = useMyRoboticsReservations({ status: status || undefined });
  const { data: all, isLoading: allLoading } = useRoboticsReservations({ status: status || undefined });
  const { data: equipment } = useRoboticsEquipment();
  const createReservation = useCreateReservation();
  const cancelReservation = useCancelReservation();
  const reviewReservation = useReviewReservation();

  const handleCreate = () => {
    createReservation.mutate(
      {
        equipment_id: Number(form.equipment_id),
        quantity: Number(form.quantity) || 1,
        start_at: form.start_at,
        end_at: form.end_at,
        purpose: form.purpose || null,
      },
      {
        onSuccess: () => {
          setCreateOpen(false);
          setForm({ equipment_id: '', quantity: '1', start_at: '', end_at: '', purpose: '' });
        },
      }
    );
  };

  const columns: Column<RoboticsEquipmentReservation>[] = [
    {
      key: 'equipment',
      header: 'Equipment',
      render: (item) => (
        <div>
          <p className="font-medium text-slate-900">{item.equipment?.name ?? '—'}</p>
          <p className="text-xs text-slate-500">
            {item.team?.name ?? item.reserved_by?.name ?? '—'} · {item.quantity} units
          </p>
        </div>
      ),
    },
    {
      key: 'start_at',
      header: 'Window',
      render: (item) => (
        <span className="text-slate-600">
          {formatDate(item.start_at)} → {formatDate(item.end_at)}
        </span>
      ),
    },
    {
      key: 'purpose',
      header: 'Purpose',
      render: (item) => item.purpose ?? '—',
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => <StatusBadge status={item.status} />,
    },
  ];

  if (mineLoading || (isStaff && allLoading)) return <PageSpinner />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Equipment Reservations"
        description="Reserve equipment for your team or manage reservation requests"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Robotics Lab', href: '/robotics/dashboard' }, { label: 'Reservations' }]}
        actions={
          <DialogRoot open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" /> New Reservation
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>New Reservation</DialogTitle>
                <DialogDescription>Request equipment for a time window.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4">
                <SelectRoot value={form.equipment_id} onValueChange={(v) => setForm({ ...form, equipment_id: v })}>
                  <SelectTrigger label="Equipment *">
                    <SelectValue placeholder="Select equipment..." />
                  </SelectTrigger>
                  <SelectContent>
                    {(equipment?.results ?? []).map((e) => (
                      <SelectItem key={e.id} value={String(e.id)}>
                        {e.name} ({e.quantity_available}/{e.quantity_total})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </SelectRoot>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Input label="Start date" type="date" value={form.start_at} onChange={(e) => setForm({ ...form, start_at: e.target.value })} />
                  <Input label="End date" type="date" value={form.end_at} onChange={(e) => setForm({ ...form, end_at: e.target.value })} />
                </div>
                <Input label="Quantity" type="number" min={1} value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
                <div>
                  <Textarea className="mt-1.5" label="Purpose" value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })} rows={2} />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button onClick={handleCreate} disabled={!form.equipment_id || !form.start_at || !form.end_at || createReservation.isPending}>
                  {createReservation.isPending ? 'Submitting...' : 'Request Reservation'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </DialogRoot>
        }
      />

      <Tabs defaultValue={isStaff ? 'all' : 'mine'}>
        <TabsList>
          <TabsTrigger value="mine">My Reservations</TabsTrigger>
          {isStaff && <TabsTrigger value="all">All Reservations</TabsTrigger>}
        </TabsList>

        <TabsContent value="mine">
          <DataTable
            columns={columns}
            data={mine?.results ?? []}
            totalCount={mine?.meta.total ?? 0}
            page={1}
            pageSize={mine?.meta.per_page ?? 10}
            searchable={false}
            rowActions={(item) =>
              item.status === 'pending' ? (
                <Button variant="ghost" size="sm" className="text-red-500" onClick={() => cancelReservation.mutate(item.id)}>
                  <XCircle className="h-4 w-4 mr-1" /> Cancel
                </Button>
              ) : undefined
            }
          />
        </TabsContent>

        {isStaff && (
          <TabsContent value="all">
            <DataTable
              columns={columns}
              data={all?.results ?? []}
              totalCount={all?.meta.total ?? 0}
              page={1}
              pageSize={all?.meta.per_page ?? 10}
              searchable={false}
              rowActions={(item) =>
                item.status === 'pending' ? (
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" className="text-red-500" onClick={() => reviewReservation.mutate({ id: item.id, action: 'reject' })}>
                      <XCircle className="h-4 w-4 mr-1" /> Reject
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => reviewReservation.mutate({ id: item.id, action: 'approve' })}>
                      <CheckCircle2 className="h-4 w-4 mr-1" /> Approve
                    </Button>
                  </div>
                ) : item.status === 'approved' ? (
                  <Button variant="outline" size="sm" onClick={() => reviewReservation.mutate({ id: item.id, action: 'complete' })}>
                    <CircleCheck className="h-4 w-4 mr-1" /> Mark Complete
                  </Button>
                ) : undefined
              }
            />
          </TabsContent>
        )}
      </Tabs>

      <Card>
        <CardContent className="p-5 flex items-center gap-3 text-sm text-slate-500">
          <CalendarCheck className="h-5 w-5 shrink-0 text-brand-600" />
          Reservations are reviewed and approved by robotics lab staff before equipment is released.
        </CardContent>
      </Card>
    </div>
  );
}
