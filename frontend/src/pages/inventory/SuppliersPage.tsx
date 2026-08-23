import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { suppliersApi, getErrorMessage } from '@/lib/api';
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
import { Users, Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { formatDate } from '@/lib/utils';

interface Supplier {
  id: number;
  name: string;
  contact_person?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  is_active: boolean;
  created_at: string;
}

interface SupplierForm {
  name: string;
  contact_person: string;
  email: string;
  phone: string;
  address: string;
  city: string;
}

const EMPTY_FORM: SupplierForm = {
  name: '',
  contact_person: '',
  email: '',
  phone: '',
  address: '',
  city: '',
};

export default function SuppliersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [form, setForm] = useState<SupplierForm>(EMPTY_FORM);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['suppliers', page, search],
    queryFn: () => suppliersApi.getAll({
      page,
      per_page: 15,
      ...(search ? {search} : {}),
    }),
  });

  const createMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => suppliersApi.create(data),
    onSuccess: () => {
      toast.success('Supplier created');
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      setDialogOpen(false);
    },
    onError: (e: any) => toast.error(getErrorMessage(e)),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Record<string, unknown> }) => suppliersApi.update(id, data),
    onSuccess: () => {
      toast.success('Supplier updated');
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      setDialogOpen(false);
    },
    onError: (e: any) => toast.error(getErrorMessage(e)),
  });

  const deleteMutation = useMutation({
    mutationFn: suppliersApi.delete,
    onSuccess: () => {
      toast.success('Supplier deleted');
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
    },
    onError: (e: any) => toast.error(getErrorMessage(e)),
  });

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  const openEdit = (supplier: Supplier) => {
    setEditing(supplier);
    setForm({
      name: supplier.name ?? '',
      contact_person: supplier.contact_person ?? '',
      email: supplier.email ?? '',
      phone: supplier.phone ?? '',
      address: supplier.address ?? '',
      city: supplier.city ?? '',
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    const payload: Record<string, unknown> = {
      name: form.name,
      contact_person: form.contact_person || null,
      email: form.email || null,
      phone: form.phone || null,
      address: form.address || null,
      city: form.city || null,
    };
    if (editing) {
      updateMutation.mutate({ id: editing.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleDelete = (id: number) => {
    if (!confirm('Are you sure you want to delete this supplier?')) return;
    deleteMutation.mutate(id);
  };

  const columns: Column<Supplier>[] = [
    {
      key: 'name',
      header: 'Supplier',
      render: (s) => (
        <div>
          <p className="font-medium text-slate-900">{s.name}</p>
          {s.city && <p className="text-xs text-slate-500">{s.city}</p>}
        </div>
      ),
    },
    { key: 'contact_person', header: 'Contact Person', render: (s) => s.contact_person ?? 'â€”' },
    { key: 'email', header: 'Email', render: (s) => s.email ?? 'â€”' },
    { key: 'phone', header: 'Phone', render: (s) => s.phone ?? 'â€”' },
    { key: 'address', header: 'Address', render: (s) => s.address ?? 'â€”' },
    {
      key: 'is_active',
      header: 'Status',
      render: (s) => <Badge variant={s.is_active ? 'default' : 'secondary'}>{s.is_active ? 'Active' : 'Inactive'}</Badge>,
    },
  ];

  if (isLoading) return <PageSpinner />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Suppliers"
        description="Manage your suppliers and vendors"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Inventory', href: '/inventory' }, { label: 'Suppliers' }]}
        actions={<Button onClick={openCreate}><Plus className="h-4 w-4 mr-1.5" /> Add Supplier</Button>}
      />

      <DataTable
        columns={columns}
        data={(data?.results ?? []) as any[]}
        totalCount={data?.count ?? 0}
        page={page}
        pageSize={15}
        onPageChange={setPage}
        onSearch={setSearch}
        searchPlaceholder="Search suppliers..."
        rowActions={(s) => (
          <div className="flex gap-1">
            <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => openEdit(s)}>
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button variant="outline" size="icon" className="h-7 w-7 text-red-600 hover:bg-red-50" onClick={() => handleDelete(s.id)}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
        emptyTitle="No suppliers"
        emptyDescription="Add your first supplier."
      />

      <DialogRoot open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Supplier' : 'New Supplier'}</DialogTitle>
            <DialogDescription>{editing ? 'Update supplier details.' : 'Add a new supplier.'}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Name *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Supplier name" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Contact Person</Label>
                <Input value={form.contact_person} onChange={(e) => setForm({ ...form, contact_person: e.target.value })} />
              </div>
              <div>
                <Label>Email</Label>
                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Phone</Label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div>
                <Label>City</Label>
                <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
              </div>
            </div>
            <div>
              <Label>Address</Label>
              <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!form.name.trim() || createMutation.isPending || updateMutation.isPending}>
              {editing ? 'Save Changes' : 'Create Supplier'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>
    </div>
  );
}
