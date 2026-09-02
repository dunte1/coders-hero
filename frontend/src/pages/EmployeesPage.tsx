import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { employeesApi } from '@/lib/api';
import { EmployeeDirectory } from '@/components/features/employees/EmployeeDirectory';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageSpinner } from '@/components/ui/Spinner';
import { SearchInput } from '@/components/ui/SearchInput';
import { Pagination } from '@/components/ui/Pagination';
import { Button } from '@/components/ui/Button';

const PAGE_SIZE = 24;

export default function EmployeesPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['employees', { search, page }],
    queryFn: () =>
      employeesApi.getEmployees({
        page,
        page_size: PAGE_SIZE,
        ...(search ? { search } : {}),
      }),
  });

  const employees = data?.results || [];
  const totalPages = data ? Math.ceil(data.count / PAGE_SIZE) : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Employees"
        description="Employee directory"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Employees' }]}
        actions={
          <Button onClick={() => navigate('/employees/create')}>Add Employee</Button>
        }
      />

      <SearchInput
        placeholder="Search by name, position, or department..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
        }}
        onClear={() => {
          setSearch('');
          setPage(1);
        }}
        className="max-w-md"
      />

      {isLoading ? (
        <PageSpinner />
      ) : isError ? (
        <div className="text-center py-12 text-red-500">Failed to load employees. Please try again.</div>
      ) : (
        <>
          <EmployeeDirectory
            employees={employees}
            onEmployeeClick={(emp) => navigate(`/employees/${emp.id}`)}
          />
          {totalPages > 1 && (
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
              totalCount={data?.count}
              pageSize={PAGE_SIZE}
            />
          )}
        </>
      )}
    </div>
  );
}