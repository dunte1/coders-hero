import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, Eye, Pencil, Plus, Trash2 } from 'lucide-react';
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
import { useStudents, useDeleteStudent, useStudentGrades } from '@/hooks/useStudents';
import { useDebounce } from '@/hooks/useDebounce';
import { StudentStatusBadge } from '@/components/students/SisBadges';
import { downloadBlob, sisExports, getErrorMessage } from '@/lib/studentsApi';
import { toast } from 'sonner';
import { formatDate, getInitials } from '@/lib/utils';
import type { Student } from '@/types/students';

export default function StudentsPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [grade, setGrade] = useState('all');
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [exporting, setExporting] = useState(false);
  const debouncedSearch = useDebounce(search);
  const { data: grades } = useStudentGrades();

  const params = useMemo(() => {
    const p: Record<string, string | number | boolean> = { page, per_page: 20 };
    if (debouncedSearch) p.search = debouncedSearch;
    if (status !== 'all') p.status = status;
    if (grade !== 'all') p.grade = grade;
    return p;
  }, [page, debouncedSearch, status, grade]);

  const { data, isLoading } = useStudents(params);
  const deleteMutation = useDeleteStudent();

  const handleExport = async () => {
    setExporting(true);
    try {
      const blob = await sisExports.students({ search: debouncedSearch || undefined, status: status === 'all' ? undefined : status, grade: grade === 'all' ? undefined : grade });
      downloadBlob(blob, 'students-export.csv');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setExporting(false);
    }
  };

  const columns: Column<Student>[] = [
    {
      key: 'student',
      header: 'Student',
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-50 text-xs font-medium text-brand-700">
            {item.photo_url ? (
              <img src={item.photo_url} alt={item.full_name} className="h-full w-full object-cover" />
            ) : (
              getInitials(item.first_name, item.last_name)
            )}
          </div>
          <div>
            <p className="font-medium text-slate-900">{item.full_name}</p>
            <p className="text-xs text-slate-500">{item.student_id}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'grade',
      header: 'Grade',
      render: (item) => <span className="text-sm text-slate-600">{item.grade || '—'}</span>,
    },
    {
      key: 'branch',
      header: 'Branch',
      render: (item) => <span className="text-sm text-slate-600">{item.branch || '—'}</span>,
    },
    {
      key: 'guardian',
      header: 'Guardian',
      render: (item) => (
        <span className="text-sm text-slate-600">{item.guardian?.full_name || '—'}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => <StudentStatusBadge status={item.status} />,
    },
    {
      key: 'admission_date',
      header: 'Admission',
      render: (item) => (
        <span className="text-sm text-slate-600">
          {item.admission_date ? formatDate(item.admission_date) : '—'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Students"
        description="Manage student records, profiles and ID cards"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Students' }]}
        actions={
          <>
            <Button variant="outline" loading={exporting} onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
            <Button onClick={() => navigate('/students/create')}>
              <Plus className="mr-2 h-4 w-4" />
              New Student
            </Button>
          </>
        }
      />

      <DataTable
        columns={columns}
        data={data?.results || []}
        totalCount={data?.meta.total || 0}
        page={page}
        pageSize={20}
        loading={isLoading}
        searchPlaceholder="Search students..."
        onSearch={(query) => {
          setSearch(query);
          setPage(1);
        }}
        onPageChange={setPage}
        onRowClick={(item) => navigate(`/students/${item.id}`)}
        emptyTitle="No students found"
        emptyDescription="Try adjusting your search or filters."
        filters={
          <div className="flex flex-wrap gap-3">
            <SelectRoot
              value={status}
              onValueChange={(value) => {
                setStatus(value);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="withdrawn">Withdrawn</SelectItem>
                <SelectItem value="transferred">Transferred</SelectItem>
                <SelectItem value="graduated">Graduated</SelectItem>
              </SelectContent>
            </SelectRoot>
            <SelectRoot
              value={grade}
              onValueChange={(value) => {
                setGrade(value);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Grade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Grades</SelectItem>
                {(grades || []).map((g) => (
                  <SelectItem key={g} value={g}>
                    {g}
                  </SelectItem>
                ))}
              </SelectContent>
            </SelectRoot>
          </div>
        }
        rowActions={(item) => (
          <div className="flex items-center justify-end gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/students/${item.id}`);
              }}
            >
              <Eye className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/students/${item.id}/edit`);
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
        )}
      />

      <ConfirmDelete
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Delete Student"
        description="Are you sure you want to delete this student? This action cannot be undone."
        loading={deleteMutation.isPending}
        onConfirm={() => {
          if (deleteId) deleteMutation.mutate(deleteId);
        }}
      />
    </div>
  );
}
