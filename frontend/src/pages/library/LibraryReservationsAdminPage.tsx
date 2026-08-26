import { useState } from 'react';
import { useReservations, useCancelReservation } from '@/hooks/useLibrary';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageSpinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { ConfirmDelete } from '@/components/cms/ConfirmDelete';
import {
  SelectRoot,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/Select';
import { X } from 'lucide-react';
import type { LibraryReservation } from '@/types/library';

const formatDate = (v?: string | null) => (v ? new Date(v).toLocaleDateString() : '—');

export default function LibraryReservationsAdminPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<'all' | string>('all');

  const { data, isLoading } = useReservations({ page, status });
  const cancelReservation = useCancelReservation();
  const [cancelTarget, setCancelTarget] = useState<LibraryReservation | null>(null);

  const reservations = data?.results || [];

  const handleCancel = async (r: LibraryReservation) => {
    setCancelTarget(r);
  };

  const confirmCancel = async () => {
    if (!cancelTarget) return;
    await cancelReservation.mutateAsync(cancelTarget.id);
    setCancelTarget(null);
  };

  const columns: Column<LibraryReservation>[] = [
    { key: 'resource', header: 'Resource', render: (r) => <span className="font-medium text-slate-900">{r.resource?.title ?? '#' + r.resource_id}</span> },
    { key: 'user', header: 'User', render: (r) => r.user?.name ?? '—' },
    { key: 'reserved_at', header: 'Reserved', render: (r) => formatDate(r.reserved_at) },
    { key: 'expires_at', header: 'Expires', render: (r) => formatDate(r.expires_at) },
    {
      key: 'status',
      header: 'Status',
      render: (r) =>
        r.status === 'pending' ? (
          <Badge variant="warning">Pending</Badge>
        ) : r.status === 'fulfilled' ? (
          <Badge variant="success">Fulfilled</Badge>
        ) : (
          <Badge variant="secondary">Cancelled</Badge>
        ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reservations"
        description="Pending and fulfilled resource reservations"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Library', href: '/library/admin' },
          { label: 'Reservations' },
        ]}
      />

      <Card>
        <CardContent className="p-5">
          <DataTable
            columns={columns}
            data={reservations}
            totalCount={data?.meta.total}
            page={data?.meta.current_page}
            pageSize={data?.meta.per_page}
            onPageChange={(p) => setPage(p)}
            loading={isLoading}
            emptyTitle="No reservations"
            emptyDescription="Reservations will appear here when users reserve borrowed resources."
            filters={
              <SelectRoot value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="fulfilled">Fulfilled</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </SelectRoot>
            }
            rowActions={(r) =>
              r.status === 'pending' ? (
                <Button variant="ghost" size="sm" className="text-red-600" onClick={() => handleCancel(r)}>
                  <X className="h-3.5 w-3.5 mr-1" /> Cancel
                </Button>
              ) : undefined
            }
          />
        </CardContent>
      </Card>

      <ConfirmDelete
        open={!!cancelTarget}
        onOpenChange={() => setCancelTarget(null)}
        title="Cancel Reservation"
        description={`Are you sure you want to cancel this reservation for "${cancelTarget?.resource?.title ?? ''}"?`}
        confirmLabel="Cancel Reservation"
        loading={cancelReservation.isPending}
        onConfirm={confirmCancel}
      />
    </div>
  );
}
