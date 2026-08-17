import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ConfirmDelete } from '@/components/cms/ConfirmDelete';
import { useGuardians, useDeleteGuardian } from '@/hooks/useGuardians';
import { useDebounce } from '@/hooks/useDebounce';
import type { Guardian } from '@/types/students';

export default function GuardiansPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const debouncedSearch = useDebounce(search);

  const params = useMemo(() => {
    const p: Record<string, string | number | boolean> = { page, per_page: 20 };
    if (debouncedSearch) p.search = debouncedSearch;
    return p;
  }, [page, debouncedSearch]);

  const { data, isLoading } = useGuardians(params);
  const deleteMutation = useDeleteGuardian();

  const columns: Column<Guardian>[] = [
    {
      key: 'name',
      header: 'Guardian',
      render: (item) => (
        <div>
          <p className="font-medium text-slate-900">{item.full_name}</p>
          {item.is_primary && <Badge variant="secondary" className="mt-0.5">Primary contact</Badge>}
        </div>
      ),
    },
    {
      key: 'relationship',
      header: 'Relationship',
      render: (item) => (
        <span className="text-sm capitalize text-slate-600">{item.relationship}</span>
      ),
    },
    {
      key: 'phone',
      header: 'Phone',
      render: (item) => <span className="text-sm text-slate-600">{item.phone || '—'}</span>,
    },
    {
      key: 'email',
      header: 'Email',
      render: (item) => (
        <span className="max-w-[220px] truncate text-sm text-slate-600">{item.email || '—'}</span>
      ),
    },
    {
      key: 'students_count',
      header: 'Students',
      render: (item) => (
        <span className="text-sm font-medium text-slate-700">{item.students_count ?? 0}</span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Guardians"
        description="Manage parents and guardians linked to students"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Guardians' }]}
        actions={
          <Button onClick={() => navigate('/guardians/new')}>
            <Plus className="mr-2 h-4 w-4" />
            New Guardian
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={data?.results || []}
        totalCount={data?.meta.total || 0}
        page={page}
        pageSize={20}
        loading={isLoading}
        searchPlaceholder="Search guardians..."
        onSearch={(query) => {
          setSearch(query);
          setPage(1);
        }}
        onPageChange={setPage}
        emptyTitle="No guardians found"
        emptyDescription="Try adjusting your search or add a new guardian."
        rowActions={(item) => (
          <div className="flex items-center justify-end gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => navigate(`/guardians/${item.id}/edit`)}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-red-500"
              onClick={() => setDeleteId(item.id)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
      />

      <ConfirmDelete
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Delete Guardian"
        description="Are you sure you want to delete this guardian? Students will keep their records but lose the guardian link."
        loading={deleteMutation.isPending}
        onConfirm={() => {
          if (deleteId) deleteMutation.mutate(deleteId);
        }}
      />
    </div>
  );
}
