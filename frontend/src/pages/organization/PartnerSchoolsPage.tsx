import { useState } from 'react';
import { usePartnerSchools, usePartnerSchool, useCreatePartnerSchool, useUpdatePartnerSchool, useDeletePartnerSchool } from '@/hooks/useOrganization';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageSpinner } from '@/components/ui/Spinner';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Switch } from '@/components/ui/Switch';
import { SelectRoot, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/Select';
import { DialogRoot, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/Dialog';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { GraduationCap, Plus, Pencil, Trash2 } from 'lucide-react';
import type { PartnerSchool, PartnerSchoolInput } from '@/lib/organizationApi';

const TYPES = ['feeder', 'sibling', 'affiliate', 'other'] as const;
const TYPE_LABELS: Record<string, string> = { feeder: 'Feeder', sibling: 'Sibling', affiliate: 'Affiliate', other: 'Other' };

const EMPTY_FORM: PartnerSchoolInput = { name: '', contact_person: '', contact_email: '', contact_phone: '', address: '', city: '', country: 'Kenya', partnership_type: 'feeder', notes: '', is_active: true };

export default function PartnerSchoolsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<PartnerSchool | null>(null);
  const [form, setForm] = useState<PartnerSchoolInput>(EMPTY_FORM);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data, isLoading } = usePartnerSchools({ page, per_page: 15, search: search || undefined, partnership_type: typeFilter || undefined });
  const createSchool = useCreatePartnerSchool();
  const updateSchool = useUpdatePartnerSchool();
  const deleteSchool = useDeletePartnerSchool();

  const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setDialogOpen(true); };
  const openEdit = (s: PartnerSchool) => { setEditing(s); setForm({ name: s.name, contact_person: s.contact_person ?? '', contact_email: s.contact_email ?? '', contact_phone: s.contact_phone ?? '', address: s.address ?? '', city: s.city ?? '', country: s.country ?? '', partnership_type: s.partnership_type, notes: s.notes ?? '', is_active: s.is_active }); setDialogOpen(true); };

  const handleSave = () => {
    if (editing) {
      updateSchool.mutate({ id: editing.id, data: form }, { onSuccess: () => setDialogOpen(false) });
    } else {
      createSchool.mutate(form, { onSuccess: () => setDialogOpen(false) });
    }
  };

  const columns: Column<PartnerSchool>[] = [
    {
      key: 'name', header: 'School',
      render: (s) => (
        <div>
          <p className="font-medium text-slate-900">{s.name}</p>
          {s.city && <p className="text-xs text-slate-500">{s.city}, {s.country ?? ''}</p>}
        </div>
      ),
    },
    { key: 'partnership_type', header: 'Type', render: (s) => <StatusBadge status={s.partnership_type} /> },
    { key: 'contact_person', header: 'Contact', render: (s) => s.contact_person ?? '—' },
    { key: 'contact_email', header: 'Email', render: (s) => s.contact_email ?? '—' },
    { key: 'contact_phone', header: 'Phone', render: (s) => s.contact_phone ?? '—' },
    { key: 'is_active', header: 'Status', render: (s) => <StatusBadge status={s.is_active ? 'active' : 'archived'} /> },
  ];

  if (isLoading) return <PageSpinner />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Partner Schools"
        description="Manage partner school relationships and affiliations"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Organization', href: '/students/overview' }, { label: 'Partner Schools' }]}
        actions={<Button onClick={openCreate}><Plus className="h-4 w-4 mr-1.5" /> Add Partner School</Button>}
      />

      <DataTable
        columns={columns}
        data={data?.results ?? []}
        totalCount={data?.meta.total ?? 0}
        page={page}
        pageSize={data?.meta.per_page ?? 15}
        onPageChange={setPage}
        searchPlaceholder="Search partner schools..."
        onSearch={(q) => { setSearch(q); setPage(1); }}
        filters={
          <SelectRoot value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setPage(1); }}>
            <SelectTrigger className="w-44"><SelectValue placeholder="All types" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="">All types</SelectItem>
              {TYPES.map((t) => <SelectItem key={t} value={t}>{TYPE_LABELS[t]}</SelectItem>)}
            </SelectContent>
          </SelectRoot>
        }
        rowActions={(s) => (
          <>
            <Button variant="outline" size="sm" onClick={() => openEdit(s)}><Pencil className="h-3.5 w-3.5 mr-1" /> Edit</Button>
            <Button variant="destructive" size="sm" onClick={() => setDeleteId(s.id)}><Trash2 className="h-3.5 w-3.5 mr-1" /> Delete</Button>
          </>
        )}
      />

      {/* Create / Edit Dialog */}
      <DialogRoot open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editing ? 'Edit Partner School' : 'Add Partner School'}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <Input label="School Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input label="Contact Person" value={form.contact_person ?? ''} onChange={(e) => setForm({ ...form, contact_person: e.target.value })} />
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Partnership Type</label>
                <SelectRoot value={form.partnership_type ?? 'feeder'} onValueChange={(v) => setForm({ ...form, partnership_type: v as PartnerSchoolInput['partnership_type'] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TYPES.map((t) => <SelectItem key={t} value={t}>{TYPE_LABELS[t]}</SelectItem>)}
                  </SelectContent>
                </SelectRoot>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input label="Contact Email" type="email" value={form.contact_email ?? ''} onChange={(e) => setForm({ ...form, contact_email: e.target.value })} />
              <Input label="Contact Phone" value={form.contact_phone ?? ''} onChange={(e) => setForm({ ...form, contact_phone: e.target.value })} />
            </div>
            <Input label="Address" value={form.address ?? ''} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <Input label="City" value={form.city ?? ''} onChange={(e) => setForm({ ...form, city: e.target.value })} />
              <Input label="Country" value={form.country ?? ''} onChange={(e) => setForm({ ...form, country: e.target.value })} />
            </div>
            <Textarea label="Notes" value={form.notes ?? ''} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            <div className="flex items-center gap-3">
              <Switch checked={form.is_active ?? true} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />
              <span className="text-sm text-slate-700">Active</span>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button onClick={handleSave} disabled={createSchool.isPending || updateSchool.isPending}>
              {createSchool.isPending || updateSchool.isPending ? 'Saving...' : editing ? 'Save Changes' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>

      {/* Delete Confirmation */}
      <DialogRoot open={deleteId !== null} onOpenChange={(v) => { if (!v) setDeleteId(null); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete Partner School</DialogTitle></DialogHeader>
          <p className="text-sm text-slate-600">Are you sure you want to delete this partner school? This action cannot be undone.</p>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button variant="destructive" onClick={() => { if (deleteId) deleteSchool.mutate(deleteId, { onSuccess: () => setDeleteId(null) }); }} disabled={deleteSchool.isPending}>
              {deleteSchool.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>
    </div>
  );
}
