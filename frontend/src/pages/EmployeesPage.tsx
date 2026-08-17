import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { employeesApi } from '@/lib/api';
import { EmployeeDirectory } from '@/components/features/employees/EmployeeDirectory';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageSpinner } from '@/components/ui/Spinner';
import { SearchInput } from '@/components/ui/SearchInput';
import { Button } from '@/components/ui/Button';
import type { Employee } from '@/types';

export default function EmployeesPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['employees', search],
    queryFn: () =>
      employeesApi.getEmployees(
        search ? { search, page_size: 50 } : { page_size: 50 }
      ),
  });

  const employees = data?.results || [];

  const filtered = search
    ? employees.filter(
        (e: Employee) =>
          `${e.user.first_name} ${e.user.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
          e.position?.title?.toLowerCase().includes(search.toLowerCase()) ||
          e.department?.name?.toLowerCase().includes(search.toLowerCase())
      )
    : employees;

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
        onChange={(e) => setSearch(e.target.value)}
        onClear={() => setSearch('')}
        className="max-w-md"
      />

      {isLoading ? (
        <PageSpinner />
      ) : (
        <EmployeeDirectory
          employees={filtered}
          onEmployeeClick={(emp) => navigate(`/employees/${emp.id}`)}
        />
      )}
    </div>
  );
}
