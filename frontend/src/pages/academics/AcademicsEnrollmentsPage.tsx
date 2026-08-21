import { useState } from 'react';
import { useEnrollments, useUnenroll } from '@/hooks/useEnrollments';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageSpinner } from '@/components/ui/Spinner';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/Progress';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useDebounce } from '@/hooks/useDebounce';
import type { Enrollment } from '@/types';

export default function AcademicsEnrollmentsPage() {
  const [search, setSearch] = useState('');
  const debounced = useDebounce(search, 300);
  const { data, isLoading } = useEnrollments(debounced ? { search: debounced } : undefined);
  const unenroll = useUnenroll();

  const columns: Column<Enrollment>[] = [
    {
      key: 'student',
      header: 'Student',
      render: (item) => (
        <div>
          <p className="font-medium text-slate-900">
            {item.student.first_name} {item.student.last_name}
          </p>
          <p className="text-xs text-slate-500">{item.student.email}</p>
        </div>
      ),
    },
    {
      key: 'course',
      header: 'Course',
      render: (item) => (
        <div>
          <p className="font-medium text-slate-900">{item.course.title}</p>
          <p className="text-xs text-slate-500">Enrolled {new Date(item.enrolled_at).toLocaleDateString()}</p>
        </div>
      ),
    },
    {
      key: 'progress',
      header: 'Progress',
      render: (item) => (
        <div className="flex items-center gap-2 w-40">
          <Progress value={item.progress} className="flex-1" />
          <span className="text-xs text-slate-500 w-8 text-right">{Math.round(item.progress)}%</span>
        </div>
      ),
    },
    {
      key: 'is_active',
      header: 'Status',
      render: (item) => <StatusBadge status={item.is_active ? 'active' : 'terminated'} />,
    },
  ];

  if (isLoading) return <PageSpinner />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Enrollments"
        description="All course enrollments across the academy"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Academics', href: '/teacher/classes' }, { label: 'Enrollments' }]}
      />

      <DataTable
        columns={columns}
        data={(data as any)?.results ?? []}
        totalCount={(data as any)?.count ?? 0}
        pageSize={(data as any)?.results?.length || 10}
        searchPlaceholder="Search student or course..."
        onSearch={setSearch}
        rowActions={(item) => (
          <Button
            variant="ghost"
            size="sm"
            className="text-red-500"
            onClick={() => {
              if (confirm(`Remove ${item.student.first_name}'s enrollment from "${item.course.title}"?`)) unenroll.mutate(item.id);
            }}
          >
            Unenroll
          </Button>
        )}
      />
    </div>
  );
}
