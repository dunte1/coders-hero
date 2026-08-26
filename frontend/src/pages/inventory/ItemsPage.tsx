import { useState } from 'react';
import {
  useInventoryItems,
  useCreateItem,
  useUpdateItem,
  useDeleteItem,
  useCreateMovement,
  useCategoryOptions,
  useLocationOptions,
} from '@/hooks/useInventory';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageSpinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
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
import { Plus, Pencil, Trash2, ArrowDownUp } from 'lucide-react';
import type { InventoryItem } from '@/types/inventory';
import type { InventoryItemInput, StockMovementInput } from '@/lib/inventoryApi';

const emptyForm: InventoryItemInput = {
  name: '',
  sku: '',
  asset_category_id: 0,
  location_id: null,
  quantity: 0,
  unit: 'pcs',
  reorder_level: 0,
  unit_cost: null,
  supplier: null,
  notes: null,
  is_active: true,
};

const emptyMovement: StockMovementInput = {
  type: 'in',
  quantity: 1,
  reference: null,
  note: null,
};

export default function ItemsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<InventoryItem | null>(null);
  const [form, setForm] = useState<InventoryItemInput>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<InventoryItem | null>(null);

  const [movementOpen, setMovementOpen] = useState(false);
  const [movementItem, setMovementItem] = useState<InventoryItem | null>(null);
  const [movementForm, setMovementForm] = useState<StockMovementInput>(emptyMovement);
  const [savingMovement, setSavingMovement] = useState(false);

  const { data, isLoading } = useInventoryItems({ page, search });
  const createItem = useCreateItem();
  const updateItem = useUpdateItem();
  const deleteItem = useDeleteItem();
  const createMovement = useCreateMovement();
  const { data: categories = [] } = useCategoryOptions();
  const { data: locations = [] } = useLocationOptions();

  const items = data?.results || [];

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (item: InventoryItem) => {
    setEditing(item);
    setForm({
      name: item.name,
      sku: item.sku,
      asset_category_id: item.category_id,
      location_id: item.location_id,
      quantity: item.quantity,
      unit: item.unit,
      reorder_level: item.reorder_level,
      unit_cost: item.unit_cost,
      supplier: item.supplier,
      notes: item.notes,
      is_active: item.is_active,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.asset_category_id) return;
    setSaving(true);
    try {
      if (editing) {
        await updateItem.mutateAsync({ id: editing.id, data: form });
      } else {
        await createItem.mutateAsync(form);
      }
      setDialogOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item: InventoryItem) => {
    setDeleteTarget(item);
  };

  const openMovement = (item: InventoryItem) => {
    setMovementItem(item);
    setMovementForm(emptyMovement);
    setMovementOpen(true);
  };

  const handleMovement = async () => {
    if (!movementItem || !movementForm.quantity) return;
    setSavingMovement(true);
    try {
      await createMovement.mutateAsync({ itemId: movementItem.id, data: movementForm });
      setMovementOpen(false);
    } finally {
      setSavingMovement(false);
    }
  };

  const columns: Column<InventoryItem>[] = [
    { key: 'name', header: 'Name', render: (i) => <span className="font-medium text-slate-900">{i.name}</span> },
    { key: 'sku', header: 'SKU', render: (i) => <span className="font-mono text-xs text-slate-500">{i.sku}</span> },
    { key: 'category', header: 'Category', render: (i) => i.category?.name ?? '—' },
    { key: 'location', header: 'Location', render: (i) => i.location?.name ?? '—' },
    {
      key: 'quantity',
      header: 'Qty',
      render: (i) => (
        <span className="font-semibold text-slate-900">
          {i.quantity} <span className="text-xs font-normal text-slate-400">{i.unit}</span>
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Stock',
      render: (i) => (i.is_low_stock ? <Badge variant="destructive">Low stock</Badge> : <Badge variant="success">In stock</Badge>),
    },
    {
      key: 'unit_cost',
      header: 'Unit Cost',
      render: (i) => <span className="text-slate-600">{i.unit_cost != null ? 'KSh ' + Number(i.unit_cost).toLocaleString() : '—'}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Stock Items"
        description="Consumables and tracked supplies"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Inventory', href: '/inventory' }, { label: 'Stock Items' }]}
        actions={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" /> New Item
          </Button>
        }
      />

      <Card>
        <CardContent className="p-5">
          <DataTable
            columns={columns}
            data={items}
            totalCount={data?.meta.total}
            page={data?.meta.current_page}
            pageSize={data?.meta.per_page}
            onPageChange={(p) => setPage(p)}
            onSearch={(q) => {
              setSearch(q);
              setPage(1);
            }}
            loading={isLoading}
            emptyTitle="No stock items found"
            emptyDescription="Add consumables and supplies to start tracking stock."
            rowActions={(i) => (
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openMovement(i)} title="Record movement">
                  <ArrowDownUp className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(i)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600" onClick={() => handleDelete(i)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          />
        </CardContent>
      </Card>

      {/* Create/edit item dialog */}
      <DialogRoot open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Stock Item' : 'New Stock Item'}</DialogTitle>
            <DialogDescription>
              {editing ? 'Update the stock item details.' : 'Register a new consumable or supply item.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <Input label="SKU *" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
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
            </div>
            <div className="grid gap-4 sm:grid-cols-4">
              <Input label="Opening Qty" type="number" value={form.quantity ?? 0} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })} />
              <Input label="Unit" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} />
              <Input label="Reorder Level" type="number" value={form.reorder_level ?? 0} onChange={(e) => setForm({ ...form, reorder_level: Number(e.target.value) })} />
              <Input label="Unit Cost (KSh)" type="number" value={form.unit_cost ?? ''} onChange={(e) => setForm({ ...form, unit_cost: e.target.value ? Number(e.target.value) : null })} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Supplier" value={form.supplier ?? ''} onChange={(e) => setForm({ ...form, supplier: e.target.value || null })} />
              <div className="flex items-end pb-2">
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={form.is_active ?? true}
                    onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                    className="h-4 w-4 rounded border-slate-300 text-brand-600"
                  />
                  Active item
                </label>
              </div>
            </div>
            <Textarea label="Notes" value={form.notes ?? ''} onChange={(e) => setForm({ ...form, notes: e.target.value || null })} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} loading={saving} disabled={!form.name || !form.sku || !form.asset_category_id}>
              {editing ? 'Save Changes' : 'Create Item'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>

      {/* Movement dialog */}
      <DialogRoot open={movementOpen} onOpenChange={setMovementOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Movement</DialogTitle>
            <DialogDescription>{movementItem ? `Adjust stock for "${movementItem.name}".` : 'Record a stock movement.'}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="mb-1.5 block">Type</Label>
              <SelectRoot value={movementForm.type} onValueChange={(v) => setMovementForm({ ...movementForm, type: v as StockMovementInput['type'] })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="in">Stock In (receipt)</SelectItem>
                  <SelectItem value="out">Stock Out (issue)</SelectItem>
                  <SelectItem value="adjustment">Adjustment</SelectItem>
                </SelectContent>
              </SelectRoot>
            </div>
            <Input label="Quantity *" type="number" min={1} value={movementForm.quantity} onChange={(e) => setMovementForm({ ...movementForm, quantity: Number(e.target.value) })} />
            <Input label="Reference" value={movementForm.reference ?? ''} onChange={(e) => setMovementForm({ ...movementForm, reference: e.target.value || null })} placeholder="e.g. PO-001, Issue note #12" />
            <Textarea label="Note" value={movementForm.note ?? ''} onChange={(e) => setMovementForm({ ...movementForm, note: e.target.value || null })} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMovementOpen(false)}>Cancel</Button>
            <Button onClick={handleMovement} loading={savingMovement} disabled={!movementForm.quantity}>
              Record Movement
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>

      <ConfirmDelete
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
        title="Delete Stock Item"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        loading={deleteItem.isPending}
        onConfirm={() => {
          if (deleteTarget) deleteItem.mutate(deleteTarget.id);
        }}
      />
    </div>
  );
}
