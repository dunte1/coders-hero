import { useState } from 'react';
import { useFeeStructures, useCreateFeeStructure, useUpdateFeeStructure, useDeleteFeeStructure } from '@/hooks/useFinance';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageSpinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { SearchInput } from '@/components/ui/SearchInput';
import { Pagination } from '@/components/ui/Pagination';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import {
  SelectRoot,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/Select';
import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/Dialog';
import { Plus, Pencil, Trash2, Wallet } from 'lucide-react';
import type { FeeStructure, FeeStructureInput, FeeType } from '@/types/finance';

const FEE_TYPES: { value: FeeType; label: string }[] = [
  { value: 'tuition', label: 'Tuition' },
  { value: 'lunch', label: 'Lunch' },
  { value: 'transport', label: 'Transport' },
  { value: 'exam', label: 'Exam' },
  { value: 'uniform', label: 'Uniform' },
  { value: 'activity', label: 'Activity' },
  { value: 'other', label: 'Other' },
];

const emptyForm: FeeStructureInput = {
  name: '',
  fee_type: 'tuition',
  amount: 0,
  term: null,
  grade_level: null,
  description: null,
  is_active: true,
};

export default function FeeStructuresPage() {
  const [page, setPage] = useState(1);
  const [feeType, setFeeType] = useState<FeeType | 'all'>('all');
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<FeeStructure | null>(null);
  const [form, setForm] = useState<FeeStructureInput>(emptyForm);

  const { data, isLoading } = useFeeStructures({
    page,
    fee_type: feeType === 'all' ? undefined : feeType,
    search: search || undefined,
  });

  const createFeeStructure = useCreateFeeStructure();
  const updateFeeStructure = useUpdateFeeStructure();
  const deleteFeeStructure = useDeleteFeeStructure();

  const structures = data?.results || [];

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (structure: FeeStructure) => {
    setEditing(structure);
    setForm({
      name: structure.name,
      fee_type: structure.fee_type,
      amount: Number(structure.amount),
      term: structure.term,
      grade_level: structure.grade_level,
      description: structure.description,
      is_active: structure.is_active,
    });
    setDialogOpen(true);
  };

  const submit = () => {
    const payload: FeeStructureInput = {
      ...form,
      term: form.term || null,
      grade_level: form.grade_level || null,
      description: form.description || null,
    };

    if (editing) {
      updateFeeStructure.mutate({ id: editing.id, data: payload }, { onSuccess: () => setDialogOpen(false) });
    } else {
      createFeeStructure.mutate(payload, { onSuccess: () => setDialogOpen(false) });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fee Structures"
        description="Standard fees applied by term and grade level"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Finance', href: '/finance' }, { label: 'Fee Structures' }]}
        actions={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4 mr-1" /> New Fee Structure
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <SearchInput value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search fee structures..." className="w-full sm:w-64" />
        <SelectRoot value={feeType} onValueChange={(v) => { setFeeType(v as FeeType | 'all'); setPage(1); }}>
          <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {FEE_TYPES.map((t) => (
              <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
            ))}
          </SelectContent>
        </SelectRoot>
      </div>

      {isLoading ? (
        <PageSpinner />
      ) : structures.length === 0 ? (
        <EmptyState icon={Wallet} title="No fee structures found" description="Create a fee structure to start invoicing." />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {structures.map((structure) => (
              <Card key={structure.id}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                      <Wallet className="h-5 w-5" />
                    </div>
                    <StatusBadge status={structure.is_active ? 'active' : 'inactive'} />
                  </div>
                  <h3 className="mt-3 font-semibold text-slate-900">{structure.name}</h3>
                  <p className="mt-1 text-sm text-slate-500 capitalize">{structure.fee_type.replace(/_/g, ' ')}</p>
                  <p className="mt-3 text-xl font-bold text-slate-900">
                    KSh {Number(structure.amount).toLocaleString()}
                  </p>
                  {(structure.term || structure.grade_level) && (
                    <p className="mt-1 text-xs text-slate-500">
                      {[structure.term, structure.grade_level].filter(Boolean).join(' · ') || 'All grades'}
                    </p>
                  )}
                  <div className="mt-4 flex items-center justify-end gap-2">
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => openEdit(structure)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 text-red-600 hover:bg-red-50"
                      onClick={() => deleteFeeStructure.mutate(structure.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {data?.meta && data.meta.last_page > 1 && (
            <Pagination
              currentPage={data.meta.current_page}
              totalPages={data.meta.last_page}
              onPageChange={setPage}
              totalCount={data.meta.total}
              pageSize={data.meta.per_page}
            />
          )}
        </>
      )}

      <DialogRoot open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Fee Structure' : 'New Fee Structure'}</DialogTitle>
            <DialogDescription>
              Define a standard fee applied to students.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Tuition - Term 1" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Fee Type</Label>
                <SelectRoot value={form.fee_type} onValueChange={(v) => setForm({ ...form, fee_type: v as FeeType })}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {FEE_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </SelectRoot>
              </div>
              <div>
                <Label>Amount (KSh)</Label>
                <Input type="number" min={0} step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Term</Label>
                <Input value={form.term ?? ''} onChange={(e) => setForm({ ...form, term: e.target.value || null })} placeholder="e.g. Term 1" />
              </div>
              <div>
                <Label>Grade Level</Label>
                <Input value={form.grade_level ?? ''} onChange={(e) => setForm({ ...form, grade_level: e.target.value || null })} placeholder="e.g. Grade 7 (blank = all)" />
              </div>
            </div>
            <div>
              <Label>Description</Label>
              <Input value={form.description ?? ''} onChange={(e) => setForm({ ...form, description: e.target.value || null })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={submit} loading={createFeeStructure.isPending || updateFeeStructure.isPending}>
              {editing ? 'Save Changes' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>
    </div>
  );
}
