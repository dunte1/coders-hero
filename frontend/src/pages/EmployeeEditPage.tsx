import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { employeesApi, departmentsApi, positionsApi, usersApi } from '@/lib/api';
import { EmployeeForm } from '@/components/features/employees/EmployeeForm';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageSpinner } from '@/components/ui/Spinner';
import { Card, CardContent } from '@/components/ui/Card';
import { useState } from 'react';
import type { EmployeeUpdate } from '@/types';
import { toast } from 'sonner';

export default function EmployeeEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: employee, isLoading } = useQuery({
    queryKey: ['employee', id],
    queryFn: () => employeesApi.getEmployee(parseInt(id || '0')),
    enabled: !!id,
  });

  const { data: departments } = useQuery({
    queryKey: ['departments'],
    queryFn: departmentsApi.getDepartments,
  });

  const { data: positionsData } = useQuery({
    queryKey: ['positions'],
    queryFn: () => positionsApi.getPositions({ page_size: 100 }),
  });

  const { data: usersData } = useQuery({
    queryKey: ['users', 'employee-edit'],
    queryFn: () => usersApi.getUsers({ page_size: 100 }),
  });

  if (isLoading) return <PageSpinner />;
  if (!employee) return <div className="text-center py-12">Employee not found</div>;

  const handleSubmit = async (data: EmployeeUpdate) => {
    setIsSubmitting(true);
    try {
      await employeesApi.updateEmployee(employee.id, data);
      toast.success('Employee updated');
      navigate(`/employees/${employee.id}`);
    } catch {
      toast.error('Failed to update employee');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader
        title="Edit Employee"
        breadcrumbs={[{ label: 'Employees', href: '/employees' }, { label: 'Edit' }]}
      />
      <Card>
        <CardContent className="p-6">
          <EmployeeForm
            employee={employee}
            users={usersData?.results || []}
            departments={departments || []}
            positions={positionsData?.results || []}
            onSubmit={handleSubmit}
            isLoading={isSubmitting}
          />
        </CardContent>
      </Card>
    </div>
  );
}
