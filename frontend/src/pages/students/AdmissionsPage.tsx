import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Pencil, Plus, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/ui/PageHeader';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { Button } from '@/components/ui/Button';
import { ConfirmDelete } from '@/components/cms/ConfirmDelete';
import {
  SelectRoot,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/Select';
import {
  useAdmissions,
  useAdmitAdmission,
  useRejectAdmission,
  useDeleteAdmission,
} from '@/hooks/useAdmissions';
import { useDebounce } from '@/hooks/useDebounce';
import { AdmissionStatusBadge } from '@/components/students/SisBadges';
import { getErrorMessage } from '@/lib/studentsApi';
import { formatDate } from '@/lib/utils';
import type { Admission } from '@/types/students';

export default function AdmissionsPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const debouncedSearch = useDebounce(search);

  const admitMutation = useAdmitAdmission();
  const rejectMutation = useRejectAdmission();
  const deleteMutation = useDeleteAdmission();

  const params = useMemo(() => {
    const p: Record<string, string | number | boolean> = { page, per_page: 20 };
    if (debouncedSearch) p.search = debouncedSearch;
    if (status !== 'all') p.status = status;
    return p;
  }, [page, debouncedSearch, status]);

  const { data, isLoading } = useAdmissions(params);

  const columns: Column<Admission>[] = [
    {
      key: 'applicant',
      header: 'Applicant',
      render: (item) => (
        <div>
          <p className="font-medium text-slate-900">{item.full_name}</p>
          <p className="text-xs text-slate-500">{item.application_number}</p>
        </div>
      ),
    },
    {
      key: 'grade',
      header: 'Grade',
      render: (item) => <span className="text-sm text-slate-600">{item.grade || '—'}</span>,
    },
    {
      key: 'program_of_interest',
      header: 'Program',
      render: (item) => (
        <span className="max-w-[160px] truncate text-sm text-slate-600">
          {item.program_of_interest || '—'}
        </span>
      ),
    },
    {
      key: 'preferred_branch',
      header: 'Branch',
      render: (item) => <span className="text-sm text-slate-600">{item.preferred_branch || '—'}</span>,
    },
    {
      key: 'applied_at',
      header: 'Applied',
      render: (item) => (
        <span className="text-sm text-slate-600">
          {item.applied_at ? formatDate(item.applied_at) : '—'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => <AdmissionStatusBadge status={item.status} />,
    },
  ];

  const handleAdmit = (id: number) => {
    admitMutation.mutate(id, {
      onError: (err) => toast.error(getErrorMessage(err)),
    });
  };

  const handleReject = (id: number) => {
    rejectMutation.mutate(id, {
      onError: (err) => toast.error(getErrorMessage(err)),
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admissions"
        description="Review applications and admit students"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Admissions' }]}
        actions={
          <Button onClick={() => navigate('/admissions/new')}>
            <Plus className="mr-2 h-4 w-4" />
            New Application
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
        searchPlaceholder="Search applicants..."
        onSearch={(query) => {
          setSearch(query);
          setPage(1);
        }}
        onPageChange={setPage}
        emptyTitle="No applications found"
        emptyDescription="Try adjusting your search or filters."
        filters={
          <SelectRoot
            value={status}
            onValueChange={(value) => {
              setStatus(value);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="in_review">In Review</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="admitted">Admitted</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </SelectRoot>
        }
        rowActions={(item) => {
          const canDecide = item.status !== 'admitted' && item.status !== 'rejected';
          return (
            <div className="flex items-center justify-end gap-1">
              {canDecide && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-emerald-600"
                    title="Admit as student"
                    loading={admitMutation.isPending && admitMutation.variables === item.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAdmit(item.id);
                    }}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-500"
                    title="Reject"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReject(item.id);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/admissions/${item.id}/edit`);
                }}
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-red-500"
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleteId(item.id);
                }}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          );
        }}
      />

      <ConfirmDelete
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Delete Application"
        description="Are you sure you want to delete this admission application? This action cannot be undone."
        loading={deleteMutation.isPending}
        onConfirm={() => {
          if (deleteId) deleteMutation.mutate(deleteId);
        }}
      />
    </div>
  );
}
