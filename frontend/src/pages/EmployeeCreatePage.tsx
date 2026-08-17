import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { employeesApi, departmentsApi, positionsApi, usersApi } from '@/lib/api';
import { EmployeeForm } from '@/components/features/employees/EmployeeForm';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent } from '@/components/ui/Card';
import { useState } from 'react';
import type { EmployeeCreate as EmployeeCreateType } from '@/types';
import { toast } from 'sonner';

export default function EmployeeCreatePage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: departments } = useQuery({
    queryKey: ['departments'],
    queryFn: departmentsApi.getDepartments,
  });

  const { data: positionsData } = useQuery({
    queryKey: ['positions'],
    queryFn: () => positionsApi.getPositions({ page_size: 100 }),
  });

  const { data: usersData } = useQuery({
    queryKey: ['users', 'employee-create'],
    queryFn: () => usersApi.getUsers({ page_size: 100 }),
  });

  const handleSubmit = async (data: EmployeeCreateType) => {
    setIsSubmitting(true);
    try {
      await employeesApi.createEmployee(data);
      toast.success('Employee added successfully');
      navigate('/employees');
    } catch {
      toast.error('Failed to add employee');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader
        title="Add Employee"
        breadcrumbs={[{ label: 'Employees', href: '/employees' }, { label: 'Add' }]}
      />
      <Card>
        <CardContent className="p-6">
          <EmployeeForm
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
