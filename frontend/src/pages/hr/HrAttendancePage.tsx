import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Save } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { PageSpinner } from '@/components/ui/Spinner';
import { useHrEmployees, useHrAttendance, useBulkStaffAttendance } from '@/hooks/useHr';
import { getInitials } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { AttendanceStatus } from '@/types/hr';

const STATUS_OPTIONS: { value: AttendanceStatus; label: string; active: string }[] = [
  { value: 'present', label: 'Present', active: 'border-emerald-600 bg-emerald-50 text-emerald-700' },
  { value: 'late', label: 'Late', active: 'border-amber-600 bg-amber-50 text-amber-700' },
  { value: 'half_day', label: 'Half Day', active: 'border-indigo-600 bg-indigo-50 text-indigo-700' },
  { value: 'absent', label: 'Absent', active: 'border-red-600 bg-red-50 text-red-700' },
  { value: 'leave', label: 'Leave', active: 'border-slate-600 bg-slate-100 text-slate-700' },
];

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function HrAttendancePage() {
  const [date, setDate] = useState(today());
  const [statuses, setStatuses] = useState<Record<number, AttendanceStatus>>({});

  const { data: employeesData, isLoading: employeesLoading } = useHrEmployees({ per_page: 500 });
  const { data: existingData, isLoading: existingLoading } = useHrAttendance({ attendance_date: date, per_page: 500 });

  const employees = useMemo(() => employeesData?.results || [], [employeesData]);
  const existingMap = useMemo(() => {
    const map: Record<number, AttendanceStatus> = {};
    for (const record of existingData?.results || []) {
      map[record.employee_id] = record.status;
    }
    return map;
  }, [existingData]);

  useEffect(() => {
    const next: Record<number, AttendanceStatus> = {};
    for (const employee of employees) {
      next[employee.id] = existingMap[employee.id] || 'present';
    }
    setStatuses(next);
  }, [employees, existingMap]);

  const bulkMutation = useBulkStaffAttendance();

  const setStatus = (employeeId: number, status: AttendanceStatus) => {
    setStatuses((prev) => ({ ...prev, [employeeId]: status }));
  };

  const markAllPresent = () => {
    const next: Record<number, AttendanceStatus> = {};
    for (const employee of employees) {
      next[employee.id] = 'present';
    }
    setStatuses(next);
  };

  const handleSave = () => {
    const records = employees.map((employee) => ({
      employee_id: employee.id,
      status: statuses[employee.id] || 'present',
    }));
    bulkMutation.mutate({ attendance_date: date, records });
  };

  if (employeesLoading) return <PageSpinner />;

  const savedCount = Object.keys(existingMap).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Staff Attendance"
        description="Record daily attendance for active employees"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'HR', href: '/hr' }, { label: 'Attendance' }]}
        actions={
          <>
            <Button variant="outline" onClick={markAllPresent}>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Mark All Present
            </Button>
            <Button onClick={handleSave} loading={bulkMutation.isPending}>
              <Save className="mr-2 h-4 w-4" />
              Save Attendance
            </Button>
          </>
        }
      />

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">Register</CardTitle>
            <CardDescription>
              {employees.length} active employee(s) · {savedCount} already recorded
            </CardDescription>
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="flex h-10 w-44 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
        </CardHeader>
        <CardContent>
          {existingLoading ? (
            <PageSpinner />
          ) : employees.length === 0 ? (
            <p className="py-12 text-center text-sm text-slate-500">
              No active employees to mark. Add employees first.
            </p>
          ) : (
            <div className="divide-y divide-slate-100">
              {employees.map((employee) => (
                <div key={employee.id} className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center">
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-medium text-brand-700">
                      {employee.user?.avatar ? (
                        <img src={employee.user.avatar} alt={employee.user.name} className="h-full w-full rounded-full object-cover" />
                      ) : (
                        getInitials((employee.user?.name ?? employee.employee_id).split(' ')[0], (employee.user?.name ?? employee.employee_id).split(' ')[1] ?? '')
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-900">{employee.user?.name}</p>
                      <p className="text-xs text-slate-500">
                        {employee.employee_id} · {employee.position?.name ?? 'No position'}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {STATUS_OPTIONS.map((option) => {
                      const selected = statuses[employee.id] === option.value;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setStatus(employee.id, option.value)}
                          className={cn(
                            'rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors',
                            selected
                              ? option.active
                              : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
                          )}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
