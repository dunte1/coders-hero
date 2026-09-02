import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { supportApi, type TicketQueryParams, type CreateTicketData } from '@/lib/supportApi';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageSpinner } from '@/components/ui/Spinner';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
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
import { Plus } from 'lucide-react';
import { formatDate, getPriorityColor, getStatusColor } from '@/lib/utils';
import type { SupportTicket, TicketCategory, TicketPriority } from '@/lib/supportApi';
import { toast } from 'sonner';

const CATEGORY_LABELS: Record<TicketCategory, string> = {
  technical: 'Technical',
  billing: 'Billing',
  general: 'General',
  bug_report: 'Bug Report',
};

const PRIORITY_LABELS: Record<TicketPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
};

const STATUS_LABELS: Record<string, string> = {
  open: 'Open',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  closed: 'Closed',
};

export default function SupportTicketsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const isAdmin = user?.role?.name === 'admin' || user?.role?.name === 'super_admin';

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('');
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [newTicket, setNewTicket] = useState<CreateTicketData>({
    subject: '',
    description: '',
    category: 'general',
    priority: 'medium',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const params: TicketQueryParams = {
    page,
    per_page: 15,
    ...(search && { search }),
    ...(statusFilter && { status: statusFilter as TicketQueryParams['status'] }),
    ...(priorityFilter && { priority: priorityFilter as TicketQueryParams['priority'] }),
  };

  const { data, isLoading } = useQuery({
    queryKey: ['support-tickets', params],
    queryFn: () => supportApi.getTickets(params),
  });

  const createMutation = useMutation({
    mutationFn: (ticket: CreateTicketData) => supportApi.createTicket(ticket),
    onSuccess: (ticket) => {
      toast.success('Ticket created successfully');
      setShowNewTicket(false);
      setNewTicket({ subject: '', description: '', category: 'general', priority: 'medium' });
      setFormErrors({});
      queryClient.invalidateQueries({ queryKey: ['support-tickets'] });
      navigate(`/support/${ticket.id}`);
    },
    onError: (err: unknown) => {
      toast.error('Failed to create ticket');
    },
  });

  const handleCreate = () => {
    const errors: Record<string, string> = {};
    if (!newTicket.subject.trim()) errors.subject = 'Subject is required';
    if (!newTicket.description.trim()) errors.description = 'Description is required';
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    createMutation.mutate(newTicket);
  };

  const columns: Column<SupportTicket>[] = [
    {
      key: 'subject',
      header: 'Subject',
      sortable: true,
      render: (ticket) => (
        <span className="font-medium text-slate-900 line-clamp-1">{ticket.subject}</span>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      render: (ticket) => (
        <Badge variant="secondary">{CATEGORY_LABELS[ticket.category]}</Badge>
      ),
    },
    {
      key: 'priority',
      header: 'Priority',
      render: (ticket) => (
        <Badge className={getPriorityColor(ticket.priority)}>
          {PRIORITY_LABELS[ticket.priority]}
        </Badge>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (ticket) => (
        <Badge className={getStatusColor(ticket.status)}>
          {STATUS_LABELS[ticket.status]}
        </Badge>
      ),
    },
    ...(isAdmin
      ? [
          {
            key: 'user_name',
            header: 'Submitted By',
            render: (ticket: SupportTicket) => (
              <span className="text-slate-600">
                {ticket.user_name || ticket.guest_name || 'Anonymous'}
              </span>
            ),
          } as Column<SupportTicket>,
        ]
      : []),
    {
      key: 'created_at',
      header: 'Created',
      sortable: true,
      render: (ticket) => (
        <span className="text-slate-500 text-sm">{formatDate(ticket.created_at)}</span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={isAdmin ? 'All Tickets' : 'My Tickets'}
        description={isAdmin ? 'Manage all support tickets' : 'View and create support tickets'}
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Support' }]}
        actions={
          <Button onClick={() => setShowNewTicket(true)}>
            <Plus className="h-4 w-4 mr-1.5" /> New Ticket
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={data?.results || []}
        totalCount={data?.meta?.total || 0}
        page={page}
        pageSize={15}
        searchPlaceholder="Search tickets..."
        onSearch={(q) => { setSearch(q); setPage(1); }}
        onPageChange={setPage}
        loading={isLoading}
        emptyTitle="No tickets yet"
        emptyDescription="You haven't created any support tickets yet."
        onRowClick={(ticket) => navigate(`/support/${ticket.id}`)}
        filters={
          <>
            <SelectRoot value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </SelectRoot>
            <SelectRoot value={priorityFilter} onValueChange={(v) => { setPriorityFilter(v); setPage(1); }}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="All Priorities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </SelectRoot>
          </>
        }
      />

      <DialogRoot open={showNewTicket} onOpenChange={(open) => !open && setShowNewTicket(false)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Support Ticket</DialogTitle>
            <DialogDescription>
              Describe your issue and we'll get back to you as soon as possible.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              label="Subject"
              placeholder="Brief description of your issue"
              value={newTicket.subject}
              onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
              error={formErrors.subject}
            />
            <Textarea
              label="Description"
              placeholder="Provide more details about your issue..."
              rows={4}
              value={newTicket.description}
              onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
              error={formErrors.description}
            />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Category</label>
                <SelectRoot
                  value={newTicket.category}
                  onValueChange={(v) => setNewTicket({ ...newTicket, category: v as TicketCategory })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technical">Technical</SelectItem>
                    <SelectItem value="billing">Billing</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="bug_report">Bug Report</SelectItem>
                  </SelectContent>
                </SelectRoot>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Priority</label>
                <SelectRoot
                  value={newTicket.priority}
                  onValueChange={(v) => setNewTicket({ ...newTicket, priority: v as TicketPriority })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </SelectRoot>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewTicket(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Creating...' : 'Create Ticket'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>
    </div>
  );
}
