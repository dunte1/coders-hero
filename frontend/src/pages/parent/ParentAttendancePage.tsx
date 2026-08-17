import { useState } from 'react';
import { CalendarCheck } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageSpinner } from '@/components/ui/Spinner';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { EmptyState } from '@/components/ui/EmptyState';
import { PortalAttendanceStatusBadge } from '@/components/parent/PortalBadges';
import { useParentAttendance } from '@/hooks/useParentPortal';
import { formatDate, getInitials } from '@/lib/utils';

const currentMonth = () => new Date().toISOString().slice(0, 7);

const summaryCells: { key: 'present' | 'late' | 'absent' | 'excused'; label: string; className: string }[] = [
  { key: 'present', label: 'Present', className: 'text-emerald-600' },
  { key: 'late', label: 'Late', className: 'text-amber-600' },
  { key: 'absent', label: 'Absent', className: 'text-red-600' },
  { key: 'excused', label: 'Excused', className: 'text-slate-500' },
];

export default function ParentAttendancePage() {
  const [month, setMonth] = useState(currentMonth());
  const { data, isLoading } = useParentAttendance(month);

  const handleMonthChange = (value: string) => {
    if (value) setMonth(value);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Attendance"
        description="Monthly attendance records for your children."
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Parent Portal', href: '/parent' }, { label: 'Attendance' }]}
        actions={
          <div className="w-44">
            <Input type="month" value={month} onChange={(e) => handleMonthChange(e.target.value)} />
          </div>
        }
      />

      {isLoading ? (
        <PageSpinner />
      ) : !data || data.children.length === 0 ? (
        <Card>
          <CardContent>
            <EmptyState
              icon={CalendarCheck}
              title="No attendance records"
              description="No attendance found for the selected month."
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {data.children.map((child) => (
            <Card key={child.student.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-base">
                  <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-brand-50 text-xs font-medium text-brand-700">
                    {child.student.photo_url ? (
                      <img src={child.student.photo_url} alt={child.student.full_name} className="h-full w-full object-cover" />
                    ) : (
                      getInitials(child.student.first_name, child.student.last_name)
                    )}
                  </div>
                  <span>{child.student.full_name}</span>
                  <span className="ml-auto text-xs font-normal text-slate-500">
                    {child.month} · {child.summary.total} records
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                  {summaryCells.map((cell) => (
                    <div key={cell.key} className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-center">
                      <p className={`text-xl font-bold ${cell.className}`}>{child.summary[cell.key]}</p>
                      <p className="text-xs text-slate-500">{cell.label}</p>
                    </div>
                  ))}
                  <div className="rounded-lg border border-slate-200 bg-brand-50 p-3 text-center">
                    <p className="text-xl font-bold text-brand-700">{child.summary.total}</p>
                    <p className="text-xs text-slate-500">Total Days</p>
                  </div>
                </div>

                {child.records.length === 0 ? (
                  <p className="py-4 text-center text-sm text-slate-400">No records for this month.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                          <th className="py-2 pr-4">Date</th>
                          <th className="py-2 pr-4">Status</th>
                          <th className="py-2 pr-4">Check In</th>
                          <th className="py-2 pr-4">Check Out</th>
                          <th className="py-2">Note</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {child.records.map((record) => (
                          <tr key={record.id}>
                            <td className="py-2 pr-4 font-medium text-slate-900">{formatDate(record.attendance_date)}</td>
                            <td className="py-2 pr-4">
                              <PortalAttendanceStatusBadge status={record.status} />
                            </td>
                            <td className="py-2 pr-4 text-slate-600">{record.check_in || '—'}</td>
                            <td className="py-2 pr-4 text-slate-600">{record.check_out || '—'}</td>
                            <td className="py-2 text-slate-500">{record.note || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
