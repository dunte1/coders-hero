import { useState } from 'react';
import { useLoginHistory, useClearLoginHistory } from '@/hooks/useLoginHistory';
import { PageHeader } from '@/components/ui/PageHeader';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/Dialog';
import { Trash2, Monitor, Smartphone, Tablet, Globe } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';
import type { LoginHistory } from '@/types';

function getDeviceIcon(deviceType?: string) {
  const type = deviceType?.toLowerCase() || '';
  if (type.includes('mobile')) return Smartphone;
  if (type.includes('tablet')) return Tablet;
  return Monitor;
}

function getStatusVariant(status: LoginHistory['status']): 'success' | 'destructive' | 'secondary' {
  if (status === 'success') return 'success';
  if (status === 'failed') return 'destructive';
  return 'secondary';
}

export default function LoginHistoryPage() {
  const [page, setPage] = useState(1);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const { data, isLoading } = useLoginHistory({ page, page_size: 15 });
  const clearHistory = useClearLoginHistory();

  const columns: Column<LoginHistory>[] = [
    {
      key: 'device',
      header: 'Device',
      render: (item) => {
        const Icon = getDeviceIcon(item.device_type);
        return (
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100">
              <Icon className="h-4 w-4 text-slate-500" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-slate-900">
                {item.platform || 'Unknown device'}
              </p>
              <p className="truncate text-xs text-slate-500">
                {item.browser || 'Unknown browser'}
                {item.device_type ? ` · ${item.device_type}` : ''}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      key: 'ip_address',
      header: 'IP Address',
      render: (item) => (
        <code className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
          {item.ip_address || '—'}
        </code>
      ),
    },
    {
      key: 'location',
      header: 'Location',
      render: (item) => (
        <span className="flex items-center gap-1.5 text-sm text-slate-600">
          <Globe className="h-3.5 w-3.5 text-slate-400" />
          {item.location || '—'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => (
        <Badge variant={getStatusVariant(item.status)} className="capitalize">
          {item.status}
        </Badge>
      ),
    },
    {
      key: 'attempted_at',
      header: 'Time',
      render: (item) => (
        <div>
          <p className="text-sm text-slate-700">{formatDateTime(item.attempted_at)}</p>
          {item.logged_in_at && item.logged_in_at !== item.attempted_at && (
            <p className="text-xs text-slate-400">Signed in at {formatDateTime(item.logged_in_at)}</p>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Login History"
        description="Recent sign-in attempts on your account"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Settings', href: '/settings' },
          { label: 'Login History' },
        ]}
        actions={
          <Button variant="destructive" onClick={() => setConfirmOpen(true)}>
            <Trash2 className="mr-2 h-4 w-4" />
            Clear History
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={data?.results || []}
        totalCount={data?.count || 0}
        page={page}
        pageSize={15}
        loading={isLoading}
        searchable={false}
        onPageChange={setPage}
        emptyTitle="No login history"
        emptyDescription="Sign-in activity will appear here as you use your account."
      />

      <DialogRoot open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Clear Login History</DialogTitle>
            <DialogDescription>
              This will permanently remove all records of your sign-in activity. This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              loading={clearHistory.isPending}
              onClick={() => {
                clearHistory.mutate(undefined, {
                  onSuccess: () => setConfirmOpen(false),
                });
              }}
            >
              Clear History
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>
    </div>
  );
}
