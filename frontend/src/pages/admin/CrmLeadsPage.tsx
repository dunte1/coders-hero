import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { leadsApi, getErrorMessage } from '@/lib/api';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageSpinner } from '@/components/ui/Spinner';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Badge } from '@/components/ui/Badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/Dialog';
import { Target, Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { formatDate } from '@/lib/utils';

interface Lead {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  organization?: string;
  source?: string;
  status: string;
  owner?: { id: string; name: string } | null;
  next_follow_up?: string | null;
  notes?: string | null;
  created_at: string;
}

interface LeadForm {
  name: string;
  email: string;
  phone: string;
  organization: string;
  source: string;
  status: string;
  notes: string;
  next_follow_up: string;
}

const STATUS_TABS = ['All', 'New', 'Contacted', 'Qualified', 'Won', 'Lost'];
const STATUSES = ['new', 'contacted', 'qualified', 'won', 'lost'];
const SOURCES = ['website', 'referral', 'social_media', 'cold_call', 'advertisement', 'other'];

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  new: 'default',
  contacted: 'secondary',
  qualified: 'outline',
  won: 'default',
  lost: 'destructive',
};

const EMPTY_FORM: LeadForm = {
  name: '',
  email: '',
  phone: '',
  organization: '',
  source: 'other',
  status: 'new',
  notes: '',
  next_follow_up: '',
};

export default function CrmLeadsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusTab, setStatusTab] = useState('All');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Lead | null>(null);
  const [form, setForm] = useState<LeadForm>(EMPTY_FORM);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['crm-leads', page, search, statusTab],
    queryFn: () => leadsApi.getAll({
      page,
      per_page: 15,
      ...(search ? {search} : {}),
      ...(statusTab !== 'All' ? {status: statusTab.toLowerCase()} : {}),
    }),
  });

  const createMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => leadsApi.create(data),
    onSuccess: () => {
      toast.success('Lead created');
      queryClient.invalidateQueries({ queryKey: ['crm-leads'] });
      setDialogOpen(false);
    },
    onError: (e: any) => toast.error(getErrorMessage(e)),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Record<string, unknown> }) => leadsApi.update(id, data),
    onSuccess: () => {
      toast.success('Lead updated');
      queryClient.invalidateQueries({ queryKey: ['crm-leads'] });
      setDialogOpen(false);
    },
    onError: (e: any) => toast.error(getErrorMessage(e)),
  });

  const deleteMutation = useMutation({
    mutationFn: leadsApi.delete,
    onSuccess: () => {
      toast.success('Lead deleted');
      queryClient.invalidateQueries({ queryKey: ['crm-leads'] });
    },
    onError: (e: any) => toast.error(getErrorMessage(e)),
  });

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  const openEdit = (lead: Lead) => {
    setEditing(lead);
    setForm({
      name: lead.name ?? '',
      email: lead.email ?? '',
      phone: lead.phone ?? '',
      organization: lead.organization ?? '',
      source: lead.source ?? 'other',
      status: lead.status ?? 'new',
      notes: lead.notes ?? '',
      next_follow_up: lead.next_follow_up?.slice(0, 10) ?? '',
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    const payload: Record<string, unknown> = {
      name: form.name,
      email: form.email || undefined,
      phone: form.phone || undefined,
      organization: form.organization || undefined,
      source: form.source,
      status: form.status,
      notes: form.notes || undefined,
      next_follow_up: form.next_follow_up || undefined,
    };
    if (editing) {
      updateMutation.mutate({ id: editing.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleDelete = (id: number) => {
    if (!confirm('Are you sure you want to delete this lead?')) return;
    deleteMutation.mutate(id);
  };

  const columns: Column<Lead>[] = [
    {
      key: 'name',
      header: 'Name',
      render: (l) => (
        <div>
          <p className="font-medium text-slate-900">{l.name}</p>
          {l.email && <p className="text-xs text-slate-500">{l.email}</p>}
        </div>
      ),
    },
    { key: 'organization', header: 'Organization', render: (l) => l.organization ?? 'â€”' },
    {
      key: 'status',
      header: 'Status',
      render: (l) => <Badge variant={STATUS_VARIANT[l.status] ?? 'secondary'}>{l.status}</Badge>,
    },
    {
      key: 'source',
      header: 'Source',
      render: (l) => <Badge variant="outline">{(l.source ?? 'other').replace(/_/g, ' ')}</Badge>,
    },
    {
      key: 'owner',
      header: 'Owner',
      render: (l) => l.owner?.name ?? 'â€”',
    },
    {
      key: 'next_follow_up',
      header: 'Next Follow-Up',
      render: (l) => l.next_follow_up ? formatDate(l.next_follow_up) : 'â€”',
    },
  ];

  if (isLoading) return <PageSpinner />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="CRM Leads"
        description="Manage your sales leads and pipeline"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'CRM Leads' }]}
        actions={<Button onClick={openCreate}><Plus className="h-4 w-4 mr-1.5" /> Add Lead</Button>}
      />

      <Tabs value={statusTab} onValueChange={setStatusTab}>
        <TabsList>
          {STATUS_TABS.map((tab) => (
            <TabsTrigger key={tab} value={tab}>{tab}</TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <DataTable
        columns={columns}
        data={(data?.results ?? []) as any[]}
        totalCount={data?.count ?? 0}
        page={page}
        pageSize={15}
        onPageChange={setPage}
        onSearch={setSearch}
        searchPlaceholder="Search leads..."
        rowActions={(l) => (
          <div className="flex gap-1">
            <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => openEdit(l)}>
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button variant="outline" size="icon" className="h-7 w-7 text-red-600 hover:bg-red-50" onClick={() => handleDelete(l.id)}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
        emptyTitle="No leads found"
        emptyDescription="Add your first lead to get started."
      />

      <DialogRoot open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Lead' : 'New Lead'}</DialogTitle>
            <DialogDescription>{editing ? 'Update lead details.' : 'Add a new lead to your pipeline.'}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Name *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Lead name" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Email</Label>
                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email@example.com" />
              </div>
              <div>
                <Label>Phone</Label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+254..." />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Organization</Label>
                <Input value={form.organization} onChange={(e) => setForm({ ...form, organization: e.target.value })} placeholder="Company name" />
              </div>
              <div>
                <Label>Source</Label>
                <select
                  value={form.source}
                  onChange={(e) => setForm({ ...form, source: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                >
                  {SOURCES.map((s) => (
                    <option key={s} value={s}>{s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Status</Label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Next Follow-Up</Label>
                <Input type="date" value={form.next_follow_up} onChange={(e) => setForm({ ...form, next_follow_up: e.target.value })} />
              </div>
            </div>
            <div>
              <Label>Notes</Label>
              <Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Additional notes..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!form.name.trim() || createMutation.isPending || updateMutation.isPending}>
              {editing ? 'Save Changes' : 'Create Lead'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>
    </div>
  );
}
