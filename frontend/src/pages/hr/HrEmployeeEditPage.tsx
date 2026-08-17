import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useHrEmployee, useHrDepartments, useHrPositions, useUpdateHrEmployee } from '@/hooks/useHr';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageSpinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import {
  SelectRoot,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/Select';
import { EMPLOYMENT_TYPES, EMPLOYEE_STATUSES } from '@/types/hr';
import type { EmployeeHr, EmployeeHrInput } from '@/types/hr';

const toInput = (employee: EmployeeHr): EmployeeHrInput => ({
  department_id: employee.department_id,
  position_id: employee.position_id,
  hire_date: employee.hire_date ?? undefined,
  employment_type: employee.employment_type,
  salary: employee.salary != null ? employee.salary : undefined,
  date_of_birth: employee.date_of_birth ?? undefined,
  gender: employee.gender ?? undefined,
  national_id: employee.national_id ?? undefined,
  address: employee.address ?? undefined,
  emergency_contact: employee.emergency_contact ?? undefined,
  emergency_phone: employee.emergency_phone ?? undefined,
  bank_name: employee.bank_name ?? undefined,
  bank_account_number: employee.bank_account_number ?? undefined,
  status: employee.status,
});

export default function HrEmployeeEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const employeeId = Number(id);

  const { data: employee, isLoading } = useHrEmployee(employeeId);
  const { data: departments } = useHrDepartments();
  const { data: positions } = useHrPositions();
  const updateEmployee = useUpdateHrEmployee();

  const [form, setForm] = useState<EmployeeHrInput>({});

  useEffect(() => {
    if (employee) {
      setForm(toInput(employee));
    }
  }, [employee]);

  if (isLoading) return <PageSpinner />;

  if (!employee) {
    return (
      <div className="space-y-6">
        <PageHeader title="Edit Employee" description="Employee not found." />
        <Button variant="outline" onClick={() => navigate('/hr/employees')}>
          Back to employees
        </Button>
      </div>
    );
  }

  const set = <K extends keyof EmployeeHrInput>(key: K, value: EmployeeHrInput[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const submit = () => {
    const payload: EmployeeHrInput = { ...form };
    if (!payload.department_id) delete payload.department_id;
    if (!payload.position_id) delete payload.position_id;
    updateEmployee.mutate(
      { id: employeeId, data: payload },
      { onSuccess: () => navigate(`/hr/employees/${employeeId}`) }
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Edit ${employee.user?.name ?? employee.employee_id}`}
        description="Update employment and personal HR information"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'HR', href: '/hr' },
          { label: 'Employees', href: '/hr/employees' },
          { label: employee.user?.name ?? employee.employee_id, href: `/hr/employees/${employee.id}` },
          { label: 'Edit' },
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate(`/hr/employees/${employeeId}`)}>
              Cancel
            </Button>
            <Button onClick={submit} loading={updateEmployee.isPending}>
              Save Changes
            </Button>
          </div>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Employment</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Department</Label>
            <SelectRoot
              value={form.department_id != null ? String(form.department_id) : undefined}
              onValueChange={(v) => set('department_id', v ? Number(v) : null)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                {departments?.map((d) => (
                  <SelectItem key={d.id} value={String(d.id)}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </SelectRoot>
          </div>
          <div>
            <Label>Position</Label>
            <SelectRoot
              value={form.position_id != null ? String(form.position_id) : undefined}
              onValueChange={(v) => set('position_id', v ? Number(v) : null)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select position" />
              </SelectTrigger>
              <SelectContent>
                {positions?.map((p) => (
                  <SelectItem key={p.id} value={String(p.id)}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </SelectRoot>
          </div>
          <div>
            <Label>Hire date</Label>
            <Input
              type="date"
              value={form.hire_date ?? ''}
              onChange={(e) => set('hire_date', e.target.value || null)}
            />
          </div>
          <div>
            <Label>Employment type</Label>
            <SelectRoot
              value={form.employment_type ?? undefined}
              onValueChange={(v) => set('employment_type', v as EmployeeHrInput['employment_type'])}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {EMPLOYMENT_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t.replace(/_/g, ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </SelectRoot>
          </div>
          <div>
            <Label>Salary (KSh)</Label>
            <Input
              type="number"
              min={0}
              value={form.salary ?? ''}
              onChange={(e) => set('salary', e.target.value ? Number(e.target.value) : null)}
            />
          </div>
          <div>
            <Label>Status</Label>
            <SelectRoot
              value={form.status ?? undefined}
              onValueChange={(v) => set('status', v as EmployeeHrInput['status'])}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {EMPLOYEE_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s.replace(/_/g, ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </SelectRoot>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Personal</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Gender</Label>
            <SelectRoot
              value={form.gender ?? undefined}
              onValueChange={(v) => set('gender', (v as EmployeeHrInput['gender']) ?? null)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                {(['male', 'female', 'other'] as const).map((g) => (
                  <SelectItem key={g} value={g}>
                    {g}
                  </SelectItem>
                ))}
              </SelectContent>
            </SelectRoot>
          </div>
          <div>
            <Label>Date of birth</Label>
            <Input
              type="date"
              value={form.date_of_birth ?? ''}
              onChange={(e) => set('date_of_birth', e.target.value || null)}
            />
          </div>
          <div>
            <Label>National ID</Label>
            <Input
              value={form.national_id ?? ''}
              onChange={(e) => set('national_id', e.target.value || null)}
              placeholder="e.g. 12345678"
            />
          </div>
          <div>
            <Label>Address</Label>
            <Input value={form.address ?? ''} onChange={(e) => set('address', e.target.value || null)} />
          </div>
          <div>
            <Label>Emergency contact</Label>
            <Input
              value={form.emergency_contact ?? ''}
              onChange={(e) => set('emergency_contact', e.target.value || null)}
            />
          </div>
          <div>
            <Label>Emergency phone</Label>
            <Input
              value={form.emergency_phone ?? ''}
              onChange={(e) => set('emergency_phone', e.target.value || null)}
            />
          </div>
          <div>
            <Label>Bank name</Label>
            <Input value={form.bank_name ?? ''} onChange={(e) => set('bank_name', e.target.value || null)} />
          </div>
          <div>
            <Label>Bank account number</Label>
            <Input
              value={form.bank_account_number ?? ''}
              onChange={(e) => set('bank_account_number', e.target.value || null)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
