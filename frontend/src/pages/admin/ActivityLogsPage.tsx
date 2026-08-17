import { useState } from 'react';
import { useActivityLogs } from '@/hooks/useAdmin';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageSpinner } from '@/components/ui/Spinner';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import type { ActivityLogItem } from '@/lib/adminApi';

function formatValue(value: unknown): string {
  if (value === null || value === undefined || value === '') return '—';
  if (Array.isArray(value) || (typeof value === 'object' && value !== null)) {
    return JSON.stringify(value);
  }
  return String(value);
}

export function ActivityLogsTable({ title, description, defaultLogName }: { title: string; description: string; defaultLogName?: string }) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [logName, setLogName] = useState(defaultLogName ?? '');

  const { data, isLoading } = useActivityLogs({
    page,
    per_page: 25,
    search: search || undefined,
    log_name: logName || undefined,
  });

  const columns: Column<ActivityLogItem>[] = [
    {
      key: 'created_at',
      header: 'Timestamp',
      render: (item) => <span className="text-slate-600">{new Date(item.created_at).toLocaleString()}</span>,
    },
    {
      key: 'causer',
      header: 'User',
      render: (item) => {
        const causer = item.causer;
        if (!causer) return <span className="text-slate-400">System</span>;
        return (
          <div>
            <p className="font-medium text-slate-900">
              {causer.first_name && causer.last_name ? `${causer.first_name} ${causer.last_name}` : (causer.name ?? causer.email ?? 'User')}
            </p>
            {causer.email && <p className="text-xs text-slate-500">{causer.email}</p>}
          </div>
        );
      },
    },
    {
      key: 'description',
      header: 'Action',
      render: (item) => <span className="text-slate-700">{item.description}</span>,
    },
    {
      key: 'event',
      header: 'Event',
      render: (item) => (item.event ? <StatusBadge status={item.event} /> : '—'),
    },
    {
      key: 'log_name',
      header: 'Log',
      render: (item) => <span className="text-xs text-slate-500">{item.log_name ?? '—'}</span>,
    },
  ];

  if (isLoading) return <PageSpinner />;

  return (
    <div className="space-y-6">
      <PageHeader title={title} description={description} />
      <DataTable
        columns={columns}
        data={data?.results ?? []}
        totalCount={data?.meta.total ?? 0}
        page={page}
        pageSize={data?.meta.per_page ?? 25}
        onPageChange={setPage}
        searchPlaceholder="Search activity..."
        onSearch={(q) => {
          setSearch(q);
          setPage(1);
        }}
      />
    </div>
  );
}

export default function ActivityLogsPage() {
  return <ActivityLogsTable title="Activity Logs" description="Recent activity across the system." />;
}
