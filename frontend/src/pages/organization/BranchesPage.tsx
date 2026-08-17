import { useState } from 'react';
import { useBranches, useBranch, useCreateBranch, useUpdateBranch, useDeleteBranch } from '@/hooks/useOrganization';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageSpinner } from '@/components/ui/Spinner';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Switch } from '@/components/ui/Switch';
import { DialogRoot, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/Dialog';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Building2, Plus, Pencil, Trash2 } from 'lucide-react';
import type { Branch, BranchInput } from '@/lib/organizationApi';

const EMPTY_FORM: BranchInput = { name: '', code: '', address: '', city: '', state: '', country: 'Kenya', phone: '', email: '', principal_name: '', notes: '', is_active: true };

export default function BranchesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Branch | null>(null);
  const [form, setForm] = useState<BranchInput>(EMPTY_FORM);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data, isLoading } = useBranches({ page, per_page: 15, search: search || undefined });
  const createBranch = useCreateBranch();
  const updateBranch = useUpdateBranch();
  const deleteBranch = useDeleteBranch();

  const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setDialogOpen(true); };
  const openEdit = (b: Branch) => { setEditing(b); setForm({ name: b.name, code: b.code, address: b.address ?? '', city: b.city ?? '', state: b.state ?? '', country: b.country ?? '', phone: b.phone ?? '', email: b.email ?? '', principal_name: b.principal_name ?? '', notes: b.notes ?? '', is_active: b.is_active }); setDialogOpen(true); };

  const handleSave = () => {
    if (editing) {
      updateBranch.mutate({ id: editing.id, data: form }, { onSuccess: () => setDialogOpen(false) });
    } else {
      createBranch.mutate(form, { onSuccess: () => setDialogOpen(false) });
    }
  };

  const columns: Column<Branch>[] = [
    {
      key: 'name', header: 'Branch',
      render: (b) => (
        <div>
          <p className="font-medium text-slate-900">{b.name}</p>
          <p className="text-xs text-slate-500">Code: {b.code}</p>
        </div>
      ),
    },
    { key: 'city', header: 'City', render: (b) => b.city ?? '—' },
    { key: 'principal_name', header: 'Principal', render: (b) => b.principal_name ?? '—' },
    { key: 'phone', header: 'Phone', render: (b) => b.phone ?? '—' },
    { key: 'email', header: 'Email', render: (b) => b.email ?? '—' },
    { key: 'is_active', header: 'Status', render: (b) => <StatusBadge status={b.is_active ? 'active' : 'archived'} /> },
  ];

  if (isLoading) return <PageSpinner />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Branches"
        description="Manage school branches and their locations"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Organization', href: '/students/overview' }, { label: 'Branches' }]}
        actions={<Button onClick={openCreate}><Plus className="h-4 w-4 mr-1.5" /> Add Branch</Button>}
      />

      <DataTable
        columns={columns}
        data={data?.results ?? []}
        totalCount={data?.meta.total ?? 0}
        page={page}
        pageSize={data?.meta.per_page ?? 15}
        onPageChange={setPage}
        searchPlaceholder="Search branches..."
        onSearch={(q) => { setSearch(q); setPage(1); }}
        rowActions={(b) => (
          <>
            <Button variant="outline" size="sm" onClick={() => openEdit(b)}><Pencil className="h-3.5 w-3.5 mr-1" /> Edit</Button>
            <Button variant="destructive" size="sm" onClick={() => setDeleteId(b.id)}><Trash2 className="h-3.5 w-3.5 mr-1" /> Delete</Button>
          </>
        )}
      />

      {/* Create / Edit Dialog */}
      <DialogRoot open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editing ? 'Edit Branch' : 'Add Branch'}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <Input label="Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <Input label="Code *" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
            </div>
            <Input label="Address" value={form.address ?? ''} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            <div className="grid grid-cols-3 gap-4">
              <Input label="City" value={form.city ?? ''} onChange={(e) => setForm({ ...form, city: e.target.value })} />
              <Input label="State" value={form.state ?? ''} onChange={(e) => setForm({ ...form, state: e.target.value })} />
              <Input label="Country" value={form.country ?? ''} onChange={(e) => setForm({ ...form, country: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Phone" value={form.phone ?? ''} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              <Input label="Email" type="email" value={form.email ?? ''} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <Input label="Principal Name" value={form.principal_name ?? ''} onChange={(e) => setForm({ ...form, principal_name: e.target.value })} />
            <Textarea label="Notes" value={form.notes ?? ''} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            <div className="flex items-center gap-3">
              <Switch checked={form.is_active ?? true} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />
              <span className="text-sm text-slate-700">Active</span>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button onClick={handleSave} disabled={createBranch.isPending || updateBranch.isPending}>
              {createBranch.isPending || updateBranch.isPending ? 'Saving...' : editing ? 'Save Changes' : 'Create Branch'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>

      {/* Delete Confirmation */}
      <DialogRoot open={deleteId !== null} onOpenChange={(v) => { if (!v) setDeleteId(null); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete Branch</DialogTitle></DialogHeader>
          <p className="text-sm text-slate-600">Are you sure you want to delete this branch? This action cannot be undone.</p>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button variant="destructive" onClick={() => { if (deleteId) deleteBranch.mutate(deleteId, { onSuccess: () => setDeleteId(null) }); }} disabled={deleteBranch.isPending}>
              {deleteBranch.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>
    </div>
  );
}
