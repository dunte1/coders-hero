import { useState } from 'react';
import { useAcademicYears, useCreateAcademicYear, useUpdateAcademicYear, useDeleteAcademicYear, useSetCurrentAcademicYear } from '@/hooks/useOrganization';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageSpinner } from '@/components/ui/Spinner';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Switch } from '@/components/ui/Switch';
import { DialogRoot, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/Dialog';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { CalendarCheck, Plus, Pencil, Trash2, Star } from 'lucide-react';
import type { AcademicYear, AcademicYearInput } from '@/lib/organizationApi';

const EMPTY_FORM: AcademicYearInput = { name: '', start_date: '', end_date: '', is_current: false, notes: '' };

export default function AcademicYearsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<AcademicYear | null>(null);
  const [form, setForm] = useState<AcademicYearInput>(EMPTY_FORM);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data, isLoading } = useAcademicYears({ page, per_page: 15, search: search || undefined });
  const createYear = useCreateAcademicYear();
  const updateYear = useUpdateAcademicYear();
  const deleteYear = useDeleteAcademicYear();
  const setCurrent = useSetCurrentAcademicYear();

  const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setDialogOpen(true); };
  const openEdit = (y: AcademicYear) => { setEditing(y); setForm({ name: y.name, start_date: y.start_date.split('T')[0], end_date: y.end_date.split('T')[0], is_current: y.is_current, notes: y.notes ?? '' }); setDialogOpen(true); };

  const handleSave = () => {
    if (editing) {
      updateYear.mutate({ id: editing.id, data: form }, { onSuccess: () => setDialogOpen(false) });
    } else {
      createYear.mutate(form, { onSuccess: () => setDialogOpen(false) });
    }
  };

  const columns: Column<AcademicYear>[] = [
    {
      key: 'name', header: 'Academic Year',
      render: (y) => (
        <div className="flex items-center gap-2">
          <div>
            <p className="font-medium text-slate-900">{y.name}</p>
            <p className="text-xs text-slate-500">{y.start_date} — {y.end_date}</p>
          </div>
        </div>
      ),
    },
    { key: 'is_current', header: 'Status', render: (y) => y.is_current ? <StatusBadge status="active" /> : <StatusBadge status="archived" /> },
  ];

  if (isLoading) return <PageSpinner />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Academic Years"
        description="Configure academic years, terms, and semesters"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Organization', href: '/students/overview' }, { label: 'Academic Years' }]}
        actions={<Button onClick={openCreate}><Plus className="h-4 w-4 mr-1.5" /> Add Academic Year</Button>}
      />

      <DataTable
        columns={columns}
        data={data?.results ?? []}
        totalCount={data?.meta.total ?? 0}
        page={page}
        pageSize={data?.meta.per_page ?? 15}
        onPageChange={setPage}
        searchPlaceholder="Search academic years..."
        onSearch={(q) => { setSearch(q); setPage(1); }}
        rowActions={(y) => (
          <>
            {!y.is_current && (
              <Button variant="outline" size="sm" onClick={() => setCurrent.mutate(y.id)} disabled={setCurrent.isPending}>
                <Star className="h-3.5 w-3.5 mr-1" /> Set Current
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={() => openEdit(y)}><Pencil className="h-3.5 w-3.5 mr-1" /> Edit</Button>
            <Button variant="destructive" size="sm" onClick={() => setDeleteId(y.id)}><Trash2 className="h-3.5 w-3.5 mr-1" /> Delete</Button>
          </>
        )}
      />

      {/* Create / Edit Dialog */}
      <DialogRoot open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editing ? 'Edit Academic Year' : 'Add Academic Year'}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <Input label="Name *" placeholder="e.g. 2026/2027" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Start Date *" type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
              <Input label="End Date *" type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={form.is_current ?? false} onCheckedChange={(v) => setForm({ ...form, is_current: v })} />
              <span className="text-sm text-slate-700">Set as current academic year</span>
            </div>
            <Textarea label="Notes" value={form.notes ?? ''} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button onClick={handleSave} disabled={createYear.isPending || updateYear.isPending}>
              {createYear.isPending || updateYear.isPending ? 'Saving...' : editing ? 'Save Changes' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>

      {/* Delete Confirmation */}
      <DialogRoot open={deleteId !== null} onOpenChange={(v) => { if (!v) setDeleteId(null); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete Academic Year</DialogTitle></DialogHeader>
          <p className="text-sm text-slate-600">Are you sure you want to delete this academic year? This action cannot be undone.</p>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button variant="destructive" onClick={() => { if (deleteId) deleteYear.mutate(deleteId, { onSuccess: () => setDeleteId(null) }); }} disabled={deleteYear.isPending}>
              {deleteYear.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>
    </div>
  );
}
