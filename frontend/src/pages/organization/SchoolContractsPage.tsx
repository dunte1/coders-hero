import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { contractsApi, getErrorMessage } from '@/lib/api';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageSpinner } from '@/components/ui/Spinner';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Badge } from '@/components/ui/Badge';
import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/Dialog';
import { FileText, Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { formatDate } from '@/lib/utils';

interface Contract {
  id: number;
  contract_number: string;
  title: string;
  partner_school?: { id: number; name: string } | null;
  value?: number | string;
  start_date?: string;
  end_date?: string;
  status: string;
  notes?: string | null;
  created_at: string;
}

interface ContractForm {
  contract_number: string;
  title: string;
  partner_school_id: string;
  value: string;
  start_date: string;
  end_date: string;
  status: string;
  notes: string;
}

const STATUS_OPTIONS = ['draft', 'active', 'expired', 'terminated', 'renewed'];

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  draft: 'secondary',
  active: 'default',
  expired: 'destructive',
  terminated: 'destructive',
  renewed: 'default',
};

const EMPTY_FORM: ContractForm = {
  contract_number: '',
  title: '',
  partner_school_id: '',
  value: '',
  start_date: '',
  end_date: '',
  status: 'draft',
  notes: '',
};

export default function SchoolContractsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Contract | null>(null);
  const [form, setForm] = useState<ContractForm>(EMPTY_FORM);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['school-contracts', page, search],
    queryFn: () => contractsApi.getAll({
      page,
      per_page: 15,
      ...(search ? {search} : {}),
    }),
  });

  const createMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => contractsApi.create(data),
    onSuccess: () => {
      toast.success('Contract created');
      queryClient.invalidateQueries({ queryKey: ['school-contracts'] });
      setDialogOpen(false);
    },
    onError: (e: any) => toast.error(getErrorMessage(e)),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Record<string, unknown> }) => contractsApi.update(id, data),
    onSuccess: () => {
      toast.success('Contract updated');
      queryClient.invalidateQueries({ queryKey: ['school-contracts'] });
      setDialogOpen(false);
    },
    onError: (e: any) => toast.error(getErrorMessage(e)),
  });

  const deleteMutation = useMutation({
    mutationFn: contractsApi.delete,
    onSuccess: () => {
      toast.success('Contract deleted');
      queryClient.invalidateQueries({ queryKey: ['school-contracts'] });
    },
    onError: (e: any) => toast.error(getErrorMessage(e)),
  });

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  const openEdit = (contract: Contract) => {
    setEditing(contract);
    setForm({
      contract_number: contract.contract_number ?? '',
      title: contract.title ?? '',
      partner_school_id: contract.partner_school?.id?.toString() ?? '',
      value: contract.value?.toString() ?? '',
      start_date: contract.start_date?.slice(0, 10) ?? '',
      end_date: contract.end_date?.slice(0, 10) ?? '',
      status: contract.status ?? 'draft',
      notes: contract.notes ?? '',
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    const payload: Record<string, unknown> = {
      contract_number: form.contract_number,
      title: form.title,
      partner_school_id: form.partner_school_id ? Number(form.partner_school_id) : null,
      value: form.value ? Number(form.value) : null,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
      status: form.status,
      notes: form.notes || null,
    };
    if (editing) {
      updateMutation.mutate({ id: editing.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleDelete = (id: number) => {
    if (!confirm('Are you sure you want to delete this contract?')) return;
    deleteMutation.mutate(id);
  };

  const columns: Column<Contract>[] = [
    {
      key: 'contract_number',
      header: 'Contract #',
      render: (c) => <span className="font-mono text-sm">{c.contract_number}</span>,
    },
    {
      key: 'title',
      header: 'Title',
      render: (c) => <span className="font-medium text-slate-900">{c.title}</span>,
    },
    {
      key: 'partner_school',
      header: 'Partner School',
      render: (c) => c.partner_school?.name ?? 'â€”',
    },
    {
      key: 'value',
      header: 'Value',
      render: (c) => c.value != null ? `KSh ${Number(c.value).toLocaleString()}` : 'â€”',
    },
    {
      key: 'start_date',
      header: 'Start Date',
      render: (c) => c.start_date ? formatDate(c.start_date) : 'â€”',
    },
    {
      key: 'end_date',
      header: 'End Date',
      render: (c) => c.end_date ? formatDate(c.end_date) : 'â€”',
    },
    {
      key: 'status',
      header: 'Status',
      render: (c) => <Badge variant={STATUS_VARIANT[c.status] ?? 'secondary'}>{c.status}</Badge>,
    },
  ];

  if (isLoading) return <PageSpinner />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="School Contracts"
        description="Manage contracts with partner schools"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Organization', href: '/students/overview' }, { label: 'Contracts' }]}
        actions={<Button onClick={openCreate}><Plus className="h-4 w-4 mr-1.5" /> New Contract</Button>}
      />

      <DataTable
        columns={columns}
        data={(data?.results ?? []) as any[]}
        totalCount={data?.count ?? 0}
        page={page}
        pageSize={15}
        onPageChange={setPage}
        onSearch={setSearch}
        searchPlaceholder="Search contracts..."
        rowActions={(c) => (
          <div className="flex gap-1">
            <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => openEdit(c)}>
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button variant="outline" size="icon" className="h-7 w-7 text-red-600 hover:bg-red-50" onClick={() => handleDelete(c.id)}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
        emptyTitle="No contracts"
        emptyDescription="Create your first school contract."
      />

      <DialogRoot open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Contract' : 'New Contract'}</DialogTitle>
            <DialogDescription>{editing ? 'Update contract details.' : 'Create a new contract with a partner school.'}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Contract Number *</Label>
                <Input value={form.contract_number} onChange={(e) => setForm({ ...form, contract_number: e.target.value })} placeholder="e.g. CTR-2026-001" />
              </div>
              <div>
                <Label>Status</Label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <Label>Title *</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Contract title" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Partner School ID</Label>
                <Input type="number" value={form.partner_school_id} onChange={(e) => setForm({ ...form, partner_school_id: e.target.value })} placeholder="School ID" />
              </div>
              <div>
                <Label>Value (KSh)</Label>
                <Input type="number" min={0} step="0.01" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Start Date</Label>
                <Input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
              </div>
              <div>
                <Label>End Date</Label>
                <Input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
              </div>
            </div>
            <div>
              <Label>Notes</Label>
              <Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Contract notes..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!form.contract_number.trim() || !form.title.trim() || createMutation.isPending || updateMutation.isPending}>
              {editing ? 'Save Changes' : 'Create Contract'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>
    </div>
  );
}
