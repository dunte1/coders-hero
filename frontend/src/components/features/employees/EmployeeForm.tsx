import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import {
  SelectRoot,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/Select';
import type { Employee, EmployeeCreate, User } from '@/types';

const employeeSchema = z.object({
  user_id: z.string().min(1, 'User is required'),
  employee_id: z.string().min(1, 'Employee ID is required'),
  department_id: z.string().min(1, 'Department is required'),
  position_id: z.string().min(1, 'Position is required'),
  hire_date: z.string().min(1, 'Hire date is required'),
  salary: z.string().optional(),
  address: z.string().optional(),
  emergency_contact: z.string().optional(),
  emergency_phone: z.string().optional(),
});

type EmployeeFormValues = z.infer<typeof employeeSchema>;

interface EmployeeFormProps {
  employee?: Employee;
  users: User[];
  departments: { id: number; name: string }[];
  positions: { id: number; title: string }[];
  onSubmit: (data: EmployeeCreate) => void;
  isLoading?: boolean;
}

export function EmployeeForm({
  employee,
  users,
  departments,
  positions,
  onSubmit,
  isLoading,
}: EmployeeFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      user_id: employee?.user?.id?.toString() || '',
      employee_id: employee?.employee_id || '',
      department_id: employee?.department?.id?.toString() || '',
      position_id: employee?.position?.id?.toString() || '',
      hire_date: employee?.hire_date ? employee.hire_date.split('T')[0] : '',
      salary: employee?.salary?.toString() || '',
      address: employee?.address || '',
      emergency_contact: employee?.emergency_contact || '',
      emergency_phone: employee?.emergency_phone || '',
    },
  });

  const onFormSubmit = (data: EmployeeFormValues) => {
    onSubmit({
      ...data,
      user_id: parseInt(data.user_id),
      department_id: parseInt(data.department_id),
      position_id: parseInt(data.position_id),
      salary: data.salary ? parseFloat(data.salary) : undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
      <Input
        label="Employee ID"
        placeholder="e.g. EMP001"
        error={errors.employee_id?.message}
        {...register('employee_id')}
      />

      <SelectRoot
        value={watch('user_id')}
        onValueChange={(value) => setValue('user_id', value)}
      >
        <SelectTrigger label="Linked User Account" error={errors.user_id?.message}>
          <SelectValue placeholder="Select user" />
        </SelectTrigger>
        <SelectContent>
          {users.map((u) => (
            <SelectItem key={u.id} value={u.id.toString()}>
              {u.first_name} {u.last_name} ({u.email})
            </SelectItem>
          ))}
        </SelectContent>
      </SelectRoot>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <SelectRoot
          value={watch('department_id')}
          onValueChange={(value) => setValue('department_id', value)}
        >
          <SelectTrigger label="Department" error={errors.department_id?.message}>
            <SelectValue placeholder="Select department" />
          </SelectTrigger>
          <SelectContent>
            {departments.map((d) => (
              <SelectItem key={d.id} value={d.id.toString()}>
                {d.name}
              </SelectItem>
            ))}
          </SelectContent>
        </SelectRoot>

        <SelectRoot
          value={watch('position_id')}
          onValueChange={(value) => setValue('position_id', value)}
        >
          <SelectTrigger label="Position" error={errors.position_id?.message}>
            <SelectValue placeholder="Select position" />
          </SelectTrigger>
          <SelectContent>
            {positions.map((p) => (
              <SelectItem key={p.id} value={p.id.toString()}>
                {p.title}
              </SelectItem>
            ))}
          </SelectContent>
        </SelectRoot>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Hire Date"
          type="date"
          error={errors.hire_date?.message}
          {...register('hire_date')}
        />
        <Input
          label="Salary (optional)"
          type="number"
          min="0"
          step="0.01"
          placeholder="0.00"
          {...register('salary')}
        />
      </div>

      <Textarea
        label="Address (optional)"
        placeholder="Employee address"
        rows={2}
        {...register('address')}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Emergency Contact (optional)"
          placeholder="Contact name"
          {...register('emergency_contact')}
        />
        <Input
          label="Emergency Phone (optional)"
          type="tel"
          placeholder="Phone number"
          {...register('emergency_phone')}
        />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="submit" loading={isLoading}>
          {employee ? 'Update Employee' : 'Add Employee'}
        </Button>
      </div>
    </form>
  );
}
