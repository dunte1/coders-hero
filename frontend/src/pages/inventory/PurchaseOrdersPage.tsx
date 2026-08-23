import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { purchaseOrdersApi, suppliersApi, getErrorMessage } from '@/lib/api';
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
import { ShoppingCart, Plus, Pencil, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import { formatDate } from '@/lib/utils';

interface PurchaseOrder {
  id: number;
  po_number: string;
  supplier?: { id: number; name: string } | null;
  total: number | string;
  status: string;
  expected_date?: string | null;
  notes?: string | null;
  items?: POItem[];
  created_at: string;
}

interface POItem {
  description: string;
  quantity: number;
  unit_price: number;
}

interface POForm {
  po_number: string;
  supplier_id: string;
  expected_date: string;
  notes: string;
  items: POItem[];
}

const STATUS_OPTIONS = ['draft', 'pending', 'approved', 'ordered', 'received', 'cancelled'];
const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  draft: 'secondary',
  pending: 'secondary',
  approved: 'default',
  ordered: 'default',
  received: 'secondary',
  cancelled: 'destructive',
};

const EMPTY_FORM: POForm = {
  po_number: '',
  supplier_id: '',
  expected_date: '',
  notes: '',
  items: [{ description: '', quantity: 1, unit_price: 0 }],
};

export default function PurchaseOrdersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<PurchaseOrder | null>(null);
  const [form, setForm] = useState<POForm>(EMPTY_FORM);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['purchase-orders', page, search],
    queryFn: () => purchaseOrdersApi.getAll({
      page,
      per_page: 15,
      ...(search ? {search} : {}),
    }),
  });

  const { data: suppliersData } = useQuery({
    queryKey: ['suppliers-options'],
    queryFn: () => suppliersApi.getAll({ per_page: 100 }),
  });

  const createMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => purchaseOrdersApi.create(data),
    onSuccess: () => {
      toast.success('Purchase order created');
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      setDialogOpen(false);
    },
    onError: (e: any) => toast.error(getErrorMessage(e)),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => purchaseOrdersApi.updateStatus(id, status),
    onSuccess: () => {
      toast.success('Status updated');
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
    },
    onError: (e: any) => toast.error(getErrorMessage(e)),
  });

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  const openEdit = (po: PurchaseOrder) => {
    setEditing(po);
    setForm({
      po_number: po.po_number ?? '',
      supplier_id: po.supplier?.id?.toString() ?? '',
      expected_date: po.expected_date?.slice(0, 10) ?? '',
      notes: po.notes ?? '',
      items: po.items?.length ? po.items : [{ description: '', quantity: 1, unit_price: 0 }],
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    const payload: Record<string, unknown> = {
      po_number: form.po_number,
      supplier_id: form.supplier_id ? Number(form.supplier_id) : null,
      expected_date: form.expected_date || null,
      notes: form.notes || null,
      items: form.items.filter((item) => item.description.trim()),
    };
    if (editing) {
      purchaseOrdersApi.update(editing.id, payload).then(() => {
        toast.success('Purchase order updated');
        queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
        setDialogOpen(false);
      }).catch((e: any) => toast.error(getErrorMessage(e)));
    } else {
      createMutation.mutate(payload);
    }
  };

  const addRow = () => {
    setForm({ ...form, items: [...form.items, { description: '', quantity: 1, unit_price: 0 }] });
  };

  const removeRow = (index: number) => {
    setForm({ ...form, items: form.items.filter((_, i) => i !== index) });
  };

  const updateRow = (index: number, field: keyof POItem, value: string | number) => {
    const items = [...form.items];
    items[index] = { ...items[index], [field]: value };
    setForm({ ...form, items });
  };

  const columns: Column<PurchaseOrder>[] = [
    {
      key: 'po_number',
      header: 'PO Number',
      render: (po) => <span className="font-mono text-sm">{po.po_number}</span>,
    },
    {
      key: 'supplier',
      header: 'Supplier',
      render: (po) => po.supplier?.name ?? 'â€”',
    },
    {
      key: 'total',
      header: 'Total',
      render: (po) => `KSh ${Number(po.total).toLocaleString()}`,
    },
    {
      key: 'status',
      header: 'Status',
      render: (po) => <Badge variant={STATUS_VARIANT[po.status] ?? 'secondary'}>{po.status}</Badge>,
    },
    {
      key: 'expected_date',
      header: 'Expected Date',
      render: (po) => po.expected_date ? formatDate(po.expected_date) : 'â€”',
    },
  ];

  if (isLoading) return <PageSpinner />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Purchase Orders"
        description="Manage purchase orders and procurement"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Inventory', href: '/inventory' }, { label: 'Purchase Orders' }]}
        actions={<Button onClick={openCreate}><Plus className="h-4 w-4 mr-1.5" /> New Purchase Order</Button>}
      />

      <DataTable
        columns={columns}
        data={(data?.results ?? []) as any[]}
        totalCount={data?.count ?? 0}
        page={page}
        pageSize={15}
        onPageChange={setPage}
        onSearch={setSearch}
        searchPlaceholder="Search purchase orders..."
        rowActions={(po) => (
          <div className="flex gap-1">
            <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => openEdit(po)}>
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <select
              value={po.status}
              onChange={(e) => statusMutation.mutate({ id: po.id, status: e.target.value })}
              className="h-7 rounded border border-slate-200 bg-white px-1 text-xs"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        )}
        emptyTitle="No purchase orders"
        emptyDescription="Create your first purchase order."
      />

      <DialogRoot open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Purchase Order' : 'New Purchase Order'}</DialogTitle>
            <DialogDescription>{editing ? 'Update purchase order details.' : 'Create a new purchase order.'}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>PO Number *</Label>
                <Input value={form.po_number} onChange={(e) => setForm({ ...form, po_number: e.target.value })} placeholder="e.g. PO-2026-001" />
              </div>
              <div>
                <Label>Supplier</Label>
                <select
                  value={form.supplier_id}
                  onChange={(e) => setForm({ ...form, supplier_id: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                >
                  <option value="">Select supplier</option>
                  {(suppliersData?.results ?? []).map((s: any) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Expected Date</Label>
                <Input type="date" value={form.expected_date} onChange={(e) => setForm({ ...form, expected_date: e.target.value })} />
              </div>
              <div>
                <Label>Notes</Label>
                <Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Optional notes" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Items</Label>
                <Button type="button" variant="outline" size="sm" onClick={addRow} className="gap-1">
                  <Plus className="h-3 w-3" /> Add Item
                </Button>
              </div>
              <div className="space-y-2">
                {form.items.map((item, idx) => (
                  <div key={idx} className="flex gap-2 items-end">
                    <div className="flex-1">
                      <Input
                        value={item.description}
                        onChange={(e) => updateRow(idx, 'description', e.target.value)}
                        placeholder="Item description"
                      />
                    </div>
                    <div className="w-20">
                      <Input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(e) => updateRow(idx, 'quantity', Number(e.target.value))}
                        placeholder="Qty"
                      />
                    </div>
                    <div className="w-28">
                      <Input
                        type="number"
                        min={0}
                        step="0.01"
                        value={item.unit_price}
                        onChange={(e) => updateRow(idx, 'unit_price', Number(e.target.value))}
                        placeholder="Unit price"
                      />
                    </div>
                    {form.items.length > 1 && (
                      <Button type="button" variant="ghost" size="icon" className="h-10 w-10 text-red-500 shrink-0" onClick={() => removeRow(idx)}>
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!form.po_number.trim() || createMutation.isPending}>
              {editing ? 'Save Changes' : 'Create PO'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>
    </div>
  );
}
