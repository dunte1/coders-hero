import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { popupsApi, getErrorMessage, type Popup } from '@/lib/popupsApi';
import { useDebounce } from '@/hooks/useDebounce';
import { PageHeader } from '@/components/ui/PageHeader';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Switch } from '@/components/ui/Switch';
import {
  SelectRoot,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/Select';
import { ConfirmDelete } from '@/components/cms/ConfirmDelete';

const TYPE_COLORS: Record<string, string> = {
  advert: 'bg-brand-100 text-brand-700',
  seasonal_greeting: 'bg-emerald-100 text-emerald-700',
};

const FREQUENCY_LABELS: Record<string, string> = {
  every_visit: 'Every Visit',
  once_per_session: 'Once Per Session',
  once_per_day: 'Once Per Day',
  once_ever: 'Once Ever',
};

function formatDate(date: string | null): string {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function PopupsAdminPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const debouncedSearch = useDebounce(search);

  const params = useMemo(() => {
    const p: Record<string, string | number | boolean> = { page, per_page: 20 };
    if (debouncedSearch) p.search = debouncedSearch;
    if (typeFilter !== 'all') p.type = typeFilter;
    return p;
  }, [page, debouncedSearch, typeFilter]);

  const { data, isLoading } = useQuery({
    queryKey: ['cms', 'popups', params],
    queryFn: () => popupsApi.list(params),
  });

  const toggleActive = useMutation({
    mutationFn: (id: number) => popupsApi.toggleActive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms', 'popups'] });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const deletePopup = useMutation({
    mutationFn: (id: number) => popupsApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms', 'popups'] });
      toast.success('Popup deleted');
      setDeleteId(null);
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const columns: Column<Popup>[] = [
    {
      key: 'title',
      header: 'Title',
      render: (item) => (
        <div>
          <p className="font-medium text-slate-900">{item.title}</p>
          {item.body && <p className="max-w-[320px] truncate text-xs text-slate-500">{item.body}</p>}
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      render: (item) => (
        <Badge className={TYPE_COLORS[item.type] || 'bg-slate-100 text-slate-700'}>
          {item.type === 'seasonal_greeting' ? 'Seasonal' : 'Advert'}
        </Badge>
      ),
    },
    {
      key: 'frequency',
      header: 'Frequency',
      render: (item) => (
        <span className="text-sm text-slate-600">{FREQUENCY_LABELS[item.frequency]}</span>
      ),
    },
    {
      key: 'start_date',
      header: 'Dates',
      render: (item) => (
        <span className="text-sm text-slate-600">
          {formatDate(item.start_date)} — {formatDate(item.end_date)}
        </span>
      ),
    },
    {
      key: 'active',
      header: 'Active',
      render: (item) => (
        <Switch
          checked={item.active}
          onCheckedChange={() => toggleActive.mutate(item.id)}
        />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Popups"
        description="Manage website popup advertisements and greetings"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Popups' }]}
        actions={
          <Button onClick={() => navigate('/cms/popups/new')}>
            <Plus className="mr-2 h-4 w-4" />
            New Popup
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
        searchPlaceholder="Search popups..."
        onSearch={(query) => {
          setSearch(query);
          setPage(1);
        }}
        onPageChange={setPage}
        emptyTitle="No popups found"
        emptyDescription="Try adjusting your search or create a new popup."
        filters={
          <SelectRoot
            value={typeFilter}
            onValueChange={(value) => {
              setTypeFilter(value);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="advert">Advert</SelectItem>
              <SelectItem value="seasonal_greeting">Seasonal Greeting</SelectItem>
            </SelectContent>
          </SelectRoot>
        }
        rowActions={(item) => (
          <div className="flex items-center justify-end gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => navigate(`/cms/popups/${item.id}/edit`)}
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
        title="Delete Popup"
        description="Are you sure you want to delete this popup? This action cannot be undone."
        loading={deletePopup.isPending}
        onConfirm={() => {
          if (deleteId) deletePopup.mutate(deleteId);
        }}
      />
    </div>
  );
}
