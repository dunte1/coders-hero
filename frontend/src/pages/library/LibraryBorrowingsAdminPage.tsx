import { useState } from 'react';
import { useBorrowings, useReturnBorrowing } from '@/hooks/useLibrary';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageSpinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
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
import { Undo2 } from 'lucide-react';
import type { LibraryBorrowing } from '@/types/library';

const formatDate = (v?: string | null) => (v ? new Date(v).toLocaleDateString() : '—');

export default function LibraryBorrowingsAdminPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<'all' | string>('all');
  const [overdueOnly, setOverdueOnly] = useState(false);
  const [returnTarget, setReturnTarget] = useState<LibraryBorrowing | null>(null);

  const { data, isLoading } = useBorrowings({ page, status, overdue: overdueOnly ? '1' : undefined });
  const returnBorrowing = useReturnBorrowing();

  const borrowings = data?.results || [];

  const handleReturn = async (b: LibraryBorrowing) => {
    setReturnTarget(b);
  };

  const confirmReturn = async () => {
    if (!returnTarget) return;
    await returnBorrowing.mutateAsync(returnTarget.id);
    setReturnTarget(null);
  };

  const columns: Column<LibraryBorrowing>[] = [
    { key: 'resource', header: 'Resource', render: (b) => <span className="font-medium text-slate-900">{b.resource?.title ?? '#' + b.resource_id}</span> },
    { key: 'user', header: 'Borrower', render: (b) => b.user?.name ?? '—' },
    { key: 'borrowed_at', header: 'Borrowed', render: (b) => formatDate(b.borrowed_at) },
    { key: 'due_at', header: 'Due', render: (b) => formatDate(b.due_at) },
    { key: 'returned_at', header: 'Returned', render: (b) => formatDate(b.returned_at) },
    {
      key: 'status',
      header: 'Status',
      render: (b) =>
        b.is_overdue ? (
          <Badge variant="destructive">Overdue</Badge>
        ) : b.status === 'returned' ? (
          <Badge variant="secondary">Returned</Badge>
        ) : (
          <Badge variant="success">Borrowed</Badge>
        ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Borrowings"
        description="Track active loans, overdue items and returns"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Library', href: '/library/admin' },
          { label: 'Borrowings' },
        ]}
      />

      <Card>
        <CardContent className="p-5">
          <DataTable
            columns={columns}
            data={borrowings}
            totalCount={data?.meta.total}
            page={data?.meta.current_page}
            pageSize={data?.meta.per_page}
            onPageChange={(p) => setPage(p)}
            loading={isLoading}
            emptyTitle="No borrowings"
            emptyDescription="Borrowings will appear here when users check out resources."
            filters={
              <div className="flex items-center gap-2">
                <SelectRoot value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="borrowed">Borrowed</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                    <SelectItem value="returned">Returned</SelectItem>
                  </SelectContent>
                </SelectRoot>
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={overdueOnly}
                    onChange={(e) => { setOverdueOnly(e.target.checked); setPage(1); }}
                    className="h-4 w-4 rounded border-slate-300 text-brand-600"
                  />
                  Overdue only
                </label>
              </div>
            }
            rowActions={(b) =>
              b.status !== 'returned' ? (
                <Button variant="outline" size="sm" onClick={() => handleReturn(b)}>
                  <Undo2 className="h-3.5 w-3.5 mr-1" /> Return
                </Button>
              ) : undefined
            }
          />
        </CardContent>
      </Card>

      <DialogRoot open={!!returnTarget} onOpenChange={() => setReturnTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Return</DialogTitle>
            <DialogDescription>
              {returnTarget ? `Mark "${returnTarget.resource?.title ?? `#${returnTarget.resource_id}`}" as returned?` : 'Confirm this resource has been returned.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReturnTarget(null)}>Cancel</Button>
            <Button onClick={confirmReturn} loading={returnBorrowing.isPending}>
              Confirm Return
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>
    </div>
  );
}
