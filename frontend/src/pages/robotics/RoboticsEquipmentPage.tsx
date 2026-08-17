import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, QrCode, Trash2, Pencil } from 'lucide-react';
import {
  useRoboticsEquipment,
  useCreateEquipment,
  useDeleteEquipment,
  useRegenerateQr,
  useRoboticsSummary,
} from '@/hooks/useRobotics';
import { useAuth } from '@/hooks/useAuth';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageSpinner } from '@/components/ui/Spinner';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Label } from '@/components/ui/Label';
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
  EQUIPMENT_CONDITIONS,
  EQUIPMENT_STATUSES,
  isRoboticsStaff,
} from '@/lib/roboticsUtils';
import type { RoboticsEquipment } from '@/types/robotics';

const typeColors: Record<string, string> = {
  kit: 'bg-blue-500',
  arduino_board: 'bg-emerald-500',
  lego_kit: 'bg-amber-500',
  sensor: 'bg-violet-500',
  microcontroller: 'bg-rose-500',
  component: 'bg-slate-400',
};

const emptyForm = {
  name: '',
  type: 'kit' as const,
  sku: '',
  manufacturer: '',
  description: '',
  quantity_total: '1',
  location: '',
  condition: 'good' as const,
  status: 'active' as const,
};

export default function RoboticsEquipmentPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isStaff = isRoboticsStaff(user?.role?.name);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [status, setStatus] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data, isLoading } = useRoboticsEquipment({ page, type: type || undefined, status: status || undefined, search: search || undefined });
  const { data: summary } = useRoboticsSummary();
  const createEquipment = useCreateEquipment();
  const deleteEquipment = useDeleteEquipment();
  const regenerateQr = useRegenerateQr();

  const handleCreate = () => {
    createEquipment.mutate(
      {
        name: form.name,
        type: form.type,
        sku: form.sku || null,
        manufacturer: form.manufacturer || null,
        description: form.description || null,
        quantity_total: Number(form.quantity_total) || 1,
        location: form.location || null,
        condition: form.condition,
        status: form.status,
      },
      {
        onSuccess: () => {
          setDialogOpen(false);
          setForm(emptyForm);
        },
      }
    );
  };

  const columns: Column<RoboticsEquipment>[] = [
    {
      key: 'name',
      header: 'Equipment',
      render: (item) => (
        <div className="flex items-center gap-3">
          <span className={`inline-block h-2.5 w-2.5 shrink-0 rounded-full ${typeColors[item.type] ?? 'bg-slate-400'}`} />
          <div>
            <p className="font-medium text-slate-900">{item.name}</p>
            <p className="text-xs text-slate-500">
              {item.sku ?? 'No SKU'}
              {item.qr_code ? ` · QR ${item.qr_code}` : ''}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      render: (item) => <span className="capitalize text-slate-600">{item.type.replace(/_/g, ' ')}</span>,
    },
    {
      key: 'quantity_total',
      header: 'Units',
      render: (item) => (
        <span className="text-slate-700">
          {item.quantity_available}/{item.quantity_total} available
        </span>
      ),
    },
    {
      key: 'condition',
      header: 'Condition',
      render: (item) => <span className="capitalize text-slate-600">{item.condition}</span>,
    },
    {
      key: 'location',
      header: 'Location',
      render: (item) => item.location ?? '—',
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
        title="Robotics Equipment"
        description={`${summary?.total_equipment ?? 0} items · ${summary?.available_units ?? 0} units available`}
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Robotics Lab', href: '/robotics/dashboard' }, { label: 'Equipment' }]}
        actions={
          isStaff && (
            <DialogRoot open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" /> Add Equipment
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Add Equipment</DialogTitle>
                  <DialogDescription>Register a new piece of robotics equipment.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4">
                  <Input label="Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. LEGO Spike Prime Kit" />
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <SelectRoot value={form.type} onValueChange={(v) => setForm({ ...form, type: v as typeof form.type })}>
                      <SelectTrigger label="Type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {EQUIPMENT_TYPES.map((t) => (
                          <SelectItem key={t} value={t}>
                            {t.replace(/_/g, ' ')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </SelectRoot>
                    <Input label="Quantity *" type="number" min={1} value={form.quantity_total} onChange={(e) => setForm({ ...form, quantity_total: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Input label="SKU" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
                    <Input label="Manufacturer" value={form.manufacturer} onChange={(e) => setForm({ ...form, manufacturer: e.target.value })} />
                  </div>
                  <Input label="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="e.g. Lab A - Shelf 2" />
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <SelectRoot value={form.condition} onValueChange={(v) => setForm({ ...form, condition: v as typeof form.condition })}>
                      <SelectTrigger label="Condition">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {EQUIPMENT_CONDITIONS.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </SelectRoot>
                    <SelectRoot value={form.status} onValueChange={(v) => setForm({ ...form, status: v as typeof form.status })}>
                      <SelectTrigger label="Status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {EQUIPMENT_STATUSES.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </SelectRoot>
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea className="mt-1.5" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button onClick={handleCreate} disabled={!form.name || createEquipment.isPending}>
                    {createEquipment.isPending ? 'Saving...' : 'Save Equipment'}
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
        page={page}
        pageSize={data?.meta.per_page ?? 10}
        onPageChange={setPage}
        searchPlaceholder="Search equipment..."
        onSearch={(q) => {
          setSearch(q);
          setPage(1);
        }}
        onRowClick={(item) => navigate(`/robotics/equipment/${item.id}`)}
        rowActions={isStaff ? (item) => (
          <>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); regenerateQr.mutate(item.id); }} title="Regenerate QR">
              <QrCode className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); navigate(`/robotics/equipment/${item.id}`); }} title="Edit">
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-red-500 hover:text-red-600"
              onClick={(e) => {
                e.stopPropagation();
                if (confirm(`Delete ${item.name}? This cannot be undone.`)) deleteEquipment.mutate(item.id);
              }}
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </>
        ) : undefined}
        filters={
          <>
            <SelectRoot value={type} onValueChange={(v) => { setType(v); setPage(1); }}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All types</SelectItem>
                {EQUIPMENT_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t.replace(/_/g, ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </SelectRoot>
            <SelectRoot value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All statuses</SelectItem>
                {EQUIPMENT_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </SelectRoot>
          </>
        }
      />
    </div>
  );
}
