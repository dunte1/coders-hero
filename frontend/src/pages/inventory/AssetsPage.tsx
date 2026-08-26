import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useInventoryAssets,
  useCreateAsset,
  useUpdateAsset,
  useDeleteAsset,
  useCategoryOptions,
  useLocationOptions,
} from '@/hooks/useInventory';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageSpinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ConfirmDelete } from '@/components/cms/ConfirmDelete';
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
import { Plus, Pencil, Trash2, QrCode } from 'lucide-react';
import type { Asset, AssetCondition, AssetStatus } from '@/types/inventory';
import type { AssetInput } from '@/lib/inventoryApi';

const emptyForm: AssetInput = {
  name: '',
  asset_category_id: 0,
  location_id: null,
  serial_number: null,
  status: 'available',
  condition: 'good',
  purchase_date: null,
  purchase_cost: null,
  supplier: null,
  notes: null,
  robotics_equipment_id: null,
};

const formatMoney = (v: number | null | undefined) =>
  v == null ? '—' : 'KSh ' + Number(v).toLocaleString();

export default function AssetsPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'all' | AssetStatus>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Asset | null>(null);
  const [form, setForm] = useState<AssetInput>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Asset | null>(null);

  const { data, isLoading } = useInventoryAssets({ page, search, status });
  const createAsset = useCreateAsset();
  const updateAsset = useUpdateAsset();
  const deleteAsset = useDeleteAsset();
  const { data: categories = [] } = useCategoryOptions();
  const { data: locations = [] } = useLocationOptions();

  const assets = data?.results || [];

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (asset: Asset) => {
    setEditing(asset);
    setForm({
      name: asset.name,
      asset_category_id: asset.category_id,
      location_id: asset.location_id,
      serial_number: asset.serial_number,
      status: asset.status,
      condition: asset.condition,
      purchase_date: asset.purchase_date ?? null,
      purchase_cost: asset.purchase_cost,
      supplier: asset.supplier,
      notes: asset.notes,
      robotics_equipment_id: asset.robotics_equipment_id,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.asset_category_id) return;
    setSaving(true);
    try {
      if (editing) {
        await updateAsset.mutateAsync({ id: editing.id, data: form });
      } else {
        await createAsset.mutateAsync(form);
      }
      setDialogOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (asset: Asset) => {
    setDeleteTarget(asset);
  };

  const columns: Column<Asset>[] = [
    {
      key: 'asset_code',
      header: 'Code',
      render: (a) => <span className="font-mono text-xs text-slate-500">{a.asset_code}</span>,
    },
    { key: 'name', header: 'Name', render: (a) => <span className="font-medium text-slate-900">{a.name}</span> },
    { key: 'category', header: 'Category', render: (a) => a.category?.name ?? '—' },
    { key: 'location', header: 'Location', render: (a) => a.location?.name ?? '—' },
    { key: 'status', header: 'Status', render: (a) => <StatusBadge status={a.status} /> },
    {
      key: 'condition',
      header: 'Condition',
      render: (a) => <span className="capitalize text-slate-600">{a.condition}</span>,
    },
    {
      key: 'purchase_cost',
      header: 'Cost',
      render: (a) => <span className="text-slate-600">{formatMoney(a.purchase_cost)}</span>,
    },
    {
      key: 'qr',
      header: 'QR',
      render: (a) => (
        <button
          className="text-slate-400 hover:text-brand-600"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/inventory/assets/${a.id}?qr=1`);
          }}
          title="View QR code"
        >
          <QrCode className="h-4 w-4" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Assets"
        description="Track equipment, robotics kits and computers"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Inventory', href: '/inventory' }, { label: 'Assets' }]}
        actions={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" /> New Asset
          </Button>
        }
      />

      <Card>
        <CardContent className="p-5">
          <DataTable
            columns={columns}
            data={assets}
            totalCount={data?.meta.total}
            page={data?.meta.current_page}
            pageSize={data?.meta.per_page}
            onPageChange={(p) => setPage(p)}
            onSearch={(q) => {
              setSearch(q);
              setPage(1);
            }}
            onRowClick={(a) => navigate(`/inventory/assets/${a.id}`)}
            loading={isLoading}
            emptyTitle="No assets found"
            emptyDescription="Register laptops, robotics kits and other equipment to get started."
            filters={
              <SelectRoot value={status} onValueChange={(v) => { setStatus(v as 'all' | AssetStatus); setPage(1); }}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="assigned">Assigned</SelectItem>
                  <SelectItem value="in_maintenance">In maintenance</SelectItem>
                  <SelectItem value="disposed">Disposed</SelectItem>
                  <SelectItem value="lost">Lost</SelectItem>
                </SelectContent>
              </SelectRoot>
            }
            rowActions={(a) => (
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(a)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600" onClick={() => handleDelete(a)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          />
        </CardContent>
      </Card>

      <DialogRoot open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Asset' : 'New Asset'}</DialogTitle>
            <DialogDescription>
              {editing ? 'Update the asset details below.' : 'Register a new asset with a generated QR code.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Dell Latitude 5420" />
              <div>
                <Label className="mb-1.5 block">Category *</Label>
                <SelectRoot
                  value={form.asset_category_id ? String(form.asset_category_id) : undefined}
                  onValueChange={(v) => setForm({ ...form, asset_category_id: Number(v) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </SelectRoot>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label className="mb-1.5 block">Location</Label>
                <SelectRoot
                  value={form.location_id ? String(form.location_id) : undefined}
                  onValueChange={(v) => setForm({ ...form, location_id: v === 'none' ? null : Number(v) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No location</SelectItem>
                    {locations.map((l) => (
                      <SelectItem key={l.id} value={String(l.id)}>{l.name}</SelectItem>
                    ))}
                  </SelectContent>
                </SelectRoot>
              </div>
              <Input label="Serial Number" value={form.serial_number ?? ''} onChange={(e) => setForm({ ...form, serial_number: e.target.value || null })} />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <Label className="mb-1.5 block">Status</Label>
                <SelectRoot value={form.status} onValueChange={(v) => setForm({ ...form, status: v as AssetStatus })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="assigned">Assigned</SelectItem>
                    <SelectItem value="in_maintenance">In maintenance</SelectItem>
                    <SelectItem value="disposed">Disposed</SelectItem>
                    <SelectItem value="lost">Lost</SelectItem>
                  </SelectContent>
                </SelectRoot>
              </div>
              <div>
                <Label className="mb-1.5 block">Condition</Label>
                <SelectRoot value={form.condition} onValueChange={(v) => setForm({ ...form, condition: v as AssetCondition })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="good">Good</SelectItem>
                    <SelectItem value="fair">Fair</SelectItem>
                    <SelectItem value="poor">Poor</SelectItem>
                  </SelectContent>
                </SelectRoot>
              </div>
              <Input label="Purchase Cost (KSh)" type="number" value={form.purchase_cost ?? ''} onChange={(e) => setForm({ ...form, purchase_cost: e.target.value ? Number(e.target.value) : null })} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Purchase Date" type="date" value={form.purchase_date ?? ''} onChange={(e) => setForm({ ...form, purchase_date: e.target.value || null })} />
              <Input label="Supplier" value={form.supplier ?? ''} onChange={(e) => setForm({ ...form, supplier: e.target.value || null })} />
            </div>
            <Input label="Notes" value={form.notes ?? ''} onChange={(e) => setForm({ ...form, notes: e.target.value || null })} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} loading={saving} disabled={!form.name || !form.asset_category_id}>
              {editing ? 'Save Changes' : 'Create Asset'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>

      <ConfirmDelete
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
        title="Delete Asset"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        loading={deleteAsset.isPending}
        onConfirm={() => {
          if (deleteTarget) deleteAsset.mutate(deleteTarget.id);
        }}
      />
    </div>
  );
}
