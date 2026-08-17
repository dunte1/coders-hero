import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHrEmployees } from '@/hooks/useHr';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageSpinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { SearchInput } from '@/components/ui/SearchInput';
import { Pagination } from '@/components/ui/Pagination';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Users, ChevronRight } from 'lucide-react';
import { getInitials } from '@/lib/utils';

export default function HrEmployeesPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const { data, isLoading } = useHrEmployees({
    page,
    per_page: 15,
    search: search || undefined,
  });

  const employees = data?.results || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Employees"
        description="Employee directory and HR records"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'HR', href: '/hr' }, { label: 'Employees' }]}
      />

      <div className="flex flex-wrap items-center gap-3">
        <SearchInput
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search by name, employee ID or email..."
          className="w-full sm:w-72"
        />
      </div>

      {isLoading ? (
        <PageSpinner />
      ) : employees.length === 0 ? (
        <EmptyState icon={Users} title="No employees found" description="Employees assigned to your school appear here." />
      ) : (
        <>
          <Card>
            <CardContent className="p-2">
              <div className="divide-y divide-slate-100">
                {employees.map((employee) => (
                  <button
                    key={employee.id}
                    type="button"
                    onClick={() => navigate(`/hr/employees/${employee.id}`)}
                    className="flex w-full items-center gap-4 px-4 py-3 text-left transition-colors hover:bg-slate-50"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-medium text-brand-700">
                      {employee.user?.avatar ? (
                        <img src={employee.user.avatar} alt={employee.user.name} className="h-full w-full rounded-full object-cover" />
                      ) : (
                        getInitials((employee.user?.name ?? employee.employee_id).split(' ')[0], (employee.user?.name ?? employee.employee_id).split(' ')[1] ?? '')
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {employee.user?.name ?? employee.employee_id}
                      </p>
                      <p className="truncate text-xs text-slate-500">
                        {employee.employee_id} · {employee.position?.name ?? 'No position'} ·{' '}
                        {employee.department?.name ?? 'No department'}
                      </p>
                    </div>
                    <div className="hidden sm:block text-right text-xs text-slate-500">
                      {employee.hire_date && <p>Since {employee.hire_date}</p>}
                      {employee.active_contract?.salary != null && (
                        <p>KSh {Number(employee.active_contract.salary).toLocaleString()}</p>
                      )}
                    </div>
                    <StatusBadge status={employee.status} />
                    <ChevronRight className="h-4 w-4 text-slate-300" />
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
          {data?.meta && data.meta.last_page > 1 && (
            <Pagination
              currentPage={data.meta.current_page}
              totalPages={data.meta.last_page}
              onPageChange={setPage}
              totalCount={data.meta.total}
              pageSize={data.meta.per_page}
            />
          )}
        </>
      )}
    </div>
  );
}
