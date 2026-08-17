import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Archive, Inbox, Mail, MailOpen, Reply, Trash2 } from 'lucide-react';
import { cmsApi, getErrorMessage } from '@/lib/cmsApi';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageSpinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { StatsCard } from '@/components/ui/StatsCard';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
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
import { ConfirmDelete } from '@/components/cms/ConfirmDelete';
import { formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { Column } from '@/components/ui/DataTable';
import type { ContactMessage, ContactMessageStatus } from '@/types/cms';

const STATUS_LABELS: Record<ContactMessageStatus, string> = {
  new: 'New',
  read: 'Read',
  replied: 'Replied',
  archived: 'Archived',
};

export default function ContactMessagesPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [selected, setSelected] = useState<ContactMessage | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data: stats } = useQuery({
    queryKey: ['cms', 'contact-messages', 'stats'],
    queryFn: cmsApi.contactMessages.stats,
  });

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['cms', 'contact-messages', { page, search, status }],
    queryFn: () =>
      cmsApi.contactMessages.list({
        page,
        search: search || undefined,
        status: status === 'all' ? undefined : status,
      }),
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: number; status: ContactMessageStatus }) =>
      cmsApi.contactMessages.updateStatus(id, status),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['cms', 'contact-messages'] });
      setSelected((current) => (current ? { ...current, ...updated } : current));
      toast.success(`Message marked as ${STATUS_LABELS[updated.status].toLowerCase()}`);
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const deleteMessage = useMutation({
    mutationFn: (id: number) => cmsApi.contactMessages.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms', 'contact-messages'] });
      toast.success('Message deleted');
      setDeleteId(null);
      setSelected(null);
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const openMessage = (item: ContactMessage) => {
    setSelected(item);
    if (item.status === 'new') {
      cmsApi.contactMessages.get(item.id).then(() => {
        queryClient.invalidateQueries({ queryKey: ['cms', 'contact-messages'] });
      });
    }
  };

  const columns = useMemo<Column<ContactMessage>[]>(
    () => [
      {
        key: 'name',
        header: 'Name',
        render: (item) => (
          <div>
            <p className={cn('font-medium text-slate-900', item.status === 'new' && 'font-semibold')}>
              {item.name}
            </p>
            <p className="text-xs text-slate-500">{item.email}</p>
          </div>
        ),
      },
      {
        key: 'subject',
        header: 'Subject',
        render: (item) => (
          <p className={cn('max-w-xs truncate', item.status === 'new' ? 'font-medium text-slate-900' : 'text-slate-600')}>
            {item.subject}
          </p>
        ),
      },
      {
        key: 'status',
        header: 'Status',
        render: (item) => <StatusBadge status={item.status} />,
      },
      {
        key: 'created_at',
        header: 'Received',
        render: (item) => <span className="text-slate-600">{formatDate(item.created_at)}</span>,
      },
    ],
    []
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Contact Messages"
        description="Messages submitted through the website contact form"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Contact Messages' }]}
      />

      {isLoading ? (
        <PageSpinner />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
            <StatsCard icon={MailOpen} title="New" value={stats?.new ?? 0} />
            <StatsCard icon={Mail} title="Read" value={stats?.read ?? 0} />
            <StatsCard icon={Reply} title="Replied" value={stats?.replied ?? 0} />
            <StatsCard icon={Archive} title="Archived" value={stats?.archived ?? 0} />
            <StatsCard icon={Inbox} title="Total" value={stats?.total ?? 0} />
          </div>

          <DataTable<ContactMessage>
            columns={columns}
            data={data?.results || []}
            totalCount={data?.meta.total || 0}
            page={data?.meta.current_page || 1}
            pageSize={data?.meta.per_page || 10}
            loading={isFetching}
            searchPlaceholder="Search messages..."
            onSearch={(query) => {
              setSearch(query);
              setPage(1);
            }}
            onPageChange={setPage}
            onRowClick={openMessage}
            filters={
              <SelectRoot
                value={status}
                onValueChange={(value) => {
                  setStatus(value);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-40" label="">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="read">Read</SelectItem>
                  <SelectItem value="replied">Replied</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </SelectRoot>
            }
            emptyTitle="No messages found"
            emptyDescription="Messages from the contact form will appear here."
          />
        </>
      )}

      <DialogRoot
        open={!!selected}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto max-w-xl">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle>{selected.subject}</DialogTitle>
                <DialogDescription>
                  From {selected.name} {selected.phone ? `· ${selected.phone}` : ''} · {selected.email}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <StatusBadge status={selected.status} />
                  <span className="text-xs text-slate-400">
                    Received {formatDate(selected.created_at)}
                  </span>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p className="whitespace-pre-wrap text-sm text-slate-700">{selected.message}</p>
                </div>
              </div>
              <DialogFooter className="flex-wrap gap-2">
                {selected.status !== 'read' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateStatus.mutate({ id: selected.id, status: 'read' })}
                  >
                    <Mail className="mr-1 h-3.5 w-3.5" />
                    Mark as Read
                  </Button>
                )}
                {selected.status !== 'replied' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateStatus.mutate({ id: selected.id, status: 'replied' })}
                  >
                    <Reply className="mr-1 h-3.5 w-3.5" />
                    Mark as Replied
                  </Button>
                )}
                {selected.status !== 'archived' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateStatus.mutate({ id: selected.id, status: 'archived' })}
                  >
                    <Archive className="mr-1 h-3.5 w-3.5" />
                    Archive
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-500"
                  onClick={() => setDeleteId(selected.id)}
                >
                  <Trash2 className="mr-1 h-3.5 w-3.5" />
                  Delete
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </DialogRoot>

      <ConfirmDelete
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Delete Message"
        description="Are you sure you want to delete this message? This action cannot be undone."
        loading={deleteMessage.isPending}
        onConfirm={() => {
          if (deleteId) deleteMessage.mutate(deleteId);
        }}
      />
    </div>
  );
}
