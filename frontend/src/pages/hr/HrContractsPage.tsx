import { useState } from 'react';
import { useHrContracts, useHrEmployees, useCreateContract, useUpdateContract, useTerminateContract, useDeleteContract } from '@/hooks/useHr';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageSpinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
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
import { Plus, Pencil, Trash2, FileText, Ban } from 'lucide-react';
import { CONTRACT_TYPES } from '@/types/hr';
import type { EmployeeContract, EmployeeContractInput } from '@/types/hr';

const emptyForm: EmployeeContractInput = {
  employee_id: 0,
  contract_no: '',
  type: 'permanent',
  start_date: new Date().toISOString().slice(0, 10),
  end_date: null,
  salary: null,
  status: 'active',
  signed_on: null,
  notes: null,
};

export default function HrContractsPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [type, setType] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<EmployeeContract | null>(null);
  const [form, setForm] = useState<EmployeeContractInput>(emptyForm);

  const { data, isLoading } = useHrContracts({
    page,
    per_page: 15,
    status: status || undefined,
    type: type || undefined,
  });
  const { data: employeesData } = useHrEmployees({ per_page: 200 });
  const createContract = useCreateContract();
  const updateContract = useUpdateContract();
  const terminateContract = useTerminateContract();
  const deleteContract = useDeleteContract();

  const employees = employeesData?.results || [];
  const contracts = data?.results || [];

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm });
    setDialogOpen(true);
  };

  const openEdit = (contract: EmployeeContract) => {
    setEditing(contract);
    setForm({
      employee_id: contract.employee_id,
      contract_no: contract.contract_no ?? '',
      type: contract.type,
      start_date: contract.start_date.slice(0, 10),
      end_date: contract.end_date?.slice(0, 10) ?? null,
      salary: contract.salary != null ? contract.salary : null,
      status: contract.status,
      signed_on: contract.signed_on?.slice(0, 10) ?? null,
      notes: contract.notes,
    });
    setDialogOpen(true);
  };

  const submit = () => {
    const payload: EmployeeContractInput = {
      ...form,
      contract_no: form.contract_no || null,
      end_date: form.end_date || null,
      salary: form.salary != null && form.salary > 0 ? form.salary : null,
      signed_on: form.signed_on || null,
      notes: form.notes || null,
    };
    if (editing) {
      updateContract.mutate({ id: editing.id, data: payload }, { onSuccess: () => setDialogOpen(false) });
    } else {
      createContract.mutate(payload, { onSuccess: () => setDialogOpen(false) });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Contracts"
        description="Employment contracts and terms"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'HR', href: '/hr' }, { label: 'Contracts' }]}
        actions={
          <Button onClick={openCreate}>
            <Plus className="mr-1 h-4 w-4" /> New Contract
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <SelectRoot value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
          <SelectTrigger label="Status" className="w-40">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All statuses</SelectItem>
            {['active', 'expired', 'terminated', 'superseded'].map((s) => (
              <SelectItem key={s} value={s}>
                {s.replace(/_/g, ' ')}
              </SelectItem>
            ))}
          </SelectContent>
        </SelectRoot>
        <SelectRoot value={type} onValueChange={(v) => { setType(v); setPage(1); }}>
          <SelectTrigger label="Type" className="w-40">
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All types</SelectItem>
            {CONTRACT_TYPES.map((t) => (
              <SelectItem key={t} value={t}>
                {t.replace(/_/g, ' ')}
              </SelectItem>
            ))}
          </SelectContent>
        </SelectRoot>
      </div>

      {isLoading ? (
        <PageSpinner />
      ) : contracts.length === 0 ? (
        <EmptyState icon={FileText} title="No contracts" description="Create a contract to get started." />
      ) : (
        <>
          <div className="space-y-3">
            {contracts.map((contract) => (
              <Card key={contract.id}>
                <CardContent className="p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900">
                        {contract.contract_no ?? `Contract #${contract.id}`}
                      </p>
                      <p className="text-sm text-slate-500">
                        {contract.employee?.user?.name ?? 'Unknown employee'} · {contract.type} ·{' '}
                        {contract.start_date}
                        {contract.end_date ? ` → ${contract.end_date}` : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {contract.salary != null && (
                        <span className="text-sm font-medium text-slate-900">
                          KSh {Number(contract.salary).toLocaleString()}
                        </span>
                      )}
                      <StatusBadge status={contract.status} />
                      {contract.status === 'active' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => terminateContract.mutate({ id: contract.id, status: 'terminated' })}
                        >
                          <Ban className="mr-1 h-3.5 w-3.5" /> Terminate
                        </Button>
                      )}
                      <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => openEdit(contract)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 text-red-600 hover:bg-red-50"
                        onClick={() => deleteContract.mutate(contract.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
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
            <DialogTitle>{editing ? 'Edit Contract' : 'New Contract'}</DialogTitle>
            <DialogDescription>Record employment terms for an employee.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Employee</Label>
              <SelectRoot
                value={form.employee_id ? String(form.employee_id) : undefined}
                onValueChange={(v) => setForm({ ...form, employee_id: Number(v) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((e) => (
                    <SelectItem key={e.id} value={String(e.id)}>
                      {e.user?.name ?? e.employee_id} ({e.employee_id})
                    </SelectItem>
                  ))}
                </SelectContent>
              </SelectRoot>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Contract no.</Label>
                <Input
                  value={form.contract_no ?? ''}
                  onChange={(e) => setForm({ ...form, contract_no: e.target.value })}
                  placeholder="e.g. CT-2026-001"
                />
              </div>
              <div>
                <Label>Type</Label>
                <SelectRoot
                  value={form.type}
                  onValueChange={(v) => setForm({ ...form, type: v as EmployeeContractInput['type'] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CONTRACT_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t.replace(/_/g, ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </SelectRoot>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Start date</Label>
                <Input
                  type="date"
                  value={form.start_date}
                  onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                />
              </div>
              <div>
                <Label>End date</Label>
                <Input
                  type="date"
                  value={form.end_date ?? ''}
                  onChange={(e) => setForm({ ...form, end_date: e.target.value || null })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Salary (KSh)</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.salary ?? ''}
                  onChange={(e) => setForm({ ...form, salary: e.target.value ? Number(e.target.value) : null })}
                />
              </div>
              <div>
                <Label>Status</Label>
                <SelectRoot
                  value={form.status}
                  onValueChange={(v) => setForm({ ...form, status: v as EmployeeContractInput['status'] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {['active', 'expired', 'terminated', 'superseded'].map((s) => (
                      <SelectItem key={s} value={s}>
                        {s.replace(/_/g, ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </SelectRoot>
              </div>
            </div>
            <div>
              <Label>Signed on</Label>
              <Input
                type="date"
                value={form.signed_on ?? ''}
                onChange={(e) => setForm({ ...form, signed_on: e.target.value || null })}
              />
            </div>
            <div>
              <Label>Notes</Label>
              <Input
                value={form.notes ?? ''}
                onChange={(e) => setForm({ ...form, notes: e.target.value || null })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={submit} loading={createContract.isPending || updateContract.isPending}>
              {editing ? 'Save Changes' : 'Create Contract'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>
    </div>
  );
}
