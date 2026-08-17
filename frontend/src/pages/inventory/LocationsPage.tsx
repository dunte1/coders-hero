import { useState } from 'react';
import { useInventoryLocations, useCreateLocation, useUpdateLocation, useDeleteLocation } from '@/hooks/useInventory';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageSpinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/Dialog';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import type { Location } from '@/types/inventory';
import type { LocationInput } from '@/lib/inventoryApi';

const emptyForm: LocationInput = { name: '', code: '', description: null, is_active: true };

export default function LocationsPage() {
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Location | null>(null);
  const [form, setForm] = useState<LocationInput>(emptyForm);
  const [saving, setSaving] = useState(false);

  const { data, isLoading } = useInventoryLocations({ page });
  const createLocation = useCreateLocation();
  const updateLocation = useUpdateLocation();
  const deleteLocation = useDeleteLocation();

  const locations = data?.results || [];

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (l: Location) => {
    setEditing(l);
    setForm({ name: l.name, code: l.code, description: l.description, is_active: l.is_active });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.code) return;
    setSaving(true);
    try {
      if (editing) {
        await updateLocation.mutateAsync({ id: editing.id, data: form });
      } else {
        await createLocation.mutateAsync(form);
      }
      setDialogOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (l: Location) => {
    if (!window.confirm(`Delete location "${l.name}"?`)) return;
    await deleteLocation.mutateAsync(l.id);
  };

  const columns: Column<Location>[] = [
    { key: 'name', header: 'Name', render: (l) => <span className="font-medium text-slate-900">{l.name}</span> },
    { key: 'code', header: 'Code', render: (l) => <span className="font-mono text-xs text-slate-500">{l.code}</span> },
    { key: 'description', header: 'Description', render: (l) => <span className="text-slate-600">{l.description ?? '—'}</span> },
    { key: 'assets', header: 'Assets', render: (l) => l.assets_count ?? 0 },
    { key: 'items', header: 'Items', render: (l) => l.items_count ?? 0 },
    { key: 'active', header: 'Active', render: (l) => (l.is_active ? <Badge variant="success">Active</Badge> : <Badge variant="secondary">Inactive</Badge>) },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Locations"
        description="Stores, labs and campuses where items are kept"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Inventory', href: '/inventory' }, { label: 'Locations' }]}
        actions={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" /> New Location
          </Button>
        }
      />

      <Card>
        <CardContent className="p-5">
          <DataTable
            columns={columns}
            data={locations}
            totalCount={data?.meta.total}
            page={data?.meta.current_page}
            pageSize={data?.meta.per_page}
            onPageChange={(p) => setPage(p)}
            loading={isLoading}
            emptyTitle="No locations"
            emptyDescription="Add locations like stores and labs to track where items are kept."
            rowActions={(l) => (
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(l)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600" onClick={() => handleDelete(l)}>
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
            <DialogTitle>{editing ? 'Edit Location' : 'New Location'}</DialogTitle>
            <DialogDescription>Locations track where assets and stock are stored.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. STEM Lab A" />
              <Input label="Code *" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="e.g. STEM-A" />
            </div>
            <Textarea label="Description" value={form.description ?? ''} onChange={(e) => setForm({ ...form, description: e.target.value || null })} />
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={form.is_active ?? true}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                className="h-4 w-4 rounded border-slate-300 text-brand-600"
              />
              Active location
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} loading={saving} disabled={!form.name || !form.code}>
              {editing ? 'Save Changes' : 'Create Location'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>
    </div>
  );
}
