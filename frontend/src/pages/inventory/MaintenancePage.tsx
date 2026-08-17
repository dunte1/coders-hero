import { useState } from 'react';
import {
  useMaintenanceRecords,
  useCreateMaintenance,
  useUpdateMaintenance,
  useDeleteMaintenance,
} from '@/hooks/useInventory';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageSpinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/Dialog';
import {
  SelectRoot,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/Select';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import type { AssetMaintenanceRecord, MaintenanceStatus } from '@/types/inventory';
import type { MaintenanceInput } from '@/lib/inventoryApi';

const emptyForm: MaintenanceInput = {
  asset_id: 0,
  maintenance_date: new Date().toISOString().slice(0, 10),
  description: '',
  status: 'reported',
  cost: null,
  note: null,
};

const formatMoney = (v: number | null | undefined) =>
  v == null ? '—' : 'KSh ' + Number(v).toLocaleString();

export default function MaintenancePage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<'all' | MaintenanceStatus>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<AssetMaintenanceRecord | null>(null);
  const [form, setForm] = useState<MaintenanceInput>(emptyForm);
  const [saving, setSaving] = useState(false);

  const { data, isLoading } = useMaintenanceRecords({ page, status });
  const createMaintenance = useCreateMaintenance();
  const updateMaintenance = useUpdateMaintenance();
  const deleteMaintenance = useDeleteMaintenance();

  const records = data?.results || [];

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (r: AssetMaintenanceRecord) => {
    setEditing(r);
    setForm({
      asset_id: r.asset_id,
      maintenance_date: r.maintenance_date,
      description: r.description,
      status: r.status,
      cost: r.cost,
      note: r.note,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.asset_id || !form.description) return;
    setSaving(true);
    try {
      if (editing) {
        await updateMaintenance.mutateAsync({ id: editing.id, data: form });
      } else {
        await createMaintenance.mutateAsync(form);
      }
      setDialogOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (r: AssetMaintenanceRecord) => {
    if (!window.confirm('Delete this maintenance record?')) return;
    await deleteMaintenance.mutateAsync(r.id);
  };

  const columns: Column<AssetMaintenanceRecord>[] = [
    { key: 'asset', header: 'Asset', render: (r) => <span className="font-medium text-slate-900">{r.asset?.name ?? '#' + r.asset_id}</span> },
    { key: 'maintenance_date', header: 'Date', render: (r) => r.maintenance_date },
    { key: 'description', header: 'Description', render: (r) => <span className="text-slate-600">{r.description}</span> },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    { key: 'cost', header: 'Cost', render: (r) => <span className="text-slate-600">{formatMoney(r.cost)}</span> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Maintenance"
        description="Repairs and servicing records for assets"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Inventory', href: '/inventory' }, { label: 'Maintenance' }]}
        actions={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" /> New Record
          </Button>
        }
      />

      <Card>
        <CardContent className="p-5">
          <DataTable
            columns={columns}
            data={records}
            totalCount={data?.meta.total}
            page={data?.meta.current_page}
            pageSize={data?.meta.per_page}
            onPageChange={(p) => setPage(p)}
            loading={isLoading}
            emptyTitle="No maintenance records"
            emptyDescription="Record repairs and servicing to track asset health."
            filters={
              <SelectRoot value={status} onValueChange={(v) => { setStatus(v as 'all' | MaintenanceStatus); setPage(1); }}>
                <SelectTrigger className="w-44">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="reported">Reported</SelectItem>
                  <SelectItem value="in_progress">In progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </SelectRoot>
            }
            rowActions={(r) => (
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(r)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600" onClick={() => handleDelete(r)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          />
        </CardContent>
      </Card>

      <DialogRoot open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Maintenance Record' : 'New Maintenance Record'}</DialogTitle>
            <DialogDescription>Record a repair or servicing event for an asset.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Asset ID *" type="number" value={form.asset_id || ''} onChange={(e) => setForm({ ...form, asset_id: Number(e.target.value) })} />
              <Input label="Maintenance Date" type="date" value={form.maintenance_date} onChange={(e) => setForm({ ...form, maintenance_date: e.target.value })} />
            </div>
            <Textarea label="Description *" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label className="mb-1.5 block">Status</Label>
                <SelectRoot value={form.status} onValueChange={(v) => setForm({ ...form, status: v as MaintenanceStatus })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="reported">Reported</SelectItem>
                    <SelectItem value="in_progress">In progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </SelectRoot>
              </div>
              <Input label="Cost (KSh)" type="number" value={form.cost ?? ''} onChange={(e) => setForm({ ...form, cost: e.target.value ? Number(e.target.value) : null })} />
            </div>
            <Textarea label="Note" value={form.note ?? ''} onChange={(e) => setForm({ ...form, note: e.target.value || null })} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} loading={saving} disabled={!form.asset_id || !form.description}>
              {editing ? 'Save Changes' : 'Create Record'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>
    </div>
  );
}
