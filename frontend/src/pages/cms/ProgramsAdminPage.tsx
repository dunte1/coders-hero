import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Pencil, Plus, Star, Trash2 } from 'lucide-react';
import { cmsApi, getErrorMessage } from '@/lib/cmsApi';
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
import { cn } from '@/lib/utils';
import type { Program } from '@/types/cms';

const CATEGORY_COLORS: Record<string, string> = {
  coding: 'bg-brand-100 text-brand-700',
  robotics: 'bg-purple-100 text-purple-700',
  stem: 'bg-emerald-100 text-emerald-700',
};

function formatPrice(price: number | null, suffix: string | null): string {
  if (price == null) return '—';
  return `$${Number(price).toFixed(0)}${suffix ? ` ${suffix}` : ''}`;
}

export default function ProgramsAdminPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const debouncedSearch = useDebounce(search);

  const params = useMemo(() => {
    const p: Record<string, string | number | boolean> = { page, per_page: 20 };
    if (debouncedSearch) p.search = debouncedSearch;
    if (category !== 'all') p.category = category;
    return p;
  }, [page, debouncedSearch, category]);

  const { data, isLoading } = useQuery({
    queryKey: ['cms', 'programs', params],
    queryFn: () => cmsApi.programs.list(params),
  });

  const toggleFeatured = useMutation({
    mutationFn: (id: number) => cmsApi.programs.toggleFeatured(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms', 'programs'] });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const toggleActive = useMutation({
    mutationFn: (id: number) => cmsApi.programs.toggleActive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms', 'programs'] });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const deleteProgram = useMutation({
    mutationFn: (id: number) => cmsApi.programs.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms', 'programs'] });
      toast.success('Program deleted');
      setDeleteId(null);
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const columns: Column<Program>[] = [
    {
      key: 'name',
      header: 'Program',
      render: (item) => (
        <div>
          <p className="font-medium text-slate-900">{item.name}</p>
          {item.tagline && <p className="max-w-[320px] truncate text-xs text-slate-500">{item.tagline}</p>}
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      render: (item) => (
        <Badge className={CATEGORY_COLORS[item.category] || 'bg-slate-100 text-slate-700'}>
          {item.category}
        </Badge>
      ),
    },
    {
      key: 'age_group',
      header: 'Age Group',
      render: (item) => <span className="text-sm text-slate-600">{item.age_group || '—'}</span>,
    },
    {
      key: 'price',
      header: 'Price',
      render: (item) => (
        <span className="text-sm text-slate-600">
          {formatPrice(item.price, item.price_suffix)}
        </span>
      ),
    },
    {
      key: 'is_featured',
      header: 'Featured',
      render: (item) => (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => toggleFeatured.mutate(item.id)}
        >
          <Star
            className={cn(
              'h-4 w-4',
              item.is_featured ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
            )}
          />
        </Button>
      ),
    },
    {
      key: 'is_active',
      header: 'Active',
      render: (item) => (
        <Switch
          checked={item.is_active}
          onCheckedChange={() => toggleActive.mutate(item.id)}
        />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Programs"
        description="Manage the learning programs offered at the centre"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Programs' }]}
        actions={
          <Button onClick={() => navigate('/cms/programs/new')}>
            <Plus className="mr-2 h-4 w-4" />
            New Program
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
        searchPlaceholder="Search programs..."
        onSearch={(query) => {
          setSearch(query);
          setPage(1);
        }}
        onPageChange={setPage}
        emptyTitle="No programs found"
        emptyDescription="Try adjusting your search or filters."
        filters={
          <SelectRoot
            value={category}
            onValueChange={(value) => {
              setCategory(value);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="coding">Coding</SelectItem>
              <SelectItem value="robotics">Robotics</SelectItem>
              <SelectItem value="stem">STEM</SelectItem>
            </SelectContent>
          </SelectRoot>
        }
        rowActions={(item) => (
          <div className="flex items-center justify-end gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => navigate(`/cms/programs/${item.id}/edit`)}
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
        title="Delete Program"
        description="Are you sure you want to delete this program? This action cannot be undone."
        loading={deleteProgram.isPending}
        onConfirm={() => {
          if (deleteId) deleteProgram.mutate(deleteId);
        }}
      />
    </div>
  );
}
