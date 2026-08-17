import { EmployeeCard } from './EmployeeCard';
import type { Employee } from '@/types';
import { EmptyState } from '@/components/ui/EmptyState';
import { UserCheck } from 'lucide-react';

interface EmployeeDirectoryProps {
  employees: Employee[];
  onEmployeeClick: (employee: Employee) => void;
}

export function EmployeeDirectory({ employees, onEmployeeClick }: EmployeeDirectoryProps) {
  if (employees.length === 0) {
    return <EmptyState icon={UserCheck} title="No employees found" description="No employees match your search criteria." />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {employees.map((emp) => (
        <EmployeeCard
          key={emp.id}
          employee={emp}
          onClick={() => onEmployeeClick(emp)}
        />
      ))}
    </div>
  );
}
