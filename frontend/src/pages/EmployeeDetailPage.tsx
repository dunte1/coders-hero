import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { employeesApi } from '@/lib/api';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageSpinner } from '@/components/ui/Spinner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { getInitials, formatDate, formatCurrency } from '@/lib/utils';
import { Mail, Phone, Building2, MapPin, Calendar, Shield } from 'lucide-react';

export default function EmployeeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: employee, isLoading } = useQuery({
    queryKey: ['employee', id],
    queryFn: () => employeesApi.getEmployee(parseInt(id || '0')),
    enabled: !!id,
  });

  if (isLoading) return <PageSpinner />;
  if (!employee) return <div className="text-center py-12">Employee not found</div>;

  return (
    <div className="space-y-6">
      <PageHeader
        title={employee.user.name}
        breadcrumbs={[
          { label: 'Employees', href: '/employees' },
          { label: employee.user.name },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6 flex flex-col items-center text-center">
            <Avatar className="h-24 w-24 mb-4">
              <AvatarImage src={employee.user.avatar} />
              <AvatarFallback className="text-2xl">
                {getInitials(employee.user.name)}
              </AvatarFallback>
            </Avatar>
            <h2 className="text-xl font-bold">{employee.user.name}</h2>
            <p className="text-sm text-brand-600 font-medium">{employee.position?.title}</p>
            <StatusBadge status={employee.status} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Employment Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-slate-400" />
                <span className="text-slate-500">ID:</span>
                <span className="font-mono">{employee.employee_id}</span>
              </div>
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-slate-400" />
                <span className="text-slate-500">Department:</span>
                <span className="font-medium">{employee.department?.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-slate-400" />
                <span className="text-slate-500">Hire Date:</span>
                <span className="font-medium">{formatDate(employee.hire_date)}</span>
              </div>
              {employee.salary && (
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">Salary:</span>
                  <span className="font-medium">{formatCurrency(employee.salary)}</span>
                </div>
              )}
            </div>

            <div className="border-t pt-4 mt-4">
              <h3 className="text-sm font-medium text-slate-700 mb-3">Contact</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-slate-400" />
                  {employee.user.email}
                </div>
                {employee.user.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-slate-400" />
                    {employee.user.phone}
                  </div>
                )}
                {employee.address && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-slate-400" />
                    {employee.address}
                  </div>
                )}
              </div>
            </div>

            {employee.emergency_contact && (
              <div className="border-t pt-4 mt-4">
                <h3 className="text-sm font-medium text-slate-700 mb-3">Emergency Contact</h3>
                <p className="text-sm">{employee.emergency_contact}</p>
                {employee.emergency_phone && (
                  <p className="text-sm text-slate-500">{employee.emergency_phone}</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
