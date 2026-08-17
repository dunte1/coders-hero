import { useState } from 'react';
import { useBackups, useCreateBackup, useDeleteBackup } from '@/hooks/useAdmin';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageSpinner } from '@/components/ui/Spinner';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { EmptyState } from '@/components/ui/EmptyState';
import { Download, Plus, RefreshCw, Trash2, Database, FileArchive } from 'lucide-react';
import { toast } from 'sonner';
import type { BackupItem } from '@/lib/adminApi';

export default function BackupsPage() {
  const { data, isLoading, refetch, isFetching } = useBackups();
  const createBackup = useCreateBackup();
  const deleteBackup = useDeleteBackup();
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleDelete = (name: string) => {
    if (!window.confirm(`Delete backup "${name}"? This cannot be undone.`)) return;
    setDeleting(name);
    deleteBackup.mutate(name, { onSettled: () => setDeleting(null) });
  };

  const columns: Column<BackupItem>[] = [
    {
      key: 'name',
      header: 'Backup',
      render: (item) => (
        <div className="flex items-center gap-2">
          <FileArchive className="h-4 w-4 text-slate-400" />
          <span className="font-medium text-slate-900">{item.name}</span>
        </div>
      ),
    },
    { key: 'size_human', header: 'Size' },
    {
      key: 'created_at',
      header: 'Created',
      render: (item) => <span className="text-slate-600">{item.created_at}</span>,
    },
  ];

  if (isLoading) return <PageSpinner />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Backups"
        description="Create and download database backups"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Administration', href: '/admin' }, { label: 'Backups' }]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => refetch()} disabled={isFetching}>
              <RefreshCw className={`h-4 w-4 mr-1.5 ${isFetching ? 'animate-spin' : ''}`} /> Refresh
            </Button>
            <Button onClick={() => createBackup.mutate()} disabled={createBackup.isPending}>
              <Plus className="h-4 w-4 mr-1.5" /> Create backup
            </Button>
          </div>
        }
      />

      {!data?.backups.length ? (
        <Card>
          <CardContent className="p-10">
            <EmptyState
              icon={Database}
              title="No backups yet"
              description="Create your first database backup to protect your data."
            />
          </CardContent>
        </Card>
      ) : (
        <DataTable
          columns={columns}
          data={data.backups}
          searchable={false}
          totalCount={data.backups.length}
          page={1}
          pageSize={data.backups.length}
          rowActions={(item) => (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  import('@/lib/adminApi').then(({ adminApi }) =>
                    adminApi.downloadBackup(item.name).then(() => toast.success('Backup downloaded'))
                  )
                }
              >
                <Download className="h-4 w-4 mr-1" /> Download
              </Button>
              <Button variant="destructive" size="sm" onClick={() => handleDelete(item.name)} disabled={deleting === item.name}>
                <Trash2 className="h-4 w-4 mr-1" /> {deleting === item.name ? 'Deleting...' : 'Delete'}
              </Button>
            </>
          )}
        />
      )}
    </div>
  );
}
